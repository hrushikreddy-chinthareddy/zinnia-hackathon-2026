import ColorsJSON from "../../tokens/style-dictionary/colors.json";
import {
  SemanticPaletteMap,
  SemanticPaletteKeys,
  ColorPaletteToken,
  ColorsSupernovaTokens,
} from "./colors.types";
import { get } from "lodash";

const { color } = ColorsJSON as ColorsSupernovaTokens;

const semanticPaletteMap: SemanticPaletteMap = {
  [SemanticPaletteKeys.BASE]: color.base,
  [SemanticPaletteKeys.BUTTON]: color.button,
};

const resolveColor = (ref: string) => {
  if (ref.startsWith("{") && ref.endsWith("}")) {
    // Remove the braces and split the reference into parts
    const fullPath = ref.slice(1, -1);
    const notFound = `Value not found for: ${ref} path: ${fullPath}`;
    const value = get(ColorsJSON, fullPath);
    return value || notFound;
  }
  return `resolved to ${ref}`; // For direct color values
};

const createsemanticPaletteProps = (
  semPalette: Record<string, ColorPaletteToken>,
) =>
  Object.entries(semPalette).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: Object.entries(value).reduce(
        (acc, [key, { value: valueString }]): Record<string, string> => ({
          ...acc,
          [key]: resolveColor(valueString).slice(0, -2),
        }),
        {},
      ),
    };
  }, {});

export const semanticPaletteProps = {
  base: createsemanticPaletteProps(semanticPaletteMap.base),
  button: createsemanticPaletteProps(semanticPaletteMap.button),
};
