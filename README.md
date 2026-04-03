# Converter_pptx_1.0

Сервис генерации презентаций на базе FastAPI + React.

## Что делает проект

Пользователь вводит запрос, при необходимости прикладывает файл и/или выбирает шаблон оформления.  
Система генерирует markdown-слайды, отображает их в редакторе и экспортирует в `.pptx`.

Поддерживаемые сценарии генерации:
- только `запрос`,
- `запрос + файл`,
- `запрос + шаблон`,
- `запрос + файл + шаблон`.

---

## Архитектура файловой системы

```text
.
├── backend/
│   ├── src/
│   │   ├── main.py                  # FastAPI app + CORS + роуты
│   │   ├── routes/                  # API endpoints
│   │   ├── services/                # бизнес-логика генерации/конвертации
│   │   ├── modules/models/          # pipeline RAG + генерация
│   │   ├── modules/parsers/         # парсинг pdf/docx/pptx/txt/md
│   │   ├── schemas/                 # pydantic-схемы
│   │   └── utils/                   # утилиты
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                     # store, theme, app-shell
│   │   ├── pages/                   # Prompt/Generate/Editor
│   │   ├── features/                # UI-фичи (генерация, редактор, роутинг)
│   │   ├── entities/                # API-слой
│   │   ├── widgets/                 # Header/Footer
│   │   └── shared/                  # типы, константы, хуки, utils
│   ├── package.json
│   └── Dockerfile
├── scripts/
│   └── prepare_soft_cache.sh        # офлайн-кэш зависимостей в ./soft
├── soft/                            # кэш pip/npm для offline/fast builds
├── docker-compose.yml
└── README.md
```

---

## Схема модулей: от запроса до презентации

1. **Frontend / PromptPage**
   - пользователь вводит промпт;
   - опционально загружает файл;
   - опционально выбирает/загружает шаблон.

2. **Frontend / API**
   - `POST /api/presentation/generate` (multipart form):
     - `text` (обязательно),
     - `file` (опционально),
     - `model`.

3. **Backend / routes/presentation_routes.py**
   - принимает запрос;
   - если файл есть — конвертирует в контекст;
   - если файла нет — контекст пустой;
   - запускает потоковую генерацию markdown.

4. **Backend / services/model_service.py**
   - pipeline:
     - классификатор аудитории,
     - планировщик структуры,
     - генератор контента слайдов (RAG + LLM),
   - выдаёт чанки markdown по мере генерации.

5. **Frontend / useGeneration**
   - принимает стрим;
   - парсит markdown в slide-структуры;
   - обновляет editor store.

6. **Frontend / Editor**
   - редактирование блоков/слайдов;
   - экспорт в PPTX (`pptxgenjs`).

---

## Docker Compose: сборка и запуск

### 1) Подготовка переменных окружения

Создайте `backend/.env` (минимум):

```env
GIGACHAT_AUTH_KEY=your_token
FRONT_URL=http://localhost:8080
DOMAIN=http://localhost:8080
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

> `CORS_ORIGINS` — CSV-список origin'ов.

Быстрый вариант:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.compose.example .env
```

### 2) Опционально: подготовка offline/быстрого кэша

```bash
bash scripts/prepare_soft_cache.sh
```

Скрипт:
- проверяет свободное место (минимум 8 GiB),
- скачивает Python-зависимости в `soft/pip`,
- прогревает npm-кэш в `soft/npm`.

### 3) Сборка и запуск

```bash
docker compose up --build
```

Для принудительного офлайн-режима:

```bash
BUILD_MODE=soft-only docker compose up --build
```

Для автоматического режима (по умолчанию):

```bash
BUILD_MODE=auto docker compose up --build
```

Сервисы:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8000`

### 4) Остановка

```bash
docker compose down
```

---

## Как работает режим soft-кэша

Во время сборки Docker:

- **backend/Dockerfile**
  - если есть маркер `/soft/pip/.ready`, использует:
    `pip install --no-index --find-links=/soft/pip -r requirements.txt`
  - иначе — стандартная загрузка из сети.

- **frontend/Dockerfile**
  - если есть маркер `/soft/npm/.ready`, использует:
    `npm ci --cache /soft/npm --prefer-offline`
  - иначе — стандартная загрузка из сети.

Итого:
- по умолчанию проект может скачивать зависимости из сети;
- если soft-кэш подготовлен — сборка старается брать из `soft`.
- в `soft-only` сборка завершится ошибкой, если `.ready`-маркеры отсутствуют.

---

## Полезные команды

```bash
# Проверка backend-модулей на синтаксис
python -m compileall backend/src

# Сборка frontend локально
npm --prefix frontend run build

# Запуск только кэша зависимостей
bash scripts/prepare_soft_cache.sh
```
