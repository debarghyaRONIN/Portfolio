import React, { useState, useEffect } from 'react';

const ReadingProgress = () => {
  const [width, setWidth] = useState(0);

  const scrollHeight = () => {
    const element = document.documentElement;
    const scrollTop = element.scrollTop || document.body.scrollTop;
    const scrollHeight = element.scrollHeight || document.body.scrollHeight;
    const clientHeight = element.clientHeight;

    const windowHeight = scrollHeight - clientHeight;
    const percentage = Math.round((scrollTop / windowHeight) * 100);
    
    setWidth(percentage);
  };

  useEffect(() => {
    window.addEventListener('scroll', scrollHeight);
    return () => window.removeEventListener('scroll', scrollHeight);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        style={{ width: `${width}%` }}
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150"
      />
    </div>
  );
};

export default ReadingProgress;