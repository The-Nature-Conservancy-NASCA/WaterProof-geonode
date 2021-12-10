/**
 * @file Comparison cases do analysis
 * @author Luis Saltron
 * @version 1.0
 */
$(function () {
    // INDICATORS RESULT CATEGORIES
    const AXIS_CATEGORIES = {
        AWY: gettext('Change in Volume of Water Yield (%)'),
        BF_M3: gettext('Change in Base Flow (%)'),
        WN_KG: gettext('Change in Nitrogen Load (%)'),
        WP_KG: gettext('Change in Phosphorus Load (%)'),
        WSED_TON: gettext('Change in Total Sediments (%)'),
        WC_TON: gettext('Change in Carbon Storage (%)'),
        RWD: gettext('ROI Benefic/Cost (Total)'),
        RME: gettext('ROI Benefit/Cost (Discounted)'),
        VPN_IMP: gettext('Cost Implementation NPV'),
        VPN_MAINT: gettext('Cost Maintenance NPV'),
        VPN_OPORT: gettext('Cost Oportunity NPV'),
        VPN_TRANS: gettext('Cost Transaction NPV'),
        VPN_PLAT: gettext('Cost Platform NPV'),
        VPN_BENF: gettext('Benefits NPV'),
        VPN_TOTAL: gettext('Total NPV')
    };
    //INDICATORS BD FIELDS
    const CHART_CATEGORIES = {
        AWY: 'awy',
        BF_M3: 'bf_m3',
        WN_KG: 'wn_kg',
        WP_KG: 'wp_kg',
        WSED_TON: 'wsed_ton',
        WC_TON: 'wc_ton',
        RWD: 'roi_without_discount',
        RME: 'roi_medium',
        VPN_IMP: 'implementation',
        VPN_MAINT: 'maintenance',
        VPN_OPORT: 'oportunity',
        VPN_TRANS: 'transaction',
        VPN_PLAT: 'platform',
        VPN_BENF: 'benefit',
        VPN_TOTAL: 'total',
        STUDYCASE: 'id',
        STUDY_NAME: 'name',
        STUDY_COUNTRY: 'city__country__name',
        STUDY_REGION: 'city__country__region__name',
        STUDY_CITY: 'city__name',
        STUDY_YEARS: 'time_implement',
        STUDY_INTAKES: 'intakes',
        STUDY_PTAPS: 'ptaps',
        STUDY_CURRENCY: 'cm_currency',
        ANALYSYS_CURRENCY: 'analysis_currency',
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
    const INDICATORS_API = {
        INVEST: '../getInvestIndicators/',
        ROI: '../getRoiIndicators/',
        VPN: '../getVpnIndicators/',
        STUDY_CASE: '../getStudyCaseInfo/',
        INVEST_RAW: '../getInvestIndicatorsRaw/',
    };
    const SLIDER_UL = {
        DOM_ID: 'splide_ul'
    }
    var chartCategories = [];
    var chartConfig = {};
    try {
        var casesSelected = JSON.parse(localStorage.analysisCases);
    } catch (error) {
        var casesSelected = [];
    }
    //Validate if there selected cases
    if (casesSelected.length <= 0) {
        Swal.fire({
            title: gettext("Wow!"),
            text: gettext("Message!"),
            type: "success"
        }).then(function () {
            window.location = "../";
        });
    }
    /******************/
    /* DEFAULT REQUEST
    /******************/
    else { //there are cases selected
        selectedCases = JSON.parse(localStorage.analysisCases);
        var casesIdOrdered = selectedCases.sort((a,b) => b - a);
        fields = [];
        fields.push(
            CHART_CATEGORIES.AWY,
            CHART_CATEGORIES.WSED_TON,
            CHART_CATEGORIES.WN_KG,
            CHART_CATEGORIES.WP_KG,
            CHART_CATEGORIES.WC_TON
        );
        /******************************/
        /* DEFAULT REQUEST AT LOAD PAGE
        /******************************/
        // Get invest indicator for selected cases
        var seriesInvestRequest = indicatorsRequest(INDICATORS_API.INVEST_RAW, casesIdOrdered, fields);
        fields = [];
        fields.push(
            CHART_CATEGORIES.STUDYCASE,
            CHART_CATEGORIES.STUDY_NAME,
            CHART_CATEGORIES.STUDY_COUNTRY,
            CHART_CATEGORIES.STUDY_REGION,
            CHART_CATEGORIES.STUDY_CITY,
            CHART_CATEGORIES.STUDY_YEARS,
            CHART_CATEGORIES.STUDY_INTAKES,
            CHART_CATEGORIES.STUDY_PTAPS,
            CHART_CATEGORIES.STUDY_CURRENCY,
            CHART_CATEGORIES.ANALYSYS_CURRENCY
        );
        var seriesCasesRequest = indicatorsRequest(INDICATORS_API.STUDY_CASE, casesIdOrdered, fields);
        fields = [];
        fields.push(
            CHART_CATEGORIES.RWD
        )
        var seriesRoiRequest = indicatorsRequest(INDICATORS_API.ROI, casesIdOrdered, fields);
        var requests = [];
        requests.push(seriesInvestRequest, seriesRoiRequest, seriesCasesRequest);
        Promise.all(requests).then(promiseResponse => {
            let seriesDataInvest = promiseResponse[0];
            let seriessDataRoi = promiseResponse[1];
            let seriesCases = promiseResponse[2];
            if (seriesDataInvest.length > 0 && seriessDataRoi.length > 0 && seriesCases.length > 0) { //results found!
                let categoriesObj = setChartObject(CHART_CATEGORIES.RWD, AXIS_CATEGORIES.RWD);
                chartCategories.push(categoriesObj);
                categoriesObj = setChartObject(CHART_CATEGORIES.AWY, AXIS_CATEGORIES.AWY);
                chartCategories.push(categoriesObj);
                categoriesObj = setChartObject(CHART_CATEGORIES.WSED_TON, AXIS_CATEGORIES.WSED_TON);
                chartCategories.push(categoriesObj);
                categoriesObj = setChartObject(CHART_CATEGORIES.WN_KG, AXIS_CATEGORIES.WN_KG);
                chartCategories.push(categoriesObj);
                categoriesObj = setChartObject(CHART_CATEGORIES.WP_KG, AXIS_CATEGORIES.WP_KG);
                chartCategories.push(categoriesObj);
                categoriesObj = setChartObject(CHART_CATEGORIES.WC_TON, AXIS_CATEGORIES.WC_TON);
                chartCategories.push(categoriesObj);
                var serie = [];
                seriesDataInvest.forEach(function (record, i) {
                    let data = [];
                    let serieObject = {};
                    //Add roi_whitout_discount value
                    data.push(seriessDataRoi[i].roi_without_discount);
                    for (const field in record) {
                        data.push(record[field]);
                    }
                    serieObject.name = gettext('Study case') + ' ' + seriesCases[i].name;
                    serieObject.data = data;
                    serie.push(serieObject);
                });
                chartConfig.categories = chartCategories.map(function (category, i) {
                    return category.name;
                });
                chartConfig.series = serie;
                fillAxisTable(chartCategories);
                var colors = [];
                serie.forEach(element => {
                    var exist = true;
                    while (exist) {
                        var color = random_rgba();
                        let filter = colors.filter(col => col == color);
                        if (filter.length === 0)
                            exist = false
                    }
                    colors.push(color);
                });
                seriesCases.forEach(element => {
                    if (element.roi_discount < 1) {
                        imagePath = static_prefix + 'waterproof_study_cases_comparison/images/discount_below1.png';
                    }
                    else if (element.roi_discount >= 1 && element.roi_discount <= 2) {
                        imagePath = static_prefix + 'waterproof_study_cases_comparison/images/discount_above1.png';
                    }
                    else if (element.roi_discount > 2) {
                        imagePath = static_prefix + 'waterproof_study_cases_comparison/images/discount_above2.png';
                    }
                    if (element.intakes.length == void (0)) {
                        var intakeCount = 1;
                    }
                    else {
                        var intakeCount = element.intakes.length;
                    }
                    if (element.intakes.ptaps == void (0)) {
                        var ptapsCount = 1;
                    }
                    else {
                        var ptapsCount = element.ptaps.length;
                    }
                    let li = `<li class="splide__slide"><img class="splideImg" src=${imagePath} height="150px" width="150px">
                            <h4 class="slider_title">${element.name}</h4><div>
                            <div>${gettext('Country')}: ${element.city__country__name} </div>
                            <div>${gettext('City')}: ${element.city__name}</div>
                            <div>${gettext('Region')}: ${element.city__country__region__name}</div>
                            <div>${gettext('Time frame')}: ${element.time_implement}</div>
                            <div>${gettext('Number of intakes')}: ${intakeCount}</div>
                            <div>${gettext('Number DWTP')}: ${ptapsCount}</div>
                            <div>${gettext('Currency')}: ${element.analysis_currency}</div></div></li>`;
                    $('#' + SLIDER_UL.DOM_ID).append(li);
                    //console.log(element);
                });
                new Splide('#card-slider', {
                    perPage: 2,
                    breakpoints: {
                        600: {
                            perPage: 1,
                        }
                    }
                }).mount();
                //return;
                var tooltip = [];
                for (let index = 0; index < chartCategories.length; index++) {
                    let tooltipValue = {
                        'lineColor': '#ff9900'
                    }
                    tooltip.push(tooltipValue);
                }
                chartConfig.tooltipValue = tooltip;
                chartConfig.colors = colors;
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
    * Set object for axis config in chart
    * 
    * @param  {String}  id - id field used in request 
    * @param  {String}  name - Name visible of axis chart  
    * 
    * @returns {Object} The object with id & name 
    */
    function setChartObject(id, name) {
        let chartObj = {
            'id': id,
            'name': name
        }
        return chartObj;
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
        var url = "";
        switch (axisName) {
            //Invest
            case CHART_CATEGORIES.AWY: case CHART_CATEGORIES.BF_M3: case CHART_CATEGORIES.WN_KG:
            case CHART_CATEGORIES.WP_KG: case CHART_CATEGORIES.WSED_TON: case CHART_CATEGORIES.WC_TON:
                url = INDICATORS_API.INVEST_RAW;
                break;
            //ROI
            case CHART_CATEGORIES.RWD: case CHART_CATEGORIES.RME:
                url = INDICATORS_API.ROI;
                break;
            //VPN
            case CHART_CATEGORIES.VPN_IMP: case CHART_CATEGORIES.VPN_MAINT: case CHART_CATEGORIES.VPN_OPORT:
            case CHART_CATEGORIES.VPN_PLAT: case CHART_CATEGORIES.VPN_TRANS: case CHART_CATEGORIES.VPN_TOTAL:
            case CHART_CATEGORIES.VPN_BENF:
                url = INDICATORS_API.VPN;
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
        var fields = [];
        chartCategories.push(catObject);
        switch (catObject.id) {
            //AWY 
            case CHART_CATEGORIES.AWY:
                fields.push(CHART_CATEGORIES.AWY);
                break;
            //BF_M3
            case CHART_CATEGORIES.BF_M3:
                fields.push(CHART_CATEGORIES.BF_M3);
                break;
            //WSED_TON
            case CHART_CATEGORIES.WSED_TON:
                fields.push(CHART_CATEGORIES.WSED_TON);
                break;
            //WN_KG
            case CHART_CATEGORIES.WN_KG:
                fields.push(CHART_CATEGORIES.WN_KG);
                break;
            //WP_KG
            case CHART_CATEGORIES.WP_KG:
                fields.push(CHART_CATEGORIES.WC_TON);
                break;
            //RWD
            case CHART_CATEGORIES.RWD:
                fields.push(CHART_CATEGORIES.RWD);
                break;
            //RME
            case CHART_CATEGORIES.RME:
                fields.push(CHART_CATEGORIES.RME);
                break;
            // VPN 
            case CHART_CATEGORIES.VPN_IMP: case CHART_CATEGORIES.VPN_MAINT:
            case CHART_CATEGORIES.VPN_OPORT: case CHART_CATEGORIES.VPN_TRANS:
            case CHART_CATEGORIES.VPN_PLAT: case CHART_CATEGORIES.VPN_BENF:
                fields.push(
                    CHART_CATEGORIES.VPN_IMP,
                    CHART_CATEGORIES.VPN_MAINT,
                    CHART_CATEGORIES.VPN_OPORT,
                    CHART_CATEGORIES.VPN_PLAT,
                    CHART_CATEGORIES.VPN_TRANS,
                    CHART_CATEGORIES.VPN_BENF
                );
                break;

            default:
                break;
        }
        var seriesDataRequest = indicatorsRequest(url, selectedCases, fields);
        var requests = [];
        requests.push(seriesDataRequest);
        Promise.all(requests).then(promiseResponse => {
            chartConfig.categories = chartCategories.map(function (category, i) {
                return category.name;
            });
            let series = chartConfig.series;
            for (let i = 0; i < series.length; i++) {
                let seriesData = series[i].data;
                // ANY VPN COST SELECTED
                if (catObject.id === CHART_CATEGORIES.VPN_IMP || catObject.id === CHART_CATEGORIES.VPN_MAINT ||
                    catObject.id === CHART_CATEGORIES.VPN_OPORT || catObject.id === CHART_CATEGORIES.VPN_TRANS || catObject.id === CHART_CATEGORIES.VPN_PLAT) {
                    let cosTotal = promiseResponse[0][i][CHART_CATEGORIES.VPN_IMP] + promiseResponse[0][i][CHART_CATEGORIES.VPN_MAINT] +
                        promiseResponse[0][i][CHART_CATEGORIES.VPN_OPORT] + promiseResponse[0][i][CHART_CATEGORIES.VPN_TRANS] + promiseResponse[0][i][CHART_CATEGORIES.VPN_PLAT];
                    let cost = promiseResponse[0][i][catObject.id] * 100 / cosTotal;
                    seriesData.push(cost);
                }
                // TOTAL VPN AXIS SELECTED
                else if (catObject.id === CHART_CATEGORIES.VPN_TOTAL) {
                    let cosTotal = promiseResponse[0][i][CHART_CATEGORIES.VPN_IMP] + promiseResponse[0][i][CHART_CATEGORIES.VPN_MAINT] +
                        promiseResponse[0][i][CHART_CATEGORIES.VPN_OPORT] + promiseResponse[0][i][CHART_CATEGORIES.VPN_TRANS] + promiseResponse[0][i][CHART_CATEGORIES.VPN_PLAT];
                    let cost = promiseResponse[0][i][CHART_CATEGORIES.VPN_BENF] - cosTotal / cosTotal;
                    seriesData.push(cost);
                }
                // REST OF AXIS
                else {
                    for (const field in promiseResponse[0][i]) {
                        seriesData.push(promiseResponse[0][i][field]);
                    }
                }
            }
            var tooltip = [];
            for (let index = 0; index < chartCategories.length; index++) {
                let tooltipValue = {
                    'lineColor': '#ff9900'
                }
                tooltip.push(tooltipValue);
            }
            chartConfig.tooltipValue = tooltip;
            let axisTable = [chartCategories[chartCategories.length - 1]];
            fillAxisTable(axisTable);
            drawChart(chartConfig);
        });
    });
    /** 
    * Remove axis from chart and table
    * @param {Event} click       Click event
    * @param {HTML}  ButtonClass Button class
    */
    $('#' + AXIS_TABLE.DOM_ID).on('click', '.removeAxis', function (evt) {
        if (chartCategories.length > 2) {
            let axis = evt.target.getAttribute('data-id');
            let axisIndex = chartCategories.map(function (e) { return e.id; }).indexOf(axis);
            //Remove Axis values from chart series
            chartConfig.series.forEach(function (element, index) {
                console.log(element);
                element.data.splice(axisIndex, axisIndex);
            });
            let currentRow = $(this).closest('tr').remove();
            chartCategories.splice(axisIndex, axisIndex);
            chartConfig.categories.splice(axisIndex, axisIndex);
            drawChart(chartConfig);
        }
        else {
            Swal.fire({
                icon: 'error',
                title: gettext('Error!'),
                text: gettext('Minimum two axes are required for the graph')
            })
        }
    });
    /*
    * Render axis selected in table
    * 
    * @param  {Array}  axis_selected - The chart serie config
    * 
    * @returns
    */
    function fillAxisTable(axis_selected) {
        let axis_table = $('#' + AXIS_TABLE.DOM_ID);
        axis_selected.forEach(axis => {
            if(axis.name == "ROI Beneficio/Costo (Total)" || axis.name == "ROI Benefit/Cost (Total)"){
                let row = `<tr><td class="small text-center vat">${axis.name}</td>`;
                axis_table.append(row);
            }else{
                let row = `<tr><td class="small text-center vat">${axis.name}</td>`;
                row += `<td class="small text-center vat"><a class="btn btn-danger removeAxis" data-id="${axis.id}">`;
                row += `<span class="glyphicon glyphicon-trash" aria-hidden="true" data-id="${axis.id}"></span></a></td></tr>`;
                axis_table.append(row);
            }
            
        });
    }
    /*
    * Set random rgba color
    * 
    * @returns {String} The rgba color 
    */
    function random_rgba() {
        var color1 = Math.floor(Math.random() * 255) + 1;
        var color2 = Math.floor(Math.random() * 255) + 1;
        var color3 = Math.floor(Math.random() * 255) + 1;
        return 'rgb(' + color1 + ',' + color2 + ',' + color3 + ')';;
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
        Highcharts.chart('parallel', {
            chart: {
                type: 'spline',
                parallelCoordinates: true,
                parallelAxes: {
                    lineWidth: 3
                }
            },
            title: {
                text: null
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
            legend: {
                enabled: true,
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
                // floating: false,
                //x: -40, // -ve = left, +ve = right
                //y: 50, // -ve = up, +ve = down

                // labelFormat: "{name}",
                labelFormatter: function () {
                    return this.name;
                },
                itemStyle: {
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: 12,
                },

                itemDistance: 15,
                //itemWidth: 130,
                //height: 00,
                width: 400,
                // padding: 8,

                borderWidth: 2,
                // borderColor: #909090,
                // borderRadius: 0,      
            },
            xAxis: {
                categories: chartConfig.categories,
                offset: 2,
            },
            yAxis: chartConfig.tooltipValue,
            tooltip: {
                valueDecimals: 2,
            },
            colors: chartConfig.colors,
            series: chartConfig.series
        });
    }
});