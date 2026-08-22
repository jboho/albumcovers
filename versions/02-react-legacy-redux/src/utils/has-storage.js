/* eslint-disable no-console */
/**
 * Test for Local Storage
 *
 * Evaluates whether or not local storage is available
 *
 * @returns {bool}
 */
const hasStorage = (function hasStorage() {
  try {
    if (typeof localStorage === 'object') {
      try {
        localStorage.setItem('localStorage', 1);
        localStorage.removeItem('localStorage');
      } catch (e) {
        if (window.console) {
          console.warn(
            'Your web browser does not support storing settings locally. Some settings may not save or some features may not work properly for you.'
          );
        }
        return false;
      }
    } else {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}());

export default hasStorage;
