import { fireEvent, render, waitFor } from "@testing-library/react";
import { UserResponse } from "@xd/api-types/dist/generated-types/knowledgebase";

import { DEFAULT_LOCALE } from "@deps/helpers/routing.helpers";
import { getAllUserDetails, searchUser } from "@deps/queries/api/knowledge-base";
import { SortBy, SortDirection } from "@deps/types/knowledge-base";

import SystemUsersTab from "./system-users-tab";

const mockUsers: UserResponse[] = [
  {
    id: "user-1",
    name: "Test User1",
    email: "test.user1@zinnia.com",
    role: UserResponse.role.ADMIN,
    conductorOneUserId: "conductorOne-user-1",
    createdAt: "2025-07-23T11:59:55.644",
    updatedAt: "2025-07-23T11:59:55.644"
  }
];
const mockBrowserLogError = jest.fn();

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: DEFAULT_LOCALE,
    },
  }),
}));

jest.mock('@deps/queries/api/knowledge-base', () => ({
  getAllUserDetails: jest.fn(),
  searchUser: jest.fn(),
}));

jest.mock('@deps/utils/browser-logging', () => {
  return {
    browserLogError: (...args: any[]) => mockBrowserLogError(...args),
  };
});

describe('SystemUsersTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  it('fetches and displays the system users on render', async () => {
    (getAllUserDetails as jest.Mock).mockResolvedValue({
      content: mockUsers,
      last: true,
      first: true,
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1
    });
    const { getByText } = render(<SystemUsersTab />);
    await waitFor(() => {
      expect(getAllUserDetails).toHaveBeenCalledWith(
        0,
        10,
        SortBy.CreatedAt,
        SortDirection.Desc
      );
      expect(getByText(mockUsers[0].name as string)).toBeInTheDocument();
    });
  });

  it('shows no users found when no users are returned', async () => {
    (getAllUserDetails as jest.Mock).mockResolvedValue({
      content: [],
      last: true,
      first: true,
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 1
    });
    const { getByText } = render(<SystemUsersTab />);
    await waitFor(() => {
      expect(getByText('admin.users.noUsersFound')).toBeInTheDocument();
    })
  });

  it('logs error when users cannot be fetched', async () => {
    (getAllUserDetails as jest.Mock).mockRejectedValue(new Error('Network error'));
    render(<SystemUsersTab />);

    await waitFor(() => {
      expect(getAllUserDetails).toHaveBeenCalledWith(
        0,
        10,
        SortBy.CreatedAt,
        SortDirection.Desc
      );
      expect(mockBrowserLogError).toHaveBeenCalled();
    })
  });

  it('throws an error when no user data is returned', async () => {
    (getAllUserDetails as jest.Mock).mockResolvedValue(undefined);
    const { findByText } = render(<SystemUsersTab />);
    const errorMessage = await findByText('admin.users.noUsersFound');
    expect(errorMessage).toBeInTheDocument();
  });

  it('gives matching users on providing a search term with 3+ characters', async () => {
    (getAllUserDetails as jest.Mock).mockResolvedValue({
      content: mockUsers,
      last: true,
      first: true,
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1
    });
    (searchUser as jest.Mock).mockResolvedValue(mockUsers);
    const { getByPlaceholderText, getByText } = render(<SystemUsersTab />);

    await waitFor(() => {
      expect(getAllUserDetails).toHaveBeenCalled();
    });

    const searchInput = getByPlaceholderText('admin.users.search');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(searchUser).toHaveBeenCalledWith('Test');
      expect(getByText(mockUsers[0].name as string)).toBeInTheDocument();
    });
  });

  it('shows no user found when no user matches the search', async () => {
    (getAllUserDetails as jest.Mock).mockResolvedValue({
      content: mockUsers,
      last: true,
      first: true,
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1
    });
    (searchUser as jest.Mock).mockResolvedValue([]);
    const { getByPlaceholderText, getByText } = render(<SystemUsersTab />);

    await waitFor(() => {
      expect(getAllUserDetails).toHaveBeenCalled();
    });

    const searchInput = getByPlaceholderText('admin.users.search');
    fireEvent.change(searchInput, { target: { value: 'Test2' } });

    await waitFor(() => {
      expect(searchUser).toHaveBeenCalledWith('Test2');
      expect(getByText('admin.users.noUsersFound')).toBeInTheDocument();
    });

  });

  it('logs error when no user data is returned after search', async () => {
    (searchUser as jest.Mock).mockResolvedValue(undefined);
    const { getByPlaceholderText } = render(<SystemUsersTab />);

    await waitFor(() => {
      expect(getAllUserDetails).toHaveBeenCalled();
    });

    const searchInput = getByPlaceholderText('admin.users.search');
    fireEvent.change(searchInput, { target: { value: 'Test2' } });

    await waitFor(() => {
      expect(mockBrowserLogError).toHaveBeenCalled();
    })
  });

  it('sorts the users by name', async () => {
    (getAllUserDetails as jest.Mock).mockResolvedValue({
      content: [
        {
          id: "user-2",
          name: "Test User2",
          email: "test.user2@zinnia.com",
          role: UserResponse.role.ASSOCIATE,
          conductorOneUserId: "conductorOne-user-2",
          createdAt: "2025-07-23T11:59:55.644",
          updatedAt: "2025-07-23T11:59:55.644"
        },
        {
          id: "user-1",
          name: "Test User1",
          email: "test.user1@zinnia.com",
          role: UserResponse.role.ASSOCIATE,
          conductorOneUserId: "conductorOne-user-1",
          createdAt: "2025-07-23T11:59:55.644",
          updatedAt: "2025-07-23T11:59:55.644"
        }
      ],
      last: true,
      first: true,
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1
    });

    const { getByText, findAllByTestId } = render(<SystemUsersTab />);
    await waitFor(() => {
      expect(getAllUserDetails).toHaveBeenCalled();
    });

    const nameHeader = getByText('admin.users.name');
    fireEvent.click(nameHeader);
    const nameCells = await findAllByTestId('system-user-name');

    const names = nameCells.map(cell => cell.textContent);
    const expectedSorted = [...names].sort((a, b) => a!.localeCompare(b!));
    expect(names).toEqual(expectedSorted);
  });

  it('sorts the users by updated and created date', async () => {
    (getAllUserDetails as jest.Mock).mockResolvedValue({
      content: [
        {
          id: "user-2",
          name: "Test User2",
          email: "test.user2@zinnia.com",
          role: UserResponse.role.ASSOCIATE,
          conductorOneUserId: "conductorOne-user-2",
          createdAt: "2025-07-24T09:10:00.000",
          updatedAt: "2025-07-25T14:20:00.000"
        },
        {
          id: "user-1",
          name: "Test User1",
          email: "test.user1@zinnia.com",
          role: UserResponse.role.ASSOCIATE,
          conductorOneUserId: "conductorOne-user-1",
          createdAt: "2025-07-22T08:00:00.000",
          updatedAt: "2025-07-23T10:30:00.000"
        }
      ],
      last: true,
      first: true,
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1
    });

    const { getByText, findAllByTestId } = render(<SystemUsersTab />);
    await waitFor(() => {
      expect(getAllUserDetails).toHaveBeenCalled();
    });

    const updatedDateHeader = getByText('admin.users.updatedDate');
    fireEvent.click(updatedDateHeader);
    const updatedDateCells = await findAllByTestId('system-user-updated-date');
    const updatedDates = updatedDateCells.map(cell => cell.textContent!.trim());
    const parsedUpdatedDates = updatedDates.map(date => new Date(date).getTime());
    const expectedSorted = [...parsedUpdatedDates].sort((a, b) => b - a);
    expect(parsedUpdatedDates).toEqual(expectedSorted);

    const createdDateHeader = getByText('admin.users.createdDate');
    fireEvent.click(createdDateHeader);

    const createdDateCells = await findAllByTestId('system-user-created-date');
    const createdDates = createdDateCells.map(cell => cell.textContent!.trim());
    const parsedCreatedDates = createdDates.map(date => new Date(date).getTime());
    const expectedCreatedSorted = [...parsedCreatedDates].sort((a, b) => b - a);
    expect(parsedCreatedDates).toEqual(expectedCreatedSorted);
  });

})