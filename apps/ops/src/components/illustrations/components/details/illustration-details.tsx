import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { PrintProvider } from '@deps/contexts/printContext';
import { getIllustrationQueryOptions } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import { getNewBusinessEApp } from '@deps/queries/tanstack/newBusinessQueries/newBusinessQueries';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';

import IllustrationDetailsContent from './content/illustration-details-content';
import IllustrationDetailsHeader from './header/illustration-details-header';
import NoIllustration from './no-illustration';
import IllustrationDetailsToolbar from './toolbar/illustration-details-toolbar';
import { getProductCarrierName } from '../../helpers/get-product-carrier-name';
import { IllustrationDetailProvider } from '../../providers/IllustrationDetailProvider';
import { useSelectedIllustration } from '../../providers/SelectedIllustrationProvider';
import { EAppProviders } from '../eapp/eapp-providers';

type IllustrationDetailsProps = {
    clientCase: IllustrationsClientCase;
    eAppId?: string;
};

export default function IllustrationDetails({
    clientCase,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const versionedAnswers = illustration.inputs
        ? JSON.parse(illustration.inputs)
        : undefined;

    return (
        <EAppProviders
            clientCase={clientCase}
            planCode={product.planCode}
            versionedAnswers={versionedAnswers}
        >
            <IllustrationDetailProvider value={fullIllustration ?? null}>
                <PrintProvider>
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
                            clientCase={clientCase}
                            illustrationId={illustration.id}
                            eAppId={eAppId}
                            planCode={product.planCode}
                        />
                    </Skeleton>
                    <IllustrationDetailsContent />
                </PrintProvider>
            </IllustrationDetailProvider>
        </EAppProviders>
    );
}
