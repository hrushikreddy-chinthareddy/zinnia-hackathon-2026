export type ColorPaletteToken = {
  [variant: string]: {
    value: string;
    type?: string;
    comment?: string;
  };
};

export enum SemanticPaletteKeys {
  BASE = "base",
  BUTTON = "button",
}

export enum ColorPaletteKeys {
  AQUA = "aqua",
  CERULEAN = "cerulean",
}

export type SemanticPaletteMap = {
  [K in SemanticPaletteKeys]: Record<string, ColorPaletteToken>;
};

export type ColorPaletteMap = {
  [K in ColorPaletteKeys]: ColorPaletteToken;
};

export type ColorsSupernovaTokens = {
  color: SemanticPaletteMap & ColorPaletteMap;
};
