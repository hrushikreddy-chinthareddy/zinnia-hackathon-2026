// restore-package-json.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Assuming the app's directory name is provided as an argument to the script
const appName = process.argv[3];

if (!appName) {
  console.error('Please provide the app name as an argument.');
  process.exit(1);
}

// Resolve the paths
const appPackageJsonPath = path.resolve(
  process.cwd(),
  'apps',
  appName,
  'package.json'
);
const cachedDirPath = path.resolve(process.cwd(), 'cached-package-json');
const cachedPackageJsonPath = path.resolve(cachedDirPath, `${appName}.json`);

try {
  // Check if the cached package.json file exists
  if (!fs.existsSync(cachedPackageJsonPath)) {
    console.error(`Cached package.json not found for app "${appName}"`);
    process.exit(1);
  }

  // Replace the current package.json file with the cached one
  fs.copyFileSync(cachedPackageJsonPath, appPackageJsonPath);
  console.log(
    `Successfully restored package.json for "${appName}" from cache.`
  );

  // Delete the cached package.json file
  fs.unlinkSync(cachedPackageJsonPath);
  console.log(`Deleted cached package.json for "${appName}".`);

  // Optionally, run `pnpm install` to sync the dependencies
  const appPath = path.resolve(process.cwd(), 'apps', appName);
  execSync('pnpm install', { cwd: appPath, stdio: 'inherit' });
  console.log('pnpm install completed successfully.');
} catch (error) {
  console.error(`Failed to restore package.json for "${appName}":`, error);
  process.exit(1);
}
