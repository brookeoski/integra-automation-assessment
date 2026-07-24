import { execFileSync } from 'node:child_process';
import { test as teardown } from '@playwright/test';

teardown('stop the local Kafka broker', async () => {
  try {
    execFileSync('docker', ['compose', 'down', '--volumes', '--remove-orphans'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const { stdout, stderr } = error as { stdout?: string; stderr?: string };
    throw new Error(
      `Failed to stop the local Kafka broker (docker compose down --volumes --remove-orphans).\n${stdout ?? ''}${stderr ?? ''}`.trim()
    );
  }
});
