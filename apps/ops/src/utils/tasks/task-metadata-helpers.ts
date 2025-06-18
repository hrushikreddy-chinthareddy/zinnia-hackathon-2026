import { v4 as uuidv4 } from 'uuid';

import { FormMetadata, TaskType } from '@deps/models/case/task';
import { PotentialMatches } from '@deps/models/case/task/doc-matching-payment';
import { BeneficiaryRecord } from '@deps/models/case/task/beneficiary-record';
import { searchBeneficiaryByCaseId, SearchTransactionFilters } from '../../queries/api/beneficiary';
import { stringifyValue } from '@deps/helpers/csr-api-helpers';

export const TaskMetadataHelper = async (task: any, tasksMetadata: any[]) => {
    const updatedMetadata = await Promise.all(
        tasksMetadata.map(async (taskMetadata: FormMetadata) => {
            switch (task.taskType) {
                case TaskType.PURCHASE_DOCUMENT_MATCHING:
                case TaskType.Standard_Document_Matching: {
                    const uiSchema = taskMetadata.uiSchema || {};
                    if (uiSchema.matchingResult?.['ui:options']?.customOptions) {
                        const existingOptions = uiSchema.matchingResult['ui:options'].customOptions
                            .filter((option: any) => {
                                if (option.value === 'NO_MATCH' && !task?.data?.isPrimaryDocumentPresent == true) {
                                    return false;
                                }
                                return true;
                            })
                            .map((option: any) => {
                                if (option.value === undefined) {
                                    return { ...option, value: null };
                                }
                                return option;
                            });

                        const potentialMatchesOptions = generatePotentialMatchesOptions(task?.data?.potentialMatches || []) || [];

                        uiSchema.matchingResult['ui:options'].customOptions = [...potentialMatchesOptions, ...existingOptions];
                    }

                    return taskMetadata;
                }

                case TaskType.Claims_Match_Bene_Document: {
                    const uiSchema = taskMetadata.uiSchema || {};
                    const potentialMatchCriteria = task.data?.details?.documentEntityMatch?.potentialMatchCriteria;
                    const matchCriteria = ((uiSchema.details ??= {}).documentEntityMatch ??= {});

                    const documents = task.data?.details?.documentEntityMatch?.documents;
                    const targetFormSchema = taskMetadata.formSchema;

                    if (documents && targetFormSchema) {
                        const uniqueDisplayNames = Array.from(new Set(documents.map((doc: any) => doc.metadata.displayName)));
                        const uniqueDocumentSources = Array.from(new Set(documents.map((doc: any) => doc.metadata.documentSource)));
                        const placeholderMap: Record<string, string> = {
                            'metadata.displayName': stringifyValue(uniqueDisplayNames[0]) ?? '',
                            'metadata.documentSource': stringifyValue(uniqueDocumentSources[0]) ?? '',
                            'carrier': task.carrier ?? '',
                          };
                          const replaceInline = (schema: any, map: Record<string, string>): any => {
                            if (!schema || typeof schema !== 'object') {
                              if (typeof schema === 'string') {
                                return schema.replace(/{{(.*?)}}/g, (match: string, key: string) => {
                                  const trimmedKey = key.trim();
                                  return map[trimmedKey] !== undefined ? map[trimmedKey] : '';
                                });
                              }
                              return schema;
                            }
                            if (Array.isArray(schema)) {
                              return schema.map(item => replaceInline(item, map));
                            }
                            const result: Record<string, any> = {};
                            for (const [key, value] of Object.entries(schema)) {
                              result[key] = replaceInline(value, map);
                            }
                            return result;
                          };

                        taskMetadata.formSchema = replaceInline(targetFormSchema, placeholderMap);
                    }

                    let zlCaseId = '';
                    let entityType = '';
                    if (potentialMatchCriteria) {
                        zlCaseId = potentialMatchCriteria.identifiers?.find((id: { identifier: string }) => id.identifier === 'zlCaseId')?.value ??
                            '';
                        entityType = Array.isArray(potentialMatchCriteria.entityType)
                            ? potentialMatchCriteria.entityType[0] ?? ''
                            : potentialMatchCriteria.entityType ?? '';
                    }

                    let beneficiaryMatches: BeneficiaryRecord[] = [];
                    if (zlCaseId && entityType) {
                        try {
                            const filters: SearchTransactionFilters = { zlCaseId, entityType };
                            const apiResult = await searchBeneficiaryByCaseId(filters);
                            beneficiaryMatches = Array.isArray(apiResult) ? apiResult : [];
                        } catch (error) {
                            console.error('Failed to fetch beneficiaries:', error);
                        }
                    } else {
                        console.warn('Missing zlCaseId or entityType, using potentialMatches');
                        beneficiaryMatches = Array.isArray(task.data?.potentialMatches) ? task.data.potentialMatches : [];
                    }
                    const beneficiaryMatchesOptions = generateBeneficiaryOptions(beneficiaryMatches);
                    matchCriteria.matchRecord['ui:options'].customOptions = [...beneficiaryMatchesOptions];

                    return taskMetadata;
                }

                default:
                    return taskMetadata;
            }
        })
    );

    return updatedMetadata;
};

const generatePotentialMatchesOptions = (potentialMatches: PotentialMatches[]): any[] => {
    return (
        potentialMatches
            ?.filter(
                item =>
                    item.correlationid &&
                    item.correlationid !== '' &&
                    Object.prototype.hasOwnProperty.call(item, 'zlCaseId') &&
                    item.zlCaseId !== ''
            )
            ?.map((item: PotentialMatches) => {
                const id = uuidv4();
                const subElement = {
                    label: '',
                    value: item?.zlCaseId ?? '',
                    title: item?.entityType ?? '',
                    url: `/cases/${item.zlCaseId}`,
                    type: 'link',
                    disabled: false,
                };
                return { label: item.entityType, value: item.correlationid, id, subElement };
            }) || []
    );
};

const generateBeneficiaryOptions = (beneficiaries: BeneficiaryRecord[]): any[] => {
    return beneficiaries.map((item: BeneficiaryRecord) => {
        const idField = item.recordId || item.zlCaseId || '';
        const id = uuidv4();
        const cardData = {
            entityType: item.entityType || '',
            recordId: idField,
            entity: {
                party: {
                    ssn: item.entity?.party?.ssn || '',
                    fullName: item.entity?.party?.fullName || item.entity?.party?.firstName || item.name || 'Unknown Beneficiary',
                },
            },
        };
        const data = {
            entityType: cardData.entityType,
            recordId: cardData.recordId,
            beneficiaryName: cardData.entity.party.fullName,
        };
        const subElement = {
            label: cardData.entity.party.fullName,

            disabled: false,
            cardType: 'Detailed',
            icon: 'CIRCLE_USER',
            ...cardData,
        };

        return {
            label: cardData.entity.party.fullName,
            value: stringifyValue(data),
            id,
            subElement,
        };
    });
};
