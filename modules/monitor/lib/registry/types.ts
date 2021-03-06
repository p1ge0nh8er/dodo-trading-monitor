import { EventTypes } from "../sources/types";

export interface EventObject {
  /**
   * Name of the event emitted from contract
   */
  eventName: string;
  /**
   * Field from emitted event that is run against constraints
   */
  eventField: string;
}

/**
 * Every Registry **MUST** implement this interface
 */
export interface Registry {
  /**
   * Id of the registry
   */
  id: number;
  /**
   * Name of the registry
   */
  name: string;
  /**
   * Sets the event, and real-life event for the specific address
   */
  set: (
    address: string,
    key: EventTypes,
    value: EventObject
  ) => Promise<boolean> | boolean;
  /**
   * Gets the onchain-event from address and real-life event
   */
  get: (address: string, key: EventTypes) => Promise<EventObject> | EventObject;
}
