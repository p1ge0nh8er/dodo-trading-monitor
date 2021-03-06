import { config } from "dotenv";
config();
import { EthMq } from "./monitor";
import { memoize } from "lodash";
import { EthSource } from "@dodo/trading-monitor";
import {
  getProvider
} from '@dodo/trading-monitor/dist/sources'
import { MqSink } from "./monitor/mqSink";
import { SubscribePayload, payloadValidator } from "@dodo/trading-monitor";
import { getRedis } from "./monitor/redis";
import { RedisRegistry } from "./monitor/redisRegistry";
import hash from "object-hash";


/**
 * Memoizes the eth source getter
 */
const getEthSource = memoize(async (): Promise<EthSource> => {
  if (process.env.WEBSOCKET_URL) {
    try {
      const provider = await getProvider(process.env.WEBSOCKET_URL);
      const registry = new RedisRegistry({ id: 2 });
      return new EthSource({ id: 0, provider, registry });
    } catch (e: any) {
      throw new Error(e.message);
    }
  } else {
    throw new Error("[EthSource] WEBSOCKET_URL must be defined in env");
  }
});

/**
 * Memoizes the mq sink getter
 */
const getMqSink = memoize((): MqSink => {
  if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
    return new MqSink({
      id: 1,
    });
  } else {
    throw new Error(
      "[MqSink] REDIS_HOST and REDIS_PORT must be defined in env"
    );
  }
});

/**
 * Entrypoint
 */
async function main() {
  let source: EthSource;
  try {
    source = await getEthSource();
  } catch (_) {
    throw new Error("Could not connect to the Eth Node");
  }

  const sink = getMqSink();
  console.log("Initialized Source and Sink");
  const ethMq = new EthMq({ source, sink });
  const redisConnection = getRedis();
  redisConnection.on("error", (e) => console.error(e));
  console.log("Initialized Redis Connection");
  try {
    await redisConnection.subscribe("eth-engine-sub", "eth-engine-unsub");
  } catch (e) {
    console.error(e);
  }
  console.log("Subscribed to relevant channels");
  redisConnection.on("message", async (channel: string, message: string) => {
    try {
      const messageBody: SubscribePayload = JSON.parse(message);
      /**
       * Validate the message received via redis pubsub
       */
      if (payloadValidator(messageBody)) {
        if (channel === "eth-engine-sub") {
          console.log("Subscribing to :", messageBody.address);
          const toChannel = hash(messageBody);
          try {
            await ethMq.run(messageBody);
          } catch (e: any) {
            const ephemeralClient = getRedis();
            await ephemeralClient.publish(
              toChannel,
              JSON.stringify({ error: true, reason: e.message })
            );
            ephemeralClient.disconnect();
          }
        } else {
          ethMq.source.unsubscribe(messageBody);
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      console.error("[Main] received invalid subscribe request");
    }
  });
}

main()
  .then(() => console.log("Initialized Eth Engine"))
  .catch((e) => console.error(e.message));
