import { QuestionnaireEngine } from '@zinnia/form-engine-sdk';
import { debounce, DebouncedFunc } from 'lodash';
import { useEffect } from 'react';

import useLazyRef from '@deps/hooks/useLazyRef';

import { useQuickQuoteMutation } from './use-quick-quote-mutation';
import { IllustrationHandler } from '../helpers/factory/illustrationsHandlerAbstractClass';

const DEBOUNCE_DELAY = 2_000;

type SubscriberState = {
    isBusy: boolean;
    isDirty: boolean;
    wasSubmitted: boolean;
    staleTimeout: NodeJS.Timeout | undefined;
    debouncedMutate: DebouncedFunc<
        (engine: QuestionnaireEngine) => Promise<unknown>
    >;
    processEvent: (engine: QuestionnaireEngine) => Promise<void>;
};

const createSubscriberState = (
    mutateAsync: (engine: QuestionnaireEngine) => Promise<unknown>
) => {
    const subscriberState = {
        isBusy: false,
        isDirty: false,
        wasSubmitted: false,
        staleTimeout: undefined,
        debouncedMutate: debounce(async (engine: QuestionnaireEngine) => {
            const isCompleted = !engine.renderingQuestionnaire.some(
                (renderingSectionGroup) => {
                    return !renderingSectionGroup.completed;
                }
            );

            if (!isCompleted) {
                return;
            }

            try {
                subscriberState.isBusy = true;
                await mutateAsync(engine);
                subscriberState.wasSubmitted = true;
            } finally {
                subscriberState.isBusy = false;
            }
        }, DEBOUNCE_DELAY),
        processEvent: async (engine: QuestionnaireEngine) => {
            const { staleTimeout, debouncedMutate, processEvent } =
                subscriberState;
            subscriberState.isDirty = true;

            clearTimeout(staleTimeout);
            if (subscriberState.isBusy) {
                setTimeout(
                    processEvent.bind(undefined, engine),
                    DEBOUNCE_DELAY
                );
                return;
            }

            debouncedMutate(engine);
        },
    };

    return subscriberState;
};

export const useQuickQuoteSubscriber = ({
    factoryHandler,
}: {
    factoryHandler: IllustrationHandler<unknown>;
}) => {
    const { mutateAsync } = useQuickQuoteMutation({
        factoryHandler,
    });

    const subscriberRefCurrent = useLazyRef<SubscriberState>(() =>
        createSubscriberState(mutateAsync)
    ).current;

    useEffect(() => {
        return () => {
            clearTimeout(subscriberRefCurrent.staleTimeout);
            subscriberRefCurrent.debouncedMutate.cancel();
        };
    }, [subscriberRefCurrent]);

    return subscriberRefCurrent.processEvent;
};
