from pydantic import BaseModel


class Album(BaseModel):
    """A normalized album, ready for the client. Mirrors the shape the SPA
    versions produce client-side: id + single-quote-stripped name/artist +
    the medium (image[2]) cover URL."""

    id: str
    name: str
    artist: str
    image: str
