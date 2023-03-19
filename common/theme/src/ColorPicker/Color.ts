export interface Color {
  hex: ColorHex;
  rgb: ColorRGB;
  hsl: ColorHSL;
}

export interface ColorHex {
  value: string;
}

export interface ColorRGB {
  value: string;
  r: number;
  g: number;
  b: number;
}

export interface ColorHSL {
  value: string;
  h: number;
  s: number;
  l: number;
}
