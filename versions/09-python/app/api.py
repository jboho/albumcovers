from typing import Annotated, Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request

from .models import Album
from .settings import Settings, get_settings

router = APIRouter(prefix="/api", tags=["search"])


def get_http_client(request: Request) -> httpx.AsyncClient:
    """Return the shared AsyncClient created in the app lifespan handler."""
    return request.app.state.http_client


def _is_usable(match: dict[str, Any]) -> bool:
    """A Last.fm match is usable only if it has a stable id (mbid) and a
    medium-sized cover (image[2]['#text'])."""
    images = match.get("image") or []
    return bool(match.get("mbid")) and len(images) > 2 and bool(images[2].get("#text"))


def _normalize(match: dict[str, Any]) -> Album:
    """Strip single quotes from name/artist and reduce to the client shape."""
    return Album(
        id=match["mbid"],
        name=match["name"].replace("'", ""),
        artist=match["artist"].replace("'", ""),
        image=match["image"][2]["#text"],
    )


@router.get("/search", response_model=list[Album])
async def search_albums(
    client: Annotated[httpx.AsyncClient, Depends(get_http_client)],
    settings: Annotated[Settings, Depends(get_settings)],
    q: Annotated[str, Query(description="Album or artist search term")] = "",
) -> list[Album]:
    """Proxy Last.fm's album.search server-side, then normalize + filter.

    The API key is injected here and never reaches the browser. An empty term
    returns an empty list (matching the SPA versions, which don't search on
    empty input); upstream failures surface as 502.
    """
    term = q.strip()
    if not term:
        return []

    try:
        response = await client.get(
            settings.lastfm_api_root,
            params={
                "method": "album.search",
                "album": term,
                "api_key": settings.lastfm_api_key,
                "format": "json",
                "limit": 20,
            },
        )
        response.raise_for_status()
        payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(
            status_code=502, detail="Upstream Last.fm request failed"
        ) from exc

    matches = (
        payload.get("results", {}).get("albummatches", {}).get("album", []) or []
    )
    normalized = [_normalize(m) for m in matches if _is_usable(m)]

    # Last.fm can return several matches sharing one mbid (e.g. "pink floyd");
    # dedupe by id (keep first, preserving order) so client render keys stay unique.
    seen: set[str] = set()
    deduped: list[Album] = []
    for album in normalized:
        if album.id in seen:
            continue
        seen.add(album.id)
        deduped.append(album)
    return deduped
