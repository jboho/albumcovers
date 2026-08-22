import { useAlbumList } from '../store/AlbumListContext';
import { Album } from './Album';

export function AlbumList() {
  const { topAlbumList } = useAlbumList();

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
