import React from 'react';
import { Folder, FileText } from 'lucide-react';

const DesktopIcon = ({ label, icon: Icon, onClick }) => (
  <div 
    className="flex flex-col items-center justify-center w-24 p-2 m-2 rounded-lg hover:bg-white/20 cursor-pointer group transition-colors duration-200"
    onDoubleClick={onClick}
  >
    <div className="w-12 h-12 flex items-center justify-center text-blue-500 drop-shadow-md group-hover:scale-105 transition-transform duration-200">
      <Icon size={48} fill="currentColor" className="text-blue-100/50" />
    </div>
    <span className="mt-1 text-sm text-white font-medium drop-shadow-lg text-center select-none">{label}</span>
  </div>
);

const Desktop = ({ openApp }) => {
  return (
    <div className="absolute inset-0 p-4 flex flex-col items-start content-start flex-wrap gap-2 z-0">
      <DesktopIcon 
        label="My Computer" 
        icon={Folder} 
        onClick={() => openApp('files')}
      />
      <DesktopIcon 
        label="Text Editor" 
        icon={FileText} 
        onClick={() => openApp('editor')}
      />
    </div>
  );
};

export default Desktop;
