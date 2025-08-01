import { FieldSizes, RenderingField } from '@zinnia/form-engine-sdk';
import clsx from 'clsx';
import ReactHtmlParser from 'html-react-parser';
import { ReactElement, ReactNode, useEffect, useRef } from 'react';

import style from './field.module.css';

export interface FieldContainerProps {
    forceNewLine: boolean;
    fieldSize: number;
    field: RenderingField;
    infoSupplementImage?: { src: string; alt?: string };
    onInfoIconClick?: () => void;
    withoutInfoSupplement?: boolean;
    children?: ReactNode;
    focusedIncompleteFieldId?: string;
    boldedBorder?: boolean;
}

export function FieldContainer(props: FieldContainerProps): ReactElement {
    const {
        // forceNewLine,
        field,
        children,
        // fieldSize,
        // onInfoIconClick,
        // infoSupplementImage,
        withoutInfoSupplement = false,
        focusedIncompleteFieldId,
        // boldedBorder,
    } = props;

    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (focusedIncompleteFieldId === field.blueprintId) {
            const { current } = divRef;
            if (current) {
                current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [focusedIncompleteFieldId, field.blueprintId]);

    // const gridSize = useMemo(() => {
    //   if (withoutInfoSupplement) {
    //     return 12;
    //   }
    //   return (
    //     field.info ? fieldSize - INFO_ICON_BUTTON_SIZE : fieldSize
    //   ) as number;
    // }, [withoutInfoSupplement, field.info, fieldSize]);

    const layoutStyle = field.layout?.size
        ? style[`layout-${field.layout.size}`]
        : '';

    return (
        <div className={style.fieldContainer}>
            {/*  TODO: handle force new line*/}
            {/* {forceNewLine && <SpacerField styleVariant={styleVariant} />} */}

            <div className={clsx(style.fieldItem, layoutStyle)}>{children}</div>
            {withoutInfoSupplement === false && field.info && (
                <div>
                    <div>
                        {/* TODO: info supplement */}
                        <div>(i)</div>
                        {/* <InfoSupplement
              title={field.info.title}
              text={field.info.text}
              image={infoSupplementImage}
              modalOptions={field.info.modalOptions}
              onClick={onInfoIconClick}
              boldedBorder={boldedBorder}
            /> */}
                    </div>
                </div>
            )}
        </div>
    );
}

export const FieldLabel = ({ field }: { field: RenderingField }) => {
    return (
        (field.title || field.text) && (
            <div className={style.fieldHeader}>
                {field.title && (
                    <label
                        htmlFor={field.id}
                        className="typography-labels-label-md-alt"
                    >
                        {ReactHtmlParser(field.title)}
                        {!field.optional && '*'}
                    </label>
                )}
                {field.text && (
                    <p className="typography-labels-label-sm-alt">
                        {ReactHtmlParser(field.text)}
                    </p>
                )}
            </div>
        )
    );
};

export function ReadOnlyField({ field }: { field: RenderingField }) {
    return (
        <FieldContainer field={field} forceNewLine fieldSize={FieldSizes.full}>
            <FieldLabel field={field} />
            {field.value && <p>{field.value}</p>}
        </FieldContainer>
    );
}
