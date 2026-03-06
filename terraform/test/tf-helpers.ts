import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const terraformBin = 'terraform';

export const terraformInit = async (dir: string) => {
  const result = await execFileAsync(terraformBin, ['init'], { cwd: dir });
  return result;
};

export const terraformPlan = async (
  dir: string,
  vars: Record<string, string> = {}
) => {
  const args = ['plan'];
  for (const [key, value] of Object.entries(vars)) {
    args.push(`-var=${key}=${value}`);
  }
  const result = await execFileAsync(terraformBin, args, { cwd: dir });
  return result;
};

export const terraformValidate = async (dir: string) => {
  const result = await execFileAsync(terraformBin, ['validate', '-json'], {
    cwd: dir,
  });
  return JSON.parse(result.stdout);
};
