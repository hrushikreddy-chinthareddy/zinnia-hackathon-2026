import { Meta, StoryObj } from '@storybook/react';

import { ReactComponent as CompletedIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';
import { ReactComponent as ExclamationCircle } from '@deps/styles/elements/icons/icons_outlined/exclamation-circle-red.svg';

export default {
    title: 'Components/Table/NewTable',
    argTypes: {
        showDueDate: { control: 'boolean' },
        showAssignee: { control: 'boolean' },
    },
} as Meta;

export const Default: StoryObj = {
    render: (args) => {
        const { showDueDate, showAssignee } = args as any;

        return (
            <div className="table-scroll-container">
                <table className="scrollable-table">
                    <caption className="hidden">Sample task table</caption>
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th className="hug">Customer</th>
                            <th>Policy number</th>
                            {showAssignee && <th>Assignee</th>}
                            {showDueDate && (
                                <th className="right-align hug">Due date</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <a
                                    className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                    href="#"
                                >
                                    <CompletedIcon
                                        height={16}
                                        width={16}
                                        className="mb-1 mr-2 inline"
                                    />
                                    Complete suitability review plus some
                                    additional text to prove a point
                                </a>
                            </td>
                            <td className="hug">Chakara Sandhu</td>
                            <td>AU06203119</td>
                            {showAssignee && <td>Jane Connors</td>}
                            {showDueDate && (
                                <td className="right-align hug">
                                    <div
                                        className="flex items-center justify-end gap-2"
                                        aria-label="Urgent Nov 7"
                                    >
                                        <ExclamationCircle
                                            height={16}
                                            width={16}
                                            aria-hidden
                                        />
                                        Nov 7
                                    </div>
                                </td>
                            )}
                        </tr>
                        <tr>
                            <td>
                                <a
                                    className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                    href="#"
                                >
                                    <CompletedIcon
                                        height={16}
                                        width={16}
                                        className="mb-1 mr-2 inline"
                                    />
                                    Provide NAIC documentation
                                </a>
                            </td>
                            <td className="hug">Sidney Fordeloney</td>
                            <td>AU00000102</td>
                            {showAssignee && <td>Jane Connors</td>}
                            {showDueDate && (
                                <td className="right-align hug">
                                    <div
                                        className="flex items-center justify-end gap-2"
                                        aria-label="Urgent Nov 8"
                                    >
                                        <ExclamationCircle
                                            height={16}
                                            width={16}
                                            aria-hidden
                                        />
                                        Nov 8
                                    </div>
                                </td>
                            )}
                        </tr>
                        <tr>
                            <td>
                                <a
                                    className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                    href="#"
                                >
                                    <CompletedIcon
                                        height={16}
                                        width={16}
                                        className="mb-1 mr-2 inline"
                                    />
                                    Complete suitability review
                                </a>
                            </td>
                            <td className="hug">Sidney Fordeloney</td>
                            <td>AU00000102</td>
                            {showAssignee && <td>Jane Connors</td>}
                            {showDueDate && (
                                <td className="right-align hug">
                                    <div
                                        className="flex items-center justify-end gap-2"
                                        aria-label="Urgent Nov 8"
                                    >
                                        <ExclamationCircle
                                            height={16}
                                            width={16}
                                            aria-hidden
                                        />
                                        Nov 8
                                    </div>
                                </td>
                            )}
                        </tr>
                        <tr>
                            <td>
                                <a
                                    className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                    href="#"
                                >
                                    <CompletedIcon
                                        height={16}
                                        width={16}
                                        className="mb-1 mr-2 inline"
                                    />
                                    Complete suitability review
                                </a>
                            </td>
                            <td className="hug">Annette Black</td>
                            <td>AU00000071</td>
                            {showAssignee && <td>Jane Connors</td>}
                            {showDueDate && (
                                <td className="right-align hug">
                                    <div
                                        className="flex items-center justify-end gap-2"
                                        aria-label="Urgent Nov 12"
                                    >
                                        <ExclamationCircle
                                            height={16}
                                            width={16}
                                            aria-hidden
                                        />
                                        Nov 12
                                    </div>
                                </td>
                            )}
                        </tr>
                        <tr>
                            <td>
                                <a
                                    className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                    href="#"
                                >
                                    <CompletedIcon
                                        height={16}
                                        width={16}
                                        className="mb-1 mr-2 inline"
                                    />
                                    Complete suitability review
                                </a>
                            </td>
                            <td className="hug">Jonathan Campbell</td>
                            <td>AU34229007</td>
                            {showAssignee && <td>Jane Connors</td>}
                            {showDueDate && (
                                <td className="right-align hug">
                                    <div
                                        className="flex items-center justify-end gap-2"
                                        aria-label="Urgent Nov 16"
                                    >
                                        <ExclamationCircle
                                            height={16}
                                            width={16}
                                            aria-hidden
                                        />
                                        Nov 16
                                    </div>
                                </td>
                            )}
                        </tr>
                        <tr>
                            <td>
                                <a
                                    className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                    href="#"
                                >
                                    <CompletedIcon
                                        height={16}
                                        width={16}
                                        className="mb-1 mr-2 inline"
                                    />
                                    Verify agent information
                                </a>
                            </td>
                            <td className="hug">Chakara Sandhu</td>
                            <td>AU06203119</td>
                            {showAssignee && <td>Jane Connors</td>}
                            {showDueDate && (
                                <td className="right-align hug">
                                    <div
                                        className="flex items-center justify-end gap-2"
                                        aria-label="Urgent Nov 17"
                                    >
                                        <ExclamationCircle
                                            height={16}
                                            width={16}
                                            aria-hidden
                                        />
                                        Nov 17
                                    </div>
                                </td>
                            )}
                        </tr>
                        <tr>
                            <td>
                                <a
                                    className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                    href="#"
                                >
                                    <CompletedIcon
                                        height={16}
                                        width={16}
                                        className="mb-1 mr-2 inline"
                                    />
                                    Verify agent information
                                </a>
                            </td>
                            <td className="hug">Jonathan Campbell</td>
                            <td>AU34229007</td>
                            {showAssignee && <td>Jane Connors</td>}
                            {showDueDate && (
                                <td className="right-align hug">
                                    <div
                                        className="flex items-center justify-end gap-2"
                                        aria-label="Urgent Nov 17"
                                    >
                                        <ExclamationCircle
                                            height={16}
                                            width={16}
                                            aria-hidden
                                        />
                                        Nov 17
                                    </div>
                                </td>
                            )}
                        </tr>
                        <tr>
                            <td>
                                <a
                                    className="block overflow-hidden text-ellipsis whitespace-nowrap"
                                    href="#"
                                >
                                    <CompletedIcon
                                        height={16}
                                        width={16}
                                        className="mb-1 mr-2 inline"
                                    />
                                    Complete suitability review
                                </a>
                            </td>
                            <td className="hug">Marvin McKinney</td>
                            <td>AU00421345</td>
                            {showAssignee && <td>Jane Connors</td>}
                            {showDueDate && (
                                <td className="right-align hug">Nov 20</td>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    },
    args: {
        showDueDate: true,
        showAssignee: true,
    },
};
