import { useState } from 'preact/hooks';
import clsx from 'clsx';
import { addAlbum, isListFull } from '../store/albumStore';
import type { Album } from '../types';

interface SearchResultAlbumProps {
  album: Album;
}

export function SearchResultAlbum({ album }: SearchResultAlbumProps) {
  const [active, setActive] = useState(false);
  const full = isListFull.value;

  return (
    <div className="flex-item">
      <div className={clsx('album-slide', active && 'active')} onClick={() => setActive(true)}>
        <img className="album-image" alt={album.name} src={album.image} />
        <div className="album-info overlay">
          <button
            type="button"
            className="close-button"
            aria-label="Close album details"
            onClick={(e) => {
              e.stopPropagation();
              setActive(false);
            }}
          >
            <span className="icon close-content" />
          </button>
          <div className="album-info-box">
            <h4>{album.name}</h4>
            <p className="artist">{album.artist}</p>
            <button
              type="button"
              className="add-to-list button button-secondary"
              disabled={full}
              onClick={(e) => {
                e.stopPropagation();
                addAlbum(album);
              }}
            >
              {full ? 'List Full' : 'Add To List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
