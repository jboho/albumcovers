import * as storage from './storage';
import * as types from '../actions/types';

const PERSIST_ON = [types.ADD_ALBUM, types.REMOVE_ALBUM];

export default function persistenceHandler(next) {
  return (reducer, initialState) => {
    const store = next(reducer, initialState);
    return Object.assign({}, store, {
      dispatch(action) {
        store.dispatch(action);

        if (PERSIST_ON.includes(action.type)) {
          storage.put(
            'albumList',
            JSON.stringify(store.getState().session.topAlbumList)
          );
        }

        return action;
      }
    });
  };
}
