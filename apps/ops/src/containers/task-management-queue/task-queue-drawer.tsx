import Typography, { TypographyVariant } from "@deps/components/typography/typography";
import { TranslationFiles } from "@deps/config/translations";
import { useTranslation } from "react-i18next";

function TaskQueueDrawer() {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue.updateTaskStatusDrawer' });
  return (
    <div className="my-5 m-10">
      <Typography variant={TypographyVariant.H4}>
        {t(`${'setTaskAsPending'}`)}
      </Typography>
      <>hiii</>
    </div>
  )
}

export default TaskQueueDrawer
