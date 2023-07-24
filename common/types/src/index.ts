export type Enum<Name extends string, Value = undefined> = Value extends undefined
  ? { tag: Name; value?: undefined }
  : {
      tag: Name;
      value: Value;
    };
