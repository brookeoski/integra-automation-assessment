import { test, expect } from '@playwright/test';
import { buildUniqueMessage, testTopic } from './kafka.data';
import { createKafkaClient } from './kafka.client';

test.describe('Kafka Producer: a message is published and acknowledged by the broker', () => {
  test('TC_KAFKA_001 - one send invocation is acknowledged by the broker', async () => {
    const kafka = createKafkaClient('integra-producer-test');
    const producer = kafka.producer();
    const topic = testTopic();
    const message = buildUniqueMessage();

    await producer.connect();

    try {
      await test.step('Publish a uniquely identifiable message to the topic in a single send invocation', async () => {
        const [acknowledgement] = await producer.send({
          topic,
          messages: [{ value: JSON.stringify(message) }],
        });

        await test.step('Expect the broker to acknowledge that send invocation with a valid offset', () => {
          expect(acknowledgement.topicName).toBe(topic);
          expect(acknowledgement.errorCode).toBe(0);
          expect(acknowledgement.baseOffset).toBeDefined();
        });
      });
    } finally {
      // A disconnect failure here must not mask a primary test failure above.
      await producer.disconnect().catch(() => {});
    }
  });
});
