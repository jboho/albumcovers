import { useAlbumList } from '../store/AlbumListContext';

export function Album({ album }) {
  const { removeAlbum } = useAlbumList();

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
