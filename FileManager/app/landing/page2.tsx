'use client';

import { FMstyles as FMstyle } from './styles';
import React, { useState, useEffect } from 'react';

// 1. Define types for our scanned data
interface DiskInfo {
  total: string;
  used: string;
  free: string;
  percentUsed: string;
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  sizeMB: string;
  updatedAt: string;
}


const ICONS = [
  { id: 1, 
    img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgODAgODAiPgoJPHBhdGggZD0iTTAgMGg4MHY4MEgweiIgZmlsbD0ibm9uZSIgLz4KCTxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KCQk8cGF0aCBkPSJtNTguNjI4IDI4LjYzMWwuMi4yMDFBNCA0IDAgMCAxIDYwIDMxLjY2MXYzMC4zNDFhNCA0IDAgMCAxLTQgNEgyNGE0IDQgMCAwIDEtNC00di00NGE0IDQgMCAwIDEgNC00bDE4LjM0Mi4wMDNhNCA0IDAgMCAxIDIuODI4IDEuMTcxbC4xODMuMTg0IiAvPgoJCTxwYXRoIGQ9Ik01OC41ODYgMjguNTg2TDQ1LjQxNCAxNS40MTVBLjgyOC44MjggMCAwIDAgNDQgMTZ2MTBhNCA0IDAgMCAwIDQgNGgxMGEuODI4LjgyOCAwIDAgMCAuNTg2LTEuNDE0IiAvPgoJPC9nPgo8L3N2Zz4K',
    alt: 'DOCUMENTS',
    bgcolor:'bg-[#264653]',
    text:'#264653'
   },
   { id: 2, 
    img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgODAgODAiPgoJPHBhdGggZD0iTTAgMGg4MHY4MEgweiIgZmlsbD0ibm9uZSIgLz4KCTxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KCQk8cGF0aCBkPSJNMTggMjRhNiA2IDAgMCAxIDYtNmgzMmE2IDYgMCAwIDEgNiA2djMyYTYgNiAwIDAgMS02IDZIMjRhNiA2IDAgMCAxLTYtNnoiIC8+CgkJPHBhdGggZD0iTTI0IDYyaDMyYTYgNiAwIDAgMCA1LjgzLTQuNTc0YS45MS45MSAwIDAgMC0uMjYtLjg1NmwtNS44NjMtNS44NjNhMSAxIDAgMCAwLTEuNDE0IDBMNTAuNTIgNTQuNDhhMSAxIDAgMCAxLTEuNDQ0LS4wMzJsLTE0LjM0LTE1LjY0M2ExIDEgMCAwIDAtMS40NzQgMGwtMTUgMTYuMzY0YTEgMSAwIDAgMC0uMjYzLjY3NlY1NmE2IDYgMCAwIDAgNiA2bTIxLjQwMy0zNi41YTUuMTk2IDUuMTk2IDAgMSAxIDUuMTk2IDlhNS4xOTYgNS4xOTYgMCAwIDEtNS4xOTYtOSIgLz4KCTwvZz4KPC9zdmc+Cg==',
    alt: 'IMAGES',
    bgcolor:'bg-[#2a9d8f]',
    text:'#2a9d8f'
   },
   { id: 3, 
    img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgNDggNDgiPgoJPHBhdGggZD0iTTAgMGg0OHY0OEgweiIgZmlsbD0ibm9uZSIgLz4KCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNNDMuNSA5djMwbS01Ljc0LTI2Ljk2aDUuNzRtLTUuNzQgNS45OGg1Ljc0TTM3Ljc2IDI0aDUuNzRtLTUuNzQgNS45OGg1Ljc0bS01Ljc0IDUuOThoNS43NE0xMC4yNCAxMi4wNGgyNy41M3YyMy45MUgxMC4yNHpNNC41IDM5VjltNS43NCAzMFY5bTI3LjUyIDMwVjlNMTAuMjQgMzUuOTZINC41bTUuNzQtNS45OEg0LjVNMTAuMjQgMjRINC41bTUuNzQtNS45OEg0LjVtNS43NC01Ljk4SDQuNSIgLz4KPC9zdmc+Cg==',
    alt: 'VIDEOS',
    bgcolor:'bg-[#e9c46a]',
    text:'#e9c46a'
   },
   { id: 4, 
    img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgNDggNDgiPgoJPHBhdGggZD0iTTAgMGg0OHY0OEgweiIgZmlsbD0ibm9uZSIgLz4KCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNNDIuNSAzMS40OTl2LTYuNDZjMC0xMC4yMTctOC4yODMtMTguNS0xOC41LTE4LjVTNS41IDE0LjgyMyA1LjUgMjUuMDR2Ni40NiIgLz4KCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTAuODUgMjYuMTQ4aDEuMjNhMi43IDIuNyAwIDAgMSAyLjY5NyAyLjY5N3Y5LjkxOWEyLjcgMi43IDAgMCAxLTIuNjk2IDIuNjk2aC0xLjIzQTUuMzUzIDUuMzUzIDAgMCAxIDUuNSAzNi4xMVYzMS41YTUuMzUzIDUuMzUzIDAgMCAxIDUuMzUtNS4zNW0yNi4yMjcgMTUuMzFoLTEuMjNhMi43IDIuNyAwIDAgMS0yLjY5Ny0yLjY5NnYtOS45MTlhMi43IDIuNyAwIDAgMSAyLjY5Ni0yLjY5NmgxLjIzMWE1LjM1MyA1LjM1MyAwIDAgMSA1LjM1IDUuMzV2NC42MTJhNS4zNTMgNS4zNTMgMCAwIDEtNS4zNSA1LjM1IiAvPgo8L3N2Zz4K',
    alt: 'AUDIO',
    bgcolor:'bg-[#f4a261]',
    text:'#f4a261'
   },
   { id: 5, 
    img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgNDggNDgiPgoJPHBhdGggZD0iTTAgMGg0OHY0OEgweiIgZmlsbD0ibm9uZSIgLz4KCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMzkuMjM2IDQyLjVIOC43NjRNMjQgMzMuOTI0VjUuNU0xMi4yODcgMjIuMjExTDI0IDMzLjkyNGwxMS43MTMtMTEuNzEzIiAvPgo8L3N2Zz4K',
    alt: 'DOWNLOADS',
    bgcolor:'bg-[#e76f51]',
    text:'#e76f51'
   },
 
];


export default function ColorPaletteCard() {
  // 2. Set up state to hold our real machine data
  const [disk, setDisk] = useState<DiskInfo | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // 3. Fetch data from our API route on mount
  useEffect(() => {
    async function loadStorageData() {
      try {
        setLoading(true);
        // Leaving the path blank defaults to your User Profile folder
        const response = await fetch('/api/scan'); 
        const data = await response.json();
        
        if (response.ok) {
          setDisk(data.disk);
          setFiles(data.items);
          setCurrentPath(data.currentPath);
        }
      } catch (error) {
        console.error("Failed to read system storage:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  return (
    <div className={FMstyle.page_container}>
      
      {/* Mini Disk Space Dashboard Header */}
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

      {/* Palette / Category Container */}
      <div className={FMstyle.palette_container}>
        {ICONS.map((icon) => {
          // 4. Do some quick logic to show how many files match this section!
          // For now, let's just count total items or simulate grouping
          const totalItemsInCategory = files.length; 

          return (
            <div key={icon.id} className={`${icon.bgcolor} ${FMstyle.ColorCard1}`}>
              <div className="flex-none text-center">
                <span className={FMstyle.ColorCardContent}>{icon.alt}</span>
                <img className= {"w-36 h-36"} src={icon.img} />
                <p className="text-xs text-white/70 mt-1">
                  {loading ? 'Analyzing...' : `${totalItemsInCategory} items found`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}