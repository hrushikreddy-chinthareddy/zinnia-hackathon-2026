import { BasePolicyBanding, IdentificationType, Policy, PolicyFeatureFeatureType, ProofOfDeathReceived } from "@deps/models/policy/sor-policy";

export const mockPolicy: Policy = {
    effectiveDate: "2024-08-16",
    coverage: {
        totalCoverageAmount: 50000,
        cumulativeGrossDeathBenefitAmount: 50000,
        netDeathBenefit: 50000,
        remainingDeathBenefitAmount: undefined,
        minimumCoverageAmount: 10000,
        maximumCoverageAmount: 2000000,
        coverageChangeEffectiveDate: "2025-06-01",
        coverageBand: "BAND1",
        maximumAnnualCoverageChangeAllowedPerPolicy: 1,
        minimumCoverageDecreaseAmount: 10000,
        maximumCoverageDecreaseAmount: 40000,
        maximumAgeNumberCoverageAmountDecrease: 121,
        coverageAmountDecreaseAllowed: 1,
        minimumCoverageIncreaseAmount: 0,
        maximumCoverageIncreaseAmount: 0,
        maximumAgeNumberCoverageAmountIncrease: 0,
        coverageAmountIncreaseAllowed: 0,
        coverageLayers: [
            {
                coverageParticipants: [
                    {
                        flatExtra: [
                            {
                                flatExtraDuration: 0,
                                flatExtraAmount: 0,
                            }
                        ],
                        partyId: "Party_PI_1",
                        issueAge: 50,
                        riskClass: "STANDARDNONTOBACCO",
                        substandardRating: "NONETABLE"
                    }
                ],
                coverageId: "Base_Coverage",
                coverageType: "BASE",
                coverageName: "Base_Coverage",
                productCode: "ELIULV01",
                currentAmount: 50000,
                originalCoverageAmount: 50000,
                minimumCoverageAmount: 10000,
                maximumCoverageAmount: 2000000,
                grossDeathBenefitAmount: 50000,
                lowDeathBenefitAmount: 50000,
                coverageEffectiveDate: "2024-06-01",
                unitOfCoverage: 50,
                valuePerUnitOfCoverage: 1000,
                guidelineSinglePremium: 17761.45,
                guidelineLevelPremium: 1236.34,
                sevenPayPremium: 3792.44
            }
        ]
    },
    riders: [
        {
            type: "RIDER",
            riderName: "Children's Term Insurance Rider",
            riderElected: "ELECTED",
            riderCode: "ELICTR",
            effectiveDate: "2024-06-01",
            terminationDate: "2096-06-01",
            status: "ACTIVE",
            coverageId: "Rider_CTR",
            amount: 5000,
            riderParticipant: [
                {
                    insuredId: "Party_CI_Coverage_Ins_1",
                    insuredAgeAtIssue: 4
                }
            ],
            charge: {
            },
            qualifiedAdditionalBenefit: true
        },
        {
            type: "RIDER",
            riderName: "Overloan Safeguard Benefit Rider",
            riderElected: "ELECTED",
            riderCode: "ELIOSBR",
            effectiveDate: "2024-06-01",
            terminationDate: "2096-06-01",
            status: "ACTIVE",
            coverageId: "Rider_OPR",
            riderParticipant: [
                {
                    insuredId: "Party_PI_1",
                    insuredAgeAtIssue: 50
                }
            ],
            charge: {
            },
            qualifiedAdditionalBenefit: false
        },
        {
            type: "RIDER",
            riderName: "Chronic Illness Accelerated Death Benefit Rider",
            riderElected: "ELECTED",
            riderCode: "ELIABRCHR",
            effectiveDate: "2024-06-01",
            terminationDate: "2096-06-01",
            status: "ACTIVE",
            coverageId: "Rider_ABRCHR",
            riderParticipant: [
                {
                    insuredId: "Party_PI_1",
                    insuredAgeAtIssue: 50
                }
            ],
            charge: {
            },
            maximumChronicIllnessBenefitPercentage: 50,
            maximumPeriodicPaymentPeriod: 120,
            qualifiedAdditionalBenefit: false
        },
        {
            type: "RIDER",
            riderName: "Critical Illness Accelerated Death Benefit Rider",
            riderElected: "ELECTED",
            riderCode: "ELIABRCRI",
            effectiveDate: "2024-06-01",
            terminationDate: "2096-06-01",
            status: "ACTIVE",
            coverageId: "Rider_ABRCRI",
            riderParticipant: [
                {
                    insuredId: "Party_PI_1",
                    insuredAgeAtIssue: 50
                }
            ],
            charge: {
            },
            maximumCriticalIllnessBenefitPercentage: 50,
            tierOneMaximumCriticalIllnessBenefitPercentage: 5,
            tierOneMaximumCriticalIllnessBenefitAmount: 5000,
            tierTwoMaximumCriticalIllnessBenefitPercentage: 50,
            tierTwoMaximumCriticalIllnessBenefitAmount: 500000,
            qualifiedAdditionalBenefit: false
        },
        {
            type: "RIDER",
            riderName: "Terminal Illness Accelerated Death Benefit Rider",
            riderElected: "ELECTED",
            riderCode: "ELIABRTRM",
            effectiveDate: "2024-06-01",
            terminationDate: "2096-06-01",
            status: "ACTIVE",
            coverageId: "Rider_ABRTRM",
            riderParticipant: [
                {
                    insuredId: "Party_PI_1",
                    insuredAgeAtIssue: 50
                }
            ],
            charge: {
            },
            qualifiedAdditionalBenefit: false
        }
    ],
    systematicPrograms: [
        {
            arrangementType: "PAYMENT",
            arrangementId: "Arr_1",
            allocationOptionType: "DEFAULT",
            reason: "PREMIUM",
            status: "ACTIVE",
            paymentForm: "ACH",
            frequency: "MONTHLY",
            requestedDate: "2024-06-01",
            startDate: "2024-07-01",
            endDate: "2044-07-01",
            previousProgramDate: "2025-06-01",
            nextProgramDate: "2024-09-01",
            amountType: "AMOUNT",
            amount: 111,
            party: [
                {
                    partyRole: "PAYOR",
                    partyId: "Party_PI_1",
                    percentage: 100,
                    bankId: "Bank_1"
                }
            ]
        }
    ],
    policyFeatures: [
        {
            featureType: "FREELOOK" as PolicyFeatureFeatureType,
            endDate: "2024-07-01",
            period: 30,
        },
        {
            featureType: "LAPSEASSESSMENT" as PolicyFeatureFeatureType,
            totalRequiredAmount: 0,
            totalMinimumRequiredAmount: 0,
        },
        {
            featureType: "LAPSEPROTECTION" as PolicyFeatureFeatureType,
        },
        {
            featureType: "REINSTATEMENT" as PolicyFeatureFeatureType,
            period: 0,
            underwritingDecision: true,
        }
    ],
    allocation: {
        investmentType: "INVESTMENTFUND",
        fundAllocationsInvestments: [
            {
                fundId: "ELF001",
                fundName: "Everly Fixed IUL Fund",
                fundAccountType: "FIXED",
                allocationPercentage: 50,
                startDate: "2024-06-01",
            },
            {
                fundId: "ELI002",
                fundName: "S AND P 500® Price Return Annual Point-to-Point with Cap Account",
                fundAccountType: "INDEXED",
                allocationPercentage: 25,
                startDate: "2024-06-01",
            },
            {
                fundId: "ELI003",
                fundName: "S AND P 500® Price Return Annual Point-to-Point with Participation Rate Account",
                fundAccountType: "INDEXED",
                allocationPercentage: 25,
                startDate: "2024-06-01",
            }
        ],
        funds: [
            {
                fundAccountType: "INDEXED",
                fundId: "ELI002",
                fundName: "S&P 500® Price Return Annual Point-to-Point with Participation Rate Account",
                generalLedgerFundCode: "XE2",
                totalFundValue: 63.72,
                fundSegments: [
                    {
                        segmentId: "3",
                        fundId: "ELI002",
                        originalDepositAmount: 21.25,
                        originalDepositDate: "2024-08-15",
                        depositDate: "2024-08-15",
                        depositAmount: 21.25,
                        currentAmount: 21.25,
                        renewalDate: "2025-08-15",
                        startDate: "2024-08-15",
                        interestEarningAmount: 21.25,
                        startingPrice: 2000,
                        startingPriceDate: "2024-08-15",
                        endingPrice: 2200,
                        endingPriceDate: "2025-08-15"
                    },
                    {
                        segmentId: "2",
                        fundId: "ELI002",
                        originalDepositAmount: 21.24,
                        originalDepositDate: "2024-07-15",
                        depositDate: "2024-07-15",
                        depositAmount: 21.24,
                        currentAmount: 21.24,
                        renewalDate: "2025-07-15",
                        startDate: "2024-07-15",
                        interestEarningAmount: 42.48,
                        startingPrice: 2000,
                        startingPriceDate: "2024-07-15",
                        endingPrice: 2200,
                        endingPriceDate: "2025-07-15"
                    },
                    {
                        segmentId: "1",
                        fundId: "ELI002",
                        originalDepositAmount: 21.24,
                        originalDepositDate: "2024-06-15",
                        depositDate: "2024-06-15",
                        depositAmount: 21.24,
                        currentAmount: 21.24,
                        renewalDate: "2025-06-15",
                        startDate: "2024-06-15",
                        interestEarningAmount: 63.71,
                        startingPrice: 2000,
                        startingPriceDate: "2024-06-15",
                        endingPrice: 2200,
                        endingPriceDate: "2025-06-15"
                    }
                ]
            },
            {
                fundAccountType: "FIXED",
                fundId: "ELF001",
                fundName: "Everly IUL Fixed Fund",
                generalLedgerFundCode: "000",
                totalFundValue: 128.03,
                fundSegments: [
                    {
                        segmentId: "1",
                        fundId: "ELF001",
                        originalDepositAmount: 42.47,
                        originalDepositDate: "2024-06-15",
                        depositDate: "2024-06-15",
                        depositAmount: 42.47,
                        currentAmount: 128.03,
                        renewalDate: "2025-06-01",
                        startDate: "2024-06-01",
                        interestEarningAmount: 128.01,
                        startingPrice: 5.4,
                        startingPriceDate: "2024-06-01",
                        endingPrice: 0,
                        endingPriceDate: "2025-06-01"
                    }
                ]
            },
            {
                fundAccountType: "FIXED",
                fundId: "ELH001",
                fundName: "Everly Holding IUL Fund",
                generalLedgerFundCode: "100",
                totalFundValue: 0,
                fundSegments: [
                    {
                        segmentId: "1",
                        fundId: "ELH001",
                        originalDepositAmount: 106.56,
                        originalDepositDate: "2024-06-01",
                        depositDate: "2025-06-01",
                        depositAmount: 0.07,
                        currentAmount: 0,
                        renewalDate: "2024-06-01",
                        startDate: "2024-06-01",
                        interestEarningAmount: 84.98,
                        startingPrice: 5.4,
                        startingPriceDate: "2024-06-01",
                        endingPrice: 0,
                        endingPriceDate: "2024-06-01"
                    }
                ]
            }
        ],
        matchSegment: {
        },
        loanSegments: []
    },
    id: "66c139ce75e2ca4a7ef70629",
    event: "InterestCredit",
    carrierId: "ELIC",
    policyReferenceId: "3a3ac660f49c49ed9b9f062dacd7faef",
    thirdPartyAdministratorId: "tpa-12345",
    product: {
        lineOfBusiness: "LIFE",
        planName: "Everly IUL TermVest+",
        productType: "INDEXEDUNIVERSALLIFE",
        marketingName: "Everly IUL TermVest+",
        distribution: "THIRDPARTYDIRECTTOCONSUMER",
        planCode: "ELIULV01",
        generalLedgerPlanCode: "IU201",
        holdingForm: "INDIVIDUAL",
        renewable: undefined,
        productVersion: "2024.01.01"
    },
    matchBonusVersion: "2021.10.15",
    banding: "NOPREMIUMBANDING" as BasePolicyBanding,
    qualificationType: "NONQUALIFIED",
    policyTerm: 20,
    policyYear: 1,
    monthOfYear: 3,
    policyNumber: "JKIUL000888",
    policyStatus: "ACTIVE",
    issueType: "FULLUNDERWRITING",
    issueState: "FL",
    currency: "USD",
    fixedCostPeriod: 20,
    policyDates: {
        policyStartDate: "2024-06-01",
        applicationDate: "2024-06-01",
        issueDate: "2024-06-01",
        contestabilityStartDate: "2024-06-01",
        contestabilityEndDate: "2026-05-31",
        previousPolicyAnniversaryDate: "2024-06-01",
        previousPolicyMonthiversaryDate: "2025-06-01",
        nextAnniversaryDate: "2025-06-01",
        maturityDate: "2096-06-01",
        initialPaymentExpiryDate: "2024-06-15",
        nextMonthiversaryDate: "2024-09-01",
    },
    costBasis: {
        costBasis: 333,
        costBasisDate: "2025-06-01"
    },
    accountValues: {
        beginningAccountValue: 212.99,
        endingAccountValue: 191.76,
        minimumRequiredAccountValue: 0,
        accountValueByPolicyYear: 0,
        unloanedPortionOfAccountValue: 191.76,
        loanedPortionOfAccountValue: 0,
        surrenderValue: 191.76,
        netAmountAtRisk: 49765.62,
        deemedAccountValue: 0,
        initialPremiumRequestAmount: 111,
        initialPremiumAppliedAmount: 106.56,
        initialPaymentAmountReceivedDate: "2024-06-01",
        cumulativePremiumSinceIssue: 333,
        totalYearToDatePremiumAmount: 333,
        modifiedEndowmentContractAuthorization: false,
        projectedLapseIndicator: false,
        policyGainAmount: 0,
        uncollectedCharges: 0,
        annualTargetPremium: 272.76,
        modalTargetPremium: 22.73,
    },
    loanValues: {
        totalLoanBalance: 0,
        totalLoanPrincipal: 0,
        loanPayoffAmount: 0,
        maximumLoanAmount: 0,
        minimumLoanAmount: 5000,
        totalLoanAccruedInterest: 0,
        totalNumberOfLoan: 0,
        loanInterestMethod: "ARREARS",
        totalYearToDateLoanTaken: 0,
        minimumLoanRepayment: 1
    },
    withdrawalValues: {
        totalWithdrawalAmount: 0,
        minimumWithdrawalAmount: 50,
        maximumWithdrawalAmount: 182.17,
        maximumWithdrawalRequestDuringVestingPeriod: 0,
        maximumWithdrawalRequestAfterVestingPeriod: 0,
        yearToDateNumberOfWithdrawal: 0,
        totalYearToDateWithdrawalTaken: 0,
        numberOfWithdrawal: 0,
        withdrawalAllowedStartDate: "2025-06-01"
    },
    testValues: {
        guidelinePremium: {
            guidelinePremiumTestDate: "2025-06-01",
            definitionOfLifeInsurance: "GPT",
            guidelineSinglePremium: 17761.45,
            guidelineLevelPremium: 1236.34,
            amountExcessToGuideline: 0,
            totalGuidelineLevelPremiumSinceIssue: 1236.34
        },
        modifiedEndowmentContract: {
            modifiedEndowmentContractTestDate: "2025-06-01",
            amountExcessToModifiedEndowmentContract: 0,
            modifiedEndowmentContractStatus: false,
            sevenPayTestBasis: 324.12,
            sevenPayPremium: 3792.44,
            sevenPayStartDate: "2024-06-01",
            sevenPayPeriod: "2031-05-31",
            sevenPayLimit: 3792.44,
            yearInPeriod: 1,
        }
    },
    timestamp: "2024-08-18T00:01:18.464Z",
    version: 105,
    deathBenefit: {
        deathBenefitOption: "LEVEL",
        deathBenefitOptionEffectiveDate: "2024-06-01",
        disputedDebtAmount: 0,
        proofOfDeathReceived: "No" as ProofOfDeathReceived,
    },
    partyRoles: [
        {
            partyRoleId: 32,
            partyRole: "INSURED",
            partyId: "Party_PI_1",
        },
        {
            partyRoleId: 31,
            partyRole: "PAYOR",
            partyId: "Party_PI_1",
            relationshipToInsured: "SELF",
            startDate: "2024-06-01",
        },
        {
            partyRoleId: 8,
            partyRole: "OWNER",
            partyId: "Party_PI_1",
            relationshipToInsured: "SELF",
            startDate: "2024-06-01",
        },
        {
            partyRoleId: 119,
            partyRole: "PAYEE",
            partyId: "Party_PI_1",
            relationshipToInsured: "SELF",
            startDate: "2024-06-01",
        },
        {
            partyRoleId: 34,
            partyRole: "PRIMARYBENEFICIARY",
            partyId: "Party_PB_Primary_Bene_1",
            relationshipToInsured: "BROTHER",
            startDate: "2024-06-01",
        },
        {
            partyRoleId: 37,
            partyRole: "PRIMARYWRITINGAGENT",
            partyId: "Party_PA_Agent_1",
            startDate: "2024-08-17",
        },
        {
            partyRoleId: 33,
            partyRole: "COVERAGEINSURED",
            partyId: "Party_CI_Coverage_Ins_1",
            startDate: "2024-08-17",
        }
    ],
    charges: [
        {
            chargeType: "COSTOFINSURANCE",
            coverageId: "Base_Coverage",
            currentMonthCharge: 0,
            uncollectedPerCharge: 0,
            cumulativePerCharge: 0
        },
        {
            chargeType: "UNITEXPENSECHARGE",
            coverageId: "Base_Coverage",
            currentMonthCharge: 0.5,
            uncollectedPerCharge: 0,
            cumulativePerCharge: 1.5
        },
        {
            chargeType: "COVERAGECREDIT",
            coverageId: "Base_Coverage",
            currentMonthCharge: 0.07,
            uncollectedPerCharge: 0,
            cumulativePerCharge: 0.15
        },
        {
            chargeType: "COVERAGECHARGE",
            coverageId: "Base_Coverage",
            currentMonthCharge: 14.31,
            uncollectedPerCharge: 0,
            cumulativePerCharge: 42.94
        },
        {
            chargeType: "EXPENSECHARGE",
            coverageId: "Base_Coverage",
            currentMonthCharge: 5,
            uncollectedPerCharge: 0,
            cumulativePerCharge: 15
        },
        {
            chargeType: "PAYMENTCHARGE",
            coverageId: "Base_Coverage",
            currentMonthCharge: 4.44,
            uncollectedPerCharge: 0,
            cumulativePerCharge: 13.32
        },
        {
            chargeType: "COSTOFINSURANCE",
            coverageId: "Rider_CTR",
            currentMonthCharge: 2,
            uncollectedPerCharge: 0,
            cumulativePerCharge: 6
        }
    ],
    parties: [
        {
            timestamp: "2024-08-17T02:59:14.640Z",
            customerId: "0048745MKH98078SSK",
            partyType: "INDIVIDUAL",
            firstName: "Jonathan",
            lastName: "Karadimas",
            gender: "MALE",
            dateOfBirth: "1985-04-20",
            attainedAge: 39,
            birthCountry: "US",
            preferredCommunicationType: "EMAIL",
            preferredAddressIndicator: "1",
            formerName: {
            },
            taxWithholdings: [
                {
                    appliesToPartyId: "Party_PI_1",
                    taxWithholdingType: "STATE",
                    taxRateToUse: "USEDEFAULTTABLE",
                    filingStatus: "DEFAULT",
                    dollar: 0,
                    percentage: 0,
                    taxJurisdiction: "USA_FL"
                },
                {
                    appliesToPartyId: "Party_PI_1",
                    taxWithholdingType: "FEDERAL",
                    taxRateToUse: "USEDEFAULTTABLE",
                    filingStatus: "DEFAULT",
                    dollar: 0,
                    percentage: 0,
                    taxJurisdiction: "USA"
                }
            ],
            partyId: "Party_PI_1",
            addresses: [
                {
                    addressId: "1",
                    startDate: "2024-06-01",
                    addressType: "RESIDENCE",
                    addressLine1: "18 MACK DR",
                    city: "Olathe",
                    state: "FL",
                    zipCode: "33132",
                    country: "US"
                }
            ],
            phones: [
                {
                    phoneId: "1",
                    startDate: "2024-06-01",
                    phoneType: "MOBILE",
                    countryCode: "1",
                    areaCode: "318",
                    dialNumber: "9873960",
                    extension: "0919",
                    bestTime: "Any time after 7:00pm",
                }
            ],
            emails: [
                {
                    emailId: "1",
                    startDate: "2024-06-01",
                    emailType: "PERSONAL",
                    emailAddress: "jonathan.karadimas@zinnia.com"
                }
            ],
            insured: {
                existingLifeInsurance: false,
                replaceLifeInsurance: false,
                pendingOrPlanToBuyAdditional: false,
                isDependent: false,
                employed: false,
                deathDetails: {
                },
                impairmentDetails: {
                    disabled: false,
                }
            },
            bankDetails: [
                {
                    bankId: "Bank_1",
                    appliesToPartyId: "Party_PI_1",
                    startDate: "2024-06-01",
                    nameOnAccount: "Jonathan Karadimas",
                    accountStatus: "ACTIVEBANKACCOUNT",
                    accountType: "CHECKING",
                    routingNumber: "005874516",
                    branchName: "Wells Fargo",
                    branchAddress: {
                    },
                    accountNumber: "*****0541",
                }
            ],
            identifications: [
                {
                    identificationType: "SSN",
                    identificationValue: "***-**-6768",
                },
                {
                    identificationType: "DRIVERLICENSE" as IdentificationType,
                    identificationValue: "FL085409537",
                    issueState: "FL",
                }
            ]
        },
        {
            timestamp: "2024-08-17T02:59:14.686Z",
            customerId: "0048745MKH98078HHE",
            partyType: "INDIVIDUAL",
            beneficiaryPercentage: 100,
            firstName: "Carter",
            lastName: "Smith",
            gender: "MALE",
            dateOfBirth: "2001-12-04",
            attainedAge: 22,
            birthCountry: "US",
            preferredCommunicationType: "EMAIL",
            preferredAddressIndicator: "1",
            formerName: {
            },
            taxWithholdings: [],
            partyId: "Party_PB_Primary_Bene_1",
            addresses: [
                {
                    addressId: "1",
                    startDate: "2024-06-01",
                    addressType: "RESIDENCE",
                    addressLine1: "18 MACK DR",
                    city: "Miami",
                    state: "FL",
                    zipCode: "33132",
                    country: "US"
                }
            ],
            phones: [
                {
                    phoneId: "1",
                    startDate: "2024-06-01",
                    phoneType: "MOBILE",
                    countryCode: "1",
                    areaCode: "318",
                    dialNumber: "9873961",
                    extension: "0919",
                    bestTime: "Any time after 7:00pm",
                }
            ],
            emails: [
                {
                    emailId: "1",
                    startDate: "2024-06-01",
                    emailType: "PERSONAL",
                    emailAddress: "Manik.Malik@gmail.com"
                }
            ],
            partyStatus: "APPROVED",
            bankDetails: [],
            identifications: [
                {
                    identificationType: "SSN",
                    identificationValue: "***-**-9999",
                },
                {
                    identificationType: "DRIVERLICENSE" as IdentificationType,
                    identificationValue: "FL085409999",
                    issueState: "FL",
                }
            ]
        },
        {
            timestamp: "2024-08-17T02:59:14.784Z",
            partyType: "INDIVIDUAL",
            firstName: "Lacey",
            lastName: "Smith",
            gender: "FEMALE",
            dateOfBirth: "2020-05-04",
            attainedAge: 4,
            birthCountry: "US",
            preferredAddressIndicator: "1",
            formerName: {
            },
            taxWithholdings: [],
            partyId: "Party_CI_Coverage_Ins_1",
            addresses: [
                {
                    addressId: "1",
                    startDate: "2024-06-01",
                    addressType: "RESIDENCE",
                    addressLine1: "18 MACK DR",
                    city: "Miami",
                    state: "FL",
                    zipCode: "33132",
                    country: "US"
                }
            ],
            phones: [],
            emails: [
                {
                    emailId: "1",
                    startDate: "2024-06-01",
                    emailType: "PERSONAL",
                    emailAddress: "Manik.Malik@gmail.com"
                }
            ],
            insured: {
                existingLifeInsurance: false,
                existingLifeInsuranceAmount: undefined,
                replaceLifeInsurance: false,
                pendingOrPlanToBuyAdditional: false,
                isDependent: false,
                employed: false,
                employmentStatus: undefined,
                occupation: undefined,
                householdIncome: undefined,
                deathDetails: {
                    dateOfDeath: undefined,
                    causeOfDeath: undefined
                },
                impairmentDetails: {
                    disabled: false,
                    disabilityStartDate: undefined
                }
            },
            partyStatus: undefined,
            version: undefined,
            agentExternalId: undefined,
            agentType: undefined,
            agentPercentage: undefined,
            bankDetails: [],
            identifications: [
                {
                    identificationType: "DRIVERLICENSE" as IdentificationType,
                    identificationValue: "FL085401111",
                    issueState: "FL",
                    issueCountry: undefined
                }
            ]
        },
        {
            timestamp: "2024-08-17T02:59:14.737Z",
            customerId: undefined,
            partyType: "INDIVIDUAL",
            beneficiaryPercentage: undefined,
            firstName: "PETER",
            middleName: undefined,
            lastName: "ANTHONY",
            fullName: undefined,
            prefix: undefined,
            suffix: undefined,
            gender: "MALE",
            dateOfBirth: undefined,
            attainedAge: 124,
            birthCountry: undefined,
            birthState: undefined,
            doingBusinessAs: undefined,
            abbreviatedName: undefined,
            organizationCode: undefined,
            entityType: undefined,
            trustDate: undefined,
            trustType: undefined,
            trustTitle: undefined,
            trustAccessCode: undefined,
            preferredCommunicationType: undefined,
            preferredAddressIndicator: undefined,
            formerName: {
                firstName: undefined,
                middleName: undefined,
                lastName: undefined,
                prefix: undefined,
                suffix: undefined,
                fullName: undefined,
                abbreviatedName: undefined,
                doingBusinessAs: undefined
            },
            taxWithholdings: [],
            partyId: "Party_PA_Agent_1",
            addresses: [],
            phones: [],
            emails: [],
            insured: undefined,
            partyStatus: undefined,
            version: undefined,
            agentExternalId: "PG0010028",
            agentType: "BROKER",
            agentPercentage: 100,
            bankDetails: [],
            identifications: []
        }
    ]
}