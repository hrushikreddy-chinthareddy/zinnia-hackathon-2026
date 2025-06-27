import Image from 'next/image';

import allstate from '@deps/styles/elements/icons/carriers/allstate.svg';
import arcus from '@deps/styles/elements/icons/carriers/arcus.svg';
import delaware from '@deps/styles/elements/icons/carriers/delaware.svg';
import empower from '@deps/styles/elements/icons/carriers/empower.svg';
import everly from '@deps/styles/elements/icons/carriers/everly.svg';
import farmers from '@deps/styles/elements/icons/carriers/farmers.svg';
import globalAtlantic from '@deps/styles/elements/icons/carriers/global-atlantic.svg';
import guaranty from '@deps/styles/elements/icons/carriers/guaranty.svg';
import guggenheim from '@deps/styles/elements/icons/carriers/guggenheim.svg';
import kuvareLincoln from '@deps/styles/elements/icons/carriers/kuvare-lincoln.svg';
import kuvare from '@deps/styles/elements/icons/carriers/kuvare.svg';
import massMutual from '@deps/styles/elements/icons/carriers/mass-mutual.svg';
import modernWoodmen from '@deps/styles/elements/icons/carriers/modern-woodmen.svg';
import nassau from '@deps/styles/elements/icons/carriers/nassau.svg';
import nationalLife from '@deps/styles/elements/icons/carriers/national-life.svg';
import pacificLife from '@deps/styles/elements/icons/carriers/pacific-life.svg';
import placeholder from '@deps/styles/elements/icons/carriers/placeholder.svg';
import prudential from '@deps/styles/elements/icons/carriers/prudential.svg';
import securityBenefit from '@deps/styles/elements/icons/carriers/security-benefit.svg';
import sunAmerica from '@deps/styles/elements/icons/carriers/sun-america.svg';
import symetra from '@deps/styles/elements/icons/carriers/symetra.svg';
import unitedLife from '@deps/styles/elements/icons/carriers/united-life.svg';
import usaa from '@deps/styles/elements/icons/carriers/usaa.svg';
import wellabe from '@deps/styles/elements/icons/carriers/wellabe.svg';
import zinnia from '@deps/styles/elements/icons/carriers/zinnia.svg';

// This is a stopgap until the carrier api is deployed
const carriers = {
    ALLM: 'Allmerica',
    ALLS: 'Allstate',
    CWA: 'Commomwealth',
    DLIC: 'Delaware',
    ELIC: 'Everly', // DEPU-2067 - used by Policy Management until we get a carrier API integration
    EMRS: 'Empower',
    FLIC: 'Forethought',
    GDMN: 'Goldman Sachs',
    GLAC: 'Industrial Alliance',
    GLCO: 'GILICO',
    ILIC: 'Arcus',
    ILNA: 'Arcus',
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
    SBUL: 'Security Benefit Life Insurance Company', // DEPU-2795
    SFGI: 'Sammons Financial',
    SMTR: 'Symetra',
    THRI: 'Thrivent Financial',
    ULIC: 'United Life',
    ULPC: 'United Life',
    USAA: 'USAA',
    WELB: 'Wellabe',
    FNWL: 'Farmers Insurance',
    CPAF: 'Farmers Insurance',
};

export const getCarrierNameByClientId = (
    clientId: string,
    showClientCode: boolean = false
): string => {
    if (!clientId) return '';
    const carrierName =
        carriers[clientId.toUpperCase() as keyof typeof carriers];

    if (showClientCode) {
        return carrierName
            ? carrierName + ' (' + clientId.toUpperCase() + ')'
            : '';
    } else {
        return carrierName || '';
    }
};

const carrierNameClientIdMappings = (activeCarriers: typeof carriers) => {
    return Object.entries(activeCarriers).reduce((prev, curr) => {
        return {
            ...prev,
            [curr[1]]:
                prev && prev[curr[1]]
                    ? prev[curr[1]].concat(curr[0]).sort()
                    : [curr[0]],
        };
    }, {} as { [key: string]: string[] });
};

export const getClientIdsByCarrierName = (
    authorizedCarriers: string[],
    carrierName: string
) => {
    const actCarriers = getActiveCarriers(authorizedCarriers);
    return (
        carrierNameClientIdMappings(actCarriers)[carrierName]?.join(',') || ''
    );
};

const getActiveCarriers = (authorizedCarriers: string[]) => {
    const filteredCarriers: { [code: string]: string } = {};
    authorizedCarriers.forEach((carrier) => {
        filteredCarriers[carrier.toUpperCase()] =
            carriers[carrier.toUpperCase() as keyof typeof carriers];
    });
    return filteredCarriers as typeof carriers;
};

export const getCarrierNamesByClientIds = (
    clientIds: string,
    authorizedCarriers: string[]
) => {
    const data = Object.entries(
        carrierNameClientIdMappings(getActiveCarriers(authorizedCarriers))
    ).filter((entry) => {
        return (entry[1] as string[]).join(',') === clientIds;
    })[0];
    return data && data.length ? data[0] : '';
};

export const getSelectedCarriers = (
    carriers: { [key: string]: string } | undefined
): string[] => {
    return Object.keys(carriers || {})
        .map((item) => item.split(','))
        .flat();
};

export const getCarrierLogoByClientId = (clientId: string): string => {
    switch (clientId.toUpperCase()) {
        case 'ALLS':
        case 'PRUD':
            return allstate;
        case 'ILIC':
            return arcus;
        case 'DLIC':
            return delaware;
        case 'EMRS':
            return empower;
        case 'EVERLY':
        case 'ELIC':
        case 'SBUL':
            return everly;
        case 'FLIC':
        case 'ALLM':
            return globalAtlantic;
        case 'GLCO':
        case 'GILICO':
            return guaranty;
        case 'GLAC':
            return guggenheim;
        case 'ULIC':
            return kuvare;
        case 'RSLN':
            return kuvareLincoln;
        case 'MASS':
            return massMutual;
        case 'MWOA':
            return modernWoodmen;
        case 'NASU':
            return nassau;
        case 'NLVF':
            return nationalLife;
        case 'PLIC':
            return pacificLife;
        case 'PRDN':
        case 'PICA':
            return prudential;
        case 'SBGC':
            return securityBenefit;
        case 'SAAG':
            return sunAmerica;
        case 'SMTR':
            return symetra;
        case 'ULPC':
            return unitedLife;
        case 'USAA':
            return usaa;
        case 'WELB':
            return wellabe;
        case 'ZINN':
            return zinnia;
        case 'FNWL':
        case 'CPAF':
            return farmers;
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
