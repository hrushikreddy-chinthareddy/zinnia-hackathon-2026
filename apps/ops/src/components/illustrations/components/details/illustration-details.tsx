import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getIllustrationQueryOptions } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import { getNewBusinessEApp } from '@deps/queries/tanstack/newBusinessQueries/newBusinessQueries';
import { ProductTypes } from '@deps/types/product';

import IllustrationDetailsContent from './content/illustration-details-content';
import IllustrationDetailsHeader from './header/illustration-details-header';
import NoIllustration from './no-illustration';
import IllustrationDetailsToolbar from './toolbar/illustration-details-toolbar';
import { getProductCarrierName } from '../../helpers/get-product-carrier-name';
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
    const { selectedIllustration, setNewBusinessCaseId, setEAppLink } =
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
            setEAppLink(getEAppLink());
        }
    }, [newBusinesResponse]);

    const getEAppLink = () => {
        if (!eAppId) return undefined;
        return newBusinesResponse?.illustrations?.customIdentifiers?.find(
            (identifier) => identifier.key.toLowerCase() === 'redirectionurl'
        )?.value;
    };

    if (!illustration || !product) {
        return <NoIllustration />;
    }

    const hasIllustrationSelected = () => {
        if (!eAppId) return undefined;
        return !!newBusinesResponse?.illustrations?.illustrationId;
    };

    return (
        <IllustrationDetailProvider value={fullIllustration ?? null}>
            <div>
                <Skeleton loading={isLoading}>
                    <IllustrationDetailsHeader
                        title={illustration.title}
                        carrier={getProductCarrierName(product)}
                        eAppId={eAppId}
                        eAppLink={getEAppLink()}
                        hasIllustrationSelected={hasIllustrationSelected()}
                    />
                </Skeleton>
                <Skeleton loading={isLoading}>
                    <IllustrationDetailsToolbar
                        status={illustration.status}
                        isLoading={isLoading}
                        clientCaseId={clientCaseId}
                        illustrationId={illustration.id}
                        eAppId={eAppId}
                    />
                </Skeleton>
                <IllustrationDetailsContent isLoading={true} />
            </div>
        </IllustrationDetailProvider>
    );
}
