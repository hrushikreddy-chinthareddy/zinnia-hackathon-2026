import React, { PropsWithChildren, ReactNode } from "react";

import classes from "./Label.module.css";

export type LabelProps = {
  /**
   * Interactive elements that add additional context to the value
   */
  interactiveElements?: ReactNode[];
  /**
   * Pass id of associated element to connect label to the value or input it is describing
   */
  labelFor: string;
} & PropsWithChildren;

export const Label: React.FC<LabelProps> = ({
  children,
  interactiveElements,
  labelFor,
}) => {
  return (
    <div className={classes.container}>
      <label htmlFor={labelFor} className={classes.text}>
        {children}
      </label>
      {interactiveElements &&
        interactiveElements.map((elem, index) => (
          <div key={`interactive-${index}`} className={classes.item}>
            {elem}
          </div>
        ))}
    </div>
  );
};
