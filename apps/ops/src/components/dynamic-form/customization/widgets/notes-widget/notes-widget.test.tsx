import { useUser } from '@auth0/nextjs-auth0/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { updateTask } from '@deps/containers/task-container/task.helpers';
import { reverseNameOrder } from '@deps/helpers/string.helpers';

import NotesWidget from './notes-widget';
import { widgetRegistryMock } from '../widgetMocks';

dayjs.extend(utc);

if (typeof structuredClone === 'undefined') {
    global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

jest.mock('@deps/containers/task-container/task.helpers', () => ({
    updateTask: jest.fn(),
}));

jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const notesData = [
    {
        note: 'Note 1',
        createdAt: '2025-06-23T15:01:50Z',
        user: 'User 1',
    },
    {
        note: 'Note 2',
        createdAt: '2025-06-23T15:01:50Z',
        user: 'User 2',
    },
];

describe.skip('NotesWidget', () => {
    const commonWidgetProps = {
        disabled: false,
        readonly: false,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        options: {},
        required: false,
        rawErrors: [],
        name: '',
        registry: widgetRegistryMock,
    };

    beforeEach(() => {
        (useUser as jest.Mock).mockReturnValue({
            user: { name: 'Doe, John' },
            isLoading: false,
            error: undefined,
        });
    });

    it('should render NotesWidget in widgetView mode without crashing', () => {
        const props = {
            ...commonWidgetProps,
            value: [notesData[0]],
            id: 'root_notes',
            label: 'Notes',
            uiSchema: {},
            schema: {},
            formContext: {
                customData: {
                    task: {
                        data: {
                            notes: [notesData[0]],
                        },
                    },
                    correlationId: 'corr-id-123',
                },
            },
        };
        render(<NotesWidget {...props} />);

        expect(screen.getByText('Note 1')).toBeInTheDocument();
        expect(screen.getByText('User 1')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('notePlaceholder')
        ).toBeInTheDocument();

        const addNoteBtn = screen.getByText('addNote');
        expect(addNoteBtn).toBeInTheDocument();
        expect(addNoteBtn).toBeDisabled();
    });

    it('should render NotesWidget in inlineView mode without crashing', () => {
        const props = {
            ...commonWidgetProps,
            value: notesData,
            id: 'root_notes',
            label: 'Inline Notes',
            uiSchema: {
                'ui:options': {
                    inline: true,
                },
            },
            schema: {},
            formContext: {
                customData: {
                    task: {
                        data: {
                            notes: notesData,
                        },
                    },
                    correlationId: 'corr-id-123',
                },
            },
        };
        render(<NotesWidget {...props} />);

        expect(screen.getByText('Inline Notes')).toBeInTheDocument();
        expect(screen.getByText('Note 1')).toBeInTheDocument();
        expect(screen.getByText('Note 2')).toBeInTheDocument();
    });

    it('should render NotesWidget in inlineWithWidget mode without crashing', () => {
        const props = {
            ...commonWidgetProps,
            value: notesData,
            id: 'root_notes',
            label: 'Notes',
            uiSchema: {
                'ui:options': {
                    inline: true,
                    inlineWithWidget: true,
                    noteEditorTitle: 'Auditor name',
                },
            },
            schema: {},
            formContext: {
                customData: {
                    task: {
                        data: {
                            notes: notesData,
                        },
                    },
                    correlationId: 'corr-id-123',
                },
            },
        };
        render(<NotesWidget {...props} />);

        expect(screen.getAllByText('Auditor name')).toHaveLength(2);
        expect(screen.getAllByText('Notes')).toHaveLength(2);
        expect(screen.getByText('addNote')).toBeInTheDocument();

        expect(screen.getAllByText('Note 1')).toHaveLength(1);
        expect(screen.getAllByText('Note 2')).toHaveLength(1);
        expect(screen.getAllByText('User 1')).toHaveLength(1);
        expect(screen.getAllByText('User 2')).toHaveLength(1);
    });

    it('should allow adding a new note in NotesWidget', async () => {
        (updateTask as jest.Mock).mockResolvedValue(true);
        const props = {
            ...commonWidgetProps,
            value: [notesData[0]],
            id: 'root_notes',
            label: 'Notes',
            uiSchema: {},
            schema: {},
            formContext: {
                customData: {
                    task: {
                        data: {
                            notes: [notesData[0]],
                        },
                    },
                    correlationId: 'corr-id-123',
                },
                setCustomData: jest.fn(),
            },
        };
        render(<NotesWidget {...props} />);

        const addNoteBtn = screen.getByText('addNote');
        expect(addNoteBtn).toBeDisabled();

        const textarea = screen.getByPlaceholderText('notePlaceholder');
        fireEvent.change(textarea, { target: { value: 'New note 2' } });

        expect(textarea).toHaveValue('New note 2');
        expect(addNoteBtn).not.toBeDisabled();

        waitFor(() => fireEvent.click(addNoteBtn));
        // Test that the reverseNameOrder function is applied to the user name
        const formattedName = reverseNameOrder('Doe, John');
        expect(await screen.findByText(formattedName)).toBeInTheDocument();
        expect(await screen.findByText('New note 2')).toBeInTheDocument();

        expect(updateTask).toHaveBeenCalledTimes(1);
        expect(addNoteBtn).toBeDisabled();
        expect(textarea).toHaveValue('');
    });

    it('should log a warning when adding a new note in the widget fails', async () => {
        (updateTask as jest.Mock).mockResolvedValue(false);
        const warnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(() => {});
        const props = {
            ...commonWidgetProps,
            value: [],
            id: 'root_notes',
            label: 'Notes',
            uiSchema: {},
            schema: {},
            formContext: {
                customData: {
                    task: {
                        data: {
                            notes: [],
                        },
                        id: '123',
                    },
                    correlationId: 'corr-id-123',
                },
            },
        };
        render(<NotesWidget {...props} />);

        const textarea = screen.getByPlaceholderText('notePlaceholder');
        fireEvent.change(textarea, { target: { value: 'New note 2' } });
        expect(textarea).toHaveValue('New note 2');

        const addNoteBtn = screen.getByText('addNote');
        expect(addNoteBtn).not.toBeDisabled();
        fireEvent.click(addNoteBtn);

        await waitFor(() => {
            expect(warnSpy).toHaveBeenCalledWith(
                'updateTask::Error updating task',
                { taskId: '123' }
            );
        });
    });

    it('should handle error when adding a new note in the widget fails', async () => {
        (updateTask as jest.Mock).mockRejectedValue(new Error('fail'));
        const errSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        const props = {
            ...commonWidgetProps,
            value: [],
            id: 'root_notes',
            label: 'Notes',
            uiSchema: {},
            schema: {},
            formContext: {
                customData: {
                    task: {
                        data: {
                            notes: [],
                        },
                        id: '123',
                    },
                    correlationId: 'corr-id-123',
                },
            },
        };
        render(<NotesWidget {...props} />);

        const textarea = screen.getByPlaceholderText('notePlaceholder');
        fireEvent.change(textarea, { target: { value: 'New note 2' } });

        const addNoteBtn = screen.getByText('addNote');
        expect(addNoteBtn).not.toBeDisabled();
        fireEvent.click(addNoteBtn);

        await waitFor(() => {
            expect(errSpy).toHaveBeenCalledWith(
                'updateTask::Error updating task',
                { taskId: '123', error: 'fail' }
            );
        });
    });

    it('should disable the Add Note button and text area when the widget is read-only or disabled', async () => {
        const props = {
            ...commonWidgetProps,
            readonly: true,
            value: [notesData[0]],
            id: 'root_notes',
            label: 'Notes',
            uiSchema: {},
            schema: {},
            formContext: {
                customData: {
                    task: {
                        data: {
                            notes: [notesData[0]],
                        },
                    },
                    correlationId: 'corr-id-123',
                },
            },
        };
        render(<NotesWidget {...props} />);

        const textarea = screen.getByPlaceholderText('notePlaceholder');
        expect(textarea).toBeDisabled();

        const addNoteBtn = screen.getByText('addNote');
        expect(addNoteBtn).toBeDisabled();
    });
});
