import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import Window from './components/Window';
import FileManager from './apps/FileManager';
import TextEditor from './apps/TextEditor';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  const openApp = (appId, initialProps = {}) => {
    const existingWindow = windows.find(w => w.appId === appId && !w.multiInstance);
    if (existingWindow) {
      setActiveWindowId(existingWindow.id);
      setWindows(prev => prev.map(w => w.id === existingWindow.id ? { ...w, minimized: false } : w));
      return;
    }

    const newWindow = {
      id: Date.now(),
      appId,
      title: appId === 'files' ? 'File Explorer' : 'Text Editor',
      minimized: false,
      zIndex: windows.length + 1,
      props: initialProps,
      ...getInitialDimensions(appId)
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const closeWindow = (id) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindowId === id) {
      const remaining = windows.filter(w => w.id !== id);
      if (remaining.length > 0) {
        setActiveWindowId(remaining[remaining.length - 1].id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeWindow = (id) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: true } : w));
    setActiveWindowId(null);
  };

  const focusWindow = (id) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: Math.max(...prev.map(p => p.zIndex)) + 1 } : w));
  };

  const getInitialDimensions = (appId) => {
    if (appId === 'files') return { width: 800, height: 600, x: 100, y: 50 };
    if (appId === 'editor') return { width: 600, height: 500, x: 150, y: 80 };
    return { width: 600, height: 400, x: 200, y: 100 };
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-cover bg-center font-sans text-gray-900 select-none"
         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop")' }}>
      
      <Desktop openApp={openApp} />

      <AnimatePresence>
        {windows.map(win => (
          !win.minimized && (
            <Window
              key={win.id}
              id={win.id}
              title={win.title}
              isActive={activeWindowId === win.id}
              initialDimensions={{ x: win.x, y: win.y, width: win.width, height: win.height }}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
            >
              {win.appId === 'files' && <FileManager openApp={openApp} />}
              {win.appId === 'editor' && <TextEditor {...win.props} />}
            </Window>
          )
        ))}
      </AnimatePresence>

      <Taskbar 
        windows={windows} 
        activeWindowId={activeWindowId} 
        onWindowClick={focusWindow}
        startMenuOpen={startMenuOpen}
        toggleStartMenu={() => setStartMenuOpen(!startMenuOpen)}
        openApp={openApp}
      />
    </div>
  );
}

export default App;
