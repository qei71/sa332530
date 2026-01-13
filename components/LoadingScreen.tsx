import React from 'react';
import { LOADING_IMAGE_URL } from '../constants';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <img 
        src={LOADING_IMAGE_URL} 
        alt="Loading..." 
        className="h-full w-full object-cover"
      />
      <div className="absolute bottom-10 animate-pulse text-white text-xl font-bold">
        載入中...
      </div>
    </div>
  );
};

export default LoadingScreen;