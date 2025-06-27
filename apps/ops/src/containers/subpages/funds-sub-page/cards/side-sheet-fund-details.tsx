import Content, { ContentVariant } from '@deps/components/content/content';
import FieldData from '@deps/components/fields/field-data/field-data';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import SegmentsTable from './segments-table';
import { FundViewModel } from '../types';

interface SideSheetFundDetailsProps {
    fund?: FundViewModel;
}
const SideSheetFundDetails = ({ fund }: SideSheetFundDetailsProps) => {
    if (!fund) {
        return <span>No fund</span>;
    }

    return (
        <div className="p-8">
            <div className="flex flex-col gap-4 pb-8">
                <div className="flex flex-col gap-1">
                    <Typography variant={TypographyVariant.H3}>
                        {fund.fundName}
                    </Typography>
                    <Content
                        details={fund.type}
                        variant={ContentVariant.Caption}
                    />
                </div>
                <div className="flex gap-8">
                    <FieldData
                        label={'Fund value'}
                        tooltipTitle={'Fund value tooltip title'}
                        tooltipBody={'Fund value tooltip body'}
                    >
                        {fund.fundValue}
                    </FieldData>
                    <FieldData
                        label={'Allocation'}
                        tooltipTitle={'Allocation tooltip title'}
                        tooltipBody={'Allocation tooltip body'}
                    >
                        {fund.allocation}
                    </FieldData>
                </div>
                <div>
                    <SegmentsTable fund={fund} />
                </div>
            </div>
        </div>
    );
};

export default SideSheetFundDetails;
