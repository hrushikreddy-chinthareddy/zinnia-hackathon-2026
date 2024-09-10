import Image from 'next/image';

import everly from '@deps/styles/elements/icons/carriers/everly.svg';
import kuvare from '@deps/styles/elements/icons/carriers/kuvare.svg';
import massMutual from '@deps/styles/elements/icons/carriers/mass-mutual.svg';
import placeholder from '@deps/styles/elements/icons/carriers/placeholder.svg';
import securityBenefit from '@deps/styles/elements/icons/carriers/security-benefit.svg';
import usaa from '@deps/styles/elements/icons/carriers/usaa.svg';

// This is a stopgap until the carrier api is deployed
const carriers = {
    ALLM: 'Allmerica',
    ALLS: 'Allstate',
    CWA: 'Commomwealth',
    DLIC: 'Delaware',
    ELIC: 'Everly', // DEPU-2067 - used by Policy Management until we get a carrier API integration
    EMRS: 'Empower',
    FLIC: 'Forethought',
    GDMN: 'Commonwealth',
    GLAC: 'Industrial Alliance',
    GLCO: 'GILICO',
    JHLI: 'John Hancock',
    MASS: 'Mass Mutual',
    MWOA: 'Modern Woodman',
    NASU: 'Nassau Re',
    NLVF: 'National Life',
    PICA: 'Pru Ins Co America',
    PLIC: 'Pacific Life',
    PMHC: 'Pacific Life',
    PRDN: 'Prudential',
    PRUD: 'Allstate',
    RSLN: 'Lincoln Benefit Life',
    SAAG: 'SunAmerica',
    SBGC: 'Security Benefit',
    SBUL: 'Everly', // DEPU-2067 - used by Policy Management until we get a carrier API integration
    SMTR: 'Symetra',
    ULIC: 'United Life',
    ULPC: 'United Life',
    USAA: 'USAA',
    THRI: 'Thrivent Financial',
    SFGI: 'Sammons Financial',
};

export const getCarrierNameByClientId = (clientId: string): string => {
    if (!clientId) return '';
    return carriers[clientId.toUpperCase() as keyof typeof carriers] || '';
};

const carrierNameClientIdMappings = (activeCarriers: typeof carriers) => {
    return Object.entries(activeCarriers).reduce((prev, curr) => {
        return {
            ...prev,
            [curr[1]]: prev && prev[curr[1]] ? prev[curr[1]].concat(curr[0]).sort() : [curr[0]],
        };
    }, {} as { [key: string]: string[] });
};

export const getClientIdsByCarrierName = (authorizedCarriers: string[], carrierName: string) => {
    const actCarriers = getActiveCarriers(authorizedCarriers);
    return carrierNameClientIdMappings(actCarriers)[carrierName]?.join(',') || '';
};

const getActiveCarriers = (authorizedCarriers: string[]) => {
    const filteredCarriers: { [code: string]: string } = {};
    authorizedCarriers.forEach(carrier => {
        filteredCarriers[carrier.toUpperCase()] = carriers[carrier.toUpperCase() as keyof typeof carriers];
    });
    return filteredCarriers as typeof carriers;
};

export const getCarrierNamesByClientIds = (clientIds: string, authorizedCarriers: string[]) => {
    const data = Object.entries(carrierNameClientIdMappings(getActiveCarriers(authorizedCarriers))).filter(entry => {
        return (entry[1] as string[]).join(',') === clientIds;
    })[0];
    return data && data.length ? data[0] : '';
};

export const getSelectedCarriers = (carriers: { [key: string]: string } | undefined): string[] => {
    return Object.keys(carriers || {})
        .map(item => item.split(','))
        .flat();
};

export const getCarrierLogoByClientId = (clientId: string): string => {
    switch (clientId.toUpperCase()) {
        case 'ULIC':
        case 'GLCO':
            return kuvare;
        case 'EVERLY':
        case 'ELIC':
        case 'SBUL':
            return everly;
        case 'USAA':
            return usaa;
        case 'MASS':
            return massMutual;
        case 'SBGC':
            return securityBenefit;
        default:
            return placeholder;
    }
};

export const getCarrierListItem = (clientId: string) => {
    const imageSrc = getCarrierLogoByClientId(clientId);
    const label = getCarrierNameByClientId(clientId) || clientId.toUpperCase();

    return (
        <span className="flex items-center gap-2">
            <Image
                src={imageSrc}
                alt={`${label} icon`}
                width={20}
                height={20}
                role="presentation"
                aria-hidden="true"
                className="rounded-xl border border-gray-200"
            />
            {label}
        </span>
    );
};
