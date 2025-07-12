import style from './menu.module.css';
import { useActiveSection } from '../../../providers/ActiveSectionProvider';
import { useQuestionnaireEngine } from '../../../providers/QuestionnaireEngineProvider';

export function Menu() {
    const { renderingQuestionnaire } = useQuestionnaireEngine();
    const { activeSection, onSelectSection } = useActiveSection();
    const sections = renderingQuestionnaire[0]?.sections; // TODO un-hard code section group once we do have the questionnaire

    return (
        <div className={style.sidebarContainer}>
            <div className={style.sectionsWrapper}>
                {sections?.map((section) => {
                    return section.visible ? (
                        <div
                            key={section.id}
                            className={`${style.sidebarSection} ${
                                activeSection?.blueprintId ===
                                    section.blueprintId && style.active
                            }`}
                            onClick={() => {
                                onSelectSection(section.blueprintId);
                            }}
                        >
                            <h5 className="--typography-labels-label-md-alt">
                                {section.title}
                            </h5>
                            <div className={style.selectedIndicator} />
                        </div>
                    ) : null;
                })}
            </div>
        </div>
    );
}
