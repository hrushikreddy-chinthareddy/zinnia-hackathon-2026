import { Address } from '@zinnia/api-types/types/sor';
import { Tag, Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { HTMLAttributes } from 'react';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Title, { TitleVariant } from '@deps/components/title/title';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';

type PartyDataPoint<T> = {
    label: string;
    value: T;
};

export type PartyInfo = {
    fields: {
        address?: PartyDataPoint<Address | undefined>;
        dob?: PartyDataPoint<string>;
        email?: PartyDataPoint<string>;
        phone?: PartyDataPoint<string>;
        ssn?: PartyDataPoint<string>;
        brokerDealer?: PartyDataPoint<string>;
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

const NoParties = ({ caseStatus, className = '', ...rest }: { caseStatus: string } & HTMLAttributes<HTMLDivElement>) => {
    const { t } = useTranslation();
    const { loadingPolicy, policy } = useCaseActivityContext();

    return (
        <div className={`flex flex-row gap-2 ${className}`} {...rest}>
            {loadingPolicy && (
                <>
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        aria-hidden="true"
                        className={`shrink-0 fill-gray-600 transform-origin-center duration-5000 animate-spin ease-linear`}
                    />
                    <div>
                        <Typography variant={TypographyVariant.BodySmBold} className="flex flex-row items-center text-gray-600">
                            {t('caseOverview.sidenav.gettingPartyDetails')}
                        </Typography>
                    </div>
                </>
            )}
            {!loadingPolicy && (
                <div>
                    <Typography variant={TypographyVariant.BodySm} className="flex flex-row items-center text-gray-600">
                        {t('caseOverview.sidenav.partyDetailsUnavailable')}
                    </Typography>
                    {!!policy && !!policy.policyNumber && !!policy.planCode && (
                        <NavElement
                            type={NavElementType.Link}
                            className="flex items-center max-w-max"
                            size={NavElementSize.Small}
                            variant={NavElementVariant.Default}
                            href={`/policies/${policy.planCode}/${policy.policyNumber}/people`}
                        >
                            {t('caseOverview.sidenav.goToPolicyParties')}
                        </NavElement>
                    )}
                </div>
            )}
        </div>
    );
};

const RoleTags = ({ party }: { party: PartyInfo }) => {
    if (!party.roles || party.roles.length < 1) {
        return;
    }

    return (
        <>
            <Tag text={party.roles[0]} key={party.roles[0]} />
            <div className="whitespace-nowrap self-end">{party.roles.length > 1 ? '+ ' + (party.roles.length - 1) : ''}</div>
        </>
    );
};

const AdditionalInfo = ({ party }: { party: PartyInfo }) => {
    let infoString = '';

    if (party.fields) {
        if (party.fields.brokerDealer?.value) {
            infoString += party.fields.brokerDealer.value;
            //if both are true, seperate with a dot
            if (party.fields.ssn?.value) {
                infoString += ' &#183; ';
            }
        }
        if (party.fields.ssn?.value) {
            infoString += party.fields.ssn.label + ': ' + party.fields.ssn.value;
        }
    }

    return <PiiWrapper className={'body-sm text-[#676767]'}>{infoString}</PiiWrapper>;
};

const PartyInformation = ({ party, ...rest }: { party: PartyInfo } & HTMLAttributes<HTMLLIElement>) => {
    if (!party) {
        return null;
    }

    return (
        <li className="flex gap-md rounded bg-white border-2 border-[#ededed] p-4 mb-2" {...rest}>
            <Icon className="flex-shrink min-w-[24px]" type={IconType.CIRCLE_USER} />
            <div className="flex-grow">
                <div className="flex gap-md">
                    <Typography variant={TypographyVariant.BodySmBold}>
                        <PiiWrapper>{party.fullName}</PiiWrapper>
                    </Typography>
                    <RoleTags party={party} />
                </div>
                <AdditionalInfo party={party} />
            </div>
            {
                // This functionaility will be added in future ticket
                //<Icon className="self-center min-w-[24px]" type={IconType.CHEVRON_RIGHT} />
            }
        </li>
    );
};

export const Parties = ({
    parties,
    caseStatus,
    showTitle = true,
    ...rest
}: { parties: PartiesProps | undefined; caseStatus: string; showTitle?: boolean } & HTMLAttributes<HTMLDivElement>) => {
    const { t } = useTranslation();
    const { owners = [], agents = [], brokers } = parties ?? {};

    const noParties = !owners.length && !agents.length && !brokers?.length;

    return (
        <div className="flex w-full flex-col" {...rest}>
            {!!showTitle && (
                <Title className="mb-2" variant={TitleVariant.SubTitle}>
                    {t('caseOverview.sidenav.people')}
                </Title>
            )}
            {!!owners.length && (
                <ul className="flex w-full flex-col">
                    {owners.map(owner => (
                        <PartyInformation party={owner} key={owner.fullName} />
                    ))}
                </ul>
            )}
            {!!agents.length && (
                <ul className="flex w-full flex-col">
                    {agents.map(agent => (
                        <PartyInformation party={agent} key={agent.fullName} />
                    ))}
                </ul>
            )}
            {!!brokers?.length && (
                <ul className="flex w-full flex-col">
                    {brokers.map(broker => (
                        <PartyInformation party={broker} key={broker.fullName} />
                    ))}
                </ul>
            )}
            {noParties && <NoParties caseStatus={caseStatus} className="gap-md" />}
        </div>
    );
};
