// import axios from 'axios';
// import { normalize } from 'normalizr';
import * as types from './types';
// import store from '../store';
// import schemas from './schemas';
// import * as storage from '../persistence/storage';
// import { API_ROOT } from '../constants';

export const fetchAlbums = () => dispatch => {
  dispatch({ type: types.FETCH_ALBUMS_PENDING, payload: {} });
  // axios
  //   .post(`${API_ROOT}/user/authenticate`, {
  //     ...authData
  //   })
  //   .then(response => {
  //     dispatch({
  //       type: types.AUTHENTICATE_SUCCESS,
  //       payload: response.data
  //     });
  //   })
  //   .catch(err => {
  //     dispatch({ type: types.AUTHENTICATE_REJECTED, payload: err });
  //   });

  // fetch(`${API_ROOT}/user/authenticate`, {
  //   method: 'POST',
  //   body: JSON.stringify(authData),
  //   headers: {
  //     'Content-Type': 'application/json;charset=UTF-8',
  //     Accept: 'application/json, text/plain, */*'
  //   }
  // }).then(response => {
  //   response.json().then(data => {
  //     if (data.status >= 300) {
  //       dispatch({
  //         type: types.AUTHENTICATE_REJECTED,
  //         payload: { message: data.msg }
  //       });
  //       return;
  //     }
  //     dispatch({
  //       type: types.AUTHENTICATE_SUCCESS,
  //       payload: data
  //     });
  //   });
  // });
};

export const addAlbum = id => dispatch => {
  dispatch({ type: types.ADD_ALBUM, payload: { id } });
};

export const removeAlbum = id => dispatch => {
  dispatch({ type: types.REMOVE_ALBUM, payload: { id } });
};
