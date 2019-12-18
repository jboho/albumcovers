import * as storage from './storage';
import * as constants from '../constants';

export default function persistenceHandler(next) {
  return (reducer, initialState) => {
    const store = next(reducer, initialState);
    return Object.assign({}, store, {
      dispatch(action) {
        store.dispatch(action);

        if (action.type === constants.FETCH_ALBUMS_SUCCESS) {
          storage.put(
            'albumList',
            JSON.stringify(store.getState().session.albumList)
          );
        }

        return action;
      }
    });
  };
}
