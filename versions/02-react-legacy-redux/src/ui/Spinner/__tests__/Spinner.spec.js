/* eslint-disable no-unused-expressions */
import React from 'react';
import { shallow } from 'enzyme';

import Spinner from '..';

describe('Spinner', () => {
  it('should render as <div> with class name of "spinner" and <svg> as a child', () => {
    const wrapper = shallow(<Spinner />);
    expect(wrapper.is('div')).toEqual(true);
    expect(wrapper.hasClass('spinner')).toBe(true);
    expect(wrapper.find('svg')).toHaveLength(1);
  });
});
