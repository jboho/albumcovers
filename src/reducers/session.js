import isEmpty from 'lodash.isempty';
import createReducer from './create-reducer';
import * as storage from '../persistence/storage';
import * as types from '../actions/types';

// The initial state of the App
const initialState = {
  albumList: [],
  topAlbumList: [],
  cachedResults: [],
  cachedSearchTerm: '',
};

const actionHandlers = {
  [types.FETCH_ALBUMS_PENDING]: () => ({ loading: true, loaded: false }),
  [types.FETCH_ALBUMS_SUCCESS]: (state, action) => ({
    agentData: action.payload,
    apiError: false,
    avatar: state.avatar || action.payload.photoURL,
    loading: false
  }),
  [types.FETCH_ALBUMS_REJECTED]: (_, action) => ({
    apiError: true,
    errorMessage: action.payload.response
      ? action.payload.response.data.msg.message
      : action.payload.message,
    loading: false
  })
};

export default createReducer(initialState, actionHandlers);
