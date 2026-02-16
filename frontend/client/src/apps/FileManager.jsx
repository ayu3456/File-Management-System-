import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, FileText, Plus, RefreshCw, Trash2, File } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const FileManager = ({ openApp }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFileSize, setNewFileSize] = useState('100');

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/files`);
            // Backend returns array of files or error
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

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className="flex flex-col h-full text-slate-200">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b border-slate-700 bg-slate-800/50">
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors"
                >
                    <Plus size={14} /> New File
                </button>
                <button 
                    onClick={fetchFiles}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <div className="ml-auto text-xs text-slate-400">
                    {files.length} items
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-2 bg-red-500/20 text-red-200 text-xs text-center border-b border-red-500/30">
                    Error loading files: {error}. Check if backend is running.
                </div>
            )}

            {/* File Grid */}
            <div className="flex-1 p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 content-start overflow-auto">
                {files.map((file) => (
                    <div 
                        key={file.filename}
                        className="group flex flex-col items-center gap-2 p-2 rounded hover:bg-blue-500/20 cursor-pointer transition-colors relative"
                        onDoubleClick={() => openApp('editor', { filename: file.filename })}
                    >
                         <div className="w-12 h-12 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                            <FileText size={40} strokeWidth={1.5} />
                        </div>
                        <div className="text-center w-full">
                            <p className="text-xs font-medium truncate w-full px-1">{file.filename}</p>
                            <p className="text-[10px] text-slate-500">{file.size} B</p>
                        </div>

                        {/* Quick Actions (only visible on hover) */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteFile(file.filename); }}
                                className="p-1 bg-slate-800 hover:bg-red-500 rounded-full shadow-sm text-slate-400 hover:text-white"
                                title="Delete"
                            >
                                <Trash2 size={10} />
                            </button>
                        </div>
                    </div>
                ))}
                
                {files.length === 0 && !loading && !error && (
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
