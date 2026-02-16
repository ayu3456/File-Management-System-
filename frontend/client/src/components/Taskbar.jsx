import React, { useState, useEffect } from 'react';
import { AppWindow, Monitor, Folder, FileText, Search, Power } from 'lucide-react';

const Clock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="flex flex-col items-end px-3 text-xs text-white cursor-default hover:bg-white/10 p-1 rounded transition-colors">
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{time.toLocaleDateString()}</span>
        </div>
    );
};

const StartMenu = ({ isOpen, onClose, openApp }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute bottom-12 left-0 w-80 bg-slate-900/90 backdrop-blur-md rounded-tr-lg rounded-tl-lg border border-white/10 shadow-2xl p-4 flex flex-col gap-4 z-50 animate-in slide-in-from-bottom-5 duration-200">
             <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                    placeholder="Search apps..." 
                    className="w-full bg-slate-800 text-white pl-8 pr-4 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-blue-500 text-sm"
                />
            </div>
            
            <div className="grid grid-cols-1 gap-1">
                <p className="text-xs font-semibold text-slate-400 px-2 mb-1">Pinned</p>
                <button 
                    onClick={() => { openApp('files'); onClose(); }}
                    className="flex items-center gap-3 p-2 hover:bg-white/10 rounded text-slate-200 text-sm transition-colors text-left"
                >
                    <div className="p-1.5 bg-blue-500/20 rounded">
                        <Folder size={18} className="text-blue-400" />
                    </div>
                    File Explorer
                </button>
                <button 
                    onClick={() => { openApp('editor'); onClose(); }}
                    className="flex items-center gap-3 p-2 hover:bg-white/10 rounded text-slate-200 text-sm transition-colors text-left"
                >
                    <div className="p-1.5 bg-emerald-500/20 rounded">
                        <FileText size={18} className="text-emerald-400" />
                    </div>
                    Text Editor
                </button>
            </div>

             <div className="border-t border-white/10 pt-3 mt-auto flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        SA
                    </div>
                    <span className="text-sm text-slate-200">Sahil / Ayush - Deadlock</span>
                </div>
                <button className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-red-400 transition-colors">
                    <Power size={18} />
                </button>
            </div>
        </div>
    );
};

const Taskbar = ({ windows, activeWindowId, onWindowClick, startMenuOpen, toggleStartMenu, openApp }) => {
  return (
    <div className="absolute bottom-0 w-full h-12 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-2 z-50 text-white select-none">
      
      <div className="flex items-center gap-2 h-full">
         <button 
            className={`p-2 rounded hover:bg-white/10 transition-all active:scale-95 ${startMenuOpen ? 'bg-white/15' : ''}`}
            onClick={toggleStartMenu}
         >
             <Monitor size={24} className="text-blue-400" />
         </button>

         {startMenuOpen && <StartMenu isOpen={true} onClose={toggleStartMenu} openApp={openApp} />}

         <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

         {/* Running Apps */}
         <div className="flex items-center gap-1">
            {windows.map(win => (
                <button
                    key={win.id}
                    onClick={() => onWindowClick(win.id)}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all max-w-[200px] truncate
                        ${activeWindowId === win.id && !win.minimized 
                            ? 'bg-white/15 shadow-sm border-b-2 border-blue-400' 
                            : 'hover:bg-white/5 opacity-80 hover:opacity-100'}
                        ${win.minimized ? 'opacity-50' : ''}
                    `}
                >
                    {win.appId === 'files' ? <Folder size={14} className="text-blue-300" /> : <FileText size={14} className="text-emerald-300" />}
                    <span className="truncate">{win.title}</span>
                </button>
            ))}
         </div>
      </div>

      <div className="flex items-center gap-2 h-full">
          {/* Status area/tray icons could go here */}
          <Clock />
      </div>

    </div>
  );
};

export default Taskbar;
