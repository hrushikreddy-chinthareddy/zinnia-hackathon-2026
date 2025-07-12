import { QuestionnaireEngine, RenderingSection } from '@zinnia/form-engine-sdk';
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useQuestionnaireEngine } from './QuestionnaireEngineProvider';

type ActiveSectionContextValue = {
    activeSection?: RenderingSection;
    onNextSection?: () => void;
    onSelectSection: (activeSectionBlueprintId: string) => void;
    onNextForLastSection?: () => void;
    setIsLoading: (val: boolean) => void;
    isLoading: boolean;
};

interface Props {
    handleNextSectionActionsOnChangeSection?: boolean;
    onNextForLastSection?: (questionnaireEngine: QuestionnaireEngine) => void;
    onNextSection?: (questionnaireEngine: QuestionnaireEngine) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ActiveSectionContext = createContext<
    ActiveSectionContextValue | undefined
>(undefined);

export function ActiveSectionProvider(props: PropsWithChildren<Props>) {
    const {
        handleNextSectionActionsOnChangeSection,
        onNextSection,
        onNextForLastSection,
    } = props;
    const [isLoading, setIsLoading] = useState(false);
    const { renderingQuestionnaire, questionnaireEngine } =
        useQuestionnaireEngine();
    const [activeSectionGroupBlueprintId, setActiveSectionGroupBlueprintId] =
        useState<string>('');
    const [activeSectionBlueprintId, setActiveSectionBlueprintId] =
        useState<string>('');
    const mostRecentlyActionedSectionBlueprintId = useRef<string>('');

    useEffect(() => {
        if (!activeSectionGroupBlueprintId) {
            const sectionGroupId = renderingQuestionnaire[0]?.blueprintId || '';
            setActiveSectionGroupBlueprintId(sectionGroupId);
        }
        if (!activeSectionBlueprintId) {
            const sectionId =
                renderingQuestionnaire[0]?.sections?.[0]?.blueprintId || '';
            setActiveSectionBlueprintId(sectionId);
        }
    }, [
        renderingQuestionnaire,
        activeSectionBlueprintId,
        activeSectionGroupBlueprintId,
    ]);

    const [activeSection, nextSectionBlueprintId]: [
        RenderingSection | undefined,
        string | undefined
    ] = useMemo(() => {
        const sectionGroupIndex = renderingQuestionnaire.findIndex(
            (sectionGroup) =>
                sectionGroup.blueprintId === activeSectionGroupBlueprintId
        );
        const activeSectionGroup =
            sectionGroupIndex === undefined || sectionGroupIndex < 0
                ? undefined
                : renderingQuestionnaire[sectionGroupIndex];

        const visibleSectionsInActiveSectionGroup =
            activeSectionGroup?.sections.filter(
                (section) => !!section.visible
            ) || [];

        const sectionIndex = visibleSectionsInActiveSectionGroup.findIndex(
            (section) => section.blueprintId === activeSectionBlueprintId
        );
        const section =
            sectionIndex === undefined
                ? undefined
                : visibleSectionsInActiveSectionGroup[sectionIndex];

        const nextSectionIndex =
            sectionIndex === undefined
                ? undefined
                : sectionIndex <
                  (visibleSectionsInActiveSectionGroup?.length || 0) - 1
                ? sectionIndex + 1
                : undefined;

        const nextBlueprintId =
            nextSectionIndex === undefined
                ? undefined
                : visibleSectionsInActiveSectionGroup[nextSectionIndex]
                      ?.blueprintId;

        return [section, nextBlueprintId];
    }, [
        activeSectionGroupBlueprintId,
        activeSectionBlueprintId,
        renderingQuestionnaire,
    ]);

    const performNextSectionActions = useCallback(() => {
        if (
            mostRecentlyActionedSectionBlueprintId.current ===
            activeSectionBlueprintId
        ) {
            return;
        }
        mostRecentlyActionedSectionBlueprintId.current =
            activeSectionBlueprintId;
        if (!!nextSectionBlueprintId && onNextSection) {
            onNextSection(questionnaireEngine);
        }
        if (!nextSectionBlueprintId && onNextForLastSection) {
            onNextForLastSection(questionnaireEngine);
        }
    }, [
        nextSectionBlueprintId,
        onNextSection,
        questionnaireEngine,
        onNextForLastSection,
        mostRecentlyActionedSectionBlueprintId,
        activeSectionBlueprintId,
    ]);

    const handleNextSectionClick = useCallback(() => {
        if (!handleNextSectionActionsOnChangeSection) {
            performNextSectionActions();
        }
        if (nextSectionBlueprintId !== undefined) {
            setActiveSectionBlueprintId(nextSectionBlueprintId);
        }
    }, [
        nextSectionBlueprintId,
        performNextSectionActions,
        handleNextSectionActionsOnChangeSection,
    ]);

    useEffect(() => {
        if (
            handleNextSectionActionsOnChangeSection &&
            activeSectionBlueprintId &&
            activeSectionBlueprintId !==
                mostRecentlyActionedSectionBlueprintId.current
        ) {
            performNextSectionActions();
        }
    }, [
        activeSectionBlueprintId,
        performNextSectionActions,
        handleNextSectionActionsOnChangeSection,
        mostRecentlyActionedSectionBlueprintId,
    ]);

    return (
        <ActiveSectionContext.Provider
            value={{
                isLoading,
                setIsLoading: (isLoading: boolean) => setIsLoading(isLoading),
                onNextForLastSection:
                    !nextSectionBlueprintId && onNextForLastSection
                        ? () => onNextForLastSection(questionnaireEngine)
                        : undefined,
                onNextSection: nextSectionBlueprintId
                    ? handleNextSectionClick
                    : undefined,
                activeSection,
                onSelectSection: (blueprintId: string) =>
                    setActiveSectionBlueprintId(blueprintId),
            }}
        >
            {props.children}
        </ActiveSectionContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useActiveSection(): ActiveSectionContextValue {
    const context = useContext(ActiveSectionContext);

    if (typeof context === 'undefined') {
        throw new Error(
            'useActiveSection must be used within an ActiveSectionProvider'
        );
    }

    return context;
}
