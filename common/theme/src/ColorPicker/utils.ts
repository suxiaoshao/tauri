import { amber, blue, cyan, green, grey, indigo, lime, orange, pink, purple, red, teal } from '@mui/material/colors';
import { hexToRgb, hslToRgb, rgbToHex } from '@mui/system';
import { ColorRGB, ColorHSL, Color } from './Color';

export const defaultColor = '#181d23';

export const defaultColors = [
  '#000000',
  grey[900],
  grey[700],
  grey[500],
  grey[400],
  grey[300],
  grey[100],
  '#ffffff',
  red[700],
  red[500],
  red[300],
  red[100],
  pink[700],
  pink[500],
  pink[300],
  pink[100],
  purple[700],
  purple[500],
  purple[300],
  purple[100],
  indigo[700],
  indigo[500],
  indigo[300],
  indigo[100],
  blue[700],
  blue[500],
  blue[300],
  blue[100],
  cyan[700],
  cyan[500],
  cyan[300],
  cyan[100],
  teal[700],
  teal[500],
  teal[300],
  teal[100],
  green[700],
  green[500],
  green[300],
  green[100],
  lime[700],
  lime[500],
  lime[300],
  lime[100],
  amber[700],
  amber[500],
  amber[300],
  amber[100],
  orange[700],
  orange[500],
  orange[300],
  orange[100],
];

export function parseColor(color: string): Color {
  let hex = '';
  let rgb = '';
  let hsl = '';

  if (color.slice(0, 1) === '#') {
    hex = color;
    rgb = hexToRgb(color);
    hsl = rgbToHsl(rgb);
  } else if (color.slice(0, 3) === 'rgb') {
    rgb = color;
    hex = rgbToHex(color);
    hsl = rgbToHsl(color);
  } else if (color.slice(0, 3) === 'hsl') {
    hsl = color;
    rgb = hslToRgb(color);
    hex = rgbToHex(rgb);
  }

  return {
    hex: {
      value: hex,
    },
    rgb: getRgb(rgb),
    hsl: getHsl(hsl),
  };
}

export function getSaturationCoordinates(color: Color): [number, number] {
  const { s, v } = rgbToHsv(color.rgb.value);

  const x = s;
  const y = 100 - v;

  return [x, y];
}

export function getHueCoordinates(color: Color): number {
  const { h } = color.hsl;

  const x = (h / 360) * 100;

  return x;
}

export function rgbToHsl(color: string): string {
  let { r, g, b } = getRgb(color);
  r /= 255;
  g /= 255;
  b /= 255;

  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (delta === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max == g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);

  if (h < 0) {
    h += 360;
  }

  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function rgbToHsv(color: string): { h: number; s: number; v: number } {
  let { r, g, b } = getRgb(color);
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);

  const h = d ? (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? 2 + (b - r) / d : 4 + (r - g) / d) * 60 : 0;
  const s = max ? (d / max) * 100 : 0;
  const v = max * 100;

  return { h, s, v };
}

export function hsvToRgb(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;

  const i = ~~(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  const index = i % 6;

  const r = Math.round([v, q, p, p, t, v][index] * 255);
  const g = Math.round([t, v, v, q, p, p][index] * 255);
  const b = Math.round([p, p, t, v, v, q][index] * 255);

  return `rgb(${r}, ${g}, ${b})`;
}

function getRgb(color: string): ColorRGB {
  const matches = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/i.exec(color);
  const r = Number(matches?.[1] ?? 0);
  const g = Number(matches?.[2] ?? 0);
  const b = Number(matches?.[3] ?? 0);

  return {
    value: color,
    r,
    g,
    b,
  };
}

function getHsl(color: string): ColorHSL {
  const matches = /hsl\((\d+),\s?([\d.]+)%,\s?([\d.]+)%\)/i.exec(color);
  const h = Number(matches?.[1] ?? 0);
  const s = Number(matches?.[2] ?? 0);
  const l = Number(matches?.[3] ?? 0);

  return {
    value: color,
    h,
    s,
    l,
  };
}

export function clamp(number: number, min: number, max: number): number {
  if (!max) {
    return Math.max(number, min) === min ? number : min;
  } else if (Math.min(number, min) === number) {
    return min;
  } else if (Math.max(number, max) === number) {
    return max;
  }
  return number;
}
