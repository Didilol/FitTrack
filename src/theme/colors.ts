export const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  surface2: '#2A2A2A',
  border: '#2F2F2F',
  muted: '#9A9A9A',
  text: '#F5F5F5',
  accent: '#CCFF00',
  accentDim: '#9BC400',
  accentInk: '#0A0F00',
  danger: '#FF5252',
  success: '#4CAF50',
} as const;

export type ColorKey = keyof typeof colors;
