import { homedir } from 'os';
import { join, isAbsolute, resolve, dirname } from 'path';

export const getHomeDir = () => homedir();

export const getCurrentDir = () => process.cwd();

export const setCurrentDir = (newDir) => {
  try {
    process.chdir(newDir);
    return true;
  } catch {
    return false;
  }
};

export const resolvePath = (path, currentDir = process.cwd()) => {
  return isAbsolute(path) ? path : join(currentDir, path);
};

export const isRootDir = (currentDir) => {
  const parentDir = dirname(currentDir);
  return parentDir === currentDir;
};