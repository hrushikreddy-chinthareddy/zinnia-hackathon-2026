import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { Fragment } from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import PopoverOnTruncate from '@deps/components/popover-on-truncate/popover-on-truncate';
import { TranslationFiles } from '@deps/config/translations';
import AddressCard from '@deps/containers/people-data-cards/address-card/address-card';
import EmailCard from '@deps/containers/people-data-cards/email-card/email-card';
import PhoneCard from '@deps/containers/people-data-cards/phone-card/phone-card';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Phone } from '@deps/models/policy/sor-policy';
import { Email } from '@deps/models/policy/sor-policy';
import { Policy, PartyRole, Address } from '@deps/models/policy/sor-policy';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { SPLITTER } from '@deps/types/constants';

// Lazy Loaded Components
const Popover = dynamic(() => import('@deps/components/popover/popover'));
const Highlighter = dynamic(() => import('@deps/components/highlighter/highlighter'));

interface DescriptionListProps {
    label: string;
    ariaLabel?: string;
    text: string | Address | Email | Phone;
    tooltip?: string;
    tooltipPlacement?: PopoverPlacement;
    identifier?: string;
    [key: string]: any;
    highlights?: string[];
    labelClassName?: string;
    valueClassName?: string;
    classNames?: string;
    truncate?: boolean;
    policy?: Policy;
}

enum EditableFieldLabel {
    Phone = 'Primary phone',
    Email = 'Email',
    Address = 'Mailing address',
}

const renderText = (text: string) => {
    if (!text) return text;

    const hasSplitter = text.toString().indexOf(SPLITTER) > -1;

    if (hasSplitter) {
        const textArray = text.split(SPLITTER);
        return textArray.map(t => (
            <Fragment key={'description-list-' + t}>
                {t}
                <br />
            </Fragment>
        ));
    }

    return text;
};

const DescriptionList = ({
    label,
    ariaLabel,
    text,
    tooltip,
    tooltipPlacement = PopoverPlacement.TopRight,
    identifier,
    highlights = [],
    labelClassName = '',
    valueClassName = '',
    classNames = '',
    margin = 'my-2.5',
    truncate = false,
    policy,
    ...props
}: DescriptionListProps) => {
    const { t } = useTranslation([TranslationFiles.COLDEFS]);
    const isStringText = typeof text === 'string';

    const ddId = 'description-list-' + label.split(' ').join('-') + `${identifier ? '-' + identifier : ''}`;
    const renderedText = isStringText ? (
        highlights ? (
            <Highlighter text={text} highlights={highlights} renderTextFunction={renderText} />
        ) : (
            renderText(text)
        )
    ) : (
        ''
    );
    const popoverClasses = clsx('line-clamp-1 break-all font-secondary text-md', valueClassName);
    const defaultClasses = clsx('content-body-sm', valueClassName);
    let textContent = isStringText ? (
        truncate ? (
            <PopoverOnTruncate title={text}>
                <span className={popoverClasses} aria-hidden="true">
                    {renderedText}
                </span>
            </PopoverOnTruncate>
        ) : (
            <span className={defaultClasses} aria-hidden="true">
                {renderedText}
            </span>
        )
    ) : null;

    const { parties, partyRoles = [] } = policy ?? {};
    const owner = partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER);

    const policyParty = parties?.find(party => party.partyId === owner?.partyId);
    // TODO MG: this should not be hardcoded
    const policyPartyArr = partyRoles?.filter(pr => pr.partyId === 'Party_PI_1') || [];
    const policyNumber = policy?.policyNumber;

    if (label === EditableFieldLabel.Phone && policyParty && policyNumber) {
        textContent = (
            <PhoneCard
                editable={true}
                infoOnly={true}
                party={{ ...policyParty, phones: [text as Phone] }}
                partyRoles={policyPartyArr}
                policyNumber={policyNumber}
            />
        );
    }

    if (label === EditableFieldLabel.Email && policyParty && policyNumber) {
        textContent = <EmailCard editable={true} infoOnly={true} party={policyParty} partyRoles={partyRoles} policyNumber={policyNumber} />;
    }

    if (label === EditableFieldLabel.Address && policyParty && policyNumber) {
        textContent = (
            <AddressCard
                editable={true}
                infoOnly={true}
                party={{ ...policyParty, addresses: [text as Address] }}
                partyRoles={policyPartyArr}
                policyNumber={policyNumber}
            />
        );
    }

    if (label === 'Upcoming monthly premium') {
        const textSections = (isStringText ? text : '').split(',');
        const amountAndDate = `${numberFormatify(textSections[0])} - ${textSections[1]}`;

        const formattedAccountType = textSections[3].charAt(0).toUpperCase() + textSections[3].slice(1).toLowerCase();

        if (textSections[2] === 'empty') {
            textContent = (
                <>
                    <span className={popoverClasses} aria-hidden="true">
                        {t('policySummary.upcomingMonthlyPremiumNoPayment')}
                    </span>
                    <span className={popoverClasses} aria-hidden="true">
                        {amountAndDate}
                    </span>
                    <NavElement size={NavElementSize.Small} type={NavElementType.Link} href={`/policies/${textSections[4]}/premiums`}>
                        {t('policySummary.makePayment')}
                    </NavElement>
                </>
            );
        } else {
            textContent = (
                <>
                    <span className={popoverClasses} aria-hidden="true">
                        {amountAndDate}
                    </span>
                    <span className={popoverClasses} aria-hidden="true">
                        <NavElement
                            size={NavElementSize.Small}
                            type={NavElementType.Link}
                            href={`/policies/${textSections[4]}/transactions/premiums`}
                        >
                            {formattedAccountType + t('policySummary.endingIn') + textSections[2]}
                        </NavElement>
                    </span>
                </>
            );
        }
    }

    return (
        <dl {...props} className={`box-border flex w-[197px] min-w-[100px] flex-col ${classNames} ${margin}`}>
            <dt className="mb-0 ml-0">
                <div className="flex items-center gap-2">
                    {label !== 'Primary phone' && label !== 'Email' && label !== 'Mailing address' && (
                        <label className={`${labelClassName} field-label`} aria-label={ariaLabel ? ariaLabel : label}>
                            {label}
                        </label>
                    )}
                    {tooltip && (
                        <Popover title={label} body={tooltip} placement={tooltipPlacement}>
                            <CircleInfoIcon height={16} width={16} className="text-primary" />
                        </Popover>
                    )}
                </div>
            </dt>
            <dd id={ddId} className="mb-0 ml-0 break-words">
                {textContent}
            </dd>
        </dl>
    );
};

export default DescriptionList;
