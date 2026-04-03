from typing import Annotated

from fastapi import APIRouter, Response, File, UploadFile

from src.services import convert_file_service
from src.utils import model_api_utils

router = APIRouter()


@router.post("/parse_file", status_code=200)
async def send_message(file: Annotated[UploadFile, File()]) -> Response:
    md_text = await convert_file_service.convert_file(file)

    return Response(content=md_text, media_type="text/markdown")


@router.get("/health/models", status_code=200)
def models_health():
    return model_api_utils.check_models_health()
