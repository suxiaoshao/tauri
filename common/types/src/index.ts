export type Enum<Name extends string | number, Value = undefined> = Value extends undefined
  ? { tag: Name; value?: Value }
  : {
      tag: Name;
      value: Value;
    };
