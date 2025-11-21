import Highcharts from 'highcharts';
import { useTranslation } from 'react-i18next';
export const TransactionActivityTooltip = () => {
    const { t } = useTranslation();

    return <p>{t('usage.activity.toolTip.description')}</p>;
};

export const transactionActivityTooltipFormatter: Highcharts.TooltipFormatterCallbackFunction =
    function () {
        const name = String((this as any).point?.name ?? this.x ?? '');
        const value =
            typeof this.y === 'number'
                ? this.y.toLocaleString()
                : String(this.y ?? '');
        const seriesName = this.series?.name ?? '';
        const header =
            seriesName !== 'Transactions' ? seriesName : 'Transaction type';

        return `
            <div style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:2px;font-family:Lato;color:#212121">
                <div style="font-size:12px;font-weight:600;line-height:16px">
                    ${header}
                </div>
                <div style="display:flex;align-items:center">
                    <span style="color:#0B7EAE;font-size:13px;font-weight:600;line-height:16px">${name}</span>
                    <span style="font-size:14px;font-weight:700;line-height:22px;margin-left:4px">${value}</span>
                    <span style="font-size:14px;font-weight:500;line-height:22px;margin-left:4px">total</span>
                </div>
            </div>
        `;
    };
