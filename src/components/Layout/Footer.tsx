import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-sm border-t border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </div>
        
        <div className="flex items-center space-x-6">
          <a 
            href="/privacy" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Terms of Service
          </a>
          <a 
            href="/contact" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;