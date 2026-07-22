import { Kafka } from 'kafkajs';
import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { buildUniqueMessage, buildUniqueTopic, createTestTopic } from './kafka.data';

test.describe('Kafka Consumer: a subscribed consumer receives exactly the message published for it', () => {
  test('TC_KAFKA_003 - a consumer in a unique group receives the expected message', async () => {
    const kafka = new Kafka({
      clientId: 'integra-consumer-test',
      brokers: process.env.KAFKA_BROKER_URL!.split(','),
    });
    const topic = buildUniqueTopic();
    const groupId = `integra-consumer-test-${randomUUID()}`;
    const consumer = kafka.consumer({ groupId });
    const producer = kafka.producer();
    const message = buildUniqueMessage();

    let receivedPayload: unknown;
    let resolveReceived!: () => void;
    const messageReceived = new Promise<void>((resolve) => {
      resolveReceived = resolve;
    });

    try {
      await test.step('Create the topic and wait for its leader to be elected', async () => {
        await createTestTopic(kafka, topic);
      });

      await test.step('Subscribe a consumer, using a unique consumer group, to the topic', async () => {
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: true });

        await consumer.run({
          eachMessage: async ({ message: record }) => {
            const payload = JSON.parse(record.value?.toString() ?? '{}');
            if (payload.correlationId !== message.correlationId) return;

            receivedPayload = payload;
            resolveReceived();
          },
        });
      });

      await test.step('Publish a unique message to the topic', async () => {
        await producer.connect();
        await producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
      });

      await test.step('Wait for the consumer to receive the expected message', async () => {
        await messageReceived;

        await test.step('Expect the received payload to match the published payload', () => {
          expect(receivedPayload).toEqual(message);
        });
      });
    } finally {
      await test.step('Disconnect cleanly', async () => {
        await producer.disconnect();
        await consumer.disconnect();
      });
    }
  });
});
