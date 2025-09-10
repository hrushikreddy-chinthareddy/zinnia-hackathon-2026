import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { TableRow, TableCell, Icon, IconType } from '@zinnia/bloom/components';
import React from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import styles from './flag-queue.module.css';

interface VariableQueueTableRowProps {
    featureVariable: string;
    featureVariableObject: {
        enabled: boolean;
        variables: any;
    };
}

const VariableQueueTableRow: React.FC<VariableQueueTableRowProps> = ({
    featureVariable,
    featureVariableObject,
}) => {
    const keys = featureVariableObject?.variables
        ? Object.keys(featureVariableObject.variables)
        : [];
    return (
        <>
            <TableRow className={styles.row}>
                <TableCell>
                    <Content
                        details={featureVariable}
                        variant={ContentVariant.BodySm}
                    />
                </TableCell>
                <TableCell>
                    <div className="flex justify-start items-center gap-2 flex-wrap">
                        {keys.length > 0 &&
                            keys.map((key) => {
                                const subKeys = Object.keys(
                                    featureVariableObject.variables[key]
                                );

                                return (
                                    <div className="mt-2" key={key}>
                                        {subKeys.length > 0 && (
                                            <DropdownMenu.Root>
                                                <DropdownMenu.Trigger
                                                    className={
                                                        'typography-content-body-sm whitespace-nowrap flex border-1 justify-center items-center rounded-lg p-2 gap-2'
                                                    }
                                                >
                                                    <label id="case-search-label">
                                                        <Typography
                                                            variant={
                                                                TypographyVariant.BodySm
                                                            }
                                                        >
                                                            {key}
                                                        </Typography>
                                                    </label>
                                                    <Icon
                                                        type={IconType.CHEVRON}
                                                        height={15}
                                                        width={15}
                                                        color="#00628B"
                                                    />
                                                </DropdownMenu.Trigger>

                                                <DropdownMenu.Portal>
                                                    <DropdownMenu.Content
                                                        className={
                                                            'bg-white rounded-lg shadow-xl z-20 w-max min-w-32 max-h-[400px] overflow-y-auto '
                                                        }
                                                    >
                                                        {subKeys.map(
                                                            (item, index) => (
                                                                <DropdownMenu.Item
                                                                    className={
                                                                        'hover:bg-gray-100 p-2 flex items-center justify-between gap-2'
                                                                    }
                                                                    key={`dropdown-item-${index}`}
                                                                    disabled={
                                                                        true
                                                                    }
                                                                >
                                                                    <Typography
                                                                        variant={
                                                                            TypographyVariant.Body
                                                                        }
                                                                    >
                                                                        {item}
                                                                    </Typography>
                                                                    {featureVariableObject
                                                                        ?.variables?.[
                                                                        key
                                                                    ]?.[
                                                                        item
                                                                    ] && (
                                                                        <Icon
                                                                            type={
                                                                                IconType.CIRCLE_CHECKMARK
                                                                            }
                                                                            color="green"
                                                                            height={
                                                                                15
                                                                            }
                                                                        />
                                                                    )}
                                                                </DropdownMenu.Item>
                                                            )
                                                        )}
                                                    </DropdownMenu.Content>
                                                </DropdownMenu.Portal>
                                            </DropdownMenu.Root>
                                        )}

                                        {subKeys.length === 0 && (
                                            <div className="border-1 rounded-lg p-2 gap-2 flex items-center w-max justify-between">
                                                <Typography
                                                    variant={
                                                        TypographyVariant.Body
                                                    }
                                                >
                                                    {key}
                                                </Typography>
                                                {featureVariableObject
                                                    ?.variables?.[key] && (
                                                    <Icon
                                                        type={
                                                            IconType.CIRCLE_CHECKMARK
                                                        }
                                                        color="green"
                                                        height={15}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </TableCell>
                <TableCell>
                    <Icon type={IconType.CIRCLE_CHECKMARK} color="green" />
                </TableCell>
            </TableRow>
        </>
    );
};

export default VariableQueueTableRow;
