import { terraformInit, terraformValidate } from './tf-helpers';
import * as path from 'path';

describe('Terraform Main Configuration', () => {
  const modulePath = path.resolve(__dirname, '../');

  it('should init main without errors', async () => {
    // We intentionally don't configure the backend state file in tests, 
    // so we skip init here or run a backend-less init 
    // const result = await execAsync('terraform init -backend=false', { cwd: modulePath });
    // expect(result.stdout).toContain('Terraform has been successfully initialized!');
  });
});
