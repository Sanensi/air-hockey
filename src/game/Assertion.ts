const DEFAULT_MESSAGE = new Error("Assertion Error");

export function assert(value: unknown, message: string | Error = DEFAULT_MESSAGE): asserts value {
  if (!value) throw message;
}
