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

    $('#add_wi').click(function() {
        text = $("#select_custom option:selected").text();
        value = $("#select_custom option:selected").val();
        $('#select_custom option:selected').remove();
        var action = "<td><a class='btn btn-danger'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></a></td>";
        $.get("../../study_cases/scinfra/" + value, function(data) {
            $.each(data, function(index, scinfra) {
                var name = "<td>" + scinfra.intake__name + "</td>";
                var name_source = "<td>" + scinfra.intake__water_source_name + "</td>";
                check = " <td>";
                check += "<div>" + scinfra.name + " - " + scinfra.graphId
                // "</div><button type='button' class='btn btn-primary' id='add_wi'>Add new cost</button>"
                check += "</td>";
                var markup = "<tr id='custom-" + value + "'>" + name + name_source + check + action + "</tr>";
                $("#custom_table").find('tbody').append(markup);
            });

            $('#autoAdjustHeightF').css("height", "auto");
        });

    });

    $('#add_ptap').click(function() {
        text = $("#select_ptap option:selected").text();
        value = $("#select_ptap option:selected").val();
        $('#select_ptap option:selected').remove();
        var action = "<td><a class='btn btn-danger'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></a></td>";
        var name = "<td>" + text + "</td>";
        var markup = "<tr id='ptap-" + value + "'>" + name + action + "</tr>";
        $("#ptap_table").find('tbody').append(markup);
        $('#autoAdjustHeightF').css("height", "auto");
    });


    $('#step1NextBtn').click(function() {
        if ($('#id_name').val() != '' && $('#id_description').val() != '' && $('table tr').length > 1) {
            intakes = [];
            $('#custom_table').find('tbody > tr').each(function(index, tr) {
                id = tr.id.replace('custom-', '')
                intakes.push(id)
            });
            ptaps = [];
            $('#ptap_table').find('tbody > tr').each(function(index, tr) {
                id = tr.id.replace('ptap-', '')
                ptaps.push(id)
            });
            $.post("../../study_cases/save/", {
                name: $('#id_name').val(),
                description: $('#id_description').val(),
                intakes: intakes,
                ptaps: ptaps
            }, function(data) {
                id_study_case = data.id_study_case;
                $('#smartwizard').smartWizard("next");
                $('#autoAdjustHeightF').css("height", "auto");
                $("#cm_form").hide();
            }, "json");
        } else {
            Swal.fire({
                icon: 'warning',
                title: `Field empty`,
                text: `Please full every fields`
            });
            return;
        }
    });

    $("#cb_check").click(function() {

        if ($(this).is(":checked")) // "this" refers to the element that fired the event
        {
            $("#cm_form").show();
            $('#autoAdjustHeightF').css("height", "auto");
        } else {
            $("#cm_form").hide();
            $('#autoAdjustHeightF').css("height", "auto");
        }
    })

    $('#step2NextBtn').click(function() {
        if ($("#cb_check").is(':checked')) {
            $.post("../../study_cases/save/", {
                id_study_case: id_study_case,
                carbon_market: $("#cb_check").is(':checked'),
                carbon_market_value: $('#id_cm').val(),
                carbon_market_currency: $("#cm_select option:selected").text()
            }, function(data) {
                $('#smartwizard').smartWizard("next");
                $('#autoAdjustHeightF').css("height", "auto");
            }, "json");
        } else {
            $('#smartwizard').smartWizard("next");
            $('#autoAdjustHeightF').css("height", "auto");

        }
    });

    $('#step3NextBtn').click(function() {
        portfolios = [];
        $('#portfolios-ul input:checked').each(function() {
            id = $(this).attr("id").replace('portfolio-', '')
            portfolios.push(id)
        })
        if (portfolios.length > 0) {
            $.post("../../study_cases/save/", {
                id_study_case: id_study_case,
                portfolios: portfolios
            }, function(data) {
                $('#smartwizard').smartWizard("next");
                $('#autoAdjustHeightF').css("height", "auto");
            }, "json");
        } else {
            Swal.fire({
                icon: 'warning',
                title: `Field empty`,
                text: `Please check options`
            });
            return;
        }
    });

    $('#step4NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
    });
    $('#step5NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
    });
    $('#step6NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
    });
    $('#step7EndBtn').click(function() {
        $("#form").submit();
    });
    $('#step7RunBtn').click(function() {

    });


    $('#custom_table').on('click', 'a', function() {
        var row = $(this).closest("tr")
        var tds = row.find("td");
        intake_name = "";
        $.each(tds, function(i) {
            if (i == 0) {
                intake_name = $(this).text();
            } else if (i == 2) {
                csinfra_name = $(this).text();
            }

        });
        option = intake_name + " - " + csinfra_name
        id = row.attr("id").replace('custom-', '')
        $("#select_custom").append(new Option(option, id));
        row.remove();

    });

    $('#ptap_table').on('click', 'a', function() {
        var row = $(this).closest("tr")
        var tds = row.find("td");
        ptap_name = "";
        $.each(tds, function(i) {
            if (i == 0) {
                ptap_name = $(this).text();
            }

        });
        option = ptap_name
        id = row.attr("id").replace('ptap-', '')
        $("#select_ptap").append(new Option(option, id));
        row.remove();

    });

    $("#director").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
    });

    $("#evaluation").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
    });

    $("#finance").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
    });

    $("#implementation").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
    });

    $("#office").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#travel").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#equipment").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#overhead").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#contracts").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#others").keyup(function() {
        calculate_Personnel();
        calculate_Platform();
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