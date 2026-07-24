import { execFileSync } from 'node:child_process';
import { test as setup, expect } from '@playwright/test';
import { createKafkaClient } from './kafka.client';
import { testTopic } from './kafka.data';

setup('start the local Kafka broker and create the shared test topic', async () => {
  setup.setTimeout(120_000);

  try {
    execFileSync('docker', ['compose', 'up', '-d', '--wait'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const { stdout, stderr } = error as { stdout?: string; stderr?: string };
    throw new Error(
      `Failed to start the local Kafka broker (docker compose up --wait).\n${stdout ?? ''}${stderr ?? ''}`.trim()
    );
  }

  const kafka = createKafkaClient('integra-kafka-setup');
  const admin = kafka.admin();
  const topic = testTopic();

  try {
    await expect(async () => {
      await admin.connect();
    }).toPass({ timeout: 60_000 });

    await admin.createTopics({ topics: [{ topic, numPartitions: 1 }] });

    // Confirm a leader is elected so the producer/consumer tests can send and
    // subscribe exactly once each, with no retry needed against this topic.
    await expect(async () => {
      const { topics } = await admin.fetchTopicMetadata({ topics: [topic] });
      expect(topics).toHaveLength(1);
      expect(topics[0].partitions.every(({ leader }) => leader !== -1)).toBe(true);
    }).toPass({ timeout: 30_000 });
  } finally {
    // A disconnect failure here must not mask a real topic-creation/readiness failure above.
    await admin.disconnect().catch(() => {});
  }
});
