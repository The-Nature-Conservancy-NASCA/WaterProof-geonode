/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */
$(function () {
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
    else { //there area cases selected
        selectedCases = JSON.parse(localStorage.analysisCases);
        // Get invest indicator for selected cases
        $.ajax({
            url: '../getAwy/',
            data: {
                'cases': selectedCases,
            },
            success: function (result) {
                if (result.length > 0) { //results found!
                    console.log(result);
                    drawChart(result);
                }
                // No results for selected cases
                else {
                    Swal.fire({
                        icon: 'error',
                        title: gettext('Error!'),
                        text: gettext('Not result for case')
                    })
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    }
    function drawChart(data) {
        Highcharts.getJSON(
            'https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/marathon.json',
            function (data) {
                Highcharts.chart('container', {
                    chart: {
                        type: 'spline',
                        parallelCoordinates: true,
                        parallelAxes: {
                            lineWidth: 3
                        }
                    },
                    title: {
                        text: 'Marathon set'
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
                        categories: [
                            'Awy',
                            'Bfm3',
                            'Ton3'
                        ],
                        offset: 2
                    },
                    yAxis: [{
                        tooltipValueFormat: '{value} km'
                    },{
                        tooltipValueFormat: '{value} km'
                    }],
                    colors: ['rgba(11, 200, 200, 0.1)'],
                    series: [{
                        data:[
                            10,12
                        ],
                        name:"Study Case 1"
                    }]
                });
            }
        );
    }
});