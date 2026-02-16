import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const TextEditor = ({ filename }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(''); // 'saved', 'unsaved', 'error'

    const fetchContent = async () => {
        if (!filename) return;
        setLoading(true);
        setStatus('');
        try {
            const res = await axios.get(`${API_URL}/files/${filename}`);
            if (res.data.content !== undefined) {
                setContent(res.data.content);
                setStatus('loaded');
            } else {
                setContent('');
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const saveContent = async () => {
        if (!filename) return;
        setSaving(true);
        try {
            await axios.put(`${API_URL}/files/${filename}`, { content });
            setStatus('saved');
            setTimeout(() => setStatus(''), 2000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [filename]);

    if (!filename) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                <p>No file selected</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-200">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b border-slate-700 bg-slate-800/50">
                <span className="text-xs font-medium text-slate-400 mr-2">{filename}</span>
                <button 
                    onClick={saveContent}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded text-xs font-medium transition-colors"
                >
                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button 
                    onClick={fetchContent}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                    title="Reload"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                
                {status === 'saved' && <span className="text-xs text-emerald-400 ml-auto">Saved</span>}
                {status === 'error' && (
                    <span className="text-xs text-red-400 ml-auto flex items-center gap-1">
                        <AlertCircle size={12} /> Error
                    </span>
                )}
            </div>

            {/* Editor Area */}
            <textarea
                className="flex-1 w-full bg-slate-900 p-4 outline-none text-sm font-mono text-slate-300 resize-none selection:bg-blue-500/30"
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                    if (status === 'saved' || status === 'loaded') setStatus('unsaved');
                }}
                placeholder="Type here..."
                spellCheck={false}
            />
            
            {/* Status Bar */}
            <div className="h-6 bg-slate-800 border-t border-slate-700 flex items-center px-2 text-[10px] text-slate-500 justify-end">
                <span>{content.length} chars</span>
            </div>
        </div>
    );
};

export default TextEditor;
