import { Button } from '@zinnia/bloom/components';
import PomTable from '../../components/pom-table/PomTable';
import type { Meta, StoryObj } from '@storybook/react';

const mockHeaders = {
  column1: 'Column 1',
  column2: 'Column 2',
  column3: 'Column 3',
};

const mockRows = [
  {
    column1: 'Value 1',
    column2: 'Value 2',
    column3: 'Value 3',
  },
  {
    column1: 'Value 4',
    column2: 'Value 5',
    column3: 'Value 6',
  },
  {
    column1: 'Value 7',
    column2: 'Value 8',
    column3: 'Value 9',
  },
  {
    column1: 'Value 10',
    column2: 'Value 11',
    column3: 'Value 12',
  },
];

const meta = {
  title: 'Components/PomTable',
  component: PomTable,
  args: {
    headers: mockHeaders,
    rows: mockRows,
  },
} satisfies Meta<typeof PomTable>;

export default meta;

type StoryType = StoryObj<typeof meta>;

export const Default: StoryType = {};

export const customHeaderLabels: StoryType = {
  args: {
    headers: {
      column1: 'Custom Column 1',
      column2: "Betcha can't guess the label would be column 2",
      column3: (
        <Button size="small" mode="link">
          You can make the label a button too
        </Button>
      ),
    },
    rows: mockRows,
  },
};

const [first, second, ...rest] = mockRows;

export const expandyRows: StoryType = {
  args: {
    headers: {
      column1: 'Column 1',
      column2: 'Column 2',
      column3: 'Column 3',
    },
    rows: [
      first,
      second,
      [
        {
          column1: 'Value 1',
          column2: 'Value 2',
          column3: 'Value 3',
        },
        {
          column1: 'Value 4 expand',
          column2: 'Value 5 expand',
          column3: 'Value 6 expand',
        },
        {
          column1: 'Value 7 expand',
          column2: 'Value 8 expand',
          column3: 'Value 9 expand',
        },
      ],
      ...rest,
    ],
  },
};
