# Manual Test Cases — Kafka

System under test: the `integra-assessment` Kafka broker (see `docker-compose.yml`).

Of the six scenarios below, TC_KAFKA_001 and TC_KAFKA_003 are automated (see `tests/kafka/`); the rest are documented for manual coverage.

## TC_KAFKA_001 – Producer Publishes Valid Message

**Preconditions**

- The Kafka broker is running and reachable.
- The target topic exists or auto-creation is enabled.

**Test Steps**

1. Connect a producer to the broker.
2. Publish a well-formed message with a unique identifier to the topic.
3. Inspect the broker acknowledgement returned by the produce request.

**Expected Result**

The broker acknowledges the publish with an offset and no error code, confirming the message was written to the topic.

---

## TC_KAFKA_002 – Producer Rejects Malformed Message

**Preconditions**

- The Kafka broker is running and reachable.
- The topic enforces a message schema or size/key constraint.

**Test Steps**

1. Connect a producer to the broker.
2. Attempt to publish a message that violates the expected format (e.g. invalid schema, oversized payload).
3. Observe the response from the produce request.

**Expected Result**

The produce request fails with a descriptive error, and no malformed message is written to the topic.

---

## TC_KAFKA_003 – Consumer Receives Valid Message

**Preconditions**

- The Kafka broker is running and reachable.
- A consumer group is subscribed to the target topic.

**Test Steps**

1. Subscribe a consumer, using a unique consumer group, to the topic.
2. Publish a uniquely identifiable message to the topic.
3. Wait for the consumer to receive the message matching the published identifier.

**Expected Result**

The consumer receives the message, and its payload matches exactly what was published.

---

## TC_KAFKA_004 – Consumer Handles Duplicate Message

**Preconditions**

- The Kafka broker is running and reachable.
- A consumer group is subscribed to the target topic.
- The consumer's processing logic is idempotent (e.g. keyed by message ID).

**Test Steps**

1. Publish a message with a unique identifier to the topic.
2. Re-publish the identical message (same identifier and payload) to simulate a redelivery.
3. Observe how the consumer processes both occurrences.

**Expected Result**

The consumer processes the message only once from a business standpoint (e.g. no duplicate side effects), even though both records exist on the topic.

---

## TC_KAFKA_005 – Producer Unavailable Broker

**Preconditions**

- No reachable Kafka broker exists at the configured connection address.

**Test Steps**

1. Configure a producer to connect to an unreachable broker address.
2. Attempt to connect and publish a message.
3. Observe the resulting behavior.

**Expected Result**

The connection or publish attempt fails with a clear connection/timeout error, and the producer does not hang indefinitely or silently drop the message.

---

## TC_KAFKA_006 – Consumer Reconnects After Restart

**Preconditions**

- A consumer is actively subscribed to a topic with committed offsets.
- The broker is temporarily restarted or the consumer process is interrupted and restarted.

**Test Steps**

1. Start a consumer and let it commit offsets after processing messages.
2. Restart the broker (or the consumer process).
3. Publish a new message once the broker/consumer is back online.
4. Observe whether the consumer resumes consumption from its last committed offset.

**Expected Result**

The consumer reconnects automatically, resumes from its last committed offset, and receives the new message without reprocessing already-committed messages.
