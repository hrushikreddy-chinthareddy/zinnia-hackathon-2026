import { useQuery } from '@tanstack/react-query';
import { Icon, IconType, Link } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { calculateAgeNumber } from '@deps/helpers/age.helpers';
import {
    buildFullName,
    convertKebabedDateString,
} from '@deps/helpers/string.helpers';
import { SortOrder } from '@deps/hooks/dashboard/useTableOptions';
import { getCaseSearchQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import { getPoliciesQuery } from '@deps/queries/tanstack/policyQueries/policyQueries';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    Address,
    ContactSearchResponse,
    PersonalInfo,
} from '@zinnia/api-types/types/contact-management';

import CaseCard from './case-card/CaseCard';
import styles from './ContactCard.module.css';
import PolicyCard from './policy-card/PolicyCard';
import { PolicySortBy } from '../policy-index/types';

function DateOfBirth({
    dateOfBirth,
}: {
    dateOfBirth: string | undefined | null;
}) {
    const { t } = useTranslation();

    if (!dateOfBirth) {
        return null;
    }

    const age = calculateAgeNumber(dateOfBirth);
    return (
        <span
            className={`${styles.contactInfoItem} typography-labels-field-label`}
        >
            <Icon
                type={IconType.CIRCLE_EXCLAMATION}
                className={styles.userIcon}
                height={16}
                width={16}
            />{' '}
            {t('contacts.age', { age })} (
            {convertKebabedDateString(dateOfBirth)})
        </span>
    );
}

function CityState({ address }: { address: Address | undefined }) {
    if (!address || (!address?.city && !address?.state)) {
        return null;
    }
    return (
        <span
            className={`${styles.contactInfoItem} typography-labels-field-label`}
        >
            <Icon
                type={IconType.CIRCLE_EXCLAMATION}
                className={styles.userIcon}
                height={16}
                width={16}
            />{' '}
            {address?.city}
            {address?.state && address?.city ? ', ' : ''}
            {address?.state}
        </span>
    );
}

function Phone({ phone }: { phone: string | undefined | null }) {
    if (!phone) {
        return null;
    }
    return (
        <span
            className={`${styles.contactInfoItem} typography-labels-field-label`}
        >
            <Icon
                type={IconType.PHONE}
                className={styles.userIcon}
                height={16}
                width={16}
            />
            {phone}
        </span>
    );
}

function Email({ email }: { email: string | undefined | null }) {
    if (!email) {
        return null;
    }
    return (
        <span
            className={`${styles.contactInfoItem} typography-labels-field-label`}
        >
            <Icon
                type={IconType.MAIL}
                className={styles.userIcon}
                height={16}
                width={16}
            />
            <Link href={`mailto:${email}`} text={email} size="small" />
        </span>
    );
}

export default function ContactCard({
    contact,
    ...rest
}: { contact: ContactSearchResponse } & React.HTMLAttributes<HTMLDivElement>) {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const { personalInfo = {} as PersonalInfo } = contact;
    const {
        data: policies,
        isLoading: isLoadingPolicies,
        isError: isErrorPolicies,
    } = useQuery({
        queryKey: ['partyPolicies', contact.partyId],
        queryFn: () =>
            getPoliciesQuery(
                { partyIds: [contact.partyId] },
                5,
                0,
                SortOrder.DESC,
                PolicySortBy.LAST_UPDATED
            ),
    });

    // ToDo - BPB: replace with the correct case filters, including searching by partyId instead of ownerFirstName and ownerLastName
    // Work with Nick Lourme to identify exactly which cases should be displayed
    // Suggest process=New+Business&caseStatus=EXCEPTION&caseStatus=IN_PROGRESS&caseStatus=NOT_STARTED
    const {
        data: cases,
        isLoading: isLoadingCases,
        isError: isErrorCases,
    } = useQuery({
        queryKey: [
            'partyCases',
            contact.partyId,
            personalInfo.firstName,
            personalInfo.lastName,
        ],
        queryFn: () =>
            getCaseSearchQuery({
                ownerFirstName: personalInfo.firstName,
                ownerLastName: personalInfo.lastName,
                limit: 5,
                offset: 0,
            }),
    });

    const hasCases = !!cases?.data?.length;
    const hasPolicies = !!policies?.results?.length;

    const nothingToShow =
        !isLoadingCases &&
        !isLoadingPolicies &&
        !isErrorCases &&
        !isErrorPolicies &&
        !cases?.data?.length &&
        !policies?.results?.length;

    return (
        <div {...rest} className={styles.contactContainer}>
            <div className={styles.topBar}>
                <div className={styles.contactInfo}>
                    <div className="typography-titles-subtitle">
                        {buildFullName(
                            personalInfo.firstName,
                            undefined,
                            personalInfo.lastName
                        )}
                    </div>
                    <div className={styles.contactTypes}>
                        <DateOfBirth dateOfBirth={personalInfo.dateOfBirth} />
                        <CityState address={contact.address} />
                        <Phone phone={personalInfo.phoneNumber} />
                        <Email email={personalInfo.email} />
                    </div>
                </div>
                <div className={styles.quickActions}></div>
            </div>
            <div className={styles.productInfo}>
                {hasCases && (
                    <ul className={styles.cases}>
                        {cases?.data?.map((caseDetails) => (
                            <CaseCard
                                caseDetails={caseDetails}
                                key={caseDetails.id}
                            />
                        ))}
                    </ul>
                )}
                {hasPolicies && (
                    <ul className={styles.inForce}>
                        {policies?.results?.map((policy) => (
                            <PolicyCard policy={policy} key={policy.id} />
                        ))}
                    </ul>
                )}
                {nothingToShow && (
                    <div className={styles.nothingToShow}>
                        <span className="typography-labels-label-lg-alt">
                            {t('contacts.nothingToShow')}
                        </span>
                        <div className={styles.ctaLinks}>
                            {!featureFlags?.[
                                FEATURE_FLAGS.MARKET_CONNECT_PRODUCT_MATCHER
                            ] && (
                                <div className={styles.cta}>
                                    <Icon
                                        type={IconType.SPARKLES}
                                        height={16}
                                        width={16}
                                        className={styles.icon}
                                    />
                                    <span>{t('contacts.getMatched')}</span>
                                </div>
                            )}
                            {!featureFlags?.[
                                FEATURE_FLAGS.MARKET_CONNECT_QUICK_QUOTE
                            ] && (
                                <div className={styles.cta}>
                                    <Icon
                                        type={IconType.SHIELD_MAGNIFY}
                                        height={16}
                                        width={16}
                                        className={styles.icon}
                                    />
                                    <span>{t('contacts.startQuote')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
