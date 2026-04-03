# Stage 1 — builder: собираем production-статику
FROM node:lts-alpine AS builder
WORKDIR /usr/src/app
ARG BUILD_MODE=auto

# Установим production-зависимости и dev-зависимости для сборки
COPY frontend/package*.json ./
COPY soft /soft
RUN if [ -f /soft/npm/.ready ]; then \
      echo "Using offline npm cache from /soft/npm"; \
      npm ci --silent --cache /soft/npm --prefer-offline; \
    else \
      if [ "$BUILD_MODE" = "soft-only" ]; then \
        echo "soft-only mode enabled, but /soft/npm/.ready not found"; \
        exit 1; \
      fi; \
      echo "Offline npm cache not found, using network download"; \
      npm ci --silent; \
    fi

# Копируем исходники и собираем
COPY frontend/ .
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

# Stage 2 — runtime: минимальный nginx для отдачи статики
FROM nginx:stable-alpine AS runtime

# Удаляем дефолтный контент и копируем сборку
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# (Опционально) копируем кастомную конфигурацию nginx, если есть
# COPY nginx/nginx.prod.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
