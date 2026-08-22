import React, { memo } from 'react';
import { connect } from 'react-redux';
import { removeAlbum } from '../actions';

const Album = ({ album, onRemove }) => (
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
            onClick={() => onRemove(album.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
);

const mapDispatchToProps = dispatch => ({
  onRemove: id => dispatch(removeAlbum(id)),
});

export default connect(null, mapDispatchToProps)(memo(Album));
