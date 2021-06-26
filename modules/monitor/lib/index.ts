import { EmailSink } from "./sinks";
import { EthSource } from "./sources";
import { EthEmail } from "./middleware";
import { SimpleRegistry } from "./registry";

/**
 * Re export everything for extendability
 */
export { EmailSink, EthSource, EthEmail, SimpleRegistry };
export * from "./middleware/types";
export * from "./middleware/ethEmail/types";
export * from "./sinks/types";
export * from "./sinks/email/types";
export * from "./sources/types";
export * from "./sources/eth/types";
export * from "./registry/types";
