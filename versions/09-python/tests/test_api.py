import httpx
import pytest
import respx

from app.main import app
from app.settings import get_settings

LASTFM_ROOT = "https://ws.audioscrobbler.com/2.0/"


def _match(mbid="id-1", name="Album", artist="Artist", medium="http://img/med.png"):
    """Build one Last.fm album match. Five image sizes as upstream returns them;
    index [2] is the medium cover this app keys on."""
    return {
        "name": name,
        "artist": artist,
        "mbid": mbid,
        "image": [
            {"#text": "http://img/s.png", "size": "small"},
            {"#text": "http://img/m.png", "size": "medium"},
            {"#text": medium, "size": "large"},
            {"#text": "http://img/xl.png", "size": "extralarge"},
            {"#text": "http://img/mega.png", "size": "mega"},
        ],
    }


def _response(matches):
    return {"results": {"albummatches": {"album": matches}}}


@pytest.fixture
def client():
    """AsyncClient wired to the ASGI app, with a real shared httpx client on
    app.state so the /api/search dependency resolves (lifespan not run here)."""
    settings = get_settings()
    settings.lastfm_api_key = "test-key"

    async def _run():
        async with httpx.AsyncClient() as http_client:
            app.state.http_client = http_client
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://test"
            ) as ac:
                yield ac

    return _run


@respx.mock
async def test_search_normalizes_and_strips_single_quotes(client):
    respx.get(LASTFM_ROOT).mock(
        return_value=httpx.Response(
            200,
            json=_response([_match(mbid="abc", name="Rock 'n' Roll", artist="D'Angelo")]),
        )
    )
    async for ac in client():
        resp = await ac.get("/api/search", params={"q": "roll"})
        assert resp.status_code == 200
        body = resp.json()
        assert body == [
            {
                "id": "abc",
                "name": "Rock n Roll",
                "artist": "DAngelo",
                "image": "http://img/med.png",
            }
        ]


@respx.mock
async def test_search_drops_items_missing_mbid_or_medium_cover(client):
    no_mbid = _match(mbid="", name="No Id")
    no_cover = _match(mbid="has-id", name="No Cover", medium="")
    good = _match(mbid="keep", name="Keep Me")
    respx.get(LASTFM_ROOT).mock(
        return_value=httpx.Response(
            200, json=_response([no_mbid, no_cover, good])
        )
    )
    async for ac in client():
        resp = await ac.get("/api/search", params={"q": "x"})
        assert resp.status_code == 200
        ids = [a["id"] for a in resp.json()]
        assert ids == ["keep"]


@respx.mock
async def test_search_dedupes_matches_sharing_an_mbid(client):
    # Last.fm can return several matches with the same mbid (e.g. "pink floyd").
    first = _match(mbid="dup", name="First")
    second = _match(mbid="dup", name="Second")
    respx.get(LASTFM_ROOT).mock(
        return_value=httpx.Response(200, json=_response([first, second]))
    )
    async for ac in client():
        resp = await ac.get("/api/search", params={"q": "dup"})
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) == 1
        assert body[0]["name"] == "First"


@respx.mock
async def test_search_returns_empty_list_on_zero_matches(client):
    respx.get(LASTFM_ROOT).mock(
        return_value=httpx.Response(200, json=_response([]))
    )
    async for ac in client():
        resp = await ac.get("/api/search", params={"q": "zzzz"})
        assert resp.status_code == 200
        assert resp.json() == []


async def test_empty_term_returns_empty_list_without_calling_upstream(client):
    # No respx mock registered: if the endpoint hit the network the test would
    # error, proving the empty-term short-circuit never calls Last.fm.
    async for ac in client():
        resp = await ac.get("/api/search", params={"q": "   "})
        assert resp.status_code == 200
        assert resp.json() == []


@respx.mock
async def test_upstream_failure_returns_502(client):
    respx.get(LASTFM_ROOT).mock(side_effect=httpx.ConnectError("boom"))
    async for ac in client():
        resp = await ac.get("/api/search", params={"q": "x"})
        assert resp.status_code == 502


@respx.mock
async def test_upstream_5xx_returns_502(client):
    respx.get(LASTFM_ROOT).mock(return_value=httpx.Response(500))
    async for ac in client():
        resp = await ac.get("/api/search", params={"q": "x"})
        assert resp.status_code == 502


async def test_index_serves_shell(client):
    async for ac in client():
        resp = await ac.get("/")
        assert resp.status_code == 200
        assert 'id="mainContainer"' in resp.text
        assert "/static/app.js" in resp.text
        # The API key must never appear in served HTML.
        assert "api_key" not in resp.text.lower()
