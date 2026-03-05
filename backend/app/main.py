"""CEE Hypervisor - Main FastAPI Application"""

import logging
import os
from contextlib import asynccontextmanager
import xml.etree.ElementTree as ET

import libvirt
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import init_db
from app.api.endpoints import vms, images, servers, clusters

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s:%(lineno)d | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

logger = logging.getLogger(__name__)


def _get_libvirt_conn() -> libvirt.virConnect:
    """Создать подключение к libvirt, используя LIBVIRT_URI.

    Выбрасывает HTTPException(500), если подключиться не удалось.
    """
    uri = os.getenv("LIBVIRT_URI", "qemu:///system")
    try:
        conn = libvirt.open(uri)
        if conn is None:
            raise HTTPException(status_code=500, detail="Не удалось подключиться к libvirt")
        return conn
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        logger.error("Libvirt connection error: %s", exc)
        raise HTTPException(status_code=500, detail="Ошибка подключения к libvirt")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    logger.info("🔄 Starting VM metrics collector background task")
    try:
        # Инициализация базы данных
        logger.info("🔄 Startup: checking configuration and initializing database")
        init_db()
        logger.debug("📊 Collected metrics for running VMs")
        yield
    finally:
        logger.info("👋 Shutting down CEE Hypervisor")

# Создание FastAPI приложения
app = FastAPI(
    title="CEE Hypervisor API",
    description="Cloud Edition Enterprise - VM Management System",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(vms.router, prefix="/api", tags=["vms"])
app.include_router(images.router, prefix="/api", tags=["images"])
app.include_router(servers.router, prefix="/api", tags=["servers"])
app.include_router(clusters.router, prefix="/api", tags=["clusters"])


@app.get("/api/vms/{name}/console")
async def vm_console(name: str):
    """Получить URL консоли ВМ для noVNC.

    Ожидается, что для ВМ настроен graphics type='vnc' в libvirt.
    Возвращает HTTP URL noVNC, который фронтенд может открыть в новой вкладке.
    """
    conn = _get_libvirt_conn()

    try:
        dom = conn.lookupByName(name)
    except libvirt.libvirtError:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"ВМ '{name}' не найдена в libvirt")

    xml_desc = dom.XMLDesc()  # type: ignore[no-untyped-call]
    root = ET.fromstring(xml_desc)
    gfx = root.find("./devices/graphics[@type='vnc']")
    if gfx is None:
        raise HTTPException(status_code=400, detail="Для ВМ не настроена VNC-консоль")

    port = gfx.get("port")
    if port is None or port == "-1":
        # -1 означает autoport: порт выбирается динамически, сейчас считаем это ошибкой конфигурации
        raise HTTPException(status_code=400, detail="VNC-порт не задан или работает в autoport-режиме")

    try:
        vnc_port = int(port)
    except ValueError:
        raise HTTPException(status_code=500, detail="Некорректный VNC-порт в конфигурации ВМ")

    novnc_host = os.getenv("NOVNC_HOST", "localhost")
    novnc_port = int(os.getenv("NOVNC_PORT", "6080"))
    vnc_target_host = os.getenv("LIBVIRT_VNC_HOST", "localhost")

    # Базовый URL для noVNC: noVNC доступен по http://NOVNC_HOST:NOVNC_PORT,
    # а в параметрах host/port указываем реальный VNC-сервер (libvirt-хост).
    console_url = (
        f"http://{novnc_host}:{novnc_port}/vnc.html"
        f"?host={vnc_target_host}&port={vnc_port}"
    )
    return {"url": console_url}

@app.get("/")
async def root():
    """Корневой endpoint"""
    return {"message": "CEE Hypervisor API v2.0", "status": "running"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "CEE Hypervisor"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )