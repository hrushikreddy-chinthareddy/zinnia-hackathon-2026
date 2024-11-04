import dayjs from 'dayjs';
import { ParsedUrlQueryInput } from 'querystring';
import { SetStateAction, useState } from 'react';

import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import { CaseSearchAdditionalFilters, CaseSearchFilters } from '@deps/contexts/CaseManagementFilters';
import { Statuses } from '@deps/models/case/case';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

import { useQueryFilters } from './queryStoreFilters';

export enum QueryKeys {
    carrier = 'carrier',
    caseStatus = 'caseStatus',
    createdDateEnd = 'createdDateEnd',
    createdDateStart = 'createdDateStart',
    limit = 'limit',
    notInCaseStatus = 'notInCaseStatus',
    offset = 'offset',
    process = 'process',
    productName = 'productName',
    requestSubType = 'requestSubType',
    sortBy = 'sortBy',
    sortDirection = 'sortDirection',
    updatedDateEnd = 'updatedDateEnd',
    updatedDateStart = 'updatedDateStart',
}

// Convert query strings to filters
const convertQueryToFilters = (query: ParsedUrlQueryInput): CaseSearchFilters => {
    const additionalFilters: CaseSearchAdditionalFilters = {
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
        searchValue: {},
        toggleValue: 'policyNumber',
    };

    if (query[QueryKeys.carrier]) {
        const carriersFromQuery = query[QueryKeys.carrier];
        let carriersList: string[] = [];
        if (Array.isArray(carriersFromQuery)) {
            carriersList = carriersFromQuery as string[];
        } else {
            carriersList = [carriersFromQuery as string];
        }

        const carrierNameToClientIds: { [key: string]: string } = {};
        const carrierFilters: { [key: string]: string } = {};

        carriersList.forEach(carrier => {
            const clientId = carrier.toUpperCase();
            const carrierName = getCarrierNameByClientId(clientId) || clientId;

            // if we already have this carrier name, work magic
            if (carrierNameToClientIds[carrierName]) {
                const currentCarrierFilterKey = carrierNameToClientIds[carrierName];
                const clientIds = [...currentCarrierFilterKey.split(','), clientId].sort().join(',');
                carrierNameToClientIds[carrierName] = clientIds;
                delete carrierFilters[currentCarrierFilterKey];
                carrierFilters[clientIds] = carrierName;
            } else {
                carrierNameToClientIds[carrierName] = clientId;
                carrierFilters[clientId] = carrierName;
            }
        });

        additionalFilters.carriers = carrierFilters;
    }

    if (query[QueryKeys.createdDateEnd]) {
        const val = dayjs(query[QueryKeys.createdDateEnd] as string);
        if (val.isValid()) {
            additionalFilters.createdDateEnd = val.format(DATE_PICKER_FORMAT);
        }
    }

    if (query[QueryKeys.createdDateStart]) {
        const val = dayjs(query[QueryKeys.createdDateStart] as string);
        if (val.isValid()) {
            additionalFilters.createdDateStart = val.format(DATE_PICKER_FORMAT);
        }
    }

    if (query[QueryKeys.limit] && !isNaN(parseInt(query[QueryKeys.limit] as string))) {
        caseFilters.limit = parseInt(query[QueryKeys.limit] as string);
    }

    if (query[QueryKeys.notInCaseStatus]) {
        if (Array.isArray(query[QueryKeys.notInCaseStatus])) {
            additionalFilters.notInCaseStatus = query[QueryKeys.notInCaseStatus] as Statuses[];
        } else if (typeof query[QueryKeys.notInCaseStatus] === 'string') {
            additionalFilters.notInCaseStatus = [query[QueryKeys.notInCaseStatus] as Statuses];
        }
    }

    if (query[QueryKeys.offset] && !isNaN(parseInt(query[QueryKeys.offset] as string))) {
        caseFilters.offset = parseInt(query[QueryKeys.offset] as string);
    }

    if (query[QueryKeys.process]) {
        if (Array.isArray(query[QueryKeys.process])) {
            additionalFilters.processTypes = new Set(query[QueryKeys.process]);
        } else if (typeof query[QueryKeys.process] === 'string') {
            additionalFilters.processTypes = new Set([query[QueryKeys.process]]);
        }
    }

    if (query[QueryKeys.productName]) {
        if (Array.isArray(query[QueryKeys.productName])) {
            additionalFilters.products = new Set(query[QueryKeys.productName]);
        } else if (typeof query[QueryKeys.productName] === 'string') {
            additionalFilters.products = new Set([query[QueryKeys.productName]]);
        }
    }

    if (query[QueryKeys.requestSubType]) {
        if (Array.isArray(query[QueryKeys.requestSubType])) {
            additionalFilters.requestSubType = new Set(query[QueryKeys.requestSubType]);
        } else if (typeof query[QueryKeys.requestSubType] === 'string') {
            additionalFilters.requestSubType = new Set([query[QueryKeys.requestSubType]]);
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

    if (query[QueryKeys.caseStatus]) {
        if (Array.isArray(query[QueryKeys.caseStatus])) {
            additionalFilters.caseStatus = query[QueryKeys.caseStatus] as Statuses[];
        } else if (typeof query[QueryKeys.caseStatus] === 'string') {
            additionalFilters.caseStatus = [query[QueryKeys.caseStatus] as Statuses];
        }
    }

    if (query[QueryKeys.updatedDateEnd]) {
        const val = dayjs(query[QueryKeys.updatedDateEnd] as string);
        if (val.isValid()) {
            additionalFilters.updatedDateEnd = val.format(DATE_PICKER_FORMAT);
        }
    }

    if (query[QueryKeys.updatedDateStart]) {
        const val = dayjs(query[QueryKeys.updatedDateStart] as string);
        if (val.isValid()) {
            additionalFilters.updatedDateStart = val.format(DATE_PICKER_FORMAT);
        }
    }

    return { ...caseFilters, additionalFilters };
};

const convertFilterToQuery = (filters: CaseSearchFilters): ParsedUrlQueryInput => {
    const query: ParsedUrlQueryInput = {};
    const { limit, offset, sortDirection, additionalFilters } = filters;
    const {
        carriers,
        caseStatus,
        createdDateEnd,
        createdDateStart,
        notInCaseStatus,
        processTypes,
        products,
        requestSubType,
        updatedDateEnd,
        updatedDateStart,
    } = additionalFilters;

    if (carriers) {
        query[QueryKeys.carrier] = Object.keys(carriers).join(',').split(',');
    }

    if (createdDateEnd) {
        query[QueryKeys.createdDateEnd] = dayjs(createdDateEnd, DATE_PICKER_FORMAT).format();
    }

    if (createdDateStart) {
        query[QueryKeys.createdDateStart] = dayjs(createdDateStart, DATE_PICKER_FORMAT).format();
    }
    if (limit) {
        query[QueryKeys.limit] = limit;
    }

    if (notInCaseStatus) {
        query[QueryKeys.notInCaseStatus] = notInCaseStatus;
    }

    if (offset) {
        query[QueryKeys.offset] = offset;
    }

    if (processTypes.size > 0) {
        query[QueryKeys.process] = Array.from(processTypes);
    }

    if (products.size > 0) {
        query[QueryKeys.productName] = Array.from(products);
    }

    if (requestSubType.size > 0) {
        query[QueryKeys.requestSubType] = Array.from(requestSubType);
    }

    if (sortDirection) {
        query[QueryKeys.sortDirection] = sortDirection;
    }

    if (caseStatus?.length) {
        query[QueryKeys.caseStatus] = caseStatus;
    }

    if (updatedDateEnd) {
        query[QueryKeys.updatedDateEnd] = dayjs(updatedDateEnd, DATE_PICKER_FORMAT).format();
    }

    if (updatedDateStart) {
        query[QueryKeys.updatedDateStart] = dayjs(updatedDateStart, DATE_PICKER_FORMAT).format();
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
