import dayjs from 'dayjs';
import { ParsedUrlQueryInput } from 'querystring';
import { SetStateAction, useState } from 'react';

import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import { CaseSearchAdditionalFilters, CaseSearchFilters } from '@deps/contexts/CaseManagementFilters';
import { Statuses } from '@deps/models/case/case';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import useQueryFilters from '@deps/utils/queryStoreFilters';

export enum QueryKeys {
    brokerDealerName = 'brokerDealerName',
    carrier = 'carrier',
    caseStatus = 'caseStatus',
    createdDateEnd = 'createdDateEnd',
    createdDateStart = 'createdDateStart',
    limit = 'limit',
    notInCaseStatus = 'notInCaseStatus',
    offset = 'offset',
    policyNumber = 'policyNumber',
    process = 'process',
    productName = 'productName',
    requestSubType = 'requestSubType',
    sortBy = 'sortBy',
    sortDirection = 'sortDirection',
    updatedDateEnd = 'updatedDateEnd',
    updatedDateStart = 'updatedDateStart',
}

// Convert query strings to filters used by case management search
// Dev Note: Once the UI is updated to be more closely integrated with the API filters, we can make this a little more manageable.
const convertQueryToFilters = (query: ParsedUrlQueryInput): CaseSearchFilters => {
    const additionalFilters: CaseSearchAdditionalFilters = {
        processTypes: new Set([]),
        requestSubType: new Set([]),
        products: new Set([]),
        brokerDealerName: '',
    };
    const caseFilters: CaseSearchFilters = {
        additionalFilters,
        offset: 0,
        total: 0,
        sortBy: 'createdAt',
        sortDirection: 'desc',
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

    if (query[QueryKeys.caseStatus]) {
        if (Array.isArray(query[QueryKeys.caseStatus])) {
            additionalFilters.caseStatus = query[QueryKeys.caseStatus] as Statuses[];
        } else if (typeof query[QueryKeys.caseStatus] === 'string') {
            additionalFilters.caseStatus = [query[QueryKeys.caseStatus] as Statuses];
        }
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

    if (query[QueryKeys.brokerDealerName]) {
        if (Array.isArray(query[QueryKeys.brokerDealerName])) {
            additionalFilters.brokerDealerName = query[QueryKeys.brokerDealerName][0] as string;
        } else if (typeof query[QueryKeys.brokerDealerName] === 'string') {
            additionalFilters.brokerDealerName = query[QueryKeys.brokerDealerName];
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
        if (typeof query[QueryKeys.sortBy] === 'string') {
            caseFilters.sortBy = query[QueryKeys.sortBy];
        }
    }

    if (
        query[QueryKeys.sortDirection] &&
        typeof query[QueryKeys.sortDirection] === 'string' &&
        ['asc', 'desc'].includes(query[QueryKeys.sortDirection].toLowerCase())
    ) {
        caseFilters.sortDirection = query[QueryKeys.sortDirection].toLowerCase() as 'asc' | 'desc';
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

    if (query[QueryKeys.policyNumber]) {
        if (Array.isArray(query[QueryKeys.policyNumber])) {
            caseFilters.searchValue.policyNumber = query[QueryKeys.policyNumber][0] as string;
        } else if (typeof query[QueryKeys.policyNumber] === 'string') {
            caseFilters.searchValue.policyNumber = query[QueryKeys.policyNumber];
        }
    }

    return { ...caseFilters, additionalFilters };
};

// Convert CaseSearchFilters to values supported by the case search api
// Dev Note: This is hopefully a short-term solution until we update the UI to be more closely integrated with the API filter values.
const convertFilterToQuery = (filters: CaseSearchFilters): ParsedUrlQueryInput => {
    const query: ParsedUrlQueryInput = {};
    const { offset, sortBy, sortDirection, additionalFilters, searchValue } = filters;
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
        brokerDealerName,
    } = additionalFilters;
    const { policyNumber } = searchValue;

    if (carriers) {
        query[QueryKeys.carrier] = Object.keys(carriers).join(',').split(',');
    }

    if (caseStatus?.length) {
        query[QueryKeys.caseStatus] = caseStatus;
    }

    if (createdDateEnd) {
        query[QueryKeys.createdDateEnd] = dayjs(createdDateEnd, DATE_PICKER_FORMAT).format();
    }

    if (createdDateStart) {
        query[QueryKeys.createdDateStart] = dayjs(createdDateStart, DATE_PICKER_FORMAT).format();
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

    if (brokerDealerName) {
        query[QueryKeys.brokerDealerName] = brokerDealerName;
    }

    if (requestSubType.size > 0) {
        query[QueryKeys.requestSubType] = Array.from(requestSubType);
    }

    if (sortBy) {
        query[QueryKeys.sortBy] = sortBy;
    }

    if (sortDirection) {
        query[QueryKeys.sortDirection] = sortDirection;
    }

    if (updatedDateEnd) {
        query[QueryKeys.updatedDateEnd] = dayjs(updatedDateEnd, DATE_PICKER_FORMAT).format();
    }

    if (updatedDateStart) {
        query[QueryKeys.updatedDateStart] = dayjs(updatedDateStart, DATE_PICKER_FORMAT).format();
    }

    if (policyNumber) {
        query[QueryKeys.policyNumber] = policyNumber;
    }

    return query;
};

// A drop-in replacement for a useState for the CaseManagementFilters with support for query params for filters
// Returns the current filters and search values as well as a function to update them.
// Search Values, except for policy number, will not be added to query params as they are potentially PII
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

export default useCaseFilterQueryStore;
