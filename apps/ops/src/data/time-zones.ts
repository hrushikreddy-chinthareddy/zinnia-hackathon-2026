export enum TimeZoneAbbreviations {
    akt = 'AKT',
    ct = 'CT',
    et = 'ET',
    ht = 'HT',
    mt = 'MT',
    pt = 'PT',
}

export type TimeZoneObject = {
    abbreviation: TimeZoneAbbreviations;
    label: string;
};
