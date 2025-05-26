import { readdir, stat, writeFile, rename, unlink } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createHash } from 'crypto';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { EOL, cpus, userInfo, arch, homedir } from 'os';
import { resolvePath, isRootDir } from './utils.js';
import { basename, dirname } from 'path';

export const up = async (currentDir) => {
  if (isRootDir(currentDir)) {
    console.log('Невозможно подняться выше корневой директории');
    return currentDir;
  }
  const parentDir = resolvePath('..', currentDir);
  return parentDir;
};

export const cd = async (path, currentDir) => {
  const newDir = resolvePath(path, currentDir);
  try {
    const stats = await stat(newDir);
    if (!stats.isDirectory()) throw new Error('Это не директория');
    return newDir;
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const ls = async (currentDir) => {
  try {
    const files = await readdir(currentDir, { withFileTypes: true });
    const dirs = [];
    const fileList = [];
    for (const item of files) {
      (item.isDirectory() ? dirs : fileList).push({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
      });
    }
    const sorted = [...dirs, ...fileList].sort((a, b) => a.name.localeCompare(b.name));
    console.table(sorted.map((item, index) => ({ index, ...item })));
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const cat = async (path, currentDir) => {
  const filePath = resolvePath(path, currentDir);
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error('Это не файл');
    const stream = createReadStream(filePath, { encoding: 'utf8' });
    stream.on('data', (chunk) => process.stdout.write(chunk));
    stream.on('error', () => { throw new Error('Операция не выполнена'); });
    await new Promise((resolve) => stream.on('end', resolve));
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const add = async (fileName, currentDir) => {
  const filePath = resolvePath(fileName, currentDir);
  try {
    await writeFile(filePath, '', { flag: 'wx' });
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const rn = async (path, newFileName, currentDir) => {
  const oldPath = resolvePath(path, currentDir);
  const newPath = resolvePath(newFileName, dirname(oldPath));
  try {
    await rename(oldPath, newPath);
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const cp = async (path, newDir, currentDir) => {
  const srcPath = resolvePath(path, currentDir);
  const destDir = resolvePath(newDir, currentDir);
  const destPath = resolvePath(basename(srcPath), destDir);
  try {
    const stats = await stat(srcPath);
    if (!stats.isFile()) throw new Error('Это не файл');
    await pipeline(createReadStream(srcPath), createWriteStream(destPath));
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const mv = async (path, newDir, currentDir) => {
  await cp(path, newDir, currentDir);
  try {
    const srcPath = resolvePath(path, currentDir);
    await unlink(srcPath);
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const rm = async (path, currentDir) => {
  const filePath = resolvePath(path, currentDir);
  try {
    await unlink(filePath);
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const osInfo = async (flag) => {
  try {
    switch (flag) {
      case '--EOL':
        console.log(JSON.stringify(EOL));
        break;
      case '--cpus':
        const cpuInfo = cpus().map((cpu) => ({
          model: cpu.model,
          speed: (cpu.speed / 1000).toFixed(2) + ' GHz',
        }));
        console.log(`Всего процессоров: ${cpuInfo.length}`);
        console.table(cpuInfo);
        break;
      case '--homedir':
        console.log(homedir());
        break;
      case '--username':
        console.log(userInfo().username);
        break;
      case '--architecture':
        console.log(arch());
        break;
      default:
        throw new Error('Неверный ввод');
    }
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const hash = async (path, currentDir) => {
  const filePath = resolvePath(path, currentDir);
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error('Это не файл');
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.pipe(hash);
    hash.on('data', (data) => console.log(data.toString('hex')));
    await new Promise((resolve) => stream.on('end', resolve));
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const compress = async (path, dest, currentDir) => {
  const srcPath = resolvePath(path, currentDir);
  const destPath = resolvePath(dest, currentDir);
  try {
    const stats = await stat(srcPath);
    if (!stats.isFile()) throw new Error('Это не файл');
    await pipeline(createReadStream(srcPath), createBrotliCompress(), createWriteStream(destPath));
  } catch {
    throw new Error('Операция не выполнена');
  }
};

export const decompress = async (path, dest, currentDir) => {
  const srcPath = resolvePath(path, currentDir);
  const destPath = resolvePath(dest, currentDir);
  try {
    const stats = await stat(srcPath);
    if (!stats.isFile()) throw new Error('Это не файл');
    await pipeline(createReadStream(srcPath), createBrotliDecompress(), createWriteStream(destPath));
  } catch {
    throw new Error('Операция не выполнена');
  }
};