import { createInterface } from 'readline';
import { setCurrentDir, getHomeDir, getCurrentDir } from './utils.js';
import * as ops from './operations.js';
import { basename } from 'path';

const username = process.argv
  .find((arg) => arg.startsWith('--username='))
  ?.split('=')[1] || 'User';

console.log(`Добро пожаловать в файловый менеджер, ${username}!`);

setCurrentDir(getHomeDir());
console.log(`Вы находитесь в ${getCurrentDir()}`);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = () => {
  rl.question('> ', async (input) => {
    const [command, ...args] = input.trim().split(' ');
    try {
      switch (command) {
        case '.exit':
          console.log(`Спасибо за использование файлового менеджера, ${username}, до свидания!`);
          rl.close();
          process.exit(0);
        case 'up':
          const newDir = await ops.up(getCurrentDir());
          if (setCurrentDir(newDir)) console.log(`Вы находитесь в ${newDir}`);
          break;
        case 'cd':
          if (args.length !== 1) throw new Error('Неверный ввод');
          const targetDir = await ops.cd(args[0], getCurrentDir());
          if (setCurrentDir(targetDir)) console.log(`Вы находитесь в ${targetDir}`);
          break;
        case 'ls':
          await ops.ls(getCurrentDir());
          break;
        case 'cat':
          if (args.length !== 1) throw new Error('Неверный ввод');
          await ops.cat(args[0], getCurrentDir());
          break;
        case 'add':
          if (args.length !== 1) throw new Error('Неверный ввод');
          await ops.add(args[0], getCurrentDir());
          break;
        case 'rn':
          if (args.length !== 2) throw new Error('Неверный ввод');
          await ops.rn(args[0], args[1], getCurrentDir());
          break;
        case 'cp':
          if (args.length !== 2) throw new Error('Неверный ввод');
          await ops.cp(args[0], args[1], getCurrentDir());
          break;
        case 'mv':
          if (args.length !== 2) throw new Error('Неверный ввод');
          await ops.mv(args[0], args[1], getCurrentDir());
          break;
        case 'rm':
          if (args.length !== 1) throw new Error('Неверный ввод');
          await ops.rm(args[0], getCurrentDir());
          break;
        case 'os':
          if (args.length !== 1) throw new Error('Неверный ввод');
          await ops.osInfo(args[0]);
          break;
        case 'hash':
          if (args.length !== 1) throw new Error('Неверный ввод');
          await ops.hash(args[0], getCurrentDir());
          break;
        case 'compress':
          if (args.length !== 2) throw new Error('Неверный ввод');
          await ops.compress(args[0], args[1], getCurrentDir());
          break;
        case 'decompress':
          if (args.length !== 2) throw new Error('Неверный ввод');
          await ops.decompress(args[0], args[1], getCurrentDir());
          break;
        default:
          throw new Error('Неверный ввод');
      }
    } catch (err) {
      console.error(err.message || 'Операция не выполнена');
    }
    console.log(`Вы находитесь в ${getCurrentDir()}`);
    prompt();
  });
};

prompt();

rl.on('close', () => {
  console.log(`Спасибо за использование файлового менеджера, ${username}, до свидания!`);
  process.exit(0);
});

process.on('SIGINT', () => {
  rl.close();
});