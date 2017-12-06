import React from 'react';

const Button = ({handleClick}) => {

  return (
    <div>
      <div onClick={handleClick}> click </div>
    </div>
  );
};

export default Button;