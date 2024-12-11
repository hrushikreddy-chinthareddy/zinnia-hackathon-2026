import { useTranslation } from 'next-i18next';
import { useContext } from 'react';
import xss from 'xss';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import SelectSimple from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { Reg60FormContext } from '@deps/contexts/Reg60FormContext';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { TranslationFiles } from '@deps/config/translations';

import { ChannelType, UserInformationProps } from './user-information.type';
import { SSN_FORMAT } from '../../utils/reg60-constants';
import AddressDetails from '../address-details/address-details';
import UserPhoneNumber from '../phone-number/phone-number';

const UserInformation = ({ userInfo, setUserInfo, formErrors, formConfig }: UserInformationProps) => {
    const { t } = useTranslation(TranslationFiles.REG60DEFS, { keyPrefix: 'caseReg60.request.partyDetails' });

    const { isFormStateReadOnly } = useContext(Reg60FormContext);
    return (
        <div className="content-divider my-6 pb-3">
            <div className="flex align-middle">
                <Typography variant={TypographyVariant.H3} className="mb-4">
                    {formConfig.title || t(`ownerInformation.header`)}
                </Typography>
                {formConfig.titleTooltip && (
                    <Popover triggerClassName="mb-4" title={'Info'} body={formConfig.titleTooltip} placement={PopoverPlacement.BottomRight}>
                        <span className="block p-[5px]">
                            <CircleInfoIcon height={'16px'} width={'16px'} className="text-primary" />
                        </span>
                    </Popover>
                )}
            </div>
            <div className="my-4 grid w-full grid-cols-3 gap-4">
                {formConfig.userFields.fields.firstName && (
                    <Field
                        label={t('firstName') as string}
                        message={formErrors?.firstName}
                        onChange={e => {
                            setUserInfo({
                                ...userInfo,
                                personalInformation: { ...userInfo?.personalInformation, firstName: xss(e.target.value) },
                            });
                        }}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={userInfo.personalInformation.firstName}
                        data-testid={`firstName-${userInfo.personalInformation.firstName}`}
                        variant={selectVarientByConfig({
                            value: userInfo.personalInformation.firstName,
                            isFormStateReadOnly,
                            error: formErrors?.firstName,
                        })}
                        required
                    />
                )}
                {formConfig.userFields.fields.middleName && (
                    <Field
                        className={formErrors?.name && 'border-2 border-solid border-semantic-error'}
                        label={t(`middleName`) as string}
                        onChange={e => {
                            setUserInfo({
                                ...userInfo,
                                personalInformation: { ...userInfo?.personalInformation, middleName: xss(e.target.value) },
                            });
                        }}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        data-testid={`middleName-${userInfo.personalInformation.middleName}`}
                        value={userInfo?.personalInformation?.middleName}
                        variant={selectVarientByConfig({
                            value: userInfo.personalInformation.middleName,
                            isFormStateReadOnly,
                            error: formErrors?.middleName,
                        })}
                    />
                )}
                {formConfig.userFields.fields.lastName && (
                    <Field
                        className={formErrors?.name && 'border-2 border-solid border-semantic-error'}
                        label={t(`lastName`) as string}
                        onChange={e => {
                            setUserInfo({
                                ...userInfo,
                                personalInformation: { ...userInfo?.personalInformation, lastName: xss(e.target.value) },
                            });
                        }}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        data-testid={`lastName-${userInfo.personalInformation.lastName}`}
                        value={userInfo.personalInformation.lastName}
                        message={formErrors?.lastName}
                        variant={selectVarientByConfig({
                            value: userInfo.personalInformation.lastName,
                            isFormStateReadOnly,
                            error: formErrors?.lastName,
                        })}
                        required
                    />
                )}
                {formConfig.userFields.fields.channel && (
                    <SelectSimple
                        disabled={isFormStateReadOnly}
                        label={t(`channel`) as string}
                        onChange={val => {
                            setUserInfo({
                                ...userInfo,
                                channel: val,
                            });
                        }}
                        options={[
                            { label: t('channelOption.cas'), value: ChannelType.CAS },
                            { label: t('channelOption.broker'), value: ChannelType.Broker },
                        ]}
                        message={formErrors?.channel}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        data-testid={`channel-${userInfo.channel}`}
                        value={userInfo.channel}
                        variant={formErrors?.channel ? FieldVariant.Error : FieldVariant.Default}
                        required
                    />
                )}
            </div>

            {formConfig.userFields?.fields?.userCompany && (
                <div className="my-4 max-w-lg">
                    <Field
                        label={formConfig.userFields.fields.userCompany?.fieldLabel}
                        message={formErrors.companyName}
                        onChange={e => {
                            setUserInfo({ ...userInfo, companyName: xss(e.target.value) });
                        }}
                        size={FieldSize.Small}
                        data-testid={`companyName-${userInfo?.companyName}`}
                        type={FieldType.BaseActive}
                        value={userInfo.companyName}
                        variant={selectVarientByConfig({
                            value: userInfo?.companyName || '',
                            isFormStateReadOnly,
                            error: formErrors?.companyName,
                        })}
                        maxLength={35}
                        required
                    />
                </div>
            )}

            <UserPhoneNumber
                phoneDetails={userInfo}
                onPhoneDetailsChange={setUserInfo}
                formErrors={formErrors}
                formConfig={formConfig}
                isFormStateReadOnly={isFormStateReadOnly}
            />

            <div className="my-4">
                {formConfig.userFields.fields.userSSN && (
                    <Field
                        className=" max-w-lg"
                        formatOptions={SSN_FORMAT}
                        label={t(`ownerSSN`) as string}
                        message={formErrors?.ssNumber}
                        onChange={e => {
                            setUserInfo({
                                ...userInfo,
                                personalInformation: { ...userInfo?.personalInformation, ssNumber: xss(e.target.value) },
                            });
                        }}
                        size={FieldSize.Small}
                        data-testid={`ownerSSN-${userInfo.personalInformation.ssNumber}`}
                        type={FieldType.BaseActive}
                        value={userInfo.personalInformation.ssNumber}
                        variant={selectVarientByConfig({
                            value: userInfo.personalInformation.ssNumber,
                            isFormStateReadOnly,
                            error: formErrors?.ssNumber,
                        })}
                        required
                    />
                )}
            </div>

            <div className="mb-4">
                <AddressDetails
                    isFormStateReadOnly={isFormStateReadOnly}
                    isPayeeAddress={false}
                    userData={userInfo}
                    errors={formErrors}
                    setUserData={setUserInfo}
                    addressFieldConfig={formConfig.addressFields}
                />
            </div>
        </div>
    );
};

export default UserInformation;
