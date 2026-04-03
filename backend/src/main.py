from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from urllib.parse import urlparse

from src.routes import file_routes, presentation_routes, test_routes, auth_routes
from src.preload import preload_models
from src.config import settings

app = FastAPI(
    title="API Documentation",
    description="API documentation for the service",
    version="1.0.0",
    root_path="/api",
    docs_url="/docs",
)

def _normalize_origin(origin: str) -> str | None:
    candidate = (origin or "").strip()
    if not candidate:
        return None
    parsed = urlparse(candidate)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        logging.warning(f"Skip invalid CORS origin: {candidate}")
        return None
    return f"{parsed.scheme}://{parsed.netloc}"


# Настройка CORS
raw_origins = []
if settings.CORS_ORIGINS:
    raw_origins.extend(settings.CORS_ORIGINS.split(","))
raw_origins.extend([settings.FRONT_URL, settings.DOMAIN, "http://localhost:3000"])

origins = []
for item in raw_origins:
    normalized = _normalize_origin(item)
    if normalized and normalized not in origins:
        origins.append(normalized)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Set-Cookie",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin",
        "Authorization",
        "X-Telegram-User-ID",
        "x-telegram-id",
    ],
)


# Preload models at startup
@app.on_event("startup")
async def startup_event():
    if not settings.PRELOAD_MODELS:
        logging.info("Startup: model preload disabled (PRELOAD_MODELS=false)")
        return

    logging.info("Starting up - preloading models...")
    try:
        preload_models()
        logging.info("✓ Models preloaded successfully")
    except Exception as e:
        logging.error(f"Failed to preload models: {e}")
        raise


app.include_router(presentation_routes.router)
app.include_router(file_routes.router)
app.include_router(test_routes.router)
app.include_router(auth_routes.router)
