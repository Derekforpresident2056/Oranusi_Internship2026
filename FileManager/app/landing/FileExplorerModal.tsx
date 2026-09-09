'use client';

import React, { useState } from 'react';
import { FileItem, ActiveCategoryContext } from './types';

interface FileExplorerModalProps {
  activeCategory: ActiveCategoryContext | null;
  onClose: () => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  allFiles: FileItem[];
  loading: boolean;
  onRefresh: () => void; // Triggered after delete/rename to sync parent state
}

export default function FileExplorerModal({
  activeCategory,
  onClose,
  currentPath,
  setCurrentPath,
  allFiles,
  loading,
  onRefresh
}: FileExplorerModalProps) {
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!activeCategory) return null;

  // Internal category filtering
  const filteredFiles = allFiles.filter(item => {
    if (activeCategory.name === 'DOWNLOADS') {
      return item.path.toLowerCase().includes('\\downloads\\');
    }
    if (item.type !== 'file') return item.type === 'folder'; 
    
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    switch (activeCategory.name) {
      case 'DOCUMENTS': return ['pdf', 'docx', 'doc', 'txt', 'xlsx', 'pptx', 'md'].includes(ext);
      case 'IMAGES': return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
      case 'VIDEOS': return ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext);
      case 'AUDIO': return ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext);
      default: return false;
    }
  });

  // Action: Handle Rename
  const handleRename = async (oldPath: string) => {
    if (!newName.trim()) return setEditingPath(null);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/scan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath, newName })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Rename failed: ${err.error}`);
      } else {
        onRefresh(); // Trigger parent re-scan
      }
    } catch (err) {
      console.error('Failed to rename item:', err);
    } finally {
      setIsProcessing(false);
      setEditingPath(null);
    }
  };

  // Action: Handle Delete
  const handleDelete = async (targetPath: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/scan', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPath })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Delete failed: ${err.error}`);
      } else {
        onRefresh(); // Trigger parent re-scan
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-white overflow-y-auto max-h-[50vh] shadow-2xl z-20">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-400">
            📂 {activeCategory.name} Cluster
          </h3>
          <p className="text-xs opacity-50 truncate max-w-xl mt-0.5">Path: {currentPath}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {currentPath.includes('\\') && (
            <button 
              onClick={() => {
                const pathParts = currentPath.split('\\');
                pathParts.pop();
                setCurrentPath(pathParts.join('\\') || 'C:\\');
              }}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 transition rounded text-xs font-semibold"
            >
              ← Up
            </button>
          )}
          <button onClick={onClose} className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded text-xs font-semibold">
            Close
          </button>
        </div>
      </div>

      {/* File List Stream with Edit & Delete Action Buttons */}
      <div className="divide-y divide-white/5 max-h-[35vh] overflow-y-auto custom-scrollbar">
        {loading || isProcessing ? (
          <div className="text-center py-8 opacity-60 text-sm">Processing storage operation...</div>
        ) : filteredFiles.length > 0 ? (
          filteredFiles.map((item) => (
            <div 
              key={item.path}
              className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-white/5 transition group"
            >
              {/* Item Icon & Name (or Inline Input Mode) */}
              <div className="flex items-center gap-3 truncate flex-1 mr-4">
                <span className="text-base flex-none">{item.type === 'folder' ? '📁' : '📄'}</span>

                {editingPath === item.path ? (
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(item.path);
                      if (e.key === 'Escape') setEditingPath(null);
                    }}
                    autoFocus
                    className="bg-black/60 border border-emerald-400/50 rounded px-2 py-0.5 text-sm text-white focus:outline-none w-full max-w-xs"
                  />
                ) : (
                  <span 
                    onClick={() => item.type === 'folder' && setCurrentPath(item.path)}
                    className={`font-medium text-sm truncate ${
                      item.type === 'folder' ? 'cursor-pointer text-emerald-300 hover:underline' : 'text-white/90'
                    }`}
                  >
                    {item.name}
                  </span>
                )}
              </div>

              {/* Action Buttons & Metadata */}
              <div className="flex items-center gap-4 text-xs flex-none font-mono">
                {item.type !== 'folder' && <span className="opacity-60">{item.sizeMB} MB</span>}

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingPath === item.path ? (
                    <>
                      <button 
                        onClick={() => handleRename(item.path)}
                        className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/40"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingPath(null)}
                        className="px-2 py-0.5 bg-white/10 text-white/60 rounded hover:bg-white/20"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setEditingPath(item.path);
                          setNewName(item.name);
                        }}
                        className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/40"
                      >
                        Rename
                      </button>
                      <button 
                        onClick={() => handleDelete(item.path, item.name)}
                        className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded hover:bg-rose-500/40"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 opacity-40 text-sm">Empty environment layer.</div>
        )}
      </div>
    </div>
  );
}