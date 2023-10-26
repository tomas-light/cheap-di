import { Stats } from 'fs';
import { readdir, stat, writeFile } from 'fs/promises';
import path from 'path';

const buildDir = './dist';

async function createEsmModulePackageJson() {
  const directories = await readdir(buildDir);

  for await (const directory of directories) {
    if (directory === 'esm') {
      const packageJsonFilePath = path.join(buildDir, directory, '/package.json');

      let fileStat: Stats | undefined;

      try {
        fileStat = await stat(packageJsonFilePath);
      } catch {}

      if (!fileStat?.isFile()) {
        const content = JSON.stringify({ type: 'module' }, null, 2);
        await writeFile(packageJsonFilePath, content);
      }
    }
  }
}

createEsmModulePackageJson();
