import dayjs from 'dayjs';
import {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from 'react';

import { EntityTypeValue } from '@deps/constants/policy';
import { Signature } from '@deps/models/case/task';
import { TransactionResponse } from '@deps/queries/api/bpm';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import {
    Address,
    AddressType,
    Country,
    Email,
    EmailType,
    IdentificationType,
    Phone,
    PhoneType,
    PartyType,
    State,
    PartyBase,
} from '@zinnia/api-types/types/sor';

export type RoleIdentification = {
    permanentResident?: string | null;
    usCitizen?: string | null;
    issueCountry?: string | null;
    endDate?: string | null;
    identificationType?: IdentificationType;
    identificationValue?: string | null;
    startDate?: string;
};

export type ExtendedAddress = Omit<Address, 'state' | 'endDate'> & {
    remove?: boolean;
    state?: State | null;
    endDate?: string | null;
};

export type ExtendedEmail = Omit<Email, 'endDate'> & {
    remove?: boolean;
    endDate?: string | null;
};

export type ExtendedPhone = Omit<Phone, 'endDate'> & {
    remove?: boolean;
    endDate?: string | null;
};

export type Party = Omit<PartyBase, 'identifications' | 'entityType'> & {
    partyId?: string;
    identifications?: RoleIdentification[];
    addresses: ExtendedAddress[];
    phones: ExtendedPhone[];
    emails: ExtendedEmail[];
    entityType: EntityTypeValue | null;
};

export type RoleData = {
    signatures?: Signature[];
    party?: Partial<Party>;
    caseId?: string | null;
    supportingDocumentAttached?: string;
    changeReason?: string;
    relationshipToParty?: string;
    validationResponse?: TransactionResponse;
    documents: any;
    correlationId?: string;
};

type RoleChangeContextType = {
    existingRoleData?: RoleData[];
    roleData: RoleData;
    setRoleData: Dispatch<SetStateAction<RoleData>>;
    setExistingRoleData?: Dispatch<SetStateAction<RoleData[]>>;
    currentErrors?: any;
    setCurrentErrors?: Dispatch<SetStateAction<any>>;
    addRole: boolean;
    setAddRole: Dispatch<SetStateAction<boolean>>;
    removeRole: boolean;
    setRemoveRole: Dispatch<SetStateAction<boolean>>;
    removedTpdIndex: number | null;
    setRemovedTpdIndex: Dispatch<SetStateAction<number | null>>;
};

export const defaultRoleValue: RoleChangeContextType = {
    roleData: {
        documents: null,
        party: {
            partyId: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            partyType: PartyType.INDIVIDUAL,
            identifications: [
                {
                    startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                    endDate: null,
                    identificationType: IdentificationType.SSN,
                    identificationValue: '',
                    issueCountry: undefined,
                    usCitizen: null,
                },
            ],
            addresses: [
                {
                    addressLine1: '',
                    city: '',
                    state: null,
                    startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                    endDate: null,
                    country: Country.US,
                    addressType: AddressType.RESIDENCE,
                    isPreferred: true,
                },
            ],
            phones: [
                {
                    phoneType: PhoneType.MOBILE,
                    startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                    countryCode: '1',
                    endDate: null,
                    dialNumber: '',
                    isPreferred: true,
                },
            ],
            emails: [
                {
                    emailType: EmailType.PERSONAL,
                    startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                    endDate: null,
                    emailAddress: '',
                    isPreferred: true,
                },
            ],
            entityType: EntityTypeValue.Other,
        },
        caseId: undefined,
    },
    setRoleData: () => {},
    setExistingRoleData: () => {},
    addRole: true,
    setAddRole: () => {},
    removeRole: false,
    setRemoveRole: () => {},
    removedTpdIndex: null,
    setRemovedTpdIndex: () => {},
};

const RoleChangeContext = createContext<RoleChangeContextType | null>(null);

export const RoleChangeProvider = ({ children }: PropsWithChildren) => {
    const [roleData, setRoleData] = useState<RoleData>(
        defaultRoleValue.roleData
    );
    const [existingRoleData, setExistingRoleData] = useState<RoleData[]>([]);
    const [currentErrors, setCurrentErrors] = useState<any>({});
    const [addRole, setAddRole] = useState<boolean>(true);
    const [removeRole, setRemoveRole] = useState<boolean>(false);
    const [removedTpdIndex, setRemovedTpdIndex] = useState<number | null>(null);

    return (
        <RoleChangeContext.Provider
            value={{
                roleData,
                setRoleData,
                existingRoleData,
                setExistingRoleData,
                currentErrors,
                setCurrentErrors,
                addRole,
                setAddRole,
                removeRole,
                setRemoveRole,
                removedTpdIndex,
                setRemovedTpdIndex,
            }}
        >
            {children}
        </RoleChangeContext.Provider>
    );
};

export const useRoleChange = () => {
    const context = useContext(RoleChangeContext);

    if (!context) {
        throw new Error(
            'useRoleChange must be used within a RoleChangeProvider'
        );
    }
    return context;
};
