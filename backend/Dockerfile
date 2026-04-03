FROM python:3.11-slim

WORKDIR /code
ARG PRELOAD_MODEL_CACHE=true
ARG BUILD_MODE=auto

# Default model cache locations (can be overridden via environment)
ENV HF_HOME=/models_cache/huggingface \
    TRANSFORMERS_CACHE=/models_cache/huggingface/transformers \
    SENTENCE_TRANSFORMERS_HOME=/models_cache/sentence-transformers \
    TORCH_HOME=/models_cache/torch \
    PIP_DISABLE_PIP_VERSION_CHECK=1

COPY backend/requirements.txt ./requirements.txt
COPY soft /soft
RUN if [ -f /soft/pip/.ready ]; then \
      echo "Using offline pip cache from /soft/pip"; \
      pip install --no-cache-dir --no-index --find-links=/soft/pip -r requirements.txt; \
    else \
      if [ "$BUILD_MODE" = "soft-only" ]; then \
        echo "soft-only mode enabled, but /soft/pip/.ready not found"; \
        exit 1; \
      fi; \
      echo "Offline pip cache not found, using network download"; \
      pip install --no-cache-dir -r requirements.txt; \
    fi

COPY backend/ .

# Ensure cache directories exist with sane permissions
RUN mkdir -p /models_cache/huggingface/transformers \
    /models_cache/sentence-transformers \
    /models_cache/torch && \
    chmod -R 777 /models_cache

# Optional warm cache during image build so runtime doesn't need internet
RUN if [ "$PRELOAD_MODEL_CACHE" = "true" ]; then python scripts/preload_model_cache.py; fi

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
