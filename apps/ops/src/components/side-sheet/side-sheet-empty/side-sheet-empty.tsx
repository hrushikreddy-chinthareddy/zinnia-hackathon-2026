import CardInfo from '@deps/components/card/card-info/card-info';

export type SideSheetEmptyProps = {
    icon: React.ReactNode;
    header: string;
    text: string;
};

export default function SideSheetEmpty({ icon, header, text }: SideSheetEmptyProps) {
    return <CardInfo icon={icon} title={header} subtitle={text} className="mt-8" />;
}
