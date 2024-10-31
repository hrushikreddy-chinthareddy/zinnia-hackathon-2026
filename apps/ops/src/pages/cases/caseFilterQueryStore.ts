import { CaseSearchAdditionalFilters, CaseSearchFilters } from '@deps/contexts/CaseManagementFilters';
import { useQueryFilters } from './queryStoreFilters';
import { SetStateAction, useState } from 'react';
import { ParsedUrlQueryInput } from 'querystring';
import dayjs from 'dayjs';
import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';

export enum QueryKeys {
    carrier = 'carrier',
    createdDateEnd = 'createdDateEnd',
    createdDateStart = 'createdDateStart',
    limit = 'limit',
    offset = 'offset',
    process = 'process',
    productName = 'productName',
    requestSubType = 'requestSubType',
    sortDirection = 'sortDirection',
    sortBy = 'sortBy',
    status = 'status',
    updatedDateEnd = 'updatedDateEnd',
    updatedDateStart = 'updatedDateStart',
}

// Convert query strings to filters
const convertQueryToFilters = (query: ParsedUrlQueryInput): CaseSearchFilters => {
    const additionalFilters: CaseSearchAdditionalFilters = {
        showOnlyCanceledCases: false,
        showOnlyCompletedCases: false,
        processTypes: new Set([]),
        requestSubType: new Set([]),
        products: new Set([]),
    };
    const caseFilters: CaseSearchFilters = {
        additionalFilters,
        limit: 25,
        offset: 0,
        total: 0,
        sortDirection: 'desc',
        statusCounterTileFilter: 'All',
        searchValue: { query: '' },
        toggleValue: 'policyNumber',
    };
    if (query[QueryKeys.createdDateStart]) {
        const val = dayjs(query[QueryKeys.createdDateStart] as string);
        if (val.isValid()) {
            additionalFilters.createdDateStart = val.format(DATE_PICKER_FORMAT);
        }
    }
    if (query[QueryKeys.createdDateEnd]) {
        const val = dayjs(query[QueryKeys.createdDateEnd] as string);
        if (val.isValid()) {
            additionalFilters.createdDateEnd = val.format(DATE_PICKER_FORMAT);
        }
    }
    if (query[QueryKeys.updatedDateStart]) {
        const val = dayjs(query[QueryKeys.updatedDateStart] as string);
        if (val.isValid()) {
            additionalFilters.updatedDateStart = val.format(DATE_PICKER_FORMAT);
        }
    }
    if (query[QueryKeys.updatedDateEnd]) {
        const val = dayjs(query[QueryKeys.updatedDateEnd] as string);
        if (val.isValid()) {
            additionalFilters.updatedDateEnd = val.format(DATE_PICKER_FORMAT);
        }
    }
    if (query[QueryKeys.carrier]) {
        if (Array.isArray(query[QueryKeys.carrier])) {
            // BPB - ToDo: Magic
            // additionalFilters.carriers = new Set(query[QueryKeys.carrier]);
        } else {
            // BPB - ToDo: Magic
            // additionalFilters.carriers = new Set([query[QueryKeys.carrier]]);
        }
    }
    if (query[QueryKeys.process]) {
        if (Array.isArray(query[QueryKeys.process])) {
            additionalFilters.processTypes = new Set(query[QueryKeys.process]);
        } else if (typeof query[QueryKeys.process] === 'string') {
            additionalFilters.processTypes = new Set([query[QueryKeys.process]]);
        }
    }
    if (query[QueryKeys.requestSubType]) {
        if (Array.isArray(query[QueryKeys.requestSubType])) {
            additionalFilters.requestSubType = new Set(query[QueryKeys.requestSubType]);
        } else if (typeof query[QueryKeys.requestSubType] === 'string') {
            additionalFilters.requestSubType = new Set([query[QueryKeys.requestSubType]]);
        }
    }

    if (query[QueryKeys.productName]) {
        if (Array.isArray(query[QueryKeys.productName])) {
            additionalFilters.products = new Set(query[QueryKeys.productName]);
        } else if (typeof query[QueryKeys.productName] === 'string') {
            additionalFilters.products = new Set([query[QueryKeys.productName]]);
        }
    }
    if (query[QueryKeys.status]) {
        // BPB - ToDo: Magic
        if (Array.isArray(query[QueryKeys.status])) {
            // additionalFilters.statuses = new Set(query[QueryKeys.status]);
        } else if (typeof query[QueryKeys.status] === 'string') {
            // additionalFilters.statuses = new Set([query[QueryKeys.status]]);
        }
    }
    if (query[QueryKeys.sortBy]) {
        // BPB - ToDo: Magic
        if (typeof query[QueryKeys.sortBy] === 'string') {
            // caseFilters.sortBy = query[QueryKeys.sortBy];
        }
    }
    if (
        query[QueryKeys.sortDirection] &&
        typeof query[QueryKeys.sortDirection] === 'string' &&
        ['asc', 'desc'].includes(query[QueryKeys.sortDirection].toLowerCase())
    ) {
        caseFilters.sortDirection = query[QueryKeys.sortDirection].toLowerCase() as 'asc' | 'desc';
    }
    if (query[QueryKeys.limit] && !isNaN(parseInt(query[QueryKeys.limit] as string))) {
        caseFilters.limit = parseInt(query[QueryKeys.limit] as string);
    }
    if (query[QueryKeys.offset] && !isNaN(parseInt(query[QueryKeys.offset] as string))) {
        caseFilters.offset = parseInt(query[QueryKeys.offset] as string);
    }

    return { ...caseFilters, additionalFilters };
};

const convertFilterToQuery = (filters: CaseSearchFilters): ParsedUrlQueryInput => {
    const query: ParsedUrlQueryInput = {};
    const { limit, offset, sortDirection, additionalFilters } = filters;
    const {
        createdDateStart,
        createdDateEnd,
        updatedDateStart,
        updatedDateEnd,
        showOnlyCanceledCases,
        showOnlyCompletedCases,
        processTypes,
        requestSubType,
        carriers,
        products,
    } = additionalFilters;

    if (createdDateStart) {
        query[QueryKeys.createdDateStart] = dayjs(createdDateStart, DATE_PICKER_FORMAT).format();
    }
    if (createdDateEnd) {
        query[QueryKeys.createdDateEnd] = dayjs(createdDateEnd, DATE_PICKER_FORMAT).format();
    }
    if (updatedDateStart) {
        query[QueryKeys.updatedDateStart] = dayjs(updatedDateStart, DATE_PICKER_FORMAT).format();
    }
    if (updatedDateEnd) {
        query[QueryKeys.updatedDateEnd] = dayjs(updatedDateEnd, DATE_PICKER_FORMAT).format();
    }
    if (showOnlyCanceledCases) {
        query[QueryKeys.status] = 'Canceled';
    }
    if (showOnlyCompletedCases) {
        query[QueryKeys.status] = 'Completed';
    }
    if (showOnlyCanceledCases && showOnlyCanceledCases) {
        query[QueryKeys.status] = ['Canceled', 'Completed'];
    }
    if (processTypes.size > 0) {
        query[QueryKeys.process] = Array.from(processTypes);
    }
    if (requestSubType.size > 0) {
        query[QueryKeys.requestSubType] = Array.from(requestSubType);
    }
    if (limit) {
        query[QueryKeys.limit] = limit;
    }
    if (offset) {
        query[QueryKeys.offset] = offset;
    }
    if (sortDirection) {
        query[QueryKeys.sortDirection] = sortDirection;
    }
    if (products.size > 0) {
        query[QueryKeys.productName] = Array.from(products);
    }
    if (carriers) {
        // BPB - ToDo: Magic
    }

    // BPB - ToDo: sortBy

    return query;
};
export const useCaseFilterQueryStore = () => {
    const [queryStoreFilter, setQueryStoreFilter] = useQueryFilters(Object.values(QueryKeys));
    const [caseManagementFilters, setCaseManagementFilters] = useState<CaseSearchFilters>(convertQueryToFilters(queryStoreFilter));

    const setFilters = (filters: SetStateAction<CaseSearchFilters>) => {
        let newFilters: CaseSearchFilters;
        if (typeof filters === 'function') {
            newFilters = filters(caseManagementFilters);
        } else {
            newFilters = filters;
        }

        setQueryStoreFilter(convertFilterToQuery(newFilters));
        setCaseManagementFilters(newFilters);
    };

    return [caseManagementFilters, setFilters] as [typeof caseManagementFilters, typeof setFilters];
};
