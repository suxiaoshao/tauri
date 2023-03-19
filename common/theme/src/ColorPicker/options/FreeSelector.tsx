import { MouseEventHandler } from 'react';

import { Box, Stack } from '@mui/material';
import { Color } from '../Color';

interface FreeSelectorProps {
  parsedColor: Color;
  satCoords: Array<number>;
  hueCoords: number;
  onSaturationChange: MouseEventHandler;
  onHueChange: MouseEventHandler;
}

export const FreeSelector = (props: FreeSelectorProps) => {
  const { parsedColor, satCoords, hueCoords, onSaturationChange, onHueChange } = props;

  return (
    <Stack
      id="cp-free-root"
      spacing={1}
      sx={{
        mb: 2,
        width: '455px',
        maxWidth: '100%',
      }}
    >
      <Box
        id="cp-saturation"
        sx={{
          width: '100%',
          height: '142px',
          backgroundColor: `hsl(${parsedColor.hsl.h}, 100%, 50%)`,
          backgroundImage: 'linear-gradient(transparent,black),linear-gradient(to right,white,transparent)',
          borderRadius: '4px',
          position: 'relative',
          cursor: 'crosshair',
        }}
        onClick={onSaturationChange}
      >
        <Box
          id="cp-saturation-indicator"
          sx={{
            width: '15px',
            height: '15px',
            border: '2px solid #ffffff',
            borderRadius: '50%',
            backgroundColor: parsedColor.hex.value,
            transform: 'translate(-7.5px, -7.5px)',
            position: 'absolute',
            left: (satCoords?.[0] ?? 0) + '%',
            top: (satCoords?.[1] ?? 0) + '%',
          }}
        />
      </Box>
      <Box
        id="cp-hue"
        sx={{
          width: '100%',
          height: '12px',
          backgroundImage: 'linear-gradient(to right,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)',
          borderRadius: '999px',
          position: 'relative',
          cursor: 'crosshair',
        }}
        onClick={onHueChange}
      >
        <Box
          id="cp-hue-indicator"
          sx={{
            width: '15px',
            height: '15px',
            border: '2px solid #ffffff',
            borderRadius: '50%',
            backgroundColor: parsedColor.hex.value,
            transform: 'translate(-7.5px, -2px)',
            position: 'absolute',
            left: (hueCoords ?? 0) + '%',
          }}
        />
      </Box>
    </Stack>
  );
};
