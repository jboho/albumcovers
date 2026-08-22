import React, { memo } from 'react';
import { connect } from 'react-redux';
import { addAlbum } from '../actions';

const showOverlay = e => {
  e.currentTarget.classList.add('active');
};

const hideOverlay = e => {
  e.stopPropagation();
  e.currentTarget.closest('.album-slide').classList.remove('active');
};

const SearchResultAlbum = ({ album, onAdd }) => (
  <div className="flex-item">
    <div className="album-slide" onClick={showOverlay}>
      <img className="album-image" alt={album.name} src={album.image} />
      <div className="album-info overlay">
        <button type="button" className="close-button" onClick={hideOverlay}>
          <span className="icon close-content" />
        </button>
        <div className="album-info-box">
          <h4>{album.name}</h4>
          <p className="artist">{album.artist}</p>
          <button
            type="button"
            className="add-to-list button button-secondary"
            onClick={e => { e.stopPropagation(); onAdd(album); }}
          >
            Add To List
          </button>
        </div>
      </div>
    </div>
  </div>
);

const mapDispatchToProps = dispatch => ({
  onAdd: album => dispatch(addAlbum(album)),
});

export default connect(null, mapDispatchToProps)(memo(SearchResultAlbum));
