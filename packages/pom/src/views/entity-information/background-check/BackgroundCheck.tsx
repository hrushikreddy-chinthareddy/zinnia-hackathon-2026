import {
  AssistiveText,
  AssistiveTextVariant,
  Badge,
  BadgeVariant,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@zinnia/bloom/components';

export const BackgroundCheck = () => {
  return (
    <div className="card-section">
      <h2>Background Check</h2>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell className="typography-content-body-sm-bold">
                Carrier
              </TableHeaderCell>
              <TableHeaderCell className="typography-content-body-sm-bold">
                Date requested
              </TableHeaderCell>
              <TableHeaderCell className="typography-content-body-sm-bold">
                Provider
              </TableHeaderCell>
              <TableHeaderCell className="typography-content-body-sm-bold">
                Result Date
              </TableHeaderCell>
              <TableHeaderCell className="typography-content-body-sm-bold">
                Status
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="typography-content-body-sm">
                Primerica
              </TableCell>
              <TableCell className="typography-content-body-sm">
                12/15/2024
              </TableCell>
              <TableCell className="typography-content-body-sm">
                danilo@example.com
              </TableCell>
              <TableCell className="typography-content-body-sm">--</TableCell>
              <TableCell className="typography-content-body-sm">
                <Badge variant={BadgeVariant.INFO} label="In Progress" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="typography-content-body-sm">Acme</TableCell>
              <TableCell className="typography-content-body-sm">
                12/19/2024
              </TableCell>
              <TableCell className="typography-content-body-sm">
                Checkr, Inc.
              </TableCell>
              <TableCell className="typography-content-body-sm">
                12/15/2024
              </TableCell>
              <TableCell className="typography-content-body-sm">
                <Badge variant={BadgeVariant.SUCCESS} label="Approved" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="typography-content-body-sm">
                1/4/2023
              </TableCell>
              <TableCell className="typography-content-body-sm">
                1/4/2023
              </TableCell>
              <TableCell className="typography-content-body-sm">
                BeenVerified
              </TableCell>
              <TableCell className="typography-content-body-sm">--</TableCell>
              <TableCell className="typography-content-body-sm">
                <AssistiveText
                  variant={AssistiveTextVariant.Error}
                  text="Can't complete"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
