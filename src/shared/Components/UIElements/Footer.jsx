import React from 'react';
import useVersion from '../../hooks/useVersion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { version } = useVersion();

  return (
    <footer className="mt-auto py-6 px-4 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <div className="flex items-center mb-2 md:mb-0">
          <span className="font-semibold text-primary">Sistem Akademik PPG Cikampek</span>
          <span className="mx-2">•</span>
          <span className="text-gray-500">
            {version ? `v${version.version}` : 'Loading...'}
          </span>
        </div>
        <div className="flex flex-col md:flex-row items-center md:gap-4">
          <span>© {currentYear} All rights reserved.</span>
          <a href="https://ppgcikampek.id" target="_blank" rel="noopener noreferrer" 
             className="hover:text-primary transition-colors duration-200">
            ppgcikampek.id
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
