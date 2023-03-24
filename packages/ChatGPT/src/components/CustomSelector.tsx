import { Menu, MenuItem } from '@mui/material';
import React from 'react';
import { useState, MouseEvent, ReactNode, Key, FocusEventHandler, FocusEvent, ForwardedRef } from 'react';

export interface CustomSelectorProps<T> {
  children?: { value: T; label: ReactNode; key: Key }[];
  onChange: (event: { target: { value: T } }, newValue: T) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  value: T;
  render?: (onClick: (event: MouseEvent<HTMLButtonElement>) => void) => ReactNode;
}

function CustomSelector<T>(
  { children, onBlur, onChange, render, value }: CustomSelectorProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    onBlur?.(undefined as unknown as FocusEvent<HTMLInputElement>);
  };

  return (
    <>
      {render?.(handleClick)}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} ref={ref}>
        {children?.map(({ value: itemValue, label, key }) => (
          <MenuItem
            onClick={() => {
              onChange({ target: { value: itemValue } }, itemValue);
              handleClose();
            }}
            selected={itemValue === value}
            key={key}
          >
            {label}
          </MenuItem>
        ))}
        {(children?.length ?? 0) === 0 && <MenuItem disabled>No options</MenuItem>}
      </Menu>
    </>
  );
}

export default React.forwardRef(CustomSelector) as typeof CustomSelector;
