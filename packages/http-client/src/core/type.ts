export type Enum<Name extends string, Value> = Value extends undefined
  ? { tag: Name }
  : {
      tag: Name;
      value: Value;
    };
