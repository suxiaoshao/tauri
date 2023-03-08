import { MouseEvent, useCallback, useMemo, useState } from 'react';

import { Box, BoxProps, Grid, hslToRgb, Paper, rgbToHex, TextField } from '@mui/material';

import { PredefinedSelector } from './options/PredefinedSelector';
import { FreeSelector } from './options/FreeSelector';
import { defaultColor, parseColor, getSaturationCoordinates, getHueCoordinates, clamp, hsvToRgb } from './utils';
import { Color } from './Color';

export type ColorPickerVariant = 'predefined' | 'free';

interface ColorPickerProps {
  initialColor?: string;
  color?: string;
  colors: Array<string>;
  onChange(color: string): void;
  variant: ColorPickerVariant;
  sx: BoxProps['sx'];
}

export const ColorPicker = (props: ColorPickerProps) => {
  const { color, initialColor, colors, onChange, variant, sx } = props;

  const [uncontrolledColor, setUncontrolledColor] = useState(initialColor || defaultColor);

  const parsedColor = useMemo((): Color => parseColor(color || uncontrolledColor), [color, uncontrolledColor]);
  const satCoords = useMemo((): [number, number] => getSaturationCoordinates(parsedColor), [parsedColor]);
  const hueCoords = useMemo((): number => getHueCoordinates(parsedColor), [parsedColor]);

  const handleChange = useCallback(
    (color: string): void => {
      setUncontrolledColor(color);
      onChange(color);
    },
    [onChange],
  );

  const handleRgbChange = useCallback(
    (component: string, value: string): void => {
      const { r, g, b } = parsedColor.rgb;

      switch (component) {
        case 'r':
          handleChange(rgbToHex(`rgb(${value ?? 0}, ${g}, ${b})`));
          return;
        case 'g':
          handleChange(rgbToHex(`rgb(${r}, ${value ?? 0}, ${b})`));
          return;
        case 'b':
          handleChange(rgbToHex(`rgb(${r}, ${g}, ${value ?? 0})`));
          return;
        default:
          return;
      }
    },
    [handleChange, parsedColor.rgb],
  );

  const handleSaturationChange = useCallback(
    (event: MouseEvent<HTMLElement>): void => {
      const { width, height, left, top } = event.currentTarget.getBoundingClientRect();

      const x = clamp(event.clientX - left, 0, width);
      const y = clamp(event.clientY - top, 0, height);

      const s = (x / width) * 100;
      const v = 100 - (y / height) * 100;

      const rgb = hsvToRgb(parsedColor?.hsl.h, s, v);

      handleChange(rgbToHex(rgb));
    },
    [handleChange, parsedColor?.hsl.h],
  );

  const handleHueChange = useCallback(
    (event: MouseEvent<HTMLElement>): void => {
      const { width, left } = event.currentTarget.getBoundingClientRect();
      const x = clamp(event.clientX - left, 0, width);
      const h = Math.round((x / width) * 360);

      const hsl = `hsl(${h}, ${parsedColor?.hsl.s}, ${parsedColor?.hsl.l})`;
      const rgb = hslToRgb(hsl);

      handleChange(rgbToHex(rgb));
    },
    [parsedColor?.hsl.s, parsedColor?.hsl.l, handleChange],
  );

  return (
    <Box
      sx={{
        overflow: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        ...sx,
      }}
    >
      {variant === 'predefined' ? (
        <PredefinedSelector colors={colors} parsedColor={parsedColor} onSelect={onChange} />
      ) : (
        <FreeSelector
          parsedColor={parsedColor}
          satCoords={satCoords}
          hueCoords={hueCoords}
          onSaturationChange={handleSaturationChange}
          onHueChange={handleHueChange}
        />
      )}

      <Grid container spacing={1} justifyContent="space-between">
        <Grid item container spacing={1} display="flex" alignItems="center" xs={12} md={6}>
          <Grid item>
            <Paper
              elevation={1}
              sx={{
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                background: parsedColor.hex.value,
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              size="small"
              label="Hex"
              value={parsedColor?.hex.value}
              onChange={(event) => {
                let val = event.target.value;
                if (val?.slice(0, 1) !== '#') {
                  val = '#' + val;
                }
                handleChange(val);
              }}
              sx={{ width: '95px' }}
            />
          </Grid>
        </Grid>

        <Grid item container spacing={1} display="flex" xs={12} md={6}>
          <Grid item>
            <TextField
              size="small"
              label="R"
              value={parsedColor.rgb.r}
              onChange={(event) => handleRgbChange('r', event.target.value)}
              sx={{ width: '60px' }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </Grid>
          <Grid item>
            <TextField
              size="small"
              label="G"
              value={parsedColor.rgb.g}
              onChange={(event) => handleRgbChange('g', event.target.value)}
              sx={{ width: '60px' }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </Grid>
          <Grid item>
            <TextField
              size="small"
              label="B"
              value={parsedColor.rgb.b}
              onChange={(event) => handleRgbChange('b', event.target.value)}
              sx={{ width: '60px' }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
