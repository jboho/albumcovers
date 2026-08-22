import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import persistenceStore from './persistence/store';
import createRootReducer from './reducers';

const initialState = {};
const middleware = [
  applyMiddleware(thunk),
  persistenceStore
];

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const buildMiddleware = () => middleware;
const finalCreateStore = composeEnhancers(...buildMiddleware())(createStore);
const configureStore = initialState =>
  finalCreateStore(createRootReducer(), initialState);

export default configureStore(initialState);
