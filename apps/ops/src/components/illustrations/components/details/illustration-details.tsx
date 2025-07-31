import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { CarrierName } from '@zinnia/bloom/components';
import { useEffect } from 'react';

import { getIllustrationQueryOptions } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import { getNewBusinessEApp } from '@deps/queries/tanstack/newBusinessQueries/newBusinessQueries';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ProductTypeLabel, ProductTypes } from '@deps/types/product';

import IllustrationDetailsContent from './content/illustration-details-content';
import IllustrationDetailsHeader from './header/illustration-details-header';
import NoIllustration from './no-illustration';
import IllustrationDetailsToolbar from './toolbar/illustration-details-toolbar';
import { IllustrationDetailProvider } from '../../providers/IllustrationDetailProvider';
import { useSelectedIllustration } from '../../providers/SelectedIllustrationProvider';

type IllustrationDetailsProps = {
    clientCaseId: string;
    eAppId?: string;
};

export default function IllustrationDetails({
    clientCaseId,
    eAppId,
}: IllustrationDetailsProps) {
    const { selectedIllustration, setNewBusinessCaseId } =
        useSelectedIllustration();
    const illustration = selectedIllustration?.illustration;
    const product = selectedIllustration?.product;

    const { isLoading, data: fullIllustration } = useQuery(
        getIllustrationQueryOptions(
            illustration?.id ?? null,
            illustration?.productType ?? ProductTypes.TERM
        )
    );

    const { data: newBusinesResponse } = useQuery({
        queryKey: ['illustrationDetail', eAppId],
        queryFn: () => {
            return getNewBusinessEApp(eAppId ?? '');
        },
        select: (data) => data.data,
        enabled:
            !!eAppId &&
            !!fullIllustration &&
            fullIllustration.inputs.source === 'zinnia-live',
    });

    useEffect(() => {
        if (newBusinesResponse) {
            setNewBusinessCaseId(newBusinesResponse.caseId);
        }
    }, [newBusinesResponse]);

    if (!illustration) {
        return <NoIllustration />;
    }

    const getCarrierName = (carrierCode?: string) => {
        if (!carrierCode) {
            return CarrierName.ZINNIA;
        }
        const carriers = new Map([
            ['ZIN', CarrierName.ZINNIA],
            ['FNWL', CarrierName.FARMERS],
        ]);
        return carriers.get(carrierCode) ?? CarrierName.ZINNIA;
    };

    const getEAppLink = () => {
        if (!eAppId) return undefined;
        return newBusinesResponse?.illustrations?.customIdentifiers?.find(
            (identifier) => identifier.key.toLowerCase() === 'redirectionurl'
        )?.value;
    };

    return (
        <IllustrationDetailProvider value={fullIllustration ?? null}>
            <div>
                <Skeleton loading={isLoading}>
                    <IllustrationDetailsHeader
                        title={illustration.title}
                        carrier={getCarrierName(product?.carrier)}
                        label={
                            product?.productMarketingName ??
                            DEFAULT_ERROR_STRING
                        }
                        planType={
                            ProductTypeLabel.get(
                                product?.productType ?? ProductTypes.TERM
                            ) ?? DEFAULT_ERROR_STRING
                        }
                        eAppId={eAppId}
                        eAppLink={getEAppLink()}
                    />
                </Skeleton>
                <Skeleton loading={isLoading}>
                    <IllustrationDetailsToolbar
                        status={illustration.status}
                        isLoading={isLoading}
                        clientCaseId={clientCaseId}
                        illustrationId={illustration.id}
                        productType={product?.productType}
                        eAppId={eAppId}
                    />
                </Skeleton>
                <IllustrationDetailsContent isLoading={true} />
            </div>
        </IllustrationDetailProvider>
    );
}
