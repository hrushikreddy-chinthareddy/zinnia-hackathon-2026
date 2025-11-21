import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';

import { IssuanceRequest } from '@deps/pages/api/test-harness/create-policy';
import { IssuanceType, PolicyState } from '@deps/utils/test-harness/types';
import { LineOfBusiness, PaymentForm } from '@zinnia/api-types/types/bpm';

/**
 *
 * @returns a random policy number
 */
export const generateRandomPolNumber = () =>
    Math.floor(10000000 + Math.random() * 90000000).toString();

/**
 *
 * This returns the file name for the XML based on the policy type
 * If the names change, THIS function should change too
 */
export const getPolicyFilePath = (type: IssuanceType) => {
    switch (type) {
        case IssuanceType.EVGL_MYGA_3:
            return 'evgl-myga-3-year.xml';
        case IssuanceType.EVGL_MYGA_5:
            return 'evgl-myga-5-year.xml';
        case IssuanceType.EVGL_MYGA_7:
            return 'evgl-myga-7-year.xml';
        case IssuanceType.UL:
            return 'everglades-ul.xml';
        case IssuanceType.IUL:
            return 'everglades-iul.xml';
        case IssuanceType.FARMERS_IUL:
            return 'farmers-iul.xml';
        case IssuanceType.FARMERS_TERM:
            return 'farmers-term.xml';
        case IssuanceType.FARMERS_ROP:
            return 'farmers-rop.xml';
    }
};

/**
 *
 * Based on the policy state, we generate different dates to replace in the XML
 * We always want the issue date to be AT LEAST 2 days
 */
export const generateIssueDate = (policyState?: PolicyState) => {
    const today = dayjs();
    switch (policyState) {
        case PolicyState.PENDING_ISSUED:
            return today.subtract(7, 'days').format('YYYY-MM-DD');
        case PolicyState.ACTIVE_FREELOOK:
            return today.subtract(15, 'days').format('YYYY-MM-DD');
        case PolicyState.ACTIVE:
            return today.subtract(65, 'days').format('YYYY-MM-DD');
        default:
            return today.subtract(7, 'days').format('YYYY-MM-DD');
    }
};

/**
 *
 * Takes in the xml content and the request body that contains the fields to change.
 * Spits out the updated XML
 */
export const updatePolicyXmlContent = (
    xmlContent: string,
    req: IssuanceRequest,
    policyNumber: string,
    issueDate: string
): string => {
    let updatedXmlContent = replaceXmlContent(xmlContent, req);
    updatedXmlContent = replacePolNumber(updatedXmlContent, policyNumber);
    return replaceMultipleDates(updatedXmlContent, issueDate);
};

/**
 *
 * Grabs some specific fields out of the altered XML. We use this to build a link to the policy page when creation finishes.
 */
export const extractResponseFields = (xmlContent: string) => {
    return {
        policyNumberField: extractFieldFromXml(xmlContent, 'PolNumber')?.[0],
        lineOfBusinessField: extractNestedFieldFromXml(
            xmlContent,
            'Policy',
            'LineOfBusiness'
        )?.[0],
        productCodeField: extractFieldFromXml(xmlContent, 'ProductCode')?.[0],
    };
};

/**
 *
 * The different XML values have some different tags that we alter to change name, email address, etc.
 * This function returns the correct regex for the tag that we want to change based on the policy type
 */
export const getPartyTagRegex = (type?: IssuanceType) => {
    switch (type) {
        case IssuanceType.EVGL_MYGA_3:
        case IssuanceType.EVGL_MYGA_5:
        case IssuanceType.EVGL_MYGA_7:
        case IssuanceType.FARMERS_IUL:
        case IssuanceType.FARMERS_TERM:
        case IssuanceType.FARMERS_ROP:
            return /<Party id="Party_PO_Owner_1">([\s\S]*?)<\/Party>/;
        case IssuanceType.UL:
        case IssuanceType.IUL:
            return /<Party id="Party_PI_1">([\s\S]*?)<\/Party>/;

        default:
            return /<Party id="Party_PO_Owner_1">([\s\S]*?)<\/Party>/;
    }
};

/**
 *
 * Extracts a specific field from the XML
 */
export const extractFieldFromXml = (xmlContent: string, tagName: string) => {
    const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'g');
    const matches = xmlContent.match(regex);
    return matches?.map((match) =>
        match.replace(new RegExp(`</?${tagName}>`, 'g'), '')
    );
};

/**
 *
 * This is a more complex version of `extractFieldFromXML` that takes into account nested tags.
 * For example, the `LineOfBusiness` tag is nested inside of the `Policy` tag
 * <Policy>
 *    <LineOfBusiness>LIFE</LineOfBusiness>
 * </Policy>
 */
export const extractNestedFieldFromXml = (
    xmlContent: string,
    parentTagName: string,
    nestedTagName: string
) => {
    const parentRegex = new RegExp(
        `<${parentTagName}[^>]*?>([\\s\\S]*?)</${parentTagName}>`,
        'g'
    );
    const parentMatches = xmlContent.match(parentRegex);

    if (!parentMatches) return null;

    return parentMatches
        .map((parentMatch) => {
            const nestedRegex = new RegExp(
                `<${nestedTagName}[^>]*?>([\\s\\S]*?)</${nestedTagName}>`,
                'g'
            );
            const nestedMatch = parentMatch.match(nestedRegex);

            if (nestedMatch) {
                return nestedMatch.map((nm) =>
                    nm.replace(
                        new RegExp(
                            `<${nestedTagName}[^>]*?>|</${nestedTagName}>`,
                            'g'
                        ),
                        ''
                    )
                );
            }

            return null;
        })
        .flat()
        .filter((match) => match !== null);
};

/**
 *
 * Loops over the policy XML content and replaces specific fields including:
 * - GovtID
 * - FirstName
 * - LastName
 * - PhoneNumber
 * - Email
 */
export const replaceXmlContent = (
    xmlContent: string,
    data: IssuanceRequest
) => {
    const ownerRegex = getPartyTagRegex(data.body.type);
    const ownerBlockMatch = xmlContent.match(ownerRegex);
    const agentBlockMatch = xmlContent.match(
        /<Party id="Party_Agent_1">([\s\S]*?)<\/Party>/
    );
    const areaCode = data.body.phoneNumber?.substring(0, 3);
    const dialNumber = data.body.phoneNumber?.substring(3);

    replacePolNumber(xmlContent, data.body.policyNumber);

    // Helper function to replace content within a tag in a block
    const replaceTagContent = (
        block: string,
        tag: string,
        replacement?: string
    ) => {
        if (replacement) {
            const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'g');
            return block.replace(regex, (match, p1) =>
                match.replace(p1, replacement)
            );
        }
        return block;
    };

    // Replace content in partyBlock if found
    if (ownerBlockMatch) {
        let partyBlock = ownerBlockMatch[1];

        partyBlock = replaceTagContent(partyBlock, 'GovtID', data.body.govtId);
        partyBlock = replaceTagContent(
            partyBlock,
            'FirstName',
            data.body.firstName
        );
        partyBlock = replaceTagContent(
            partyBlock,
            'LastName',
            data.body.lastName
        );
        partyBlock = replaceTagContent(
            partyBlock,
            'FullName',
            `${data.body.firstName} ${data.body.lastName}`
        );
        partyBlock = replaceTagContent(
            partyBlock,
            'DialNumber',
            data.body.phoneNumber
        );
        partyBlock = replaceTagContent(partyBlock, 'AddrLine', data.body.email);
        partyBlock = replaceTagContent(partyBlock, 'AreaCode', areaCode);
        partyBlock = replaceTagContent(partyBlock, 'DialNumber', dialNumber);

        xmlContent = xmlContent.replace(ownerBlockMatch[1], partyBlock);
    }

    // Replace content in agentBlock if found
    if (agentBlockMatch) {
        let agentBlock = agentBlockMatch[1];

        agentBlock = replaceTagContent(
            agentBlock,
            'FirstName',
            data.body.agentFirstName
        );
        agentBlock = replaceTagContent(
            agentBlock,
            'LastName',
            data.body.agentLastName
        );
        agentBlock = replaceTagContent(
            agentBlock,
            'ProducerKey',
            data.body.agentProducerKey
        );
        agentBlock = replaceTagContent(
            agentBlock,
            'LicenseNum',
            data.body.agentLicenseNumber
        );
        agentBlock = replaceTagContent(
            agentBlock,
            'CompanyProducerID',
            data.body.agentCompanyProducerID
        );

        xmlContent = xmlContent.replace(agentBlockMatch[1], agentBlock);
    }

    return xmlContent;
};

/**
 *
 * Replaces the policy number in the XML content.
 */
export const replacePolNumber = (
    xmlContent: string,
    finalPolicyNumber: string
) => {
    //get the policy field
    const policyNumberRegex = /<PolNumber>.*?<\/PolNumber>/g;

    if (!policyNumberRegex.test(xmlContent)) {
        throw new Error('Policy number tag not found in the XML content.');
    }

    return xmlContent.replace(
        policyNumberRegex,
        `<PolNumber>${finalPolicyNumber}</PolNumber>`
    );
};

/**
 *
 * We use this to change multiple dates in the XML based on the PolicyState someone wants to have
 * PolicyState can be PENDING_ISSUED, ACTIVE, ACTIVE_FREELOOK
 */
export const replaceMultipleDates = (xmlContent: string, date: string) => {
    const tags = [
        'TransExeDate',
        'InitDepositDate',
        'SignedDate',
        'ApplicationCollectionDate',
        'SignatureDate',
        'ApplicationIGODate',
        'StartDate',
        'EffDate',
    ];

    tags.forEach((tag) => {
        const regex = new RegExp(`<${tag}>.*?<\\/${tag}>`, 'g');
        xmlContent = xmlContent.replace(regex, `<${tag}>${date}</${tag}>`);
    });

    return xmlContent;
};

/**
 *
 * Create the payload to generate the initial premium
 */
export const generateInitialPremiumRequest = (
    policyNumber: string,
    lineOfBusiness: string,
    policyState: PolicyState
) => {
    const issueDate = generateIssueDate(policyState);
    const effectiveDate = dayjs(issueDate).add(1, 'day').format('YYYY-MM-DD');

    return {
        correlationId: uuidV4(),
        effectiveDate: effectiveDate,
        payor: {
            partyId: 'Exchanged_Party_Carrier_1',
            paymentForm: PaymentForm.EXCHANGE,
            bankId: undefined,
        },
        reverseInitiator: false,
        transactionAmounts: {
            requestedAmount: 250000,
        },
        exchange: {
            policyNumber,
            lineOfBusiness:
                lineOfBusiness === 'Annuity'
                    ? LineOfBusiness.ANNUITY
                    : LineOfBusiness.LIFE,
            exchangeDescription: 'EXTERNAL1035',
            exchangeDate: effectiveDate,
            exchangeAmount: 250000,
            qualificationType: 'INDIVIDUALRETIREMENTACCOUNTREGULAR',
            costBasis: 0,
            modifiedEndowmentContractStatus: null,
            outstandingLoanRolloverAmount: null,
        },
        taxBasis: null,
        fundAllocation: {
            allocationOption: 'DEFAULT',
        },
    };
};
