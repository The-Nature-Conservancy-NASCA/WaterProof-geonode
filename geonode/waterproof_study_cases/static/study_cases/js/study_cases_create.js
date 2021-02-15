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
    $('#custom').click(function() {
        $("#panel-custom").removeClass("panel-hide");
    });

    $('#add_wi').click(function() {
        text = $("#select_custom option:selected").text();
        value = $("#select_custom option:selected").val();
        $('#select_custom option:selected').remove();
        var name = "<td>" + text + "</td>";
        var name_source = "<td>" + text + "</td>";
        var action = "<td><a class='btn btn-danger'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></a></td>";
        check = " <td>";
        $.get("http://localhost:8000/study_cases/intakescinfralist/" + value, function(data) {
            $.each(data, function(index, value) {
                check += "<div class='custom-control custom-checkbox'>" +
                    "<input type='checkbox' class='custom-control-input'>  SCINFRA - " + value.name + "</div>" +
                    "<button type='button' class='btn btn-primary' id='add_wi'>Add new cost</button>"
            });
            check += "</td>";
            var markup = "<tr>" + name + name_source + check + action + "</tr>";
            $("table tbody").append(markup);
            $('#autoAdjustHeightF').css("height", "auto");
        });

    });


    $('#step1NextBtn').click(function() {
        if ($('#id_name').val() != '' && $('#id_description').val() != '' && $('table tr').length > 1) {
            $('#smartwizard').smartWizard("next");
            $('#autoAdjustHeightF').css("height", "auto");
            $("#form").submit();
        } else {
            Swal.fire({
                icon: 'warning',
                title: `Field empty`,
                text: `Please full every fields`
            });
            return;
        }
    });



    $('#smartwizard').smartWizard({
        selected: 0,
        theme: 'dots',
        enableURLhash: false,
        autoAdjustHeight: true,
        transition: {
            animation: 'fade', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
        },
        toolbarSettings: {
            toolbarPosition: 'bottom', // both bottom
            toolbarButtonPosition: 'center', // both bottom
        },
        keyboardSettings: {
            keyNavigation: false
        },
        toolbarSettings: {
            showNextButton: false,
            showPreviousButton: false,
        }
    });
    hei = $('#autoAdjustHeightF');
    console.log(hei)
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