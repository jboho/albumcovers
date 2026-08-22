import React from 'react';
import PropTypes from 'prop-types';

/**
 * Controlled input, era-typical: the field's value lives in this.state and the
 * <form> onSubmit fires on both Enter and the Go! button.
 */
export default class SearchBar extends React.Component {
  state = { value: '' };

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const term = this.state.value.trim();
    if (term) this.props.onSearch(term);
  };

  render() {
    return (
      <form className="search-group" onSubmit={this.handleSubmit}>
        <input
          type="search"
          name="q"
          className="search-input"
          placeholder="Enter an album or artist name ..."
          aria-label="Search for an album or artist"
          value={this.state.value}
          onChange={this.handleChange}
        />
        <span className="search-group-btn">
          <button className="button button-primary" type="submit">
            Go!
          </button>
        </span>
      </form>
    );
  }
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};
