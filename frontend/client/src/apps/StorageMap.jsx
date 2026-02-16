import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, HardDrive, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const CATEGORY_COLORS = {
    documents: 'bg-blue-500', 
    images: 'bg-purple-500',
    code: 'bg-emerald-500',
    others: 'bg-amber-500',
    free: 'bg-slate-700/50'
};

const CATEGORY_LABELS = {
    documents: 'Documents',
    images: 'Images',
    code: 'Code',
    others: 'Others',
    free: 'Free Space'
};

const StorageMap = () => {
    const [status, setStatus] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [statusRes, filesRes] = await Promise.all([
                axios.get(`${API_URL}/status`),
                axios.get(`${API_URL}/files`)
            ]);
            setStatus(statusRes.data);
            setFiles(filesRes.data);
        } catch (err) {
            console.error("Failed to fetch storage data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to determine file category (duplicated logic, should abstract but keeping simple)
    const getFileCategory = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(ext)) return 'documents';
        if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return 'images';
        if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'c', 'h', 'py'].includes(ext)) return 'code';
        return 'others';
    };

    // Build the Block Map
    const renderBlockMap = () => {
        if (!status) return null;

        const totalBlocks = status.total_blocks || 100; // Default fallback
        const blocks = new Array(totalBlocks).fill('free');
        
        // Fill blocks based on files
        // Note: This is an abstraction. Real block allocation might be fragmented.
        // We are just showing relative usage visually.
        let currentIndex = 0;
        
        files.forEach(file => {
            if (file.filename.startsWith('.trash_')) return; // Don't count trash for active storage visualization? Or allow it?
            // Maybe trash should be a separate color 'red'?
            // Let's treat trash as 'others' or 'trash' category if we want.
            // For now, let's include trash as 'others' or specific category.
            
            const category = file.filename.startsWith('.trash_') ? 'others' : getFileCategory(file.filename);
            const fileBlocks = file.blocks;
            
            for (let i = 0; i < fileBlocks && currentIndex < totalBlocks; i++) {
                blocks[currentIndex] = category;
                currentIndex++;
            }
        });

        return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(12px,1fr))] gap-1 p-4 bg-slate-900 rounded-lg border border-slate-700">
                {blocks.map((type, idx) => (
                    <div 
                        key={idx} 
                        className={`w-3 h-3 rounded-sm ${CATEGORY_COLORS[type] || 'bg-slate-700/50'} transition-all hover:scale-125 hover:z-10`}
                        title={`Block ${idx}: ${type}`}
                    ></div>
                ))}
            </div>
        );
    };

    if (!status) return <div className="p-4 text-slate-400">Loading storage info...</div>;

    const usedSize = status.total_size - (status.free_blocks * status.block_size);
    const usedPercent = Math.round((usedSize / status.total_size) * 100);

    return (
        <div className="flex flex-col h-full text-slate-200 bg-slate-900/90 overflow-hidden">
             {/* Header */}
             <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
                         <HardDrive size={24} />
                     </div>
                     <div>
                         <h2 className="font-semibold text-lg">Virtual Disk Storage</h2>
                         <p className="text-xs text-slate-400">
                             {usedPercent}% Used ({usedSize} B / {status.total_size} B)
                         </p>
                     </div>
                 </div>
                 <button onClick={fetchData} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                     <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                 </button>
             </div>

             {/* Visualization */}
             <div className="flex-1 p-4 overflow-auto">
                 <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Block Usage Map</h3>
                 {renderBlockMap()}

                 {/* Legend */}
                 <div className="mt-6">
                     <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">File Types</h3>
                     <div className="flex flex-wrap gap-4">
                         {Object.keys(CATEGORY_LABELS).map(cat => (
                             <div key={cat} className="flex items-center gap-2">
                                 <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat]}`}></div>
                                 <span className="text-sm text-slate-300">{CATEGORY_LABELS[cat]}</span>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default StorageMap;
