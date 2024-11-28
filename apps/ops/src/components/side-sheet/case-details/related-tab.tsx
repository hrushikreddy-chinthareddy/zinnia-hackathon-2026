import ChipStatus from "@deps/components/chip-status/chip-status";
import PaginationControls from "@deps/components/pagination/pagination";
import { TranslationFiles } from "@deps/config/translations";
import { CaseTableData } from "@deps/contexts/CaseManagementFilters";
import { DEFAULT_EXTENDED_DATE_FORMAT } from "@deps/types/constants";
import dayjs from "dayjs";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

type relatedTabProps = {
  caseTableData: CaseTableData,
  offset: number,
  limit: number,
  setOffset: React.Dispatch<React.SetStateAction<number>>
}

function RelatedTab({ caseTableData, offset, limit, setOffset }: relatedTabProps) {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.CaseDetailsContent' });
  const paginationControls = useMemo(() => {
    const goToPage = (pageNumber: number) => {
      setOffset((pageNumber - 1) * limit);
      window.scrollTo(0, 0);
    };

    return <PaginationControls total={caseTableData.total} limit={limit} offset={offset} goToPage={goToPage} />;
  }, [caseTableData.total, offset, limit]);


  return (
    <div className="flex-1 flex flex-col w-full !mb-0 px-4 pt-4 md:px-6 lg:px-8 gap-4">
      {caseTableData.cases.map((caseData) => {
        const formattedApplicationDate = dayjs(caseData.updatedAt).format(DEFAULT_EXTENDED_DATE_FORMAT);
        return (
          <div className="border-2 border-gray-200  min-w-full rounded-sm grid grid-cols-2 p-4 gap-3 hover:border-black">
            <div className="col-span-2 ">
              <div className="font-secondary text-[18px] font-bold text-gray-800">{caseData.process}</div>
              <div className="font-secondary text-md text-gray-600">{t('relatedTab.lastUpdated')}: {formattedApplicationDate}</div>
            </div>
            <div className="col-span-1">
              <div className="font-secondary text-md font-bold text-gray-800"> {t('relatedTab.caseId')}</div>
              <div className="font-secondary text-md text-[--color-base-text-text-link] font-bold">#{caseData.id}</div>
            </div>
            <div className="col-span-1 flex justify-end items-end pb-2">
              <div>
                {<ChipStatus status={caseData.caseStatus} data-testid="chip-status" classNames="whitespace-nowrap" />}
              </div>

            </div>
          </div>
        );
      })}


      {paginationControls}
    </div>
  )
}

export default RelatedTab
