import { Kafka, Producer } from "kafkajs";

let producer: Producer | null = null;
let connectPromise: Promise<Producer> | null = null;

export async function createProducer(): Promise<Producer> {

  if (producer) {
    return producer;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const region = process.env.REGION;

  if (!region) {
    throw new Error("Missing required env var REGION");
  }

  const kafka = new Kafka({
    clientId: process.env.CLIENT_ID,
    brokers: process.env.MSK_CLUSTER_BROKERS
      ? process.env.MSK_CLUSTER_BROKERS.split(",")
      : [],
    ssl: true,

    sasl: {
      mechanism: "oauthbearer",
      oauthBearerProvider: async () => {
        return oauthBearerTokenProvider(region);
      }
    },

    retry: {
      initialRetryTime: Number(process.env.KAFKA_INITIAL_RETRY_TIME || 300),
      retries: Number(process.env.KAFKA_RETRIES_CONFIG || 5)
    }
  });

  const newProducer = kafka.producer({
    lingerMs: Number(process.env.KAFKA_LINGER_MS_CONFIG || 5),
    maxInFlightRequests: Number(process.env.KAFKA_MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION || 5),
    idempotent: true
  });

  connectPromise = Promise.race([
    newProducer.connect(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Kafka connection timeout")), 5000)
    )
  ]) as Promise<Producer>;

  try {
    await connectPromise;
    producer = newProducer;
    return producer;
  } catch (err) {

    producer = null;
    connectPromise = null;

    throw err;
  }
}

export async function cleanupProducer() {

  try {
    if (producer) {
      await producer.disconnect();
    }
  } catch {
    // ignore
  } finally {
    producer = null;
    connectPromise = null;
  }
}


==============

import * as producerProvider from "../producerProvider";
import { EventPayload } from "../../../interfaces/eventPayload.interface";

export async function sendMessageToTopic(
  event: EventPayload,
  topic: string,
  encodedMsg: any,
  retries: number
) {

  const maxRetries = Number.isFinite(Number(retries)) ? Number(retries) : 3;

  let attempt = 0;

  while (attempt < maxRetries) {

    try {

      const producer = await producerProvider.createProducer();

      const headers = getListOfHeader(event);

      const result = await producer.send({
        topic,
        messages: [
          {
            key: event.metadata.key,
            value: encodedMsg,
            headers
          }
        ]
      });

      return result;

    } catch (error) {

      attempt++;

      console.error("Kafka send failed attempt:", attempt, error);

      await producerProvider.cleanupProducer();

      if (attempt >= maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 100;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

===========

export function getListOfHeader(event: EventPayload) {

    const headers = event?.metadata?.headers;
  
    if (!headers || !Array.isArray(headers)) {
      return {};
    }
  
    return headers.reduce(
      (acc, current) => Object.assign(acc, current),
      {}
    );
  }