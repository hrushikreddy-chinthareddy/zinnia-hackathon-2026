export interface ComparisonTableRowProps {
  label: string;
  onEdit?: () => void;
  isNew?: boolean;
  newValue: React.ReactNode;
  currentValue?: React.ReactNode;
}

export interface ComparisonTableProps {
  newValueHeader: string;
  currentValueHeader?: string;
  data: Record<string, ComparisonTableRowProps>;
}

export interface ComparisonFieldProps {
  header?: React.ReactNode;
  subtext?: React.ReactNode;
  isNew?: boolean;
  onEdit?: () => void;
}
