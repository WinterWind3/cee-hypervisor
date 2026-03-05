from fastapi import APIRouter

router = APIRouter()


@router.get("/clusters")
async def list_clusters() -> list[dict]:
  """Временный заглушечный endpoint для списка кластеров.

  Возвращает пустой список, чтобы фронтенд и OpenAPI не падали.
  Реальная логика может быть добавлена позже.
  """
  return []
