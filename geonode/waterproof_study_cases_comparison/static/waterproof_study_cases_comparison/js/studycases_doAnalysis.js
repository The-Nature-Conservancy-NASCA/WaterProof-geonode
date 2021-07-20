/**
 * @file Comparison cases do analysis
 * @author Luis Saltron
 * @version 1.0
 */
$(function () {
    // INDICATORS RESULT CATEGORIES
    const AXIS_CATEGORIES = {
        AWY: 'Change in Volume of Water Yield (%)',
        BF_M3: 'Change in Base Flow (%)',
        WN_KG: 'Change in Nitrogen Load (%)',
        WP_KG: 'Change in Phosphorus Load (%)',
        WSED_TON: 'Change in Total Sediments (%)',
        WC_TON: 'Change in Carbon Storage'
    };
    const CHART_CATEGORIES = {
        AWY: 'awy',
        BF_M3: 'bf_m3',
        WN_KG: 'wn_kg',
        WP_KG: 'wp_kg',
        WSED_TON: 'wsed_ton',
        WC_TON: 'wc_ton',
        STUDYCASE: 'study_case'
    };
    const AXIS_TABLE = {
        DOM_ID: 'axis_table'
    };
    const AXIS_SELECT = {
        DOM_ID: 'select_axis'
    };
    const ADD_BUTTON = {
        DOM_ID: 'add_axis'
    };
    const INVEST_API = {
        URL: '../getInvestIndicators/'
    };
    chartCategories = [];
    try {
        var casesSelected = JSON.parse(localStorage.analysisCases);
    } catch (error) {
        var casesSelected = [];
    }
    //Validate if there selected cases
    if (casesSelected.length <= 0) {
        Swal.fire({
            title: "Wow!",
            text: "Message!",
            type: "success"
        }).then(function () {
            window.location = "../";
        });
    }
    else { //there are cases selected
        selectedCases = JSON.parse(localStorage.analysisCases);
        fields = [];
        fields.push(
            CHART_CATEGORIES.AWY,
            CHART_CATEGORIES.BF_M3,
            CHART_CATEGORIES.WN_KG,
            CHART_CATEGORIES.WP_KG
        );
        /******************************/
        /* DEFAULT REQUEST AT LOAD PAGE
        /******************************/
        // Get invest indicator for selected cases
        var seriesDataRequest = indicatorsRequest(INVEST_API.URL, selectedCases, fields);
        fields = [];
        fields.push(
            CHART_CATEGORIES.STUDYCASE,
        );
        var seriesCasesRequest = indicatorsRequest(INVEST_API.URL, selectedCases, fields);
        var investRequest = [];
        investRequest.push(seriesDataRequest, seriesCasesRequest);
        Promise.all(investRequest).then(promiseResponse => {
            let seriesData = promiseResponse[0];
            let seriesCases = promiseResponse[1];
            if (seriesData.length > 0 && seriesCases.length > 0) { //results found!
                let categoriesOb = {};
                categoriesOb.id = CHART_CATEGORIES.AWY;
                categoriesOb.name = AXIS_CATEGORIES.AWY;
                chartCategories.push(categoriesOb);
                categoriesOb = {};
                categoriesOb.id = CHART_CATEGORIES.BF_M3;
                categoriesOb.name = AXIS_CATEGORIES.BF_M3;
                chartCategories.push(categoriesOb);
                categoriesOb = {};
                categoriesOb.id = CHART_CATEGORIES.WN_KG;
                categoriesOb.name = AXIS_CATEGORIES.WN_KG;
                chartCategories.push(categoriesOb);
                categoriesOb = {};
                categoriesOb.id = CHART_CATEGORIES.WP_KG;
                categoriesOb.name = AXIS_CATEGORIES.WP_KG;
                chartCategories.push(categoriesOb);
                var serie = [];
                seriesData.forEach(function (record, i) {
                    let data = [];
                    let serieObject = {};
                    for (const field in record) {
                        data.push(record[field]);
                    }
                    serieObject.name = gettext('Study case') + ' ' + seriesCases[i].study_case;
                    serieObject.data = data;
                    serie.push(serieObject);
                });
                let chartConfig = {};
                chartConfig.categories = chartCategories.map(function (category, i) {
                    return category.name;
                });
                chartConfig.series = serie;
                fillAxisTable(chartCategories);
                drawChart(chartConfig);
            }
            // No results for selected cases
            else {
                Swal.fire({
                    icon: 'error',
                    title: gettext('Error!'),
                    text: gettext('Not result for case')
                })
            }
        }).catch(reason => {
            console.log(reason)
        });
    }
    /*
    * Add a new axis to parallel chart
    * 
    * @returns
    */
    $('#' + ADD_BUTTON.DOM_ID).click(function () {
        let axis_select = $('#' + AXIS_SELECT.DOM_ID + ' option:selected');
        let exist_cat = chartCategories.filter(cat => cat.id == axis_select[0].value);
        // Check if axis has been added
        if (exist_cat.length > 0) {
            Swal.fire({
                icon: 'error',
                title: gettext('Error!'),
                text: gettext('Axis already added')
            });
            return
        }
        var axisName = axis_select[0].value;
        switch (axisName) {
            case CHART_CATEGORIES.AWY, CHART_CATEGORIES.BF_M3, CHART_CATEGORIES.WN_KG,
                CHART_CATEGORIES.WP_KG, CHART_CATEGORIES.WSED_TON, CHART_CATEGORIES.WC_TON:
                var url = INVEST_API.URL;
                break;
            default:
                break;
        }
        let chartCatAsArray = Object.entries(CHART_CATEGORIES);
        let filteredChartCat = chartCatAsArray.filter(cat => cat[1] == axis_select[0].value);
        let axisCatAsArray = Object.entries(AXIS_CATEGORIES);
        let filteredAxisCat = axisCatAsArray.filter(cat => cat[0] == filteredChartCat[0][0]);
        let catObject = {
            'id': filteredChartCat[0][1],
            'name': filteredAxisCat[0][1]
        }
        chartCategories.push(catObject);
        let fields = chartCategories.map(function (category, i) {
            return category.id;
        });
        var seriesDataRequest = indicatorsRequest(url, selectedCases, fields);
    });
    /*
    * Render axis selected in table
    * 
    * @param  {Array}  axis_selected - The chart serie config
    * 
    * @returns
    */
    function fillAxisTable(axis_selected) {
        let axis_table = $('#' + AXIS_TABLE.DOM_ID + ' tr:last');
        axis_selected.forEach(axis => {
            let row = `<tr><td class="small text-center vat">${axis.name}</td>`;
            row += `<td class="small text-center vat"><a class="btn btn-danger removeAxis" data-id="${axis}">`;
            row += `<span class="glyphicon glyphicon-trash" aria-hidden="true" data-id="${axis}"></span></a></td></tr>`;
            axis_table.after(row);
        });

    }
    /*
    * Set a indicators promise request
    * 
    * @param  {String}  apiUrl - Request URL 
    * @param  {Array}   cases  - The selected cases for analysis
    * @param  {Array}   fields - Fiels returned in the promises response
    * 
    * @returns {Promise} The indicator request promise 
    */
    function indicatorsRequest(apiUrl, cases, fields) {
        let seriesDataRequest = $.ajax({
            url: apiUrl,
            data: {
                'cases': cases,
                'fields': fields
            }
        });
        return seriesDataRequest;
    }
    /*
    * Render parallel chart
    * 
    * @param  {Object}  chartConfig - Chart properties config 
    * @param  {Array}   chartConfig.categories - The chart categories
    * @param  {Array}   chartConfig.serie - The chart serie config
    * 
    * @returns
    */
    function drawChart(chartConfig) {
        console.log(chartConfig);
        Highcharts.chart('container', {
            chart: {
                type: 'spline',
                parallelCoordinates: true,
                parallelAxes: {
                    lineWidth: 3
                }
            },
            title: {
                text: gettext('Study case comparison')
            },
            plotOptions: {
                series: {
                    animation: false,
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    },
                    states: {
                        hover: {
                            halo: {
                                size: 0
                            }
                        }
                    },
                    events: {
                        mouseOver: function () {
                            this.group.toFront();
                        }
                    }
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{point.color}">\u25CF</span>' +
                    '{series.name}: <b>{point.formattedValue}</b><br/>'
            },
            xAxis: {
                categories: chartConfig.categories,
                offset: 2
            },
            yAxis: [{
                tooltipValueFormat: '{value} km'
            },
            {
                tooltipValueFormat: '{value} km',
            }],
            colors: ['rgba(11, 200, 200, 0.1)'],
            series: chartConfig.series
        });
    }
});