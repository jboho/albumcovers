import React from 'react';
import PropTypes from 'prop-types';
import Album from './Album';
import { albumShape } from './albumShape';

export default class AlbumList extends React.Component {
  render() {
    const { albums, onRemove } = this.props;

    return (
      <section className="album-list">
        <h1 className="text-center">Your List</h1>
        <div id="listWrapper" className="album-list-wrapper">
          {albums.map((album) => (
            <Album key={album.id} album={album} onRemove={onRemove} />
          ))}
        </div>
      </section>
    );
  }
}

AlbumList.propTypes = {
  albums: PropTypes.arrayOf(albumShape).isRequired,
  onRemove: PropTypes.func.isRequired,
};
