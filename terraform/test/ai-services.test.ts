import { terraformInit, terraformValidate } from './tf-helpers';
import * as path from 'path';

describe('Terraform Module: AI Services', () => {
  const modulePath = path.resolve(__dirname, '../modules/ai-services');

  it('should initialize successfully', async () => {
    const result = await terraformInit(modulePath);
    expect(result.stdout).toContain(
      'Terraform has been successfully initialized!'
    );
  }, 120000);

  it('should validate correctly', async () => {
    const result = await terraformValidate(modulePath);
    expect(result.valid).toBe(true);
  }, 120000);
});
