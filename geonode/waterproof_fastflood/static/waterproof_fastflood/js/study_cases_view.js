/**
 * @file Create Study Case wizard step
 * validations & interactions
 * @version 1.0
 */

var id_study_case = studyCaseId;
var intakes = [];

$(document).ready(function () {
    $("#div-customcase").removeClass("panel-hide");
    autoAdjustHeightTabContent();
    $('#cityLabel').text(localStorage.city + ", " + localStorage.country);
    $('#coeqCountry').text("CO2_country" + " (" + localStorage.country + ")");

    if ($('#annual_investment').val() == "") {
        $('#annual_investment').val(0);
    }

    $("#analysis_nbs").change(function () {
        console.log($(this).val());
        if ($(this).val() == "1") {
            $("#quantile").prop("disabled", true);
            $("#quantile").val("N/A");
        } else {
            $("#quantile").prop("disabled", false);
            $("#quantile").val("85");
        }
    });

    calculate_Personnel();
    calculate_Platform();
    loadNBS();    

    $('#step1NextBtn').click(function () {
        watersheds = [];        
        valid_intakes = true;
        
        $('#custom_table').find('tbody > tr').each(function (index, tr) {
            id = tr.id.split("-")[1];
            watersheds.push(id);
        });
        
        $('#smartwizard').smartWizard("next");
        loadCarbomMarketParameter();        
        autoAdjustHeightTabContent();
    });

    $("#ff_flood").click(function () {
        if ($(this).is(":checked")) {
            $('#ocean_elevation').prop('disabled', false);
        } else {
            $('#ocean_elevation').prop('disabled', true);
            $('#ocean_elevation').val('0');
        }
    })

    $("#cm_form").hide();

    $("#cb_check").click(function () {
        if ($(this).is(":checked")) // "this" refers to the element that fired the event
        {
            $("#cm_form").show();
            autoAdjustHeightTabContent();
        } else {
            $("#cm_form").hide();
        }
        autoAdjustHeightTabContent();
    })
    
    $('#step2NextBtn').click(function () {
        $('#smartwizard').smartWizard("next");
        autoAdjustHeightTabContent();
    });

    $('#step3NextBtn').click(function () {
        $('#smartwizard').smartWizard("next");
        autoAdjustHeightTabContent();
    });

    $('#step4NextBtn').click(function () {
        loadFinancialParameter();
        $('#smartwizard').smartWizard("next");
        autoAdjustHeightTabContent();
    });

    $('#step5NextBtn').click(function () {
        $('#smartwizard').smartWizard("next");
        autoAdjustHeightTabContent();
    });

    $('#step6NextBtn').click(function () {
        loadNBSActivities(true);
        try{
            let objStudyCaseType = JSON.parse(studycaseType);
            if (objStudyCaseType.country_currency){
                $('#analysis_currency option').filter(function() {
                    return $(this).text() === objStudyCaseType.country_currency;
                }).prop('selected', true);
            }
        } catch(error){
            console.error("Error parsing study case type:", error);
        }
        $('#smartwizard').smartWizard("next");
        autoAdjustHeightTabContent();
    });

    $('#step7RunBtn').click(function () {
        $('#smartwizard').smartWizard("next");
        autoAdjustHeightTabContent();
        locationHref();
    });

    function loadNBS() {
        var city_id = localStorage.cityId;
        $.post("../../../fastflood/nbs/", {
            id_study_case: studyCaseId,
            city_id: city_id,
            process: "Edit"
        }, function (data) {
            content = ''
            $.each(data, function (index, nbs) {
                var name = nbs.name;
                var id = nbs.id;
                var def = nbs.default;
                content = '<li class="list-group-item"><div class="custom-control custom-checkbox">'
                if (def) {
                    content += '<input type="checkbox" class="custom-control-input" disabled id="nbs-' + id + '" checked>';
                } else {
                    content += '<input type="checkbox" class="custom-control-input" disabled id="nbs-' + id + '">';
                }
                content += '<label class="custom-control-label" for="nbs-' + id + '"> ' + name + '</label></div></li>'
                $("#nbs-ul").append(content);
            });
            autoAdjustHeightTabContent();

        });
    }

    autoAdjustHeightTabContent();
    
});
