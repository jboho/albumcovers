import { useState } from 'react';
import clsx from 'clsx';
import { useAlbumList, MAX_LIST_SIZE } from '../store/AlbumListContext';

export function SearchResultAlbum({ album }) {
  const [active, setActive] = useState(false);
  const { addAlbum, topAlbumList } = useAlbumList();
  const isFull = topAlbumList.length >= MAX_LIST_SIZE;

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
              disabled={isFull}
              onClick={(e) => {
                e.stopPropagation();
                addAlbum(album);
              }}
            >
              {isFull ? 'List Full' : 'Add To List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
