import { randomUUID } from 'node:crypto';
import { requireEnv } from '../env';

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

export function testTopic(): string {
  return requireEnv('KAFKA_TOPIC');
}
