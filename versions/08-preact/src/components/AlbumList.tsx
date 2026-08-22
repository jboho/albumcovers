import { topAlbumList } from '../store/albumStore';
import { Album } from './Album';

export function AlbumList() {
  return (
    <section className="album-list">
      <h1 className="text-center">Your List</h1>
      <div id="listWrapper" className="album-list-wrapper">
        {topAlbumList.value.map((album) => (
          <Album key={album.id} album={album} />
        ))}
      </div>
    </section>
  );
}
