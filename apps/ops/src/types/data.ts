import { Component } from 'react';

import { PopoverPlacement } from '@deps/components/popover/popover';
import { Paths } from '@deps/utils/template-literals.util';

export interface DataDefinition<T extends object> {
    key: Paths<T>;
    accessKey?: string;
    label: string;
    value?: string | number | null;
    col?: number;
    tooltip?: string;
    tooltipBody?: string;
    tooltipPlacement?: PopoverPlacement;
    format?: (value?: any) => string;
    defaultValue?: string;
    component?: Component;
    group?: string;
    groupLabel?: string;
}

export type KeyObjectDef = Record<string, any>;

export interface LabelValue<T> {
    label: string;
    value?: T;
    fullLabel?: string;
    placeholder?: string;
    mask?: string;
    format?: string;
    prefix?: string;
    replaceValue?: string;
    disabled?: boolean;
    errorMessage?: string;
    group?: LabelValue<T>[];
    testId?: string;
}
