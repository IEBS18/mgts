//  ***********************************
// Layout without sidebar 
// ************************************* 
import React from 'react';
import BioFormulateHeader from '@/components/Navbar/BioFormulateHeader';
import '../index.css'

const BioFormulateLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-full no-scrollbar">
      {/* Use Header at the top */}
      <div className='sticky top-0 w-full z-50'>
        <BioFormulateHeader />
      </div>
      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-gray-100 no-scrollbar">{children}</div>
    </div>
  );
};

export default BioFormulateLayout;

