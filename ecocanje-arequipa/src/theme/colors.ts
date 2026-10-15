export const colors = {
  primary: '#2E7D32',
  primaryLight: '#A5D6A7',
  primaryDark: '#1B5E20',
  accent: '#0277BD',
  background: '#F6FAF6',
  surface: '#FFFFFF',
  text: '#1B1B1B',
  textMuted: '#5F6B5F',
  border: '#DCE5DC',
  danger: '#C62828',
  warning: '#F9A825',
} as const;

export type ColorKey = keyof typeof colors;
