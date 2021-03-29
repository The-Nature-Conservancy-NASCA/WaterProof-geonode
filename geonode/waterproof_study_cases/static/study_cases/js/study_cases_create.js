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
var id_study_case = '';
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

    calculate_Personnel();
    calculate_Platform();

    $('#custom').click(function() {
        if ($('#ptap_table').find('tbody > tr').length > 0) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    $("#panel-custom").removeClass("panel-hide");
                    $("#panel-ptap").addClass("panel-hide");
                    $('#autoAdjustHeightF').css("height", "auto");
                    $("#ptap_table tbody tr").empty();
                } else {
                    $("input[name=type][value='1']").prop('checked', true);
                }
            })
        } else {
            $("#panel-custom").removeClass("panel-hide");
            $("#panel-ptap").addClass("panel-hide");
            $('#autoAdjustHeightF').css("height", "auto");
        }
    });

    $('#ptap').click(function() {
        $("#panel-ptap").removeClass("panel-hide");
        $("#panel-custom").removeClass("panel-hide");
        $('#autoAdjustHeightF').css("height", "auto");
    });

    $('#btn-full').click(function() {
        $("#full-table").removeClass("panel-hide");
        $('#autoAdjustHeightF').css("height", "auto");
        $('#column_investment').text("Percentage");
    });
    $('#btn-investment').click(function() {
        $("#full-table").removeClass("panel-hide");
        $('#autoAdjustHeightF').css("height", "auto");
        $('#column_investment').text("Investment");
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
        intakes = [];
        $('#custom_table').find('tbody > tr').each(function(index, tr) {
            id = tr.id.replace('custom-', '')
            intakes.push(id)
        });
        var type = $("input[name='type']:checked").val();
        if (type == "1") {
            ptaps = [];
            $('#ptap_table').find('tbody > tr').each(function(index, tr) {
                id = tr.id.replace('ptap-', '')
                ptaps.push(id)
            });
        }
        if (($('#name').val() != '' && $('#description').val() != '' && intakes.length > 0)) {
            console.log(id_study_case)
            $.post("../../study_cases/save/", {
                name: $('#name').val(),
                id_study_case: id_study_case,
                description: $('#description').val(),
                intakes: intakes,
                ptaps: ptaps,
                type: type
            }, function(data) {
                id_study_case = data.id_study_case;
                if (id_study_case == '') {
                    Swal.fire({
                        icon: 'warning',
                        title: `Study Case exist`,
                        text: `please change the name`
                    });
                    return;
                } else {
                    $('#smartwizard').smartWizard("next");
                    $('#autoAdjustHeightF').css("height", "auto");
                    $("#cm_form").hide();
                }

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

    $('#step2PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

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

    $('#step3PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
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

    $('#step4PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step4NextBtn').click(function() {
        $('#smartwizard').smartWizard("next");
    });

    $('#step5PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step5NextBtn').click(function() {
        var valid = true;
        $("#div_financial").find("input").each(function() {
            var $this = $(this);
            if ($this.val().length <= 0) {
                valid = false;
                return false;
            }
        });

        if (valid) {
            $.post("../../study_cases/save/", {
                id_study_case: id_study_case,
                director: $('#director').val(),
                implementation: $('#implementation').val(),
                evaluation: $('#evaluation').val(),
                finance: $('#finance').val(),
                office: $('#office').val(),
                overhead: $('#overhead').val(),
                equipment: $('#equipment').val(),
                discount: $('#discount').val(),
                minimum: $('#minimum').val(),
                minimum: $('#minimum').val(),
                transaction: $('#transaction').val(),
                travel: $('#travel').val(),
                contracts: $('#contracts').val(),
                others: $('#others').val(),
                total_platform: $('#total_platform').val()
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

    $('#step6PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step6NextBtn').click(function() {
        nbs = [];
        $('#nbs-ul input:checked').each(function() {
            id = $(this).attr("id").replace('nbs-', '')
            nbs.push(id)
        })
        if (nbs.length > 0) {
            $.post("../../study_cases/save/", {
                id_study_case: id_study_case,
                nbs: nbs
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

    $('#step7PreviousBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step7EndBtn').click(function() {
        edit = !$("#full-table").hasClass("panel-hide")
        var valid_edit = true;
        var valid_investment = true;
        if (edit) {
            var valid_edit = true;
            $("#full-table").find("input").each(function() {
                var $this = $(this);
                if ($this.val().length <= 0) {
                    valid_edit = false;
                    return false;
                }
            });
        }
        var type = $("input[name='analysis_type']:checked").val();
        if (type == "2") {
            valid_investment = $('#annual_investment').val() != ''
        }
        if ($('#period_analysis').val() != '' && $('#period_nbs').val() != '' && type && valid_edit && valid_investment) {
            $.post("../../study_cases/save/", {
                id_study_case: id_study_case,
                analysis_type: type,
                period_nbs: $('#period_nbs').val(),
                period_analysis: $('#period_analysis').val(),
                conservation: $('#conservation').val(),
                active: $('#active').val(),
                passive: $('#passive').val(),
                silvopastoral: $('#silvopastoral').val(),
                agroforestry: $('#agroforestry').val(),
                analysis_currency: $('#analysis_currency').val(),
                analysis_nbs: $("#analysis_nbs option:selected").text(),
                annual_investment: $('#annual_investment').val(),
            }, function(data) {
                $('#smartwizard').smartWizard("next");
                $('#autoAdjustHeightF').css("height", "auto");
            }, "json");
            $("#form").submit();
        } else {
            Swal.fire({
                icon: 'warning',
                title: `Field empty`,
                text: `Please check options`
            });
            return;
        }

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