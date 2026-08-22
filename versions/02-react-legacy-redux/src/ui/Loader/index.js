import React from 'react';
import Spinner from '../Spinner';

const Loader = () => (
  <div className="peaksware--loader">
    <div>
      <Spinner />
      Loading
    </div>
  </div>
);

export default Loader;
