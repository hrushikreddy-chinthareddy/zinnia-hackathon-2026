import { Email, EmailType } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { SortEmailsByType } from '@deps/containers/people-data-cards/email-card/email-card.helpers';
import { isEndDated } from '@deps/helpers/date.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface GetEmailTypes {
    t: TFunction;
}

export const getEmailTypes = ({ t }: GetEmailTypes) => [
    {
        label: t('labels.emailOptions.personal') as string,
        value: EmailType.PERSONAL,
    },
    {
        label: t('labels.emailOptions.business') as string,
        value: EmailType.BUSINESS,
    },
    { label: t('labels.emailOptions.other') as string, value: EmailType.OTHER },
];

export const INITIAL_EMAIL: Email = {
    emailType: EmailType.PERSONAL,
    startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
};

export const getPersonalEmails = ({ emails }: SortEmailsByType): Email[] => {
    if (!emails) return [];

    const validEmails =
        emails?.filter((email) => !isEndDated(email.endDate)) ?? [];

    const personalEmails: Email[] = [];

    validEmails.forEach((validEmail) => {
        switch (validEmail.emailType) {
            case EmailType.PERSONAL:
                personalEmails.push(validEmail);
                break;
        }
    });

    return [...personalEmails];
};
