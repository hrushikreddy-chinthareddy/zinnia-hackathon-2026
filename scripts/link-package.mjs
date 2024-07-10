import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const [packageName, appName] = process.argv.slice(3);

if (!appName || !packageName) {
  console.error('Please provide the app name and package name as arguments.');
  process.exit(1);
}

// Resolve the path to the package.json file of the app
const appPackageJsonPath = path.resolve(
  process.cwd(),
  'apps',
  appName,
  'package.json'
);
const cachedDirPath = path.resolve(process.cwd(), 'cached-package-json');
const cachedPackageJsonPath = path.resolve(cachedDirPath, `${appName}.json`);

try {
  if (!fs.existsSync(cachedDirPath)) {
    fs.mkdirSync(cachedDirPath);
  }

  const packageJsonRaw = fs.readFileSync(appPackageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonRaw);

  // Save the original package.json in the cache directory
  if (!fs.existsSync(cachedPackageJsonPath)) {
    fs.writeFileSync(cachedPackageJsonPath, packageJsonRaw, 'utf8');
  }

  // Check both dependencies and devDependencies
  let isUpdated = false;
  ['dependencies', 'devDependencies'].forEach((depType) => {
    if (packageJson[depType] && packageJson[depType][packageName]) {
      packageJson[depType][packageName] = 'workspace:*';
      isUpdated = true;
    }
  });

  // Write the updated JSON object back to the package.json file if changes were made
  if (isUpdated) {
    fs.writeFileSync(
      appPackageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf8'
    );
    console.log(
      `Package "${packageName}" updated to "workspace:*" in "${appName}". Running pnpm install...`
    );

    // Run `pnpm install` in the appName directory
    const appPath = path.resolve(process.cwd(), 'apps', appName);
    execSync('pnpm install', { cwd: appPath, stdio: 'inherit' });

    console.log('pnpm install completed successfully.');
  } else {
    console.log(
      `Package "${packageName}" not found in the dependencies or devDependencies of "${appName}".`
    );
  }
} catch (error) {
  console.error(
    `Failed to update or install package.json for "${appName}":`,
    error
  );
  process.exit(1);
}
