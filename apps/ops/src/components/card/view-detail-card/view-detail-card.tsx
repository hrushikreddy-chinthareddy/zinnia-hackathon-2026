import Typography, { TypographyVariant } from '@deps/components/typography/typography';
interface ViewDetailCardProps {
    cardTitle: string;
    cardValue: string;
}
function ViewDetailCard({ cardTitle, cardValue }: ViewDetailCardProps) {
    return (
        <div>
            <div className=" gap-3 align-bottom px-5 py-8 border-b-2 border-gray-100">
                <Typography variant={TypographyVariant.H4} className="line-clamp-5 break-normal text-gray-500">
                    {cardTitle}
                </Typography>
                <Typography variant={TypographyVariant.Body} className="line-clamp-5 break-normal  ">
                    {cardValue}
                </Typography>
            </div>
        </div>
    );
}

export default ViewDetailCard;
