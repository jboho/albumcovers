import hasStorage from '../utils/has-storage';

export function put(key, value) {
  hasStorage && window.localStorage.setItem(key, value);
}

export function get(key) {
  return hasStorage ? window.localStorage.getItem(key) : '';
}

export function remove(key) {
  return hasStorage && window.localStorage.removeItem(key);
}

export function clear() {
  hasStorage && window.localStorage.clear();
}
