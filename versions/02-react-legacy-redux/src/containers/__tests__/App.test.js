import React from 'react';
import { shallow } from 'enzyme';
import App from '../App';
import store from '../../store';

it('renders', () => {
  shallow(<App store={store} />);
});
