import { combineReducers } from 'redux';
import session from './session';

export default function createRootReducer() {
  return combineReducers({ session });
}
