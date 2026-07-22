import { randomUUID } from 'node:crypto';

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
