import React, { memo } from 'react';
import { connect } from 'react-redux';
import Album from './Album';

const AlbumList = ({ topAlbumList }) => (
  <section className="album-list">
    <h1 className="text-center">Your List</h1>
    <div id="listWrapper" className="album-list-wrapper">
      {topAlbumList.map(album => <Album key={album.id} album={album} />)}
    </div>
  </section>
);

const mapStateToProps = state => ({
  topAlbumList: state.session.topAlbumList,
});

export default connect(mapStateToProps)(memo(AlbumList));
