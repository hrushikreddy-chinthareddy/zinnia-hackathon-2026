import { ReactNode } from 'react';

import './label.css';

export interface LabelProps {
  text: string;
  /**
   * Interactive elements that add additional context to the value
   */
  interactiveElements?: ReactNode[];
  /**
   * Pass id of associated element to connect label to the value or input it is describing
   */
  labelFor: string;
}

export const Label = ({ text, interactiveElements, labelFor }: LabelProps) => {
  return (
    <div className="label__container">
      <label
        htmlFor={labelFor}
        className="typographyLabelsFieldLabel label__text"
      >
        {text}
      </label>
      {interactiveElements &&
        interactiveElements.map((elem, index) => (
          <div key={`interactive-${index}`} className="label__interactive-item">
            {elem}
          </div>
        ))}
    </div>
  );
};
