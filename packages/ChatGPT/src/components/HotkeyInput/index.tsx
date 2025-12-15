import { type ComponentProps, useCallback, useEffect, useState } from 'react';
import { useRecordHotkeys } from 'react-hotkeys-hook';
import { match } from 'ts-pattern';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../ui/input-group';
import { XIcon } from 'lucide-react';

export interface HotkeyInputProps extends Omit<
  ComponentProps<typeof InputGroupInput>,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
> {
  value?: string | null;
  onChange: (event: { target: { value: string | null } }) => void;
  onBlur?: (event: { target: { value: string | null } }) => void;
}
function HotkeyInput({ value, onChange, onBlur, ...props }: HotkeyInputProps) {
  // internal state to handle value changes
  const [innerValue, setInnerValue] = useState(value ?? null);
  useEffect(() => {
    setInnerValue(value ?? null);
  }, [value]);

  // hotkey recording
  const [keys, { start, stop, isRecording }] = useRecordHotkeys();
  useEffect(() => {
    if (isRecording && keys.size > 0) {
      // eslint-disable-next-line prefer-spread
      const value = Array.from(keys).join('+');
      onChange({ target: { value } });
      setInnerValue(value);
    }
  }, [isRecording, keys, onChange]);

  // handle blur event and stop recording
  const handleBlur = useCallback(
    (_event: React.FocusEvent<HTMLInputElement>) => {
      if (isRecording) {
        stop();
      }
      if (onBlur) {
        onBlur({ target: { value: innerValue } });
      }
    },
    [stop, isRecording, onBlur, innerValue],
  );

  // handle delete button
  const handleClear = useCallback(() => {
    onChange({ target: { value: null } });
    setInnerValue(null);
  }, [onChange]);

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        value={innerValue ?? ''}
        onFocus={() => {
          match(isRecording)
            .with(true, () => stop())
            .otherwise(() => start());
        }}
        onBlur={handleBlur}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton type="button" variant="ghost" size="icon-xs" onClick={handleClear}>
          <XIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export default HotkeyInput;
