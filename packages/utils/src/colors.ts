// Function to convert hex to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

// Function to convert RGB to hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (x: number) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Function to adjust the shade of a color
export const adjustShade = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));
  return rgbToHex(newR, newG, newB);
};

// Function to generate a new random color based on the existing colors
export const generateNewColor = (colors: string[]): string => {
  // Pick a random base color from the array
  const randomIndex = Math.floor(Math.random() * colors.length);
  const baseColor = colors[randomIndex] ?? '#000000';

  // Generate a random shade adjustment amount
  const shadeAmount = Math.floor(Math.random() * 51) - 25; // Random amount between -25 and 25

  // Adjust the shade of the base color
  return adjustShade(baseColor, shadeAmount);
};
