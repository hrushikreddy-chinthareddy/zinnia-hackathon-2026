import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import getMassMutualReg60Config from './mass-mutual-reg60-form-helper';

describe.only('#REG60 Mass Mutual form config', () => {
    const t: TFunction = (key: string | string[]) => key as unknown as TFunctionDetailedResult<string>;
    const mmReg60Config = getMassMutualReg60Config(t);

    describe('#Config existence', () => {
        it('should return an object with the correct configuration options', () => {
            expect(mmReg60Config.formValidation).toBeDefined();
            expect(mmReg60Config.disclosureAuthorizationConfig).toBeDefined();
            expect(mmReg60Config.ownerInformationConfig).toBeDefined();
            expect(mmReg60Config.agentInformtaionConfig).toBeDefined();
            expect(mmReg60Config.disclosureConfig).toBeDefined();
        });
    });
});
