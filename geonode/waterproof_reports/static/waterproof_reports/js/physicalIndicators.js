Highcharts.chart('container', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Column chart with negative values'
    },
    xAxis: {
        categories: ['{% trans "Change in volume of water yield (%)" %}', '{% trans "Change in base flow(%)" %}', '{% trans "Change in total sediments (%)" %}', '{% trans "Change in nitrogen load (%)" %}', '{% trans "Change in phosphorus Load (%)" %}', '{% trans "Change in carbon storage" %}']
    },
    credits: {
        enabled: false
    },
    series: [{
        name: 'Intake',
        data: [5, 3, 4, 7, 2, 8]
    }]
});