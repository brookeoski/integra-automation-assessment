import { randomUUID } from 'node:crypto';
import { Kafka } from 'kafkajs';

export interface KafkaTestMessage {
  correlationId: string;
  sentAt: string;
}

export function buildUniqueMessage(): KafkaTestMessage {
  return {
    correlationId: randomUUID(),
    sentAt: new Date().toISOString(),
  };
}

export function buildUniqueTopic(): string {
  return `${process.env.KAFKA_TOPIC}-${randomUUID()}`;
}

// Auto-created topics can briefly report no elected leader; creating the
// topic explicitly and waiting for its leader avoids that race deterministically.
export async function createTestTopic(kafka: Kafka, topic: string): Promise<void> {
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({ topics: [{ topic, numPartitions: 1 }], waitForLeaders: true });
  await admin.disconnect();
}
