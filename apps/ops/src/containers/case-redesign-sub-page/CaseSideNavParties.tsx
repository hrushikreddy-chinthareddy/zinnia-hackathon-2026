import { Label, Tag, Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { HTMLAttributes } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Title, { TitleVariant } from '@deps/components/title/title';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { Statuses } from '@deps/models/case/case';
import { Address } from '@deps/models/policy/sor-policy';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

type PartyDataPoint<T> = {
    label: string;
    value: T;
};

export type PartyInfo = {
    fields?: {
        address: PartyDataPoint<Address | undefined>;
        dob: PartyDataPoint<string>;
        email: PartyDataPoint<string>;
        phone: PartyDataPoint<string>;
        ssn: PartyDataPoint<string>;
    };
    fullName: string;
    id: string;
    roles: string[];
};

export type PartiesProps = {
    agents: PartyInfo[];
    brokers?: PartyInfo[];
    owners: PartyInfo[];
};

const NoPartiesStatus = ({
    caseStatus,
    partyType,
    spinLoader = false,
    className = '',
    ...rest
}: { caseStatus: string; partyType: 'agent' | 'owner'; spinLoader?: boolean } & HTMLAttributes<HTMLDivElement>) => {
    const { t } = useTranslation();
    const missingDataClasses = 'flex flex-row items-center text-gray-600';
    let statusTextKey = 'caseOverview.sidenav.';
    let statusSubtextKey = 'caseOverview.sidenav.';
    const partyTypeKey = partyType === 'agent' ? 'Agent' : 'Owner';
    if ([Statuses.Canceled, Statuses.Completed].includes(caseStatus as Statuses)) {
        statusTextKey += `unavailable${partyTypeKey}Details`;
        statusSubtextKey += 'unavailableDetailsSubtext';
    } else {
        statusTextKey += `get${partyTypeKey}Details`;
        statusSubtextKey += 'getDetailsSubtext';
    }

    const loadingClasses = 'transform-origin-center duration-5000 animate-spin ease-linear';

    return (
        <div className={`flex flex-row gap-2 ${className}`} {...rest}>
            <InProgressIcon
                height={18}
                width={18}
                role="presentation"
                aria-hidden="true"
                className={`shrink-0 fill-gray-600 ${spinLoader && loadingClasses}`}
            />
            <div>
                <Typography variant={TypographyVariant.BodySmBold} className={missingDataClasses}>
                    {t(statusTextKey, { status: caseStatus.toLowerCase() })}
                </Typography>
                <Typography variant={TypographyVariant.BodySm} className="text-gray-600">
                    {t(statusSubtextKey, { status: caseStatus.toLowerCase() })}
                </Typography>
            </div>
        </div>
    );
};

const AgentAndBrokerInformation = ({ party, ...rest }: { party: PartyInfo } & HTMLAttributes<HTMLLIElement>) => {
    if (!party) {
        return null;
    }

    return (
        <li className="flex flex-col gap-1" {...rest}>
            <Typography variant={TypographyVariant.LabelMdAlt}>
                <PiiWrapper>{party.fullName}</PiiWrapper>
            </Typography>
            <div className="flex flex-row flex-wrap gap-1">
                {party.roles.map(role => (
                    <Tag text={role} key={role} />
                ))}
            </div>
        </li>
    );
};

const OwnerInformation = ({ owner, ...rest }: { owner: PartyInfo } & HTMLAttributes<HTMLLIElement>) => {
    if (!owner) {
        return null;
    }

    return (
        <li className="flex gap-4 rounded bg-white border-2 border-[#ededed] p-4" {...rest}>
            <Icon type={IconType.CIRCLE_USER} />
            <Typography variant={TypographyVariant.BodyBold}>
                <PiiWrapper>{owner.fullName}</PiiWrapper>
            </Typography>
            <div className="flex gap-4">
                {owner.roles.map(role => (
                    <Tag text={role} key={role} />
                ))}
            </div>

            {owner.fields && (
                <div className="mt-2 grid w-full grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4 lg:grid-cols-2">
                    <div>
                        <div className="flex h-6 w-full items-center">
                            <Label labelFor={`${owner.id}-ssn`}>{owner.fields.ssn.label}</Label>
                        </div>
                        <Content
                            id={`${owner.id}-ssn`}
                            key={owner.id}
                            details={owner.fields.ssn.value}
                            variant={ContentVariant.BodySm}
                            pii={true}
                        />
                    </div>
                    <div>
                        <div className="flex h-6 w-full items-center">
                            <Label labelFor={`${owner.id}-dob`}>{owner.fields.dob.label}</Label>
                        </div>
                        <Content
                            id={`${owner.id}-dob`}
                            key={owner.id}
                            details={owner.fields.dob.value}
                            variant={ContentVariant.BodySm}
                            pii={true}
                        />
                    </div>
                    <div>
                        <div className="flex h-6 w-full items-center">
                            <Label labelFor={`${owner.id}-phone`}>{owner.fields.phone.label}</Label>
                        </div>
                        <Content id={`${owner.id}-phone`} details={owner.fields.phone.value} variant={ContentVariant.BodySm} pii={true} />
                    </div>
                    <div>
                        <div className="flex h-6 w-full items-center">
                            <Label labelFor={`${owner.id}-email`}>{owner.fields.email.label}</Label>
                        </div>
                        <Content id={`${owner.id}-email`} details={owner.fields.email.value} variant={ContentVariant.BodySm} pii={true} />
                    </div>
                    <div>
                        <div className="flex h-6 w-full items-center">
                            <Label labelFor={`${owner.id}-address`}>{owner.fields.address.label}</Label>
                        </div>
                        {owner.fields.address.value ? (
                            <FormattedAddress id={`${owner.id}-address`} address={owner.fields.address.value} />
                        ) : (
                            <span id={`${owner.id}-address`}>{DEFAULT_ERROR_STRING}</span>
                        )}
                    </div>
                </div>
            )}
        </li>
    );
};

export const Parties = ({
    parties,
    caseStatus,
    ...rest
}: { parties: PartiesProps | undefined; caseStatus: string } & HTMLAttributes<HTMLDivElement>) => {
    const { t } = useTranslation();
    const { loadingPolicy } = useCaseActivityContext();
    const { owners = [], agents = [], brokers } = parties ?? {};
    const spacingAndBorderClasses = 'border-gray-100 py-4 [&:not(:last-child)]:border-b-2 last:pb-0';
    const listClasses = `${spacingAndBorderClasses} flex w-full flex-col gap-4`;
    console.log(parties);
    return (
        <div className="flex w-full flex-col p-4 rounded bg-white shadow-elevation-light-04" {...rest}>
            <Title className="mb-2" variant={TitleVariant.SubTitle}>
                {t('caseOverview.sidenav.people')}
            </Title>
            {owners.length ? (
                <ul className={`${listClasses} pt-0`}>
                    {owners.map(owner => (
                        <OwnerInformation owner={owner} key={owner.fullName} />
                    ))}
                </ul>
            ) : (
                <NoPartiesStatus
                    caseStatus={caseStatus}
                    partyType="owner"
                    className={`${spacingAndBorderClasses} pt-0`}
                    spinLoader={loadingPolicy}
                />
            )}
            {agents.length ? (
                <ul className={listClasses}>
                    {agents.map(agent => (
                        <AgentAndBrokerInformation party={agent} key={agent.fullName} />
                    ))}
                </ul>
            ) : (
                <NoPartiesStatus caseStatus={caseStatus} partyType="agent" className={spacingAndBorderClasses} spinLoader={loadingPolicy} />
            )}
            {!!brokers?.length && (
                <ul className={listClasses}>
                    {brokers.map(broker => (
                        <AgentAndBrokerInformation party={broker} key={broker.fullName} />
                    ))}
                </ul>
            )}
        </div>
    );
};
