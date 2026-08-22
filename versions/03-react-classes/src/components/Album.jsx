import React from 'react';
import PropTypes from 'prop-types';
import { albumShape } from './albumShape';

/** A single item in the user's saved Top 10 list. */
export default class Album extends React.PureComponent {
  handleRemove = () => {
    this.props.onRemove(this.props.album.id);
  };

  render() {
    const { album } = this.props;

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
                onClick={this.handleRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Album.propTypes = {
  album: albumShape.isRequired,
  onRemove: PropTypes.func.isRequired,
};
