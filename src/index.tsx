import React from 'react';
import { Test } from './Test';

interface indexProps {}

const Demo: React.FC<indexProps> = ({}) => {
  console.log('test');
  return (
    <div>
      <Test></Test>
    </div>
  );
};

export default Demo;
