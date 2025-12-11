import { Label, Accordion } from '@zinnia/bloom/components';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';

import styles from './raw-data-viewer.module.css';
import DotContainer from '../dot-container/dot-container';
import Typography, { TypographyVariant } from '../typography/typography';

type Serializable =
    | string
    | number
    | boolean
    | null
    | undefined
    | Serializable[]
    | { [key: string]: Serializable };

const RecursiveViewer = ({
    data,
    fieldName,
}: {
    data: Serializable;
    fieldName: string;
}) => {
    if (typeof data !== 'object' || data === null) {
        return (
            <DotContainer
                key={fieldName}
                dotLeftSide={<div>{fieldName}</div>}
                dotLeftSideClassName="typography-content-body-sm"
                dotRightSide={
                    isNullEmptyOrUndefined(data) ? JSON.stringify(data) : data
                }
                dotRightSideClassName="typography-content-body-sm"
            />
        );
    }

    if (Array.isArray(data)) {
        if (!data.length) {
            return (
                <DotContainer
                    key={fieldName}
                    dotLeftSide={<div>{fieldName}</div>}
                    dotLeftSideClassName="typography-content-body-sm"
                    dotRightSide="[ ] (Empty)"
                    dotRightSideClassName="typography-content-body-sm"
                />
            );
        }
        return (
            <div className={styles.accordionSection}>
                <Accordion sectionLabel={fieldName}>
                    <div className={styles.accordionContent}>
                        {data.map((item, index) => (
                            <RecursiveViewer
                                key={index}
                                data={item}
                                fieldName={`${fieldName}[${index}]`}
                            />
                        ))}
                    </div>
                </Accordion>
            </div>
        );
    }

    return (
        <div className={styles.accordionSection}>
            <Accordion sectionLabel={fieldName}>
                <div className={styles.accordionContent}>
                    {Object.entries(data).map(([key, value]) => (
                        <RecursiveViewer
                            key={key}
                            data={value}
                            fieldName={key}
                        />
                    ))}
                </div>
            </Accordion>
        </div>
    );
};

const assertSerializable = (data: any): Serializable => {
    try {
        return JSON.parse(JSON.stringify(data));
    } catch (e) {
        throw new Error('Data is not serializable');
    }
};

const RawDataViewer = ({
    data,
    title,
    ...rest
}: {
    data: any;
    title: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
    let isSerializable = true;
    let serializableData: Serializable;
    try {
        serializableData = assertSerializable(data);
    } catch (e) {
        isSerializable = false;
    }
    if (!isSerializable) {
        return (
            <div className={styles.primitive} {...rest}>
                <Label>{title}</Label>
                <div className="typography-content-body-sm">
                    Unable to serialize data
                </div>
            </div>
        );
    }

    if (typeof serializableData !== 'object' || serializableData === null) {
        return (
            <div className={styles.primitive} {...rest}>
                <Typography variant={TypographyVariant.H2}>{title}</Typography>
                <DotContainer
                    key={title}
                    dotLeftSide={<div>{title}</div>}
                    dotLeftSideClassName="typography-content-body-sm"
                    dotRightSide={
                        isNullEmptyOrUndefined(serializableData)
                            ? JSON.stringify(serializableData)
                            : serializableData
                    }
                    dotRightSideClassName="typography-content-body-sm"
                />
            </div>
        );
    }
    return (
        <div className={styles.wrapper} {...rest}>
            <Typography variant={TypographyVariant.H2}>{title}</Typography>
            <div className={styles.accordionSection}>
                {(Array.isArray(serializableData)
                    ? serializableData.map(
                          (item, index): [string, Serializable] => [
                              `${title}[${index}]`,
                              item,
                          ]
                      )
                    : Object.entries(serializableData)
                ).map(([key, value]) => (
                    <RecursiveViewer key={key} data={value} fieldName={key} />
                ))}
            </div>
        </div>
    );
};

export default RawDataViewer;
