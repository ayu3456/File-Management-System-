import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, FileText, Plus, RefreshCw, Trash2, File, Grid, List, ArrowLeft, Image, Code, FileCode, Archive, UploadCloud } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const FOLDER_TYPES = {
    documents: { label: 'Documents', icon: FileText, extensions: ['txt', 'md', 'doc', 'docx', 'pdf'], color: 'text-blue-400' },
    images: { label: 'Images', icon: Image, extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg'], color: 'text-purple-400' },
    code: { label: 'Code', icon: Code, extensions: ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'c', 'h', 'py'], color: 'text-emerald-400' },
    others: { label: 'Others', icon: Archive, extensions: [], color: 'text-slate-400' }
};

const FileManager = ({ openApp }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFileSize, setNewFileSize] = useState('100');
    
    // Organization State
    const [isOrganized, setIsOrganized] = useState(false);
    const [currentFolder, setCurrentFolder] = useState(null); // null = root

    // Drag and Drop State
    const [isDragging, setIsDragging] = useState(false);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/files`);
            if (Array.isArray(res.data)) {
                setFiles(res.data);
                setError(null);
            } else {
                setFiles([]);
                console.error("Invalid response format", res.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createFile = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/files`, { filename: newFileName, size: parseInt(newFileSize) });
            setNewFileName('');
            setShowCreateModal(false);
            fetchFiles();
        } catch (err) {
            alert('Failed to create file: ' + err.message);
        }
    };

    const deleteFile = async (filename) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
        try {
            await axios.delete(`${API_URL}/files/${filename}`);
            fetchFiles();
        } catch (err) {
            alert('Failed to delete file');
        }
    };

    // Drag and Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length === 0) return;

        // Process each file
        for (const file of droppedFiles) {
            await uploadFile(file);
        }
        fetchFiles();
    };

    const uploadFile = async (file) => {
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            const content = event.target.result;
            // 1. Create File Entry
            try {
                // Determine size based on content length or file.size
                // Note: file.size is accurate, but VFM allocates blocks. 
                // We'll trust file.size for metadata, but VFM might need block alignment handling in 'create'. 
                // For now, passing file.size is fine.
                
                // Sanitize filename: Replace spaces with underscores, remove special chars to avoid CLI issues
                const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                
                await axios.post(`${API_URL}/files`, { filename: safeFilename, size: file.size });
                
                // 2. Write Content
                // Note: content is read as text. Binary files might be corrupted if VFM expects string args in CLI.
                // Since VFM is text-based based on 'write' command implementation, we assume text.
                await axios.put(`${API_URL}/files/${safeFilename}`, { content });
                
            } catch (err) {
                console.error(`Failed to upload ${file.name}:`, err);
                alert(`Failed to upload ${file.name}. Ensure it is a text file and backend is running.`);
            }
        };

        // Read as text for now, since our VFM is likely standard text-based interactions
        reader.readAsText(file);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Helper to determine file category
    const getFileCategory = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (FOLDER_TYPES.documents.extensions.includes(ext)) return 'documents';
        if (FOLDER_TYPES.images.extensions.includes(ext)) return 'images';
        if (FOLDER_TYPES.code.extensions.includes(ext)) return 'code';
        return 'others';
    };

    // Filter files based on current view
    const getVisibleItems = () => {
        if (!isOrganized) return files;
        
        if (currentFolder) {
            return files.filter(f => getFileCategory(f.filename) === currentFolder);
        } else {
            const counts = files.reduce((acc, file) => {
                const cat = getFileCategory(file.filename);
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {});

            return Object.entries(FOLDER_TYPES).map(([key, config]) => ({
                id: key,
                isFolder: true,
                label: config.label,
                icon: config.icon,
                color: config.color,
                count: counts[key] || 0
            }));
        }
    };

    const visibleItems = getVisibleItems();

    return (
        <div 
            className={`flex flex-col h-full text-slate-200 relative transition-colors duration-200 ${isDragging ? 'bg-blue-500/10' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-lg m-2 pointer-events-none">
                    <div className="text-center animate-bounce">
                        <UploadCloud size={64} className="mx-auto text-blue-400 mb-2" />
                        <p className="text-xl font-bold text-blue-200">Drop files here to upload</p>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b border-slate-700 bg-slate-800/50">
                {currentFolder && (
                     <button 
                        onClick={() => setCurrentFolder(null)}
                        className="p-1.5 hover:bg-slate-700 rounded transition-colors mr-2 text-slate-300"
                        title="Back"
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}
                
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors"
                >
                    <Plus size={14} /> New File
                </button>
                <div className="h-4 w-[1px] bg-slate-600 mx-1"></div>
                <button 
                    onClick={() => { setIsOrganized(!isOrganized); setCurrentFolder(null); }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${isOrganized ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                    title="Group files by type"
                >
                    <Grid size={14} /> {isOrganized ? 'Organized' : 'All Files'}
                </button>
                 <button 
                    onClick={fetchFiles}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors ml-auto"
                    title="Refresh"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <div className="text-xs text-slate-400">
                    {files.length} items
                </div>
            </div>

            {/* Breadcrumbs */}
            {isOrganized && currentFolder && (
                 <div className="px-4 py-2 text-xs text-slate-400 flex items-center gap-1 bg-slate-800/30">
                    <span onClick={() => setCurrentFolder(null)} className="hover:underline cursor-pointer">Home</span>
                    <span>/</span>
                    <span className="text-slate-200">{FOLDER_TYPES[currentFolder].label}</span>
                 </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-2 bg-red-500/20 text-red-200 text-xs text-center border-b border-red-500/30">
                    Error loading files: {error}. Check if backend is running.
                </div>
            )}

            {/* File Grid */}
            <div className="flex-1 p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 content-start overflow-auto">
                {visibleItems.map((item) => {
                    if (item.isFolder) {
                        const Icon = item.icon || Folder;
                        return (
                             <div 
                                key={item.id}
                                className="group flex flex-col items-center gap-2 p-2 rounded hover:bg-white/10 cursor-pointer transition-colors relative"
                                onDoubleClick={() => setCurrentFolder(item.id)}
                            >
                                <div className={`w-14 h-14 flex items-center justify-center ${item.color} drop-shadow-lg group-hover:scale-105 transition-transform`}>
                                    <Icon size={48} strokeWidth={1.5} />
                                </div>
                                <div className="text-center w-full">
                                    <p className="text-xs font-medium truncate w-full px-1">{item.label}</p>
                                    <p className="text-[10px] text-slate-500">{item.count} items</p>
                                </div>
                            </div>
                        );
                    }
                    
                    // Render File
                    return (
                        <div 
                            key={item.filename}
                            className="group flex flex-col items-center gap-2 p-2 rounded hover:bg-blue-500/20 cursor-pointer transition-colors relative"
                            onDoubleClick={() => openApp('editor', { filename: item.filename })}
                        >
                            <div className="w-12 h-12 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                                <FileText size={40} strokeWidth={1.5} />
                            </div>
                            <div className="text-center w-full">
                                <p className="text-xs font-medium truncate w-full px-1">{item.filename}</p>
                                <p className="text-[10px] text-slate-500">{item.size} B</p>
                            </div>

                            {/* Quick Actions (only visible on hover) */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteFile(item.filename); }}
                                    className="p-1 bg-slate-800 hover:bg-red-500 rounded-full shadow-sm text-slate-400 hover:text-white"
                                    title="Delete"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                
                {visibleItems.length === 0 && !loading && !error && (
                    <div className="col-span-full flex flex-col items-center justify-center p-10 text-slate-500 opacity-50">
                        <Folder size={48} />
                        <p className="mt-2 text-sm">Folder is empty</p>
                    </div>
                )}
            </div>

            {/* Create Modal Overlay */}
            {showCreateModal && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-100">
                    <form onSubmit={createFile} className="bg-slate-800 p-4 rounded-lg shadow-2xl border border-slate-700 w-64">
                         <h3 className="text-sm font-semibold mb-3">Create New File</h3>
                         <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Filename</label>
                                <input 
                                    autoFocus
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                                    value={newFileName}
                                    onChange={e => setNewFileName(e.target.value)}
                                    placeholder="example.txt"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Size (bytes)</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                                    value={newFileSize}
                                    onChange={e => setNewFileSize(e.target.value)}
                                    min="1"
                                    max="1048576" // 1MB
                                    required
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
                                >
                                    Create
                                </button>
                            </div>
                         </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FileManager;


