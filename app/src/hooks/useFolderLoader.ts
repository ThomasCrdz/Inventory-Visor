import { useState, useCallback } from 'react';
import { detectSourceKey } from '../lib/folderDetect';
import type { SourceKey } from '../types';

// File System Access API types
interface FileSystemDirectoryHandle {
  name: string;
  values(): AsyncIterableIterator<FileSystemHandle>;
  requestPermission(opts: { mode: 'read' }): Promise<PermissionState>;
}
interface FileSystemFileHandle extends FileSystemHandle {
  getFile(): Promise<File>;
}
interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

declare global {
  interface Window {
    showDirectoryPicker?(opts?: { mode?: 'read' | 'readwrite'; startIn?: string }): Promise<FileSystemDirectoryHandle>;
  }
}

const DB_NAME    = 'fleet-inventory';
const STORE_NAME = 'folder-handle';
const HANDLE_KEY = 'last-folder';

async function saveHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => {
      const tx = req.result.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
      tx.oncomplete = () => { resolve(); req.result.close(); };
      tx.onerror = () => { reject(tx.error); req.result.close(); };
    };
    req.onerror = () => reject(req.error);
  });
}

async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => {
      const tx = req.result.transaction(STORE_NAME, 'readonly');
      const get = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
      get.onsuccess = () => { resolve((get.result as FileSystemDirectoryHandle | undefined) ?? null); req.result.close(); };
      get.onerror = () => { resolve(null); req.result.close(); };
    };
    req.onerror = () => { resolve(null); };
  });
}

export interface FolderLoadResult {
  matched: Record<SourceKey, string>;   // key → filename matched
  unmatched: string[];                  // filenames not recognized
}

export function useFolderLoader(
  onFile: (key: SourceKey, file: File) => void,
  addLog: (level: 'ok' | 'warn' | 'err' | 'info', msg: string) => void,
) {
  const [folderName, setFolderName]   = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [savedHandle, setSavedHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [hasSupport]                  = useState(() => typeof window.showDirectoryPicker === 'function');

  // Try to restore saved handle on mount
  const restoreHandle = useCallback(async () => {
    const h = await loadHandle();
    if (h) {
      setSavedHandle(h);
      setFolderName(h.name);
    }
  }, []);

  const readFolder = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setLoading(true);
    const unmatched: string[] = [];
    let matched = 0;

    try {
      for await (const entry of handle.values()) {
        if (entry.kind !== 'file') continue;
        const fileHandle = entry as FileSystemFileHandle;
        const name = entry.name;
        const key = detectSourceKey(name);
        if (!key) { unmatched.push(name); continue; }
        const file = await fileHandle.getFile();
        onFile(key, file);
        matched++;
      }

      if (unmatched.length) {
        addLog('warn', `Sin reconocer: ${unmatched.join(', ')}`);
      }
      addLog('ok', `📂 ${handle.name} — ${matched} archivos cargados`);
    } catch (err: unknown) {
      addLog('err', `Error leyendo carpeta: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [onFile, addLog]);

  const pickFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) return;
    try {
      const handle = await window.showDirectoryPicker({ mode: 'read' });
      await saveHandle(handle);
      setSavedHandle(handle);
      setFolderName(handle.name);
      await readFolder(handle);
    } catch (err: unknown) {
      // User cancelled — DOMException name AbortError
      if ((err as Error).name !== 'AbortError') {
        addLog('err', `Error: ${(err as Error).message}`);
      }
    }
  }, [readFolder, addLog]);

  const refreshFolder = useCallback(async () => {
    if (!savedHandle) return;
    // Re-request permission in case it expired
    const perm = await savedHandle.requestPermission({ mode: 'read' });
    if (perm !== 'granted') {
      addLog('err', 'Permiso denegado para la carpeta guardada');
      return;
    }
    await readFolder(savedHandle);
  }, [savedHandle, readFolder, addLog]);

  return { hasSupport, folderName, loading, savedHandle, pickFolder, refreshFolder, restoreHandle };
}
