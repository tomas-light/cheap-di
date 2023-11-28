import { readdir, writeFile } from 'fs/promises';
import path from 'path';

const buildDir = './dist';

async function createEsmModulePackageJson() {
  const directories = await readdir(buildDir);

  const directoryTypeMap = {
    cjs: 'commonjs',
    esm: 'module',
  };
  const keys = Array.from(Object.keys(directoryTypeMap));

  for await (const directory of directories) {
    if (keys.includes(directory)) {
      const packageJsonFilePath = path.join(buildDir, directory, '/package.json');

      const content = JSON.stringify(
        {
          type: directoryTypeMap[directory as keyof typeof directoryTypeMap],
        },
        null,
        2
      );
      await writeFile(packageJsonFilePath, content);
    }
  }
}

createEsmModulePackageJson();
