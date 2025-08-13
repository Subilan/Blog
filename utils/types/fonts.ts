const fonts = ['Literata', 'Open Sans', 'Inter', 'Fira Sans', 'IBM Plex Sans', 'Noto Sans'] as const;

export default fonts;
export type AvailableFont = (typeof fonts)[number];
