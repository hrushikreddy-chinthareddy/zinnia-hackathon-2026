import { PropsWithChildren, ReactNode } from "react";

import classes from "./Label.module.css";

export type LabelProps = {
  /**
   * Interactive elements that add additional context to the value
   */
  interactiveElements?: ReactNode[];
  /**
   * Pass id of associated element to connect label to the value or input it is describing
   */
  labelFor?: string;
} & PropsWithChildren;

export const Label = ({
  children,
  interactiveElements,
  labelFor,
}: LabelProps) => {
  const labelEl = labelFor ? (
    <label htmlFor={labelFor} className={classes.text}>
      {children}
    </label>
  ) : (
    <div className={classes.text}>{children}</div>
  );

  return (
    <div className={classes.container}>
      {labelEl}
      {interactiveElements &&
        interactiveElements.map((elem, index) => (
          <div key={`interactive-${index}`} className={classes.item}>
            {elem}
          </div>
        ))}
    </div>
  );
};
