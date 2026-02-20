import { Loader, LoaderVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Image from 'next/image';
import NextLink from 'next/link';

import Badge from '@deps/components/badge/badge';
import CaseDetailField from '@deps/components/card/case-search-card/case-detail-field';
import Content, { ContentVariant } from '@deps/components/content/content';
import Dropdown from '@deps/components/dropdown/Dropdown';
import { PartyWithOthers } from '@deps/components/table/case-result-table';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getValidFullName } from '@deps/helpers/case-management';
import { getAgents, getPolicyOwners } from '@deps/helpers/parties';
import {
    formatSSN,
    toSentenceCase,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { EarlyTaskType } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ReactComponent as Warning } from '@deps/styles/elements/icons/alert/warning.svg';
import { ReactComponent as Progress } from '@deps/styles/elements/icons/icons_outlined/clipboard-list.svg';
import { getCarrierLogoByClientId } from '@deps/utils/carriers';
import { DEFAULT_DATE_FORMAT } from '@deps/utils/dates';

import cellRendererStyle from './task-queue-cell-renderer.module.css';
import { StatusItem } from './task-queue-table-row';
import { stopPropagation } from './task-queue-utils';

export const StickyWrap = (styles: any, children: React.ReactNode) => (
    <>
        <>
            <div className={styles.stickyBgLayer}></div>
            <div className={styles.stickyContent}>{children}</div>
        </>
    </>
);

export const createCellRenderers = (ctx: {
    task: any;
    t: any;
    styles: any;
    carrierName: string;
    showBadge: boolean;
    badgeIcon: JSX.Element;
    badgeVariant: any;
    badgeLabel: string;
    statuses: StatusItem[];
    actionLoader: boolean;

    AssigneeComponent: JSX.Element;
    getTimeText: (v?: string) => string;

    isOpsManagerView: boolean;
}) => {
    const { task, styles } = ctx;

    const parties = task?.parties ?? [];
    const agents = getAgents(parties);
    const policyOwners = task.parties ? getPolicyOwners(task.parties) : [];

    const toNameSsnEntity = (
        party: Parameters<typeof getValidFullName>[0] & { ssn?: string }
    ) => ({
        name: toTitleCase(getValidFullName(party)),
        ssn: formatSSN(party.ssn),
    });
    const formatPrimarySsn = (party?: { ssn?: string } | null) =>
        party?.ssn ? formatSSN(party.ssn) : undefined;

    const ownerEntities = policyOwners.slice(1).map(toNameSsnEntity);
    const ownerSsn = formatPrimarySsn(policyOwners[0]);
    const ownerComponentProps = {
        text: toTitleCase((getValidFullName(policyOwners[0]) ?? '')?.trim()),
        highlights: [],
        entities: ownerEntities,
        truncate: true,
    };

    const otherAgents = agents.slice(1).map(toNameSsnEntity);
    const agentSsn = formatPrimarySsn(agents[0]);
    const agentComponentProps = {
        text: toTitleCase(getValidFullName(agents[0]) ?? ''),
        highlights: [],
        entities: otherAgents,
        truncate: true,
    };

    return {
        task: () => (
            <>
                <Content
                    contentClassName={cellRendererStyle.taskContent}
                    triggerClassName="text-left"
                    truncate
                    details={toSentenceCase(task.taskName)}
                    variant={ContentVariant.BodySm}
                />
                <Content
                    truncate
                    contentClassName={cellRendererStyle.taskContent}
                    triggerClassName="text-left"
                    className={`${styles.fadedText} truncate w-full`}
                    details={toSentenceCase(task.process)}
                    variant={ContentVariant.BodySm}
                />
            </>
        ),
        status: () =>
            task?.status === TaskStatus.InProgress &&
            task?.queue &&
            !ctx.isOpsManagerView &&
            !Object.values(EarlyTaskType).includes(task?.taskType) ? (
                <div
                    data-stop-row-activation
                    onClick={(e) => stopPropagation(e)}
                    onKeyDown={(e) => stopPropagation(e)}
                >
                    <Dropdown
                        triggerIcon={
                            <div className={cellRendererStyle.statusTrigger}>
                                <Progress width={16} height={16} />
                            </div>
                        }
                        triggerLabel="In Progress"
                        options={ctx.statuses}
                    />
                </div>
            ) : (
                <Badge
                    icon={ctx.badgeIcon}
                    variant={ctx.badgeVariant}
                    label={ctx.badgeLabel}
                    rounded
                    className={cellRendererStyle.badgeContainer}
                />
            ),

        carrierCase: () => (
            <div className={cellRendererStyle.flex}>
                <div className={cellRendererStyle.iconBox}>
                    <Image
                        src={getCarrierLogoByClientId(task.carrier)}
                        alt={`${task.carrier} icon`}
                        role="presentation"
                        height={16}
                        width={16}
                    />
                </div>

                <div className={cellRendererStyle.minWidth0}>
                    <Content
                        details={ctx.carrierName}
                        variant={ContentVariant.BodySm}
                    />

                    <div
                        className={clsx(
                            cellRendererStyle.flex,
                            cellRendererStyle.itemsCenter,
                            cellRendererStyle.minWidth0,
                            cellRendererStyle.fullWidth
                        )}
                    >
                        <Typography
                            className={clsx(
                                cellRendererStyle.flexAuto,
                                cellRendererStyle.truncate
                            )}
                            variant={TypographyVariant.BodySm}
                        >
                            {ctx.t('caseId')}
                        </Typography>

                        {task.caseId ? (
                            <NextLink
                                href={`/cases/${task.caseId}`}
                                className={clsx(
                                    cellRendererStyle.caseLink,
                                    ctx.isOpsManagerView &&
                                        cellRendererStyle.z10
                                )}
                            >
                                {task.caseId}
                            </NextLink>
                        ) : (
                            <Content
                                className={cellRendererStyle.secondaryText}
                                details="-"
                                variant={ContentVariant.BodySm}
                            />
                        )}

                        {ctx.showBadge && (
                            <Warning
                                height={16}
                                width={16}
                                className={cellRendererStyle.ml2}
                            />
                        )}
                    </div>
                </div>
            </div>
        ),

        owner: () => (
            <div className={cellRendererStyle.flexCol}>
                <Typography variant={TypographyVariant.BodySm}>
                    {policyOwners.length > 1 ? (
                        <PartyWithOthers {...ownerComponentProps} />
                    ) : (
                        <CaseDetailField pii={true} {...ownerComponentProps} />
                    )}
                </Typography>

                {ownerSsn && (
                    <CaseDetailField
                        pii={true}
                        text={ownerSsn}
                        className={cellRendererStyle.detail}
                    />
                )}
            </div>
        ),
        agent: () => (
            <div className={cellRendererStyle.flexCol}>
                <Typography variant={TypographyVariant.BodySm}>
                    {agents.length > 1 ? (
                        <PartyWithOthers {...agentComponentProps} />
                    ) : (
                        <CaseDetailField pii={true} {...agentComponentProps} />
                    )}
                </Typography>
                {agentSsn && (
                    <CaseDetailField
                        pii={true}
                        text={agentSsn}
                        className={cellRendererStyle.detail}
                    />
                )}
            </div>
        ),

        assignee: () =>
            ctx.actionLoader ? (
                <div className={cellRendererStyle.assigneeLoader}>
                    <Loader variant={LoaderVariant.CTA} />
                </div>
            ) : (
                ctx.AssigneeComponent
            ),

        createdAt: () => (
            <Typography
                variant={TypographyVariant.BodySm}
                className={styles.fadedText}
            >
                {ctx.getTimeText(task.createdAt)}
            </Typography>
        ),

        updatedAt: () => (
            <Typography
                variant={TypographyVariant.BodySm}
                className={styles.fadedText}
            >
                {ctx.getTimeText(task.updatedAt)}
            </Typography>
        ),

        policyNumber: () => (
            <Typography variant={TypographyVariant.BodySm}>
                {task?.policyNumber ?? '-'}
            </Typography>
        ),

        scheduledDate: () => (
            <Typography
                variant={TypographyVariant.BodySm}
                className={styles.fadedText}
            >
                {(task?.scheduledDate &&
                    dayjs(task.scheduledDate).format(DEFAULT_DATE_FORMAT)) ??
                    '-'}
            </Typography>
        ),

        linkSpacer: () => null,
    };
};
