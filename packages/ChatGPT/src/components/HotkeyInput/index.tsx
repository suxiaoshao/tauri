import { Close } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useRecordHotkeys } from 'react-hotkeys-hook';

export interface HotkeyInputProps extends Omit<TextFieldProps, 'value' | 'onChange' | 'onBlur' | 'onFucos'> {
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
      const value = Array.from(keys).join('+');
      onChange({ target: { value } });
      setInnerValue(value);
    }
  }, [isRecording, keys]);

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
    <TextField
      {...props}
      value={innerValue ?? ''}
      onFocus={isRecording ? stop : start}
      onBlur={handleBlur}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleClear} edge="end">
              <Close />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

export default HotkeyInput;
