export enum PopoverPlacement {
  TopRight = 'top-right',
  TopLeft = 'top-left',
  BottomRight = 'bottom-right',
  BottomLeft = 'bottom-left',
}

export const getPlacementProps = (placement: PopoverPlacement) => {
  let side: 'top' | 'bottom' | undefined;
  let align: 'end' | 'start' | 'center' | undefined;

  switch (placement) {
    case PopoverPlacement.TopLeft:
      side = 'top';
      align = 'end';
      break;
    case PopoverPlacement.TopRight:
      side = 'top';
      align = 'start';
      break;
    case PopoverPlacement.BottomLeft:
      side = 'bottom';
      align = 'end';
      break;
    default:
    case PopoverPlacement.BottomRight:
      side = 'bottom';
      align = 'start';
      break;
  }

  return { side, align };
};
