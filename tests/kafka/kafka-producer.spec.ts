import { Kafka, RecordMetadata } from 'kafkajs';
import { test, expect } from '@playwright/test';
import { buildUniqueMessage, buildUniqueTopic } from './kafka.data';

test.describe('Kafka Producer: a uniquely identifiable message is published and acknowledged', () => {
  test('TC_KAFKA_001 - a valid message is published and acknowledged by the broker', async () => {
    const kafka = new Kafka({
      clientId: 'integra-producer-test',
      brokers: process.env.KAFKA_BROKER_URL!.split(','),
    });
    const producer = kafka.producer();
    const topic = buildUniqueTopic();
    const message = buildUniqueMessage();

    await producer.connect();

    try {
      let acknowledgement!: RecordMetadata;

      await test.step('Publish a uniquely identifiable message to the topic', async () => {
        // A newly auto-created topic can briefly report no leader on this
        // connection; retrying the send absorbs that without an arbitrary wait.
        await expect(async () => {
          [acknowledgement] = await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
          });
        }).toPass({ timeout: 30_000 });

        await test.step('Expect the broker to acknowledge the publish with a valid offset', () => {
          expect(acknowledgement.topicName).toBe(topic);
          expect(acknowledgement.errorCode).toBe(0);
          expect(acknowledgement.baseOffset).toBeDefined();
        });
      });
    } finally {
      await producer.disconnect();
    }
  });
});
