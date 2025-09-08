import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="text-xs text-gray-500">
          © 2025 @ GreenEarthSpacesLLP | All Rights Reserved.
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">Policy – GES</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-500">Contacts</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
