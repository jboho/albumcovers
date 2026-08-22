from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .api import router as api_router
from .settings import get_settings

BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create one shared httpx.AsyncClient (10s timeout) for the app's lifetime
    and close it on shutdown, so every request reuses the same connection pool."""
    settings = get_settings()
    app.state.http_client = httpx.AsyncClient(
        timeout=settings.lastfm_timeout_seconds
    )
    try:
        yield
    finally:
        await app.state.http_client.aclose()


app = FastAPI(title="Top 10 Album List Builder", lifespan=lifespan)
app.include_router(api_router)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    """Render the DOM shell (mirrors v01's index.html)."""
    return templates.TemplateResponse(request, "index.html")
