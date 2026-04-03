#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOFT_DIR="${ROOT_DIR}/soft"
PIP_DIR="${SOFT_DIR}/pip"
NPM_CACHE_DIR="${SOFT_DIR}/npm"

# Conservative minimum free space requirement (8 GiB)
MIN_FREE_BYTES=$((8 * 1024 * 1024 * 1024))

free_kb="$(df -Pk "${ROOT_DIR}" | awk 'NR==2 {print $4}')"
free_bytes=$((free_kb * 1024))

if (( free_bytes < MIN_FREE_BYTES )); then
  echo "Недостаточно свободного места для подготовки soft-кэша."
  echo "Требуется минимум: ${MIN_FREE_BYTES} байт, доступно: ${free_bytes} байт."
  exit 1
fi

mkdir -p "${PIP_DIR}" "${NPM_CACHE_DIR}"
rm -f "${PIP_DIR}/.ready" "${NPM_CACHE_DIR}/.ready"

echo "[1/3] Скачивание Python-зависимостей в ${PIP_DIR}"
python3 -m pip download \
  -r "${ROOT_DIR}/backend/requirements.txt" \
  -d "${PIP_DIR}"
touch "${PIP_DIR}/.ready"

echo "[2/3] Прогрев npm-кэша в ${NPM_CACHE_DIR}"
(
  cd "${ROOT_DIR}/frontend"
  npm ci --cache "${NPM_CACHE_DIR}" --prefer-offline --no-audit
)
touch "${NPM_CACHE_DIR}/.ready"

echo "[3/3] Soft-кэш готов: ${SOFT_DIR}"
echo "Docker build будет использовать soft-кэш при наличии файлов в ${PIP_DIR} и ${NPM_CACHE_DIR}."
