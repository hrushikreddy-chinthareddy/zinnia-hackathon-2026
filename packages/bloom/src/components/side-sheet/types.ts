import { ReactNode } from "react";

export enum SideSheetLocation {
  Left = "left",
  Right = "right",
}

export interface SideSheetProps {
  closeCallback?: () => void;
  children: ReactNode;
  header: ReactNode;
  location?: SideSheetLocation;
  /**
   * If you want the sidesheet to close when a user clicks outside of it
   * set this to true
   */
  preventCloseOnOutsideClick?: boolean;
  trigger: ReactNode;
}
