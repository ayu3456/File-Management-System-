import React from 'react';
import { Monitor, FileText, Trash2, HardDrive } from 'lucide-react';

const Desktop = ({ openApp }) => {
    const icons = [
        { id: 'computer', label: 'My Computer', icon: Monitor, color: 'text-blue-400' },
        { id: 'editor', label: 'Text Editor', icon: FileText, color: 'text-slate-200' },
        { id: 'bin', label: 'Recycle Bin', icon: Trash2, color: 'text-red-400' },
        { id: 'storage', label: 'Storage', icon: HardDrive, color: 'text-emerald-400' }
    ];

    return (
        <div className="absolute inset-0 z-0 p-4 grid grid-cols-1 content-start gap-4 w-24">
            {icons.map((icon) => (
                <div 
                    key={icon.id}
                    className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 cursor-pointer transition-colors group"
                    onDoubleClick={() => openApp(icon.id)}
                >
                    <div className={`w-12 h-12 flex items-center justify-center ${icon.color} drop-shadow-md group-hover:scale-105 transition-transform`}>
                        <icon.icon size={40} strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-medium text-white drop-shadow-md text-center leading-tight">
                        {icon.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default Desktop;
