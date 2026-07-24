import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { buildUniqueMessage, testTopic } from './kafka.data';
import { createKafkaClient } from './kafka.client';

test.describe('Kafka Consumer: a subscribed consumer receives the matching published message', () => {
  test('TC_KAFKA_003 - a consumer in a unique group receives the expected message', async () => {
    const kafka = createKafkaClient('integra-consumer-test');
    const topic = testTopic();
    const groupId = `integra-consumer-test-${randomUUID()}`;
    const consumer = kafka.consumer({ groupId });
    const producer = kafka.producer();
    const message = buildUniqueMessage();

    let resolveReceived!: (payload: unknown) => void;
    const messageReceived = new Promise<unknown>((resolve) => {
      resolveReceived = resolve;
    });

    try {
      await test.step('Subscribe a consumer, using a unique consumer group, to the topic', async () => {
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: true });
        await consumer.run({
          eachMessage: async ({ message: record }) => {
            const payload = JSON.parse(record.value?.toString() ?? '{}');
            if (payload.correlationId !== message.correlationId) return;

            resolveReceived(payload);
          },
        });
      });

      await test.step('Publish one message to the topic', async () => {
        await producer.connect();
        await producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
      });

      await test.step('Wait for the consumer to receive the matching message', async () => {
        let timer!: NodeJS.Timeout;
        const timeout = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(new Error(`Timed out waiting for correlationId ${message.correlationId} on topic ${topic}`));
          }, 15_000);
        });

        try {
          const receivedPayload = await Promise.race([messageReceived, timeout]);

          await test.step('Expect the received payload to deeply equal the sent payload', () => {
            expect(receivedPayload).toEqual(message);
          });
        } finally {
          clearTimeout(timer);
        }
      });
    } finally {
      await test.step('Disconnect cleanly', async () => {
        // A disconnect failure here must not mask a primary test failure above,
        // and one client's disconnect failure must not block the other's.
        await producer.disconnect().catch(() => {});
        await consumer.disconnect().catch(() => {});
      });
    }
  });
});
