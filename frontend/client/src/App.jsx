import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import Window from './components/Window';
import FileManager from './apps/FileManager';
import TextEditor from './apps/TextEditor';
import RecycleBin from './apps/RecycleBin';
import StorageMap from './apps/StorageMap';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';

function App() {
  const [booting, setBooting] = useState(true);
  const [bootPhase, setBootPhase] = useState(0); // 0=black, 1=logo, 2=loading, 3=fade out
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // Boot sequence
  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setBootPhase(1), 400));   // Show logo
    timers.push(setTimeout(() => setBootPhase(2), 1200));  // Show loading
    timers.push(setTimeout(() => setBootPhase(3), 3000));  // Start fade out
    timers.push(setTimeout(() => setBooting(false), 3600)); // Remove boot screen
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleShutdown = () => {
    // Close all windows and trigger boot screen again
    setWindows([]);
    setActiveWindowId(null);
    setStartMenuOpen(false);
    setBootPhase(3); // Start fade to black
    setBooting(true);
    setTimeout(() => {
      setBootPhase(0); // Full black
      setTimeout(() => setBootPhase(1), 400);   // Logo
      setTimeout(() => setBootPhase(2), 1200);  // Loading
      setTimeout(() => setBootPhase(3), 3000);  // Fade out
      setTimeout(() => setBooting(false), 3600); // Desktop
    }, 600);
  };

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
      
      {/* Boot Splash Screen */}
      <AnimatePresence>
        {booting && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            animate={{ opacity: bootPhase === 3 ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: bootPhase >= 1 ? 1 : 0, scale: bootPhase >= 1 ? 1 : 0.5 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                <Lock size={40} className="text-white" />
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: bootPhase >= 1 ? 1 : 0, y: bootPhase >= 1 ? 0 : 10 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-4xl font-bold text-white tracking-widest"
                style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}
              >
                DEADLOCK
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: bootPhase >= 1 ? 0.5 : 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-sm text-slate-400 mt-2 tracking-wider"
              >
                Virtual File System
              </motion.p>
              
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: bootPhase >= 2 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="mt-12 flex flex-col items-center"
            >
              {/* Spinner */}
              <div className="w-6 h-6 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin"></div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: bootPhase >= 2 ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-xs text-slate-500 mt-4"
              >
                Starting up...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        onShutdown={handleShutdown}
      />
    </div>
  );
}

export default App;
