import Highcharts from 'highcharts';
import Drilldown from 'highcharts/modules/drilldown';

if (typeof window !== 'undefined' && !window.__highChartsModulesInit) {
    window.__highChartsModulesInit = true;
    Drilldown(Highcharts);
}

export default Highcharts;
