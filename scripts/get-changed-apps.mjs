import { promisify } from 'util';
import { exec } from 'child_process';
const execPromise = promisify(exec);

async function getChangedApps() {
  try {
    const { stdout } = await execPromise(
      'git diff --name-only origin/dev HEAD'
    );
    const appsChanged = stdout
      .split('\n')
      .filter((path) => path.startsWith('apps/'))
      .map((path) => path.split('/')[1])
      .filter((value, index, self) => self.indexOf(value) === index);
    return appsChanged;
  } catch (error) {
    console.error('Error executing git command:', error);
    return [];
  }
}

const appsChanged = await getChangedApps();
console.log('Apps changed: ' + appsChanged.join(', '));
