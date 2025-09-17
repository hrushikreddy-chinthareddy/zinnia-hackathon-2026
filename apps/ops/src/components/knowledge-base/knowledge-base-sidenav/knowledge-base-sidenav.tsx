import { MeResponse } from "@xd/api-types/dist/generated-types/knowledgebase";
import { Icon, IconType } from "@zinnia/bloom/components";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

import SelectComponent from "@deps/components/select/select";
import Typography, { TypographyVariant } from "@deps/components/typography/typography";
import { TranslationFiles } from "@deps/config/translations";
import { useKnowledgeBaseContext } from "@deps/contexts/KnowledgeBaseContext";
import { DocumentsDisplayType, KnowledgeBasePages } from "@deps/types/knowledge-base";

import styles from './knowledge-base-sidenav.module.css';
import RecentChat from "../chat/recent-chat/recent-chat";

type KnowledgeBaseSidenavProps = {
  opsUserData: MeResponse;
}

export const KnowledgeBasePaths = {
  chat: "/zinnia-ai-assistant/chat",
  documents: "/zinnia-ai-assistant/documents",
  admin: "/zinnia-ai-assistant/admin",
}

const KnowledgeBaseSidenav = ({ opsUserData }: KnowledgeBaseSidenavProps) => {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'zinniaAiAssistant', });
  const { selectedClientId, setSelectedClient, startNewChatSession } = useKnowledgeBaseContext();
  const router = useRouter();

  const clientNameCleanup = (name: string) => {
    return name.replace(/\.aspx$/i, "").replace(/-/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2")
  }

  const clientOptions = opsUserData?.client?.map((client) => {
    const clientOption = {
      value: client.id || '',
      textValue: client.name || '',
      label: clientNameCleanup(client?.name || ''),
    };
    return clientOption;
  }) || [];

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    startNewChatSession();
  };

  const handleStartNewChat = () => {
    const currentPage = router.pathname.split('/').pop();
    if (currentPage !== KnowledgeBasePages.CHAT) {
      router.push(KnowledgeBasePaths.chat);
    }
    const urlParams = new URLSearchParams(router.query as Record<string, string>);
    urlParams.delete('sessionId');

    const queryString = urlParams.toString();
    const newPath = queryString
      ? `${router.pathname}?${queryString}`
      : router.pathname;

    router.push(newPath, undefined, { shallow: true });
    startNewChatSession();
  }

  const handleShowSharepointDocuments = (docs: DocumentsDisplayType) => {
    router.push({
      pathname: KnowledgeBasePaths.documents,
      query: { docs },
    });
  };

  const handleShowAdminPage = () => {
    if (opsUserData?.role === MeResponse.role.ADMIN) {
      router.push(KnowledgeBasePaths.admin);
    }
  };

  return (
    <div className="w-[250px] h-full border-l-1 border-gray-100 px-4 flex flex-col justify-between py-2">
      <div>
        <SelectComponent
          value={selectedClientId}
          options={clientOptions}
          onChange={handleClientChange} />

        <button
          type="button"
          className={`flex gap-2 w-full py-1 px-2 text-gray-500 mt-6 mb-2 ${styles.itemhover}`}
          onClick={handleStartNewChat}
        >
          <Icon type={IconType.EDIT_ALT} />
          <Typography variant={TypographyVariant.BodySm}>
            {t('sidenav.newChat')}
          </Typography>
        </button>

        <div className="text-gray-500">
          <div
            className={`flex gap-2 w-full py-1 px-2 mb-1 ${router.pathname.includes('documents') &&
              styles.activeItem
              }`}
          >
            <Icon type={IconType.DOCUMENT_DUPLICATE} />
            <Typography variant={TypographyVariant.BodySm}>
              {t('sidenav.sharepointDocuments')}
            </Typography>
          </div>
          <ul className="list-disc px-4 ml-8 flex flex-col gap-1">
            <li
              className={`${router.query.docs ===
                DocumentsDisplayType.Recent &&
                styles.activeDocType
                } ${styles.itemhover} pl-1`}
            >
              <button
                type="button"
                onClick={() =>
                  handleShowSharepointDocuments(
                    DocumentsDisplayType.Recent
                  )
                }
              >
                <Typography variant={TypographyVariant.BodySm}>
                  {t('sidenav.recentlyAdded')}
                </Typography>
              </button>
            </li>
            <li
              className={`${router.query.docs ===
                DocumentsDisplayType.Updated &&
                styles.activeDocType
                } ${styles.itemhover} pl-1`}
            >
              <button
                type="button"
                onClick={() =>
                  handleShowSharepointDocuments(
                    DocumentsDisplayType.Updated
                  )
                }
              >
                <Typography variant={TypographyVariant.BodySm}>
                  {t('sidenav.recentlyModified')}
                </Typography>
              </button>
            </li>
            <li
              className={`${(router.query.docs ===
                DocumentsDisplayType.All ||
                (router.pathname.includes('documents') &&
                  !router.query.docs)) &&
                styles.activeDocType
                } ${styles.itemhover} pl-1`}
            >
              <button
                type="button"
                onClick={() =>
                  handleShowSharepointDocuments(
                    DocumentsDisplayType.All
                  )
                }
              >
                <Typography variant={TypographyVariant.BodySm}>
                  {t('sidenav.allDocs')}
                </Typography>
              </button>
            </li>
          </ul>
        </div>

        <RecentChat opsUserData={opsUserData} />
      </div>
      <div>

        {opsUserData.role === MeResponse.role.ADMIN && (
          <button
            type="button"
            className={`flex gap-2 w-full py-1 px-2 text-gray-500 mt-6 ${router.pathname.includes('admin') && styles.activeItem
              } ${styles.itemhover}`}
            onClick={handleShowAdminPage}
          >
            <Icon type={IconType.COG} />
            <Typography variant={TypographyVariant.BodySm}>
              {t('sidenav.settings')}
            </Typography>
          </button>
        )}

      </div>
    </div>
  )
}

export default KnowledgeBaseSidenav