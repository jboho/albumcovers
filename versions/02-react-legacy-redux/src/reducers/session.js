import createReducer from './create-reducer';
import * as storage from '../persistence/storage';
import * as types from '../actions/types';

const MAX_LIST_SIZE = 10;

const hydrateTopAlbumList = () => {
  try {
    const stored = JSON.parse(storage.get('albumList'));
    return Array.isArray(stored) ? stored : [];
  } catch (e) {
    return [];
  }
};

const initialState = {
  topAlbumList: hydrateTopAlbumList(),
  cachedResults: [],
  loading: false,
  error: null,
};

const isInList = (list, id) => list.some(album => album.id === id);

const actionHandlers = {
  [types.FETCH_ALBUMS_PENDING]: () => ({ loading: true, error: null }),
  [types.FETCH_ALBUMS_SUCCESS]: (state, action) => ({
    cachedResults: action.payload,
    loading: false,
  }),
  [types.FETCH_ALBUMS_REJECTED]: (state, action) => ({
    loading: false,
    error: action.payload.message,
  }),
  [types.ADD_ALBUM]: (state, action) => {
    if (state.topAlbumList.length >= MAX_LIST_SIZE || isInList(state.topAlbumList, action.payload.album.id)) {
      return state;
    }
    return { topAlbumList: [...state.topAlbumList, action.payload.album] };
  },
  [types.REMOVE_ALBUM]: (state, action) => ({
    topAlbumList: state.topAlbumList.filter(album => album.id !== action.payload.id),
  }),
};

export default createReducer(initialState, actionHandlers);
