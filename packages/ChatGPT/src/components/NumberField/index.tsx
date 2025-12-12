/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-19 10:20:30
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 11:57:40
 * @FilePath: /self-tools/Users/sushao/Documents/code/tauri/packages/ChatGPT/src/components/NumberField/index.tsx
 */
import React, { type ComponentProps, useImperativeHandle } from 'react';
import { match, P } from 'ts-pattern';
import { Input } from '../ui/input';

export interface NumberFieldProps extends Omit<ComponentProps<'input'>, 'type' | 'onChange'> {
  onChange?: (value: { target: { value: number } }) => void;
  ref: React.Ref<HTMLInputElement | null>;
}

function customParseFloat(value: unknown): number {
  return match(value)
    .with(P.number, (v) => v)
    .with(P.string, (v) => {
      const newValue = Number.parseFloat(v);
      return match(newValue)
        .with(Number.NaN, () => 0)
        .with(P.number, (num) => num)
        .otherwise(() => 0);
    })
    .otherwise(() => 0);
}

function proxy<T>(source: T): T {
  switch (typeof source) {
    case 'object':
    case 'function': {
      if (source !== null) {
        return new Proxy(source, {
          get(target, p) {
            if (p === 'focus') {
              return () => {
                // eslint-disable-next-line no-explicit-any
                (target as any).focus();
              };
            }
            if (p === 'value') {
              const value = Reflect.get(target, p);
              return customParseFloat(value);
            }
            return Reflect.get(target, p);
          },
          apply(target, thisArg, argArray) {
            return Reflect.apply(target as () => void, thisArg, argArray);
          },
          construct(target, argArray, newTarget) {
            return Reflect.construct(target as () => void, argArray, newTarget);
          },
          set(target, p, newValue) {
            target[p as keyof T] = newValue;
            return true;
            // return Reflect.set(target, p, newValue, receiver);
          },
          defineProperty(target, property, attributes) {
            return Reflect.defineProperty(target, property, attributes);
          },
          deleteProperty(target, p) {
            return Reflect.deleteProperty(target, p);
          },
          getOwnPropertyDescriptor(target, p) {
            return Reflect.getOwnPropertyDescriptor(target, p);
          },
          getPrototypeOf(target) {
            return Reflect.getPrototypeOf(target);
          },
          has(target, p) {
            return Reflect.has(target, p);
          },
          isExtensible(target) {
            return Reflect.isExtensible(target);
          },
          ownKeys(target) {
            return Reflect.ownKeys(target);
          },
          preventExtensions(target) {
            return Reflect.preventExtensions(target);
          },
          setPrototypeOf(target, v) {
            return Reflect.setPrototypeOf(target, v);
          },
        });
      }
    }
    // eslint-disable-next-line no-fallthrough
    default: {
      return source;
    }
  }
}

function NumberField({ onChange, ref, ...props }: NumberFieldProps) {
  const [sourceRef, setSourceRef] = React.useState<HTMLInputElement | null>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = customParseFloat(event.target.value);
    if (onChange) {
      onChange({ target: { value } });
    }
  };
  useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(ref, () => {
    return proxy(sourceRef);
  }, [sourceRef]);
  return <Input type="number" onChange={handleChange} {...props} ref={setSourceRef} />;
}

export default NumberField;
