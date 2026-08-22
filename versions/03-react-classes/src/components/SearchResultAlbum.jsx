import React from 'react';
import PropTypes from 'prop-types';
import { albumShape } from './albumShape';

/** Per-card overlay reveal: clicking the slide flips this.state.active. */
export default class SearchResultAlbum extends React.Component {
  state = { active: false };

  handleReveal = () => {
    this.setState({ active: true });
  };

  handleClose = (e) => {
    e.stopPropagation();
    this.setState({ active: false });
  };

  handleAdd = (e) => {
    e.stopPropagation();
    this.props.onAdd(this.props.album);
  };

  render() {
    const { album, isFull } = this.props;
    const slideClass = this.state.active ? 'album-slide active' : 'album-slide';

    return (
      <div className="flex-item">
        <div className={slideClass} onClick={this.handleReveal}>
          <img className="album-image" alt={album.name} src={album.image} />
          <div className="album-info overlay">
            <button
              type="button"
              className="close-button"
              aria-label="Close album details"
              onClick={this.handleClose}
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
                onClick={this.handleAdd}
              >
                {isFull ? 'List Full' : 'Add To List'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SearchResultAlbum.propTypes = {
  album: albumShape.isRequired,
  isFull: PropTypes.bool.isRequired,
  onAdd: PropTypes.func.isRequired,
};
