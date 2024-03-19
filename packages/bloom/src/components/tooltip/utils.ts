import { ReactNode } from "react";

export enum TooltipPlacement {
  TopRight = "top-right",
  TopLeft = "top-left",
  BottomRight = "bottom-right",
  BottomLeft = "bottom-left",
}

export const getPlacementProps = (placement: TooltipPlacement) => {
  let side: "top" | "bottom" | undefined;
  let align: "end" | "start" | "center" | undefined;

  switch (placement) {
    case TooltipPlacement.TopLeft:
      side = "top";
      align = "end";
      break;
    case TooltipPlacement.TopRight:
      side = "top";
      align = "start";
      break;
    case TooltipPlacement.BottomLeft:
      side = "bottom";
      align = "end";
      break;
    default:
    case TooltipPlacement.BottomRight:
      side = "bottom";
      align = "start";
      break;
  }

  return { side, align };
};

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement> {
    placement?: TooltipPlacement;
    tooltipClassName?: string;
    trigger: ReactNode;
  }
