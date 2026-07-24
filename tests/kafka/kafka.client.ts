import { Kafka, logLevel } from 'kafkajs';
import { requireEnv } from '../env';

function parseBrokers(): string[] {
  const brokers = requireEnv('KAFKA_BROKER_URL')
    .split(',')
    .map((broker) => broker.trim())
    .filter((broker) => broker.length > 0);

  if (brokers.length === 0) {
    throw new Error('KAFKA_BROKER_URL must contain at least one non-empty broker address.');
  }

  return brokers;
}

export function createKafkaClient(clientId: string): Kafka {
  return new Kafka({
    clientId,
    brokers: parseBrokers(),
    logLevel: logLevel.ERROR,
  });
}
