export interface DividerProps {
  direction: "horizontal" | "vertical";
  color?: "default" | "subtle" | "dark" | "darker"
}

export const colorVar = {
  "default": 'var(--color-base-border-border-light, #ededed)',
  "subtle": 'var(--color-base-border-border-subtle, #cccccc)',
  "dark": 'var(--color-base-border-border-dark, #313131)',
  "darker": 'var(--color-base-border-border-darker, #212121)',
}