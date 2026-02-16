import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, RefreshCw, RotateCcw, FileX, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const RecycleBin = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDeletedFiles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/files`);
            if (Array.isArray(res.data)) {
                // Filter only files starting with .trash_
                const deleted = res.data.filter(f => f.filename.startsWith('.trash_'));
                setFiles(deleted);
                setError(null);
            } else {
                setFiles([]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const restoreFile = async (filename) => {
        const originalName = filename.replace('.trash_', '');
        try {
            await axios.post(`${API_URL}/files/rename`, {
                oldName: filename,
                newName: originalName
            });
            fetchDeletedFiles();
        } catch (err) {
            alert('Failed to restore file: ' + err.message);
        }
    };

    const deletePermanently = async (filename) => {
        if (!confirm(`Permanently delete ${filename}? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_URL}/files/${filename}`);
            fetchDeletedFiles();
        } catch (err) {
            alert('Failed to delete file');
        }
    };

    const emptyBin = async () => {
        if (!confirm('Are you sure you want to permanently delete all items?')) return;
        for (const file of files) {
            try {
                await axios.delete(`${API_URL}/files/${file.filename}`);
            } catch (e) {
                console.error(e);
            }
        }
        fetchDeletedFiles();
    };

    useEffect(() => {
        fetchDeletedFiles();
    }, []);

    return (
        <div className="flex flex-col h-full text-slate-200 bg-slate-900/90">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b border-slate-700 bg-slate-800/50">
                <button 
                    onClick={emptyBin}
                    disabled={files.length === 0}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 rounded text-xs font-medium transition-colors"
                >
                    <Trash2 size={14} /> Empty Bin
                </button>
                 <button 
                    onClick={fetchDeletedFiles}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors ml-auto"
                    title="Refresh"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <div className="text-xs text-slate-400">
                    {files.length} items
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 content-start overflow-auto">
                <div className="grid grid-cols-1 gap-2">
                    {files.map((file) => (
                        <div key={file.filename} className="flex items-center justify-between p-3 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-red-500/20 rounded text-red-400">
                                    <FileX size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{file.filename.replace('.trash_', '')}</p>
                                    <p className="text-xs text-slate-500">
                                        Original Size: {file.size} B • Deleted just now
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => restoreFile(file.filename)}
                                    className="p-1.5 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                                    title="Restore"
                                >
                                    <RotateCcw size={16} />
                                </button>
                                <button 
                                    onClick={() => deletePermanently(file.filename)}
                                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                    title="Delete Permanently"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {files.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500 opacity-50">
                        <Trash2 size={48} />
                        <p className="mt-2 text-sm">Recycle Bin is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecycleBin;
