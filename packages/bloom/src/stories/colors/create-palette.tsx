import { ColorPalette, ColorItem } from '@storybook/blocks'

type CreatePaletteProps = {
  paletteProps: Record<string, {
    [key: string]: string
  }>
}

const CreatePalette = ({ paletteProps }: CreatePaletteProps) => (
  <ColorPalette>
    {Object.entries(paletteProps).map(([key, value]) => (
      <ColorItem
        subtitle=""
        key={key}
        title={key}
        colors={value}
      />
    )
    )}
  </ColorPalette>
)

export default CreatePalette;