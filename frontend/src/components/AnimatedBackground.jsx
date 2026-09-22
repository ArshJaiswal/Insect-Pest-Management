import React from 'react';
import '../pages/styles/animatedBackground.css';

const AnimatedBackground = () => {
  return (
    <div className="animated-background-container">
      <div className="orbs-container">
        <div className="orb orb-green"></div>
        <div className="orb orb-blue"></div>
        <div className="orb orb-yellow"></div>
      </div>
      <div className="grid-overlay"></div>
    </div>
  );
};

export default AnimatedBackground;
