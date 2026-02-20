export const AXIS_TITLE_STYLE: Highcharts.CSSObject = {
    color: 'var(--color-base-text-primary)',
    fontSize: 'var(--measure-dimension-font-size-md, 14px)',
    fontWeight: '700',
    fontFamily: 'Lato',
};

export const AXIS_LABEL_STYLE = {
    color: 'var(--color-base-text-primary)',
    fontSize: 'var(--measure-dimension-font-size-sm, 13px)',
    fontWeight: '600',
    fontFamily: 'Lato',
};

export const DRILLDOWN_STYLES = {
    breadcrumbs: {
        buttonTheme: {
            style: {
                fontSize: 'var(--measure-dimension-font-size-sm, 13px)',
                fontWeight: '600',
                color: 'var(--color-base-text-link)',
                fontFamily: 'Lato',
            },
            states: {
                hover: {
                    fill: 'transparent',
                    stroke: 'transparent',
                },
            },
        },
        separator: {
            text: ' / ',
            style: {
                color: 'var(--color-base-text-secondary)',
                fontSize: 'var(--measure-dimension-font-size-sm, 13px)',
                fontWeight: '600',
                fontFamily: 'Lato',
            },
        },
    },
    activeAxisLabel: {
        textDecoration: 'none',
        color: 'var(--color-base-text-link)',
        fontWeight: '600',
    },
} as const;
