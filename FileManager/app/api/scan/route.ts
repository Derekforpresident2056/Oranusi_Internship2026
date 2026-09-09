import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 1. Define what our flattened item looks like
interface FlattenedFile {
  name: string;
  path: string;
  type: 'file' | 'folder';
  sizeMB: string;
  updatedAt: Date;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetPath = searchParams.get('path') || process.env.USERPROFILE || 'C:\\';
  
  // Define our depth limits. 
  // 3 levels deep gives excellent metric accuracy for user files without hanging the system.
  const MAX_DEPTH = 3; 

  try {
    // --- 1. Get Overall Disk Storage Info via Native PowerShell ---
    const driveLetter = path.parse(targetPath).root.substring(0, 2);
    const psCommand = `powershell -Command "Get-CimInstance Win32_LogicalDisk -Filter 'DeviceID=\\"${driveLetter}\\"' | Select-Object Size, FreeSpace | ConvertTo-Json"`;
    
    const output = execSync(psCommand).toString();
    const diskData = JSON.parse(output);

    const totalBytes = Number(diskData.Size);
    const freeBytes = Number(diskData.FreeSpace);
    const usedBytes = totalBytes - freeBytes;

    const totalGB = (totalBytes / 1024 / 1024 / 1024).toFixed(2);
    const freeGB = (freeBytes / 1024 / 1024 / 1024).toFixed(2);
    const usedGB = (usedBytes / 1024 / 1024 / 1024).toFixed(2);

    // --- 2. Depth-Limited Recursive Scanning ---
    const filesData: FlattenedFile[] = [];

    function scanDirectory(currentDir: string, currentDepth: number) {
      // Hard break condition: stop diving if we exceed our targeted depth boundary
      if (currentDepth > MAX_DEPTH) return;

      let items: string[] = [];
      try {
        items = fs.readdirSync(currentDir);
      } catch (err) {
        // Skip system/locked directories entirely
        return;
      }

      for (const item of items) {
        try {
          const fullPath = path.join(currentDir, item);
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            // Push the folder itself into the flat map array
            filesData.push({
              name: item,
              path: fullPath,
              type: 'folder',
              sizeMB: '0.00', // Folders don't have direct size stats natively
              updatedAt: stats.mtime
            });

            // Keep digging into subfolders, incrementing the depth counter
            scanDirectory(fullPath, currentDepth + 1);
          } else {
            // It's a file, calculate its size and push it
            filesData.push({
              name: item,
              path: fullPath,
              type: 'file',
              sizeMB: (stats.size / 1024 / 1024).toFixed(2),
              updatedAt: stats.mtime
            });
          }
        } catch (err) {
          // Skip unreadable files or symbolic links that break stats
          continue;
        }
      }
    }

    // Initialize our recursive scan starting at depth 1
    scanDirectory(targetPath, 1);

    // --- 3. Sort by largest size first ---
    filesData.sort((a, b) => Number(b.sizeMB) - Number(a.sizeMB));

    return NextResponse.json({
      disk: {
        total: `${totalGB} GB`,
        used: `${usedGB} GB`,
        free: `${freeGB} GB`,
        percentUsed: ((usedBytes / totalBytes) * 100).toFixed(1)
      },
      currentPath: targetPath,
      items: filesData
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// PATCH: Rename a file or folder
export async function PATCH(request: Request) {
  try {
    const { oldPath, newName } = await request.json();

    if (!oldPath || !newName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);

    // Prevent overwriting existing files
    if (fs.existsSync(newPath)) {
      return NextResponse.json({ error: 'A file or folder with that name already exists.' }, { status: 409 });
    }

    fs.renameSync(oldPath, newPath);

    return NextResponse.json({ success: true, newPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// DELETE: Delete a file or folder
export async function DELETE(request: Request) {
  try {
    const { targetPath } = await request.json();

    if (!targetPath) {
      return NextResponse.json({ error: 'Missing target path' }, { status: 400 });
    }

    const stats = fs.statSync(targetPath);

    if (stats.isDirectory()) {
      // Remove folder and recursive contents
      fs.rmSync(targetPath, { recursive: true, force: true });
    } else {
      // Remove single file
      fs.unlinkSync(targetPath);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}