import { execSync } from 'node:child_process';
import { test as teardown } from '@playwright/test';

teardown('stop the local Kafka broker', async () => {
  execSync('npm run kafka:down', { stdio: 'inherit' });
});
