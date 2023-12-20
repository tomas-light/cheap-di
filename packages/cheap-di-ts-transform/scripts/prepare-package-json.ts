import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const paths = {
  project: path.join(__dirname, '..'),
  get readme() {
    return path.join(this.project, 'README.md');
  },
  get license() {
    return path.join(this.project, 'LICENSE');
  },
  get packageJson() {
    return path.join(this.project, 'package.json');
  },
  get dist() {
    return path.join(this.project, 'dist');
  },
  get distReadme() {
    return path.join(this.dist, 'README.md');
  },
  get distLicense() {
    return path.join(this.dist, 'LICENSE');
  },
  get distPackageJson() {
    return path.join(this.dist, 'package.json');
  },
};

async function copyReadme() {
  const readmeContent = await readFile(paths.readme, 'utf-8');
  await writeFile(paths.distReadme, readmeContent);
}
async function copyLicense() {
  const licenseContent = await readFile(paths.license, 'utf-8');
  await writeFile(paths.distLicense, licenseContent);
}

async function copyAndFixPackageJson(sourcePackageJson: Record<string, any>) {
  const modifiedPackageJson = {
    ...sourcePackageJson,
    name: 'cheap-di-ts-transform',
    ...sourcePackageJson['build-instructions'],
  };
  delete modifiedPackageJson['build-instructions'];
  delete modifiedPackageJson['devDependencies'];
  delete modifiedPackageJson['scripts'];

  const modifiedPackageJsonString = JSON.stringify(modifiedPackageJson, null, 2);
  await writeFile(paths.distPackageJson, modifiedPackageJsonString);
}

async function createEsmModulePackageJson(sourcePackageJson: Record<string, any>) {
  const directories = await readdir(paths.dist);

  const directoryTypeMap = {
    cjs: 'commonjs',
    esm: 'module',
  };
  const keys = Array.from(Object.keys(directoryTypeMap));

  for await (const directory of directories) {
    if (keys.includes(directory)) {
      const packageJsonFilePath = path.join(paths.dist, directory, 'package.json');

      const content = JSON.stringify(
        {
          type: directoryTypeMap[directory as keyof typeof directoryTypeMap],
          version: sourcePackageJson.version,
        },
        null,
        2
      );
      await writeFile(packageJsonFilePath, content);
    }
  }
}

(async () => {
  const sourcePackageJsonString = await readFile(paths.packageJson, 'utf-8');
  const sourcePackageJson = JSON.parse(sourcePackageJsonString);

  await copyReadme();
  await copyLicense();
  await copyAndFixPackageJson(sourcePackageJson);
  await createEsmModulePackageJson(sourcePackageJson);
})();
