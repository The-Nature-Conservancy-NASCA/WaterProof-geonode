/**
 * @file Create Study Case wizard step
 * validations & interactions
 * @version 1.0
 */
var urlParams = (function(url) {
    var result = new Object();
    var params = window.location.search.slice(1).split('&');
    for (var i = 0; i < params.length; i++) {
        idx = params[i].indexOf('=');
        if (idx > 0) {
            result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
        }
    }
    return result;
})(window.location.href);

var mxLanguage = urlParams['lang'];
var map;
var basinId;
var mapDelimit;
var snapMarker;
var snapMarkerMapDelimit;
var catchmentPoly;
var catchmentPolyDelimit;
var editablepolygon;
var validPolygon;
var isFile;
var delimitationFileType;
var xmlGraph;
var id_study_case;
var waterExtractionData = {};
var waterExtractionValue;
const delimitationFileEnum = {
    GEOJSON: 'geojson',
    SHP: 'shapefile'
}
const interpolationType = {
    LINEAR: 'LINEAR',
    POTENTIAL: 'POTENTIAL',
    EXPONENTIAL: 'EXPONENTIAL',
    LOGISTICS: 'LOGISTICS'
}

var mapLoader;
$(document).ready(function() {
    $('#autoAdjustHeightF').css("height", "auto");
    $('#custom').click(function() {
        $("#panel-custom").removeClass("panel-hide");
        $("#panel-ptap").addClass("panel-hide");
        $('#autoAdjustHeightF').css("height", "auto");
    });
    $('#ptap').click(function() {
        $("#panel-ptap").removeClass("panel-hide");
        $("#panel-custom").addClass("panel-hide");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#btn-full').click(function() {
        $("#full-table").removeClass("panel-hide");
        $('#autoAdjustHeightF').css("height", "auto");
    });
    $('#btn-investment').click(function() {
        $("#investment-table").removeClass("panel-hide");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#full').click(function() {
        $("#panel-full").removeClass("panel-hide");
        $("#panel-investment").addClass("panel-hide");
        $("#investment-table").addClass("panel-hide");
        $('#autoAdjustHeightF').css("height", "auto");
    });
    $('#investment').click(function() {
        $("#panel-investment").removeClass("panel-hide");
        $("#panel-full").addClass("panel-hide");
        $("#full-table").addClass("panel-hide");
        $('#autoAdjustHeightF').css("height", "auto");
    });




    $('#step1NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#step2NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#step3NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#step4NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });
    $('#step5NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });
    $('#step6NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });
    $('#step7EndBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });




    $('#autoAdjustHeightF').css("height", "auto");


    /*$("#smartwizard").on("showStep", function(e, anchorObject, stepIndex, stepDirection) {
        if (stepIndex == 3) {
            if (catchmentPoly)
                mapDelimit.fitBounds(catchmentPoly.getBounds());
            changeFileEvent();
        }
    });

    /*
        var menu1Tab = document.getElementById('mapid');
        var observer2 = new MutationObserver(function() {
            if (menu1Tab.style.display != 'none') {
                mapDelimit.invalidateSize();
            }
        });
        observer2.observe(menu1Tab, {
            attributes: true
        });
    */
});


window.onbeforeunload = function() {
    return mxResources.get('changesLost');
};