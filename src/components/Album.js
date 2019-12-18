import React, { memo } from 'react';
import { removeAlbum } from '../actions';

const Album = ({ album }) => (
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
            id={album.id}
            onClick={() => { removeAlbum(album.id) }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default memo(Album);


//addAlbum
/*
<div class="flex-item">
  <div class="album-slide">
    <img class="album-image" src="${album.image[2]['#text']}" />
    <div class="album-info overlay">
      <a class="close-button"><span class="icon close-content"></span></a>
      <div class="album-info-box">
        <h4>${album.name}</h4>
        <p class="artist">${album.artist}</p>
        <button class="add-to-list button button-secondary" data-album='${dataString}' id="${album.mbid}">Add To List</button>
      </div>
    </div>
  </div>
</div>s
*/
