from fastapi import APIRouter

router = APIRouter()


@router.get("/servers")
async def list_servers() -> list[dict]:
  """Временный заглушечный endpoint для списка серверов.

  Возвращает пустой список, чтобы фронтенд и OpenAPI не падали.
  Реальная логика может быть добавлена позже.
  """
  return []
