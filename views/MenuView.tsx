import React, { useState } from 'react';
import { MENU_IMAGES } from '../constants';
import { ZoomIn, X } from 'lucide-react';

interface Props {
  // Keeping interface consistent if other props needed later
  cart?: any; 
  setCart?: any;
}

const MenuView: React.FC<Props> = () => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <div className="pb-32 min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="bg-white w-full p-4 shadow-sm sticky top-0 z-10">
        <h2 className="text-xl font-bold text-center">精選菜單</h2>
      </div>

      <div className="p-6 w-full max-w-lg space-y-6">
        <p className="text-center text-gray-500 text-sm mb-4">點擊圖片可放大檢視</p>
        
        {MENU_IMAGES.map((img, index) => (
          <div 
            key={index} 
            className="bg-white p-2 rounded-xl shadow-lg cursor-pointer transform transition hover:scale-[1.02]"
            onClick={() => setZoomedImage(img.full)}
          >
            <div className="relative">
              <img 
                src={img.thumb} 
                alt={img.alt} 
                className="w-full rounded-lg object-contain"
              />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full">
                <ZoomIn size={20} />
              </div>
            </div>
            <p className="text-center font-bold mt-2 text-gray-700">{img.alt}</p>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white bg-gray-800 p-2 rounded-full"
            onClick={() => setZoomedImage(null)}
          >
            <X size={32} />
          </button>
          
          <img 
            src={zoomedImage} 
            alt="Zoomed Menu" 
            className="max-w-full max-h-screen object-contain rounded-sm"
          />
        </div>
      )}
    </div>
  );
};

export default MenuView;