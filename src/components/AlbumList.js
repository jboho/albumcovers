import React, { memo } from 'react';
import Album from './Album';

const AlbumList = props => (
  <section className="album-list">
    <h1 className="text-center">Your List</h1>
    <div id="listWrapper" className="album-list-wrapper">
      {props.topAlbumList.map(album => <Album key={album.id} data={album} />)}
    </div>
  </section>
);

export default memo(AlbumList);
