from fastapi import APIRouter

router = APIRouter()


@router.get("/images")
async def list_images() -> list[dict]:
  """Временный заглушечный endpoint для списка образов.

  Возвращает пустой список, чтобы фронтенд и OpenAPI не падали.
  Реальная логика может быть добавлена позже.
  """
  return []
