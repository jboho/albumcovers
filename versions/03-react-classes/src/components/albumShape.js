import PropTypes from 'prop-types';

export const albumShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
});
