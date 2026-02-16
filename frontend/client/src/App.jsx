import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import Window from './components/Window';
import FileManager from './apps/FileManager';
import TextEditor from './apps/TextEditor';
import RecycleBin from './apps/RecycleBin';
import StorageMap from './apps/StorageMap';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  const openApp = (appId, initialProps = {}) => {
    const existingWindow = windows.find(w => w.appId === appId && appId !== 'editor'); // Allow multiple editors? Maybe not for now 
    if (existingWindow) {
      if (existingWindow.minimized) {
        setWindows(windows.map(w => w.id === existingWindow.id ? { ...w, minimized: false } : w));
      }
      setActiveWindowId(existingWindow.id);
      return;
    }

    const id = Date.now();
    const dimensions = getInitialDimensions(appId);
    
    let title = 'Application';
    if (appId === 'computer') title = 'My Computer';
    if (appId === 'editor') title = initialProps.filename ? `Text Editor - ${initialProps.filename}` : 'Text Editor';
    if (appId === 'bin') title = 'Recycle Bin';
    if (appId === 'storage') title = 'Storage Visualization';

    setWindows([...windows, {
      id,
      appId,
      title,
      x: dimensions.x,
      y: dimensions.y,
      width: dimensions.width,
      height: dimensions.height,
      minimized: false,
      props: initialProps
    }]);
    setActiveWindowId(id);
  };

  const closeWindow = (id) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: true } : w));
    setActiveWindowId(null);
  };

  const focusWindow = (id) => {
    setActiveWindowId(id);
    setWindows(prev => {
      const win = prev.find(w => w.id === id);
      const others = prev.filter(w => w.id !== id);
      return [...others, win];
    });
  };

  const getInitialDimensions = (appId) => {
    if (appId === 'computer') return { x: 100, y: 50, width: 800, height: 600 };
    if (appId === 'editor') return { x: 150, y: 100, width: 600, height: 500 };
    if (appId === 'bin') return { x: 200, y: 150, width: 700, height: 500 };
    if (appId === 'storage') return { x: 120, y: 80, width: 600, height: 450 };
    return { x: 100, y: 100, width: 600, height: 400 };
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
              {win.appId === 'computer' && <FileManager openApp={openApp} />}
              {win.appId === 'editor' && <TextEditor filename={win.props.filename} />}
              {win.appId === 'bin' && <RecycleBin />}
              {win.appId === 'storage' && <StorageMap />}
            </Window>
          )
        ))}
      </AnimatePresence>

      <Taskbar 
        windows={windows} 
        activeWindowId={activeWindowId} 
        onWindowClick={(id) => {
          const win = windows.find(w => w.id === id);
          if (win.minimized) {
            setWindows(windows.map(w => w.id === id ? { ...w, minimized: false } : w));
            setActiveWindowId(id);
          } else {
            if (activeWindowId === id) {
              minimizeWindow(id);
            } else {
              focusWindow(id);
            }
          }
        }}
        startMenuOpen={startMenuOpen}
        toggleStartMenu={() => setStartMenuOpen(!startMenuOpen)}
        openApp={openApp}
      />
    </div>
  );
}

export default App;
