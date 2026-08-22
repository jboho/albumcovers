import { removeAlbum } from '../store/albumStore';
import type { Album as AlbumType } from '../types';

interface AlbumProps {
  album: AlbumType;
}

export function Album({ album }: AlbumProps) {
  return (
    <div className="flex-item">
      <div className="album-slide">
        <img className="album-image" alt={album.name} src={album.image} />
        <div className="album-info below">
          <div className="album-info-box">
            <h4>{album.name}</h4>
            <p className="artist">{album.artist}</p>
            <button
              type="button"
              className="remove-from-list button button-secondary button-small"
              onClick={() => removeAlbum(album.id)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
