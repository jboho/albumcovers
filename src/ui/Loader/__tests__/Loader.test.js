import React from 'react';
import { shallow } from 'enzyme';
import Loader from '..';

describe('Loader', () => {
  it('should render as <div> with class name of "peaksware--loader"', () => {
    const wrapper = shallow(<Loader />);
    expect(wrapper.is('div')).toEqual(true);
    expect(wrapper.hasClass('peaksware--loader')).toBe(true);
  });
});
