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

var id_study_case = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

var intakes = [];
var ptaps = [];

var mapLoader;
$(document).ready(function() {
    $('#autoAdjustHeightF').css("height", "auto");
    $('#cityLabel').text(localStorage.city);
    calculate_Personnel();
    calculate_Platform();
    loadNBS();


    $('#step1NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#step2PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step2NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#step3PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step3NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#step4PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step4NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#step5PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step5NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#step6PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step6NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#step7PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step7EndBtn').click(function() {
        location.href = "/study_cases/";
    });


    $('#btn-advanced_option').click(function() {
        $('#custom_table').find('tbody > tr').each(function(index, tr) {
            id = tr.id.replace('custom-', '')
            intakes.push(id)
        });
        var type = $("input[name='type']:checked").val();
        if (type == "1") {
            $('#ptap_table').find('tbody > tr').each(function(index, tr) {
                id = tr.id.replace('ptap-', '')
                ptaps.push(id)
            });
        }
        if ($("#biophysical-panel").hasClass("panel-hide")) {
            $("#biophysical-panel").removeClass("panel-hide");
            loadBiophysicals();
        } else {
            $("#biophysical-panel").addClass("panel-hide");
        }
    });

    function calculate_Personnel() {
        var total = 0.0;
        var total_personnel = $("#total_personnel");
        var director = $("#director").val();
        var evaluation = $("#evaluation").val();
        var finance = $("#finance").val();
        var implementation = $("#implementation").val();
        if (director && !isNaN(director)) {
            total += parseFloat(director)
        }
        if (evaluation && !isNaN(evaluation)) {
            total += parseFloat(evaluation)
        }
        if (finance && !isNaN(finance)) {
            total += parseFloat(finance)
        }
        if (implementation && !isNaN(implementation)) {
            total += parseFloat(implementation)
        }
        total_personnel.val(total)
    }

    function calculate_Platform() {
        var total = 0.0;
        var total_plaform = $("#total_platform");
        var personnel = $("#total_personnel").val();
        var office = $("#office").val();
        var travel = $("#travel").val();
        var equipment = $("#equipment").val();
        var overhead = $("#overhead").val();
        var contracts = $("#contracts").val();
        var others = $("#others").val();

        if (personnel && !isNaN(personnel)) {
            total += parseFloat(personnel)
        }
        if (director && !isNaN(director)) {
            total += parseFloat(director)
        }
        if (office && !isNaN(office)) {
            total += parseFloat(office)
        }
        if (travel && !isNaN(travel)) {
            total += parseFloat(travel)
        }
        if (equipment && !isNaN(equipment)) {
            total += parseFloat(equipment)
        }
        if (contracts && !isNaN(contracts)) {
            total += parseFloat(contracts)
        }
        if (overhead && !isNaN(overhead)) {
            total += parseFloat(overhead)
        }
        if (others && !isNaN(others)) {
            total += parseFloat(others)
        }
        total_plaform.val(total)
    }

    function loadNBS() {
        var country = localStorage.country
        $.post("../../study_cases/nbs/", {
            id_study_case: id_study_case,
            country: country,
            process: "View"
        }, function(data) {
            $.each(data, function(index, nbs) {
                var name = nbs.name;
                var id = nbs.id
                var def = nbs.default
                content = '<li class="list-group-item"><div class="custom-control custom-checkbox">'
                if (def) {
                    content += '<input type="checkbox" class="custom-control-input" id="nbs-' + id + '" checked disabled>'
                } else {
                    content += '<input type="checkbox" class="custom-control-input" id="nbs-' + id + '">'
                }
                content += '<label class="custom-control-label" for="nbs-' + id + '"> ' + name + '</label></div></li>'
                $("#nbs-ul").append(content);
            });
            $('#autoAdjustHeightF').css("height", "auto");

        });
    }


    function loadBiophysicals() {
        if (ptaps.length > 0) {
            $.each(ptaps, function(index, id_ptap) {
                $.get("../../study_cases/intakebyptap/" + id_ptap, function(data) {
                    $.each(data, function(index, intake) {
                        loadBiophysical(intake.csinfra_elementsystem__intake__id, intake.csinfra_elementsystem__intake__name)
                    });
                });
            });

        }
        if (intakes.length > 0) {
            $.each(intakes, function(index, id_intake) {
                $.get("../../study_cases/intakebyid/" + id_intake, function(data) {
                    intake = data[0];
                    loadBiophysical(intake.id, intake.name)
                });
            });

        }
    }

    function loadBiophysical(id_intake, name) {
        $.post("../../study_cases/bio/", {
            id_intake: id_intake,
            id_study_case: id_study_case,
        }, function(data) {
            labels = data[0]
            content = '<div class="col-md-12"><legend><label>Intake ' + name + '</span> </label></legend>'
            content += '<table id="bio_table_' + id_intake + '" class="table table-striped table-bordered table-condensed" style="width:100%"><thead><tr class="info">'
            content += '<th scope="col" class="small text-center vat">description</th>'
            content += '<th scope="col" class="small text-center vat">lucode</th>'
            $.each(labels, function(key, v) {
                if (key != 'lucode' && key != 'default' && key != 'lulc_desc' && key != 'description' && key != 'user_id' && key != 'intake_id' && key != 'study_case_id' && key != 'id' && key != 'macro_region' && key != 'kc') {
                    content += '<th scope="col" class="small text-center vat">' + key + '</th>'
                }
            });
            content += '</tr></thead><tbody>'
            $.each(data, function(index, bio) {
                content += '<tr id="id_' + bio.id + '">'
                content += '<td id="description_' + bio.id + '">' + bio.description + '</td>'
                content += '<td id="lucode_' + bio.id + '">' + bio.lucode + '</td>'
                $.each(bio, function(key, v) {
                    if (key != 'lucode' && key != 'default' && key != 'lulc_desc' && key != 'description' && key != 'user_id' && key != 'intake_id' && key != 'study_case_id' && key != 'id' && key != 'macro_region' && key != 'kc') {
                        content += '<td id="' + key + '_' + bio.id + '">' + v + '</td>'
                    }
                });
                content += '</tr>'
            });
            content += '</tbody></table></div>'
            $("#biophysical-panel").append(content);
            $('#autoAdjustHeightF').css("height", "auto");

        });



        content += '</tbody></table>'
    }




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


    $('#autoAdjustHeightF').css("height", "auto");
});


window.onbeforeunload = function() {
    return mxResources.get('changesLost');
};