import { useAlbumStore } from '../store/useAlbumStore';
import { Album } from './Album';

export function AlbumList() {
  const topAlbumList = useAlbumStore((s) => s.topAlbumList);

  return (
    <section className="album-list">
      <h1 className="text-center">Your List</h1>
      <div id="listWrapper" className="album-list-wrapper">
        {topAlbumList.map((album) => (
          <Album key={album.id} album={album} />
        ))}
      </div>
    </section>
  );
}
