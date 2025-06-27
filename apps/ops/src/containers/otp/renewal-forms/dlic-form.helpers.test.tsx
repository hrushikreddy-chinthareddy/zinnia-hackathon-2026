import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { OwnerInformation } from '@deps/models/case/task';

import getDlicConfig from './dlic-form.helpers';

describe('#DLIC renewal form config', () => {
    const t: TFunction = (key: string | string[]) =>
        key as unknown as TFunctionDetailedResult<string>;

    const dlicConfig = getDlicConfig(t);
    describe('Config existence', () => {
        it('should return an object with the correct configuration options', () => {
            expect(dlicConfig.formPartyConfigs).toBeDefined();
            expect(dlicConfig.periodRadioItems).toBeDefined();
            expect(dlicConfig.signatureConfigs).toBeDefined();
            expect(dlicConfig.formValidation).toBeDefined();
            expect(dlicConfig.transList).toBeDefined();
        });
    });

    describe('formValidation', () => {
        const { formValidation } = dlicConfig;
        const ownerInformation: OwnerInformation[] = [
            {
                firstName: '',
                middleName: '',
                lastName: 'Test_01_Trust',
                fullName: ' Test_01_Trust',
                type: 'Primary',
                signature: {
                    title: 'Trust',
                    signaturePresent: 'Yes',
                    type: 'Primary',
                    isValidDate: true,
                    signDate: '2024-02-20',
                    name: ' Test_01_Trust',
                },
            },
        ];

        const subsequentTargetFunds = [
            {
                fundName: '7 Year Guarantee Period',
                value: '100',
            },
        ];

        it('should provide no errors for a valid form', () => {
            expect(
                formValidation({ ownerInformation, subsequentTargetFunds })
            ).toEqual({});
        });
    });
});
