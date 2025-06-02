import { Email } from '@zinnia/api-types/types/sor';

import { sortEmailsByType } from '@deps/containers/people-data-cards/email-card/email-card.helpers';

import { BasePartyItems } from './BasePartyItems';

export class Emails extends BasePartyItems<Email> {
    public emailById: Record<string, Email>;
    constructor(emails: Email[] = []) {
        super(emails);
        this.emailById = this.historicalList.reduce((acc, email) => {
            if (email.emailId) {
                acc[email.emailId] = email;
            }
            return acc;
        }, {} as Record<string, Email>);
    }

    public get bestAvailable(): Email | undefined {
        return sortEmailsByType({ emails: this.currentList })?.[0];
    }

    public getById(id: string): Email | undefined {
        return this.emailById[id];
    }

    public get preferred(): Email | undefined {
        // BPB - TODO: get preferred Email logic
        return this.bestAvailable;
    }
}
