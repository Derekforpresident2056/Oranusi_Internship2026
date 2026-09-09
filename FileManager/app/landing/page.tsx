'use client';

import { FMstyles as FMstyle } from './styles';
import React, { useState, useEffect } from 'react';
import FileExplorerModal from './FileExplorerModal';
import { DiskInfo, FileItem, IconCategory, ActiveCategoryContext } from './types';

const ICONS = [
  { 
    id: 1, 
    img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgODAgODAiPgoJPHBhdGggZD0iTTAgMGg4MHY4MEgweiIgZmlsbD0ibm9uZSIgLz4KCTxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KCQk8cGF0aCBkPSJtNTguNjI4IDI4LjYzMWwuMi4yMDFBNCA0IDAgMCAxIDYwIDMxLjY2MXYzMC4zNDFhNCA0IDAgMCAxLTQgNEgyNGE0IDQgMCAwIDEtNC00di00NGE0IDQgMCAwIDEgNC00bDE4LjM0Mi4wMDNhNCA0IDAgMCAxIDIuODI4IDEuMTcxbC4xODMuMTg0IiAvPgoJCTxwYXRoIGQ9Ik01OC41ODYgMjguNTg2TDQ1LjQxNCAxNS40MTVBLjgyOC44MjggMCAwIDAgNDQgMTZ2MTBhNCA0IDAgMCAwIDQgNGgxMGEuODI4LjgyOCAwIDAgMCAuNTg2LTEuNDE0IiAvPgoJPC9nPgo8L3N2Zz4K',
    alt: 'DOCUMENTS',
    bgcolor: 'bg-[#264653]',
    text: '#264653'
  },
  { 
    id: 2, 
    img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgODAgODAiPgoJPHBhdGggZD0iTTAgMGg4MHY4MEgweiIgZmlsbD0ibm9uZSIgLz4KCTxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KCQk8cGF0aCBkPSJNMTggMjRhNiA2IDAgMCAxIDYtNmgzMmE2IDYgMCAwIDEgNiA2djMyYTYgNiAwIDAgMS02IDZIMjRhNiA2IDAgMCAxLTYtNnoiIC8+CgkJPHBhdGggZD0iTTI0IDYyaDMyYTYgNiAwIDAgMCA1LjgzLTQuNTc0YS45MS45MSAwIDAgMC0uMjYtLjg1NmwtNS44NjMtNS44NjNhMSAxIDAgMCAwLTEuNDE0IDBMNTAuNTIgNTQuNDhhMSAxIDAgMCAxLTEuNDQ0LS4wMzJsLTE0LjM0LTE1LjY0M2Ex IDEgMCAwIDAtMS40NzQgMGwtMTUgMTYuMzY0YTEgMSAwIDAgMC0uMjYzLjY3NlY1NmE2IDYgMCAwIDAgNiA2bTIxLjQwMy0zNi41YTUuMTk2IDUuMTk2IDAgMSAxIDUuMTk2IDlhNS4xOTYgNS4xOTYgMCAwIDEtNS4xOTYtOSIgLz4KCTwvZz4KPC9zdmc+Cg==',
    alt: 'IMAGES',
    bgcolor: 'bg-[#2a9d8f]',
    text: '#2a9d8f'
  },
  { 
    id: 3, 
    img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgNDggNDgiPgoJPHBhdGggZD0iTTAgMGg4MHY4MEgweiIgZmlsbD0ibm9uZSIgLz4KCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNNDMuNSA5djMwbS01Ljc0LTI2Ljk2aDUuNzRtLTUuNzQgNS45OGg1Ljc0TTM3Ljc2IDI0aDUuNzRtLTUuNzQgNS45OGg1Ljc0bS01Ljc0IDUuOThoNS43NE0xMC4yNCAxMi4wNGgyNy41M3YyMy45MUgxMC4yNHpNNC41IDM5VjltNS43NCAzMFY5bTI3LjUyIDMwVjlNMTAuMjQgMzUuOTZINC41bTUuNzQtNS45OEg0LjVNMTAuMjQgMjRINC41bTUuNzQtNS45OEg0LjVtNS43NC01Ljk4SDQuNSIgLz4KPC9zdmc+Cg==',
    alt: 'VIDEOS',
    bgcolor: 'bg-[#e9c46a]',
    text: '#e9c46a'
  },
  { 
    id: 4, 
    img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgNDggNDgiPgoJPHBhdGggZD0iTTAgMGg4MHY4MEgweiIgZmlsbD0ibm9uZSIgLz4KCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNNDIuNSAzMS40OTl2LTYuNDZjMC0xMC4yMTctOC4yODMtMTguNS0xOC41LTE4LjVTNS41IDE0LjgyMyA1LjUgMjUuMDR2Ni40NiIgLz4KCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTAuODUgMjYuMTQ4aDEuMjNhMi43IDIuNyAwIDAgMSAyLjY5NyAyLjY5N3Y5LjkxOWEyLjcgMi43IDAgMCAxLTIuNjk2IDIuNjk2aC0xLjIzQTUuMzUzIDUuMzUzIDAgMCAxIDUuNSAzNi4xMVYzMS41YTUuMzUzIDUuMzUzIDAgMCAxIDUuMzUtNS4zNW0yNi4yMjcgMTUuMzFoLTEuMjNhMi43IDIuNyAwIDAgMS0yLjY5Ny0yLjY5NnYtOS45MTlhMi43IDIuNyAwIDAgMSAyLjY5Ni0yLjY5NmgxLjIzMWE1LjM1MyA1LjM1MyAwIDAgMSA1LjM1IDUuMzV2NC42MTJhNS4zNTMgNS4zNTMgMCAwIDEtNS4zNSA1LjM1IiAvPgo8L3N2Zz4K',
    alt: 'AUDIO',
    bgcolor: 'bg-[#f4a261]',
    text: '#f4a261'
  },
  { 
    id: 5, 
   img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgNDggNDgiPgoJPHBhdGggZD0iTTAgMGg0OHY0OEgweiIgZmlsbD0ibm9uZSIgLz4KCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMzkuMjM2IDQyLjVIOC43NjRNMjQgMzMuOTI0VjUuNU0xMi4yODcgMjIuMjExTDI0IDMzLjkyNGwxMS43MTMtMTEuNzEzIiAvPgo8L3N2Zz4K',
    alt: 'DOWNLOADS',
    bgcolor: 'bg-[#e76f51]',
    text: '#e76f51'
  }
];

export default function ColorPaletteCard() {
  const [disk, setDisk] = useState<DiskInfo | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<ActiveCategoryContext | null>(null);


  const triggerRefresh = () => {
  // Toggling or re-setting currentPath forces the main useEffect scan to run
  setCurrentPath((prev) => prev);
};

  // Unified Data Fetcher
  const fetchStorageData = async () => {
    setLoading(true);
    try {
      const url = currentPath 
        ? `/api/scan?path=${encodeURIComponent(currentPath)}` 
        : '/api/scan';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setDisk(data.disk);
        setFiles(data.items || []);
        if (!currentPath && data.currentPath) {
          setCurrentPath(data.currentPath);
        }
      }
    } catch (err) {
      console.error("Failed to read directory details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
  }, [currentPath]);

  return (
    <div className={FMstyle.page_container}>
      
      {/* Disk Space Header */}
      {disk && (
        <div className="p-6 max-w-4xl w-full mx-auto bg-white/5 backdrop-blur rounded-xl mb-4 text-white">
          <p className="text-sm opacity-60 uppercase tracking-wider">Scanning: {currentPath}</p>
          <div className="flex justify-between items-end mt-2">
            <h2 className="text-2xl font-bold">{disk.used} / {disk.total} Used</h2>
            <span className="text-sm font-semibold px-2 py-1 bg-white/10 rounded">{disk.percentUsed}%</span>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all duration-500" 
              style={{ width: `${disk.percentUsed}%` }}
            />
          </div>
        </div>
      )}

      {/* Palette / Category Grid */}
      <div className={FMstyle.palette_container}>
        {ICONS.map((icon) => {
          const categoryItems = files.filter(item => {
            if (item.type !== 'file') return false;
            const ext = item.name.split('.').pop()?.toLowerCase() || '';

            switch (icon.alt) {
              case 'DOCUMENTS':
                return ['pdf', 'docx', 'doc', 'txt', 'xlsx', 'pptx', 'md'].includes(ext);
              case 'IMAGES':
                return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
              case 'VIDEOS':
                return ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext);
              case 'AUDIO':
                return ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext);
              default:
                const knownExts = [
                  'pdf', 'docx', 'doc', 'txt', 'xlsx', 'pptx', 'md', 
                  'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 
                  'mp4', 'mkv', 'avi', 'mov', 'webm', 
                  'mp3', 'wav', 'flac', 'aac', 'ogg'
                ];
                return !knownExts.includes(ext);
            }
          });

          const totalCount = categoryItems.length;
          const totalSize = categoryItems.reduce((acc, item) => acc + Number(item.sizeMB), 0).toFixed(1);

          return (
            <div 
              key={icon.id}  
              onClick={() => setActiveCategory({ name: icon.alt as any, bgcolor: icon.bgcolor })}
              className={`${icon.bgcolor} ${FMstyle.ColorCard1} cursor-pointer hover:opacity-90 transition`}
            >
              <div className="flex-none text-center">
                <span className={FMstyle.ColorCardContent}>{icon.alt}</span>
                <img className="w-36 h-36 mx-auto object-contain" src={icon.img} alt={icon.alt} />
                <p className="text-xs text-white/70 mt-1">
                  {loading ? 'Analyzing...' : `${totalCount} items (${totalSize} MB)`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modular File Explorer Modal */}
      <FileExplorerModal 
  activeCategory={activeCategory}
  onClose={() => setActiveCategory(null)}
  currentPath={currentPath}
  setCurrentPath={setCurrentPath}
  allFiles={files}
  loading={loading}
  onRefresh={triggerRefresh}
/>

    </div>
  );
}