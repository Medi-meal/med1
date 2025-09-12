import React, { useState } from 'react';
import './CustomTooltip.css';

const CustomTooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={`custom-tooltip tooltip-${position}`}>
          {content}
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;
