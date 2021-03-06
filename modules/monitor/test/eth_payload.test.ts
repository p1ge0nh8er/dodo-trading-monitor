import { payloadValidator } from "@dodo/trading-monitor";
import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";
import "mocha";

export const cleanPayload: any = {
  abi: [
    "event Transfer(address indexed from, address indexed to, uint amount)",
  ],
  address: AddressZero,
  label: "Foo Bar",
  triggerValue: 200,
  type: "arbitrage",
};

describe("[eth payload validator]", () => {
  it("Should return true for valid object", () => {
    expect(payloadValidator(cleanPayload)).to.eql(true);
  });

  it("Should return false for malformed abi", () => {
    const notArray = { ...cleanPayload, abi: "foo" };
    expect(payloadValidator(notArray)).to.eql(false);
    const emptyArray = { ...cleanPayload, abi: [] };
    expect(payloadValidator(emptyArray)).to.eql(false);
    const noAbi = { ...cleanPayload };
    delete noAbi.abi;
    expect(payloadValidator(noAbi)).to.eql(false);
  });

  it("Should return false for malformed address", () => {
    const notAddress = { ...cleanPayload, address: "1234564xp" };
    expect(payloadValidator(notAddress)).to.eql(false);
    const noAddress = { ...cleanPayload };
    delete noAddress.address;
    expect(payloadValidator(noAddress)).to.eql(false);
  });

  it("Should return false for malformed label", () => {
    const notLabel = { ...cleanPayload, label: [] };
    expect(payloadValidator(notLabel)).to.eql(false);
    const noLabel = { ...cleanPayload };
    delete noLabel.label;
    expect(payloadValidator(noLabel)).to.eql(false);
  });

  it("Should return false for malformed triggerValue", () => {
    const notTValue = { ...cleanPayload, triggerValue: "1234564xp" };
    expect(payloadValidator(notTValue)).to.eql(false);
    const noTValue = { ...cleanPayload };
    delete noTValue.triggerValue;
    expect(payloadValidator(noTValue)).to.eql(false);
  });

  it("Should return false for malformed eventType", () => {
    const notEType = { ...cleanPayload, address: "testSwap" };
    expect(payloadValidator(notEType)).to.eql(false);
    const noEType = { ...cleanPayload };
    delete noEType.type;
    expect(payloadValidator(noEType)).to.eql(false);
  });
});
