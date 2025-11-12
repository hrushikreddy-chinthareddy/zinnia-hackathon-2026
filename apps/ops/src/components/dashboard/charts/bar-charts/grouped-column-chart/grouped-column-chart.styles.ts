export const AXIS_TITLE_STYLE: Highcharts.CSSObject = {
    color: '#212121',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'Lato',
};

export const AXIS_LABEL_STYLE = {
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'Lato',
};

export const DRILLDOWN_STYLES = {
    breadcrumbs: {
        buttonTheme: {
            style: {
                fontSize: '13px',
                fontWeight: '600',
                color: '#00628B',
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
                color: '#666666',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'Lato',
            },
        },
    },
    activeAxisLabel: {
        textDecoration: 'none',
        color: '#00628B',
        fontWeight: '600',
    },
} as const;
