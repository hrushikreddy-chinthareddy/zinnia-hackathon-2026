import Link from 'next/link';
import { FC } from 'react';

interface KeyValuePairLabelGroupProps {
  fields: {
    title: string;
    children: {
      title?: string;
      url?: string;
      customComponent?: React.ReactNode;
    }[];
  }[];
}

/**
 *
 * Takes in a list of fields and formats and renders them out.
 */
export const KeyValueLabelGroup: FC<KeyValuePairLabelGroupProps> = ({
  fields,
}) => {
  return (
    <div>
      {fields.map((field, index) => (
        <div key={index}>
          <p className={'typography-labels-field-label'}>{field.title}</p>
          {field.children.map((child, childIndex) => {
            if (child.customComponent) {
              return <div key={childIndex}>{child.customComponent}</div>;
            }
            if (child.url) {
              return (
                <div key={childIndex}>
                  <Link href={child.url}>{child.title}</Link>
                </div>
              );
            }

            return (
              <p className={'`typography-content-body-sm`'} key={childIndex}>
                {child.title}
              </p>
            );
          })}
        </div>
      ))}
    </div>
  );
};
