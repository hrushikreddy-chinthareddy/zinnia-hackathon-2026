import { create } from '@storybook/theming/create'
import { Colors } from '../src/tokens/react/colors'

export default create({
  base: 'dark',

  // Colors
  // actually do not know what this does
  colorPrimary: Colors.secondaryColorSecondary,
  // color for active styles
  colorSecondary: Colors.primaryColorPrimary,


  // app
  // background for sidebar
  appBg: Colors.navMenuMenuDefaultFill,
  // background for the controls and interactions drawer
  appContentBg: Colors.baseSurfaceSurfaceDarker,
  // bg behind stories
  appPreviewBg: Colors.fieldsSurfaceFieldBackgroundInactiveFill,
  // borders and component search input outline
  appBorderColor: Colors.fieldsBorderFieldBorderDefault,
  // border between sidebar and story content
  appBorderRadius: 0,

  // Typography
  // base font
  fontBase: '"Open Sans", sans-serif',
  // font for code
  fontCode: 'monospace',

  // Typography
  // links, form labels
  textColor: Colors.baseTextTextLight,
  // ????
  // textInverseColor: Colors.baseTextTextLink,
  // settings, search, docs, Folders
  // textMutedColor: Colors.semanticsColorSemanticTextHighlight,

  // Toolbar default and active colors
  barTextColor: Colors.buttonGroupButtonGroupItemPrimaryText,
  barHoverColor: Colors.buttonGroupButtonGroupItemPrimaryHoverFill,
  barSelectedColor: Colors.primaryColorPrimary,
  barBg: Colors.baseSurfaceSurfaceTertiary,

  // buttons
  buttonBg: Colors.buttonPrimaryButtonPrimaryFill,
  buttonBorder: Colors.buttonPrimaryButtonPrimaryBorder,

  // boolean colors
  booleanBg: Colors.toggleToggleContrastDefaultFill,
  booleanSelectedBg: Colors.toggleToggleSelectedFill,

  // Form colors
  inputBg: Colors.baseSurfaceSurfaceQuaternary,
  inputBorder: Colors.fieldsBorderFieldBorderDefault,
  inputTextColor: Colors.baseTextTextPrimary,
  inputBorderRadius: 16,

  // Brand
  // title for storybook
  brandTitle: 'Bloom',
  // url when you click logo
  brandUrl: 'https://zinnia-design-system.supernova-docs.io/',
  // logo
  brandImage: '/zinnia-logo-white.svg',
  // open in same or different window
  brandTarget: '_self',
})