
import { render, fireEvent, within } from '@testing-library/react';
import { MeResponse } from '@xd/api-types/dist/generated-types/knowledgebase';
import { useRouter } from 'next/router';

import { useKnowledgeBaseContext } from '@deps/contexts/KnowledgeBaseContext';
import { DocumentsDisplayType } from '@deps/types/knowledge-base';

import KnowledgeBaseSidenav, { KnowledgeBasePaths } from './knowledge-base-sidenav';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@deps/contexts/KnowledgeBaseContext', () => ({
  useKnowledgeBaseContext: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@deps/components/select/select', () => ({
  __esModule: true,
  default: ({ value, options, onChange }: any) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="mock-select"
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

const mockOpsUserData = {
  client: [
    { id: '123', name: 'Client-One', default: true },
    { id: '456', name: 'Client-Two', default: false }
  ],
  role: MeResponse.role.ADMIN,
};

describe('KnowledgeBaseSidenav', () => {
  const mockPush = jest.fn();
  const mockSetSelectedClient = jest.fn();
  const mockStartNewChatSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/zinnia-ai-assistant/chat',
      query: {},
      push: mockPush,
    });

    (useKnowledgeBaseContext as jest.Mock).mockReturnValue({
      selectedClientId: '123',
      setSelectedClient: mockSetSelectedClient,
      startNewChatSession: mockStartNewChatSession,
    });
  });

  it('renders client select with options', () => {
    const { getByRole } = render(
      <KnowledgeBaseSidenav opsUserData={mockOpsUserData} />
    );

    const select = getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(within(select).getByText('Client One')).toBeInTheDocument();
  });

  it('calls setSelectedClient and startNewChatSession on client change', async () => {
    const { getByRole } = render(<KnowledgeBaseSidenav opsUserData={mockOpsUserData as any} />);

    fireEvent.change(getByRole('combobox'), {
      target: { value: '456' },
    });

    expect(mockSetSelectedClient).toHaveBeenCalledWith('456');
    expect(mockStartNewChatSession).toHaveBeenCalled();
  });


  it('navigates to chat and resets session on "New Chat" click', () => {
    const { getByRole } = render(<KnowledgeBaseSidenav opsUserData={mockOpsUserData as any} />);

    fireEvent.click(getByRole('button', { name: /sidenav.newChat/i }));
    expect(mockPush).toHaveBeenCalledWith(KnowledgeBasePaths.chat, undefined, { shallow: true });
    expect(mockStartNewChatSession).toHaveBeenCalled();
  });

  it('navigates to chat if not already on chat page and resets session on "New Chat" click', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/zinnia-ai-assistant/documents',
      query: {},
      push: mockPush,
    });

    const { getByRole } = render(<KnowledgeBaseSidenav opsUserData={mockOpsUserData as any} />);

    fireEvent.click(getByRole('button', { name: /sidenav.newChat/i }));

    expect(mockPush).toHaveBeenCalledWith(KnowledgeBasePaths.chat);
    expect(mockPush).toHaveBeenCalledWith('/zinnia-ai-assistant/documents', undefined, { shallow: true });
    expect(mockStartNewChatSession).toHaveBeenCalled();
  });

  it('navigates to recent documents when clicked', () => {
    const { getByText } = render(<KnowledgeBaseSidenav opsUserData={mockOpsUserData as any} />);

    fireEvent.click(getByText(/sidenav.recentlyAdded/i));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: KnowledgeBasePaths.documents,
      query: { docs: DocumentsDisplayType.Recent },
    });
  });

  it('navigates to recently modified documents when clicked', () => {
    const { getByText } = render(<KnowledgeBaseSidenav opsUserData={mockOpsUserData as any} />);

    fireEvent.click(getByText(/sidenav.recentlyModified/i));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: KnowledgeBasePaths.documents,
      query: { docs: DocumentsDisplayType.Updated },
    });
  });

  it('navigates to all documents when clicked', () => {
    const { getByText } = render(<KnowledgeBaseSidenav opsUserData={mockOpsUserData as any} />);

    fireEvent.click(getByText(/sidenav.allDocs/i));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: KnowledgeBasePaths.documents,
      query: { docs: DocumentsDisplayType.All },
    });
  });

  it('shows admin button if user is ADMIN', () => {
    const { getByText } = render(<KnowledgeBaseSidenav opsUserData={mockOpsUserData} />);

    expect(getByText(/sidenav.settings/i)).toBeInTheDocument();
    fireEvent.click(getByText(/sidenav.settings/i));
    expect(mockPush).toHaveBeenCalledWith(KnowledgeBasePaths.admin);
  });

  it('hides admin button if user is not ADMIN', () => {
    const { queryByText } = render(<KnowledgeBaseSidenav opsUserData={{ ...mockOpsUserData, role: MeResponse.role.ASSOCIATE } as any} />);
    expect(queryByText(/sidenav.settings/i)).not.toBeInTheDocument();
  });
});