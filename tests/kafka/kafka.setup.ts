import { execSync } from 'node:child_process';
import { Kafka } from 'kafkajs';
import { test as setup, expect } from '@playwright/test';

setup('start the local Kafka broker and wait until it accepts connections', async () => {
  setup.setTimeout(120_000);

  execSync('npm run kafka:up', { stdio: 'inherit' });

  const kafka = new Kafka({
    clientId: 'integra-kafka-setup',
    brokers: process.env.KAFKA_BROKER_URL!.split(','),
  });

  await expect(async () => {
    const admin = kafka.admin();
    await admin.connect();
    await admin.disconnect();
  }).toPass({ timeout: 60_000 });
});
