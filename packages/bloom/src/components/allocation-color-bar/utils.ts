export const beneficiaryColorOrder = [
  'var(--color-fuchsia-color-600-fuchsia, #973B93)',
  'var(--color-yellow-color-300-yellow, #FFD576)',
  'var(--color-aqua-color-800-aqua, #1f3c3d)',
  'var(--color-aqua-color-300-orange, #FFA071)',
  'var(--color-aqua-color-700-red, #A20713)',
  'var(--color-aqua-color-200-aqua, #A9D8DA)',
  'var(--color-aqua-color-600-cerulean, #00628B)',
  'var(--color-aqua-color-400-yellow, #FFC600)',
  'var(--color-aqua-color-700-gray, #4D4D4D)',
  'var(--color-aqua-color-300-lime, #C0C64F)',
  'var(--color-base-surface-surface-bold, #b3b3b3)',
];

export const contingentColorOrder = [
  'var(--color-fuchsia-color-300-yellow, #FFD576)',
  'var(--color-fuchsia-color-600-red, #DA021C)',
  'var(--color-fuchsia-color-200-lime, #E1E38D)',
  'var(--color-fuchsia-color-500-orange, #F26003)',
  'var(--color-fuchsia-color-200-cerulean, #ABDCFB)',
  'var(--color-fuchsia-color-600-fuchsia, #973B93)',
  'var(--color-base-surface-surface-bold, #b3b3b3)',
];

export interface AllocationColorBarProps {
  type: 'beneficiary' | 'contingent';
  allocations: number[];
}
