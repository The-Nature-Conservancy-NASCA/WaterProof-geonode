/**
 * @file Create Study Case wizard step
 * validations & interactions
 * @version 1.0
 */

var id_study_case = '';
var intakes = [];
var yearsDemand = [];
var studyCaseFolder = '';

$(document).ready(function () {
    console.log("Document ready study case clone");

    const tableBody = document.getElementById('max-damage-table-body');

    maxDamageCostObject = {};
    maxDamageCostPreffix = "max_damage_cost_";
    maxDamageCostDefault.forEach(a => { 
        maxDamageCostObject[a.damage_class] = a.max_damage_cost;
        id = maxDamageCostPreffix + a.damage_class.toLowerCase();
        $('#' + id).text(a.max_damage_cost);
        //console.log("" + id + " -> " + a.max_damage_cost);
    });

    $("#div-customcase").removeClass("panel-hide");
    autoAdjustHeightTabContent();
    $('#cityLabel').text(localStorage.city + ", " + localStorage.country);
    $('#coeqCountry').text("CO2_country"+" ("+localStorage.country+")");

    if ($('#annual_investment').val() == "") {
        $('#annual_investment').val(0);
    }

    if ($("#analysis_nbs option:selected").text() == "HISTORIC"){
        $("#climate_year").prop("disabled", true);
        $("#quantile").prop("disabled", true);
    }

    calculate_Personnel();
    calculate_Platform();    
    loadNBS();    

    document.getElementById("custom").click();

    $('#step1NextBtn').click(function () {
        console.log("Next step 1");

        // Check if name already exists before proceeding
        if (nameExistsGlobal) {
            showWarning(gettext("study_case_exist"), gettext("error_name"));
            return;
        }

        watersheds = [];                
        validWatershed = true;
        $('#custom_table').find('tbody > tr').each(function (index, tr) {
            id = tr.id.split("-")[1];
            watersheds.push(id);
        });
        if (watersheds.length <= 0) {
            validWatershed = false;
        }
        var type = $("input[name='type']:checked").val();

        if (($('#name').val() != '' && $('#description').val() != '' && validWatershed)) {
            toggleLoadingStep("show");
            // Use fetch instead of $.post
            postData("/fastflood/save/", {
                name: $('#name').val(),
                id_study_case: id_study_case,
                description: $('#description').val(),
                watersheds: watersheds,
                ptaps: [],
                city_id: localStorage.cityId,
                country: localStorage.country,
                type: type,
            })
            .then(data => {
                id_study_case = data.id_study_case;
                if (id_study_case == '') {
                    showWarning(gettext('study_case_exist'), gettext('error_name'));
                    toggleLoadingStep("hide");
                    return;
                } else {
                    
                    autoAdjustHeightTabContent();
                    loadCarbomMarketParameter();
                    // loadBiophysicalParams(watersheds[0]);
                    $('#smartwizard').smartWizard("next");
                    toggleLoadingStep("hide");
                    createFolder(id_study_case, watersheds[0])
                        .then(result => {
                            console.log("Folder creation completed:", result);
                            // getDamagesByCountry(); // Uncomment when needed
                        })
                        .catch(error => {
                            console.error("Folder creation failed:", error);
                            showError('Error', 'Failed to create study case folder: ' + error.message);
                        });
                    // getDamagesByCountry();
                }
            })
            .catch(error => {
                toggleLoadingStep("hide");
                console.error("Error saving study case:", error);
                showError('Error', 'Failed to save study case: ' + error.message);
            });
        } else {
            showWarning(gettext('field_empty'), gettext('error_fields'));
            return;
        }
    });

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
        toggleLoadingStep
        postData("/fastflood/save/", {
            id_study_case: id_study_case,
            carbon_market: $("#cb_check").is(':checked'),
            carbon_market_value: $('#id_cm').val(),
            carbon_market_currency: $("#cm_select option:selected").val()
        })
        .then(data => {
            $('#smartwizard').smartWizard("next");
            toggleLoadingStep("hide");
            autoAdjustHeightTabContent();
        })
        .catch(error => {
            console.error("Error saving data:", error);
            toggleLoadingStep("hide");
        });
    });

    $('#step3NextBtn').click(function () {
        portfolios = [];
        $('#portfolios-ul input:checked').each(function () {
            id = $(this).attr("id").replace('portfolio-', '')
            portfolios.push(id)
        })
        if (portfolios.length > 0) {
            // Use fetch instead of $.post
            toggleLoadingStep("show");
            postData("/fastflood/save/", {
                id_study_case: id_study_case,
                portfolios: portfolios
            })
            .then(data => {
                $('#smartwizard').smartWizard("next");
                autoAdjustHeightTabContent();
                toggleLoadingStep("hide");
            })
            .catch(error => {
                console.error("Error saving portfolios:", error);
                toggleLoadingStep("hide");
                showError('Error', 'Failed to save portfolios: ' + error.message);
            });
        } else {
            showWarning(gettext('field_empty'), gettext('error_fields'));
            return;
        }
    });

    $('#step4NextBtn').click(function () {
        biophysical = []

        if (validateDamageData()) {
            let oceanElevationValue = Number($('#ocean_elevation').val());
            if (!oceanElevationValue) {
                oceanElevationValue = 0; 
            }
            exponential_params = $('#ff_flood_parameters').val()
            width_mul_value = Number($('#width_mul').val());
            width_exp_value = Number($('#width_exp').val());
            depth_mul_value = Number($('#depth_mul').val());
            depth_exp_value = Number($('#depth_exp').val());
            min_cross_value = Number($('#min_cross').val());
            channel_mannings_value = Number($('#channel_mannings').val());
            exchange_rate = value = Number.parseFloat($('#damage_currency_exchange').val()).toFixed(5);
            toggleLoadingStep("show");
            postData("/fastflood/save/", {
                id_study_case: id_study_case,
                ocean_elevation: oceanElevationValue,
                commercial_value: Number($('#commercial-value').text()),
                industrial_value: Number($('#industrial-value').text()),
                exponential_params: exponential_params,
                width_mul: width_mul_value,
                width_exp: width_exp_value,
                depth_mul: depth_mul_value,
                depth_exp: depth_exp_value,
                min_cross: min_cross_value,
                channel_mannings: channel_mannings_value,
                exchange_rate: exchange_rate,
                damage_currency: $("#damage_currency option:selected").val().split("-")[0]
            })
            .then(data => {
                $('#smartwizard').smartWizard("next");
                saveStudyCaseBiophysicalParams();
                saveDamageData();
                loadFinancialParameter();
                fillCsvDamageData(id_study_case);
                autoAdjustHeightTabContent();
                toggleLoadingStep("hide");
            })
            .catch(error => {
                console.error("Error saving data:", error);
                toggleLoadingStep("hide");
            });
        }else{
            showWarning(gettext('field_empty'), gettext('error_fields'));
            return;
        }        
    });

    $('#step5NextBtn').click(function () {
        var valid = true;
        $("#div_financial").find("input").each(function () {
            var $this = $(this);
            if ($this.val().length <= 0) {
                valid = false;
                return false;
            }
        });
        let msg = "";
        if (Number($('#minimum').val()) > Number($('#maximum').val())) {
            msg = gettext('error_minimum')            
        }
        if ((Number($('#discount').val()) < Number($('#minimum').val())) || (Number($('#discount').val()) > Number($('#maximum').val()))) {
            msg = gettext('error_discount');            
        }
        if (!valid){
            showWarning(gettext('discount_value'), msg);            
            return;
        }

        if (valid) {
            toggleLoadingStep
            postData("/fastflood/save/", {
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
                maximum: $('#maximum').val(),
                transaction: $('#transaction').val(),
                travel: $('#travel').val(),
                contracts: $('#contracts').val(),
                others: $('#others').val(),
                total_platform: $('#total_platform').val(),
                financial_currency: $("#financial_currency option:selected").val()
            })
            .then(data => {
                $('#smartwizard').smartWizard("next");
                autoAdjustHeightTabContent();
                toggleLoadingStep("hide");
            })
            .catch(error => {
                console.error("Error saving data:", error);
                toggleLoadingStep("hide");
            });
        } else {
            showWarning(gettext('field_empty'), gettext('error_fields'));
            return;
        }
        autoAdjustHeightTabContent();
    });

    $('#step6NextBtn').click(function () {
        nbs = [];
        $('#nbs-ul input:checked').each(function () {
            id = $(this).attr("id").replace('nbs-', '')
            nbs.push(id)
        })
        if (nbs.length > 0) {
            toggleLoadingStep("show");
            postData("/fastflood/save/", {
                id_study_case: id_study_case,
                nbs: nbs
            })
            .then(data => {
                loadNBSActivities();                
                $(".lbl-currency-budget").html("(" + $("#analysis_currency").val()+ ")");                
            })
            .catch(error => {
                console.error("Error saving NBS data:", error);                
            }).finally(() => {
                toggleLoadingStep("hide");
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
            });
            validateAnalysisNbs();
        } else {
            showWarning(gettext('field_empty'), gettext('error_fields'));
            return;
        }
    });

    $('#step7RunBtn').click(function () {
        var valid_edit = true;
        var valid_period = true;
        nbsactivities = []
        var valid_edit = true;        
        var periodAnalysis = $('#period_analysis').val();
        var stormAnalysis = $('#analysis_storm').val();

        $("#full-table").find("input").each(function () {
            var $this = $(this);
            if ($this.val().length <= 0) {
                valid_edit = false;
                return false;
            } 
        });
        if (!valid_edit) {
            showWarning(gettext('field_empty'), gettext('error_table'));
        }
        if ($('#period_analysis').val() < 10 || $('#period_analysis').val() > 100) {
            showWarning(gettext('field_problem'), gettext('error_period_analysis'));
            valid_period = false;
            return;
        }
        if (!stormAnalysis) {
            showWarning(gettext('field_empty'), gettext('error_analysis_storm'));
            return;
        }
        if (yearsDemand.length > 0){
            var period = parseInt(periodAnalysis);
            var validPeriodAnalysis = true;
            yearsDemand.forEach(function(year){
                if (year != period){
                    validPeriodAnalysis = false;
                }
            })
            if (!validPeriodAnalysis){
                showWarning(gettext('field_problem'), gettext('Alert_time_demand')).then((result) => {                    
                    afterValidationStep7Run(valid_edit, valid_period);
                });
            }else{
                afterValidationStep7Run(valid_edit, valid_period);
            }  
        }else{
            afterValidationStep7Run(valid_edit, valid_period);
        }  
    });

    function afterValidationStep7Run(valid_edit, valid_period){
        if ($('#period_analysis').val() != '' && $('#period_nbs').val() != '') {
            if (parseInt($('#period_analysis').val()) < parseInt($('#period_nbs').val())) {
                showWarning(gettext('field_problem'), gettext('error_period_nbs'));
                valid_period = false;
                return
            }
        } else {
            valid_period = false;
        }
        if ($('#period_analysis').val() != '' && $('#period_nbs').val() != '' && valid_edit && valid_period) {
            analysis_currency = $("#analysis_currency option:selected").val();           
            let lbl_currency = gettext('Currency for the execution this analisys');
            let lbl_applied_currency = gettext('The following exchange rates will be applied for the analysis');            
            html = '<div class="row" id="currencys-panel"> <div class="col-md-10 currency-panel">' + lbl_currency + 
                    '</div><div class="col-md-2 currency-panel currency-text">' + analysis_currency;
            html += '</div><div class="col-md-12 currency-panel">' + lbl_applied_currency + '.</div>';
            html += '<div class="custom-control col-md-4 currency-value">'+ gettext('Currency') +'</div>';
            html += '<div class="custom-control col-md-8 currency-value">'+ gettext('Exchange') +'</div>';
            toggleLoadingStep("show");
            fetchCurrencies(id_study_case, analysis_currency)
            .then(data => {
                valid_investment = true;
                conversion = 1;
                each(data, function (i, currency) {
                    toggleLoadingStep("hide");
                    value = Number.parseFloat(currency.value).toFixed(5);
                    if (currency.currency == 'USD') {
                        conversion = value;
                    }
                    if (currency.currency != analysis_currency) {
                        value = Number.parseFloat(currency.value).toFixed(5);
                        html += '<div class="col-md-4 currency-value"><label class="custom-control-label" for="currency">' + currency.currency + '</label></div>'
                        html += '<div class="custom-control col-md-8 currency-value"><input id="' + currency.currency + 
                                '" class="text-number" type="number" class="custom-control-input" value="' + value + '"></div>';
                    }
                });
                nbs_value = 0;
                nbs_min = 0;
                minimun = 0;
                valid_nbs = true;
                $("#full-table").find("input").each(function (i, input) {
                    input_id = input.id
                    if ($("#" + input_id).hasClass("hiddennbs")) {
                        nbssc_id = input_id.split('-').pop();
                        nbs_min = parseFloat($("#" + input_id).val());
                        if ($("#" + input_id)[0].getAttribute("data-min-val-currency")) {
                            nbs_min = parseFloat($("#" + input_id)[0].getAttribute("data-min-val-currency"));
                        }else{
                            nbs_min /= conversion;
                        }
                        if (minimun) {
                            if (minimun > nbs_min) {
                                minimun = nbs_min;
                            }
                        } else {
                            minimun = nbs_min;
                        }
                        if (nbs_value < nbs_min && nbs_value > 0) {
                            valid_nbs = false;
                            $('#nbssc-' + nbssc_id).css('border-color', 'red');
                            showWarning(gettext('field_problem'), gettext('error_minimun_nbs') + ": " + nbs_min);
                            return false;
                        }
                    } else {
                        nbs_value = parseFloat($("#" + input_id).val());
                        if (nbs_value > 0)
                            valid_investment = false;
                        $("#" + input_id).css('border-color', '#eeeeee');
                    }
                });
                $('#annual_investment').css('border-color', '#eeeeee');
                if (valid_investment && $('#annual_investment').val() < minimun) {
                    valid_nbs = false;
                    $('#annual_investment').css('border-color', 'red');
                    showWarning(gettext('field_problem'), gettext('error_annual_investment') + ": " + minimun);
                    return false;
                }

                if (valid_nbs) {
                    showAlert({
                        title: gettext('exchange_rate'),
                        html: html,
                        showCancelButton: true,
                        confirmButtonText: gettext('Confirm and run'),
                        preConfirm: () => {
                            currencys = []
                            $("#currencys-panel").find("input").each(function (index, input) {
                                currency = {}
                                input_id = input.id
                                if (input_id) {
                                    val = $("#" + input_id).val()
                                    currency['currency'] = input_id;
                                    currency['value'] = val;
                                    currencys.push(currency)
                                }
                            });
                            return currencys;
                        }
                    }).then((result) => {
                        
                        if (result.isConfirmed) {
                            localStorage.setItem("preprocInit",false);
                            $("#full-table").find("input").each(function (index, input) {
                                nbsactivity = {};
                                input_id = input.id;
                                input_type = input.type;
                                if (input_id && input_type != 'hidden') {
                                    split = input_id.split('-');
                                    nbssc_id = split.pop();
                                    val = $("#" + input_id).val();
                                    nbsactivity['id'] = nbssc_id;
                                    nbsactivity['value'] = val;
                                    nbsactivities.push(nbsactivity);
                                }
                            });

                            let quantileValue = 0;
                            if ($('#quantile').prop("disabled") == false && $('#quantile').val() != 'N/A') {
                                quantileValue = $('#quantile').val();
                            }else{
                                quantileValue = 0;
                            }                            

                            postData("/fastflood/save/", {
                                id_study_case: id_study_case,
                                analysis_type: 'investment scenario',
                                period_nbs: $('#period_nbs').val(),
                                period_analysis: $('#period_analysis').val(),
                                analysis_nbs: $("#analysis_nbs option:selected").val(),
                                analysis_currency: $("#analysis_currency option:selected").val(),
                                studycase_type: `{"country_currency" : "${$('#analysis_currency option:selected').text()}"}`,
                                annual_investment: Number($('#annual_investment').val()),
                                rellocated_remainder: $("#rellocated_check").is(':checked'),
                                nbsactivities: '1' + JSON.stringify(nbsactivities),
                                currencys: '1' + JSON.stringify(result.value),
                                change_year: $('#climate_year').val(),
                                analisys_storm: $('#analysis_storm').val(),
                                storm_duration:  $('#storm_duration').val(),
                                quantile: quantileValue
                            })
                            .then(data => {
                                console.log("Default execution preprocRiosProcess");
                                try{
                                    // Ejecutar inmediatamente el primer intento
                                    console.log("Execution preprocRiosProcess .. First time");
                                    preprocRiosProcess(id_study_case, getPriority(getArea()));

                                    let validationInterval = setInterval(retryExecStudyCase, 20 * 1000);
                                    let iteration = 1;

                                    function retryExecStudyCase(){
                                        const preprocInit = localStorage.getItem("preprocInit");

                                        // Solo reintentar si NO está inicializado y NO está en progreso
                                        if (preprocInit !== "true" && preprocInit !== "in_progress"){
                                            console.log("Execution preprocRiosProcess in retry: " + iteration);
                                            preprocRiosProcess(id_study_case, getPriority(getArea()));
                                            iteration++;

                                            if (iteration == 2){
                                                clearInterval(validationInterval);
                                            }
                                        }else{
                                            console.log("preprocRiosProcess is running or completed, Cancel Retry");
                                            clearInterval(validationInterval);
                                        }
                                    }
                                }catch (error){
                                    console.error('Ocurrió un error:', error);
                                    msgError();
                                }
                            })
                            .catch(error => {
                                console.error("Error saving analysis data:", error);
                                msgError();
                            });
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            toggleLoadingStep("hide");
                            console.log("El usuario canceló, cerrando modal...");
                            Swal.close(); 
                        }
                    })
                }
            })
            .catch(error => {
                toggleLoadingStep("hide");
                console.error("Error fetching currencies:", error);
                showError('Error', 'Failed to fetch currency data: ' + error.message);
            });
        } else {
            showWarning(gettext('field_empty'), gettext('error_fields'));
            return;
        }
    }

    $('#step7EndBtn').click(function () {
        var valid_edit = true;
        var valid_period = true;
        nbsactivities = [];
        var valid_edit = true;        
        var periodAnalysis = $('#period_analysis').val();
        var stormAnalysis = $('#analysis_storm').val();

        $("#full-table").find("input").each(function () {
            var $this = $(this);
            if ($this.val().length <= 0) {
                valid_edit = false;
                return false;
            }
        });
        if (!valid_edit) {
            showWarning(gettext('field_empty'), gettext('error_table'));
        }
        if (!stormAnalysis) {
            showWarning(gettext('field_empty'), gettext('error_analysis_storm'));
            return;
        }
        if (periodAnalysis < 10 || periodAnalysis > 100) {
            showWarning(gettext('field_problem'), gettext('error_period_analysis'));
            valid_period = false;
            return;
        }
        if (periodAnalysis != '' && $('#period_nbs').val() != '') {
            if (parseInt(periodAnalysis) < parseInt($('#period_nbs').val())) {
                showWarning(gettext('field_problem'), gettext('error_period_nbs'));
                valid_period = false;
                return;
            }
        } else {
            valid_period = false;
        }

        if (yearsDemand.length > 0){
            var period = parseInt(periodAnalysis);
            var validPeriodAnalysis = true;
            yearsDemand.forEach(function(year){
                if (year != period){
                    validPeriodAnalysis = false;
                }
            })
            if (!validPeriodAnalysis){
                showWarning(gettext('field_problem'), gettext('Alert_time_demand')).then((result) => {                    
                    afterValidationStep7(valid_edit, valid_period);
                });
            }else{
                afterValidationStep7(valid_edit, valid_period);
            }
        }else{
            afterValidationStep7(valid_edit, valid_period);
        }        

    });

    function afterValidationStep7 (valid_edit, valid_period) {
        if ($('#period_analysis').val() != '' && $('#period_nbs').val() != '' && valid_edit && valid_period) {
            analysis_currency = $("#analysis_currency option:selected").val();            
            toggleLoadingStep("show");
            fetchCurrencies(id_study_case, analysis_currency)
            .then(data => {
                toggleLoadingStep("hide");
                valid_investment = true;
                conversion = 1;
                each(data, function (i, currency) {
                    value = Number.parseFloat(currency.value).toFixed(5);
                    if (currency.currency == 'USD') {
                        conversion = value;
                    }
                    if (currency.currency != analysis_currency) {
                        value = Number.parseFloat(currency.value).toFixed(5);                        
                    }
                });
                nbs_value = 0;
                nbs_min = 0;
                minimun = 0;
                valid_nbs = true
                $("#full-table").find("input").each(function (i, input) {
                    input_id = input.id;
                    if ($("#" + input_id).hasClass("hiddennbs")) {
                        split = input_id.split('-');
                        nbssc_id = split.pop();
                        nbs_min = parseFloat($("#" + input_id).val());
                        if ($("#" + input_id)[0].getAttribute("data-min-val-currency")) {
                            nbs_min = parseFloat($("#" + input_id)[0].getAttribute("data-min-val-currency"));
                        }else{
                            nbs_min /= conversion;
                        }
                        if (minimun) {
                            if (minimun > nbs_min) {
                                minimun = nbs_min;
                            }
                        } else {
                            minimun = nbs_min;
                        }
                        if (nbs_value < nbs_min && nbs_value > 0) {
                            valid_nbs = false;
                            $('#nbssc-' + nbssc_id).css('border-color', 'red');
                            showWarning(gettext('field_problem'), gettext('error_minimun_nbs') + ": " + nbs_min.toFixed(2));
                            return false
                        }
                    } else {
                        nbs_value = parseFloat($("#" + input_id).val());
                        if (nbs_value > 0)
                            valid_investment = false
                        $("#" + input_id).css('border-color', '#eeeeee');
                    }
                });
                if (valid_investment && $('#annual_investment').val() < minimun) {
                    valid_nbs = false;
                    showWarning(gettext('field_problem'), gettext('error_annual_investment') + ": " + minimun);
                    return false
                }
                if (valid_nbs) {                    
                    $("#full-table").find("input").each(function (index, input) {
                        nbsactivity = {};
                        input_id = input.id;
                        input_type = input.type;
                        if (input_id && input_type != 'hidden') {
                            split = input_id.split('-')
                            nbssc_id = split.pop();
                            val = $("#" + input_id).val();
                            nbsactivity['id'] = nbssc_id;
                            nbsactivity['value'] = val;
                            nbsactivities.push(nbsactivity);
                        }
                    });

                    let quantileValue = 0;
                    if ($('#quantile').prop("disabled") == false && $('#quantile').val() != 'N/A') {
                        quantileValue = $('#quantile').val();
                    }else{
                        quantileValue = 0;
                    }
                    
                    currencys = [];
                    $("#currencys-panel").find("input").each(function (index, input) {
                        currency = {};
                        input_id = input.id;
                        if (input_id) {
                            val = $("#" + input_id).val();
                            currency['currency'] = input_id;
                            currency['value'] = val;
                            currencys.push(currency);
                        }
                    });

                    postData("/fastflood/save/", {
                        id_study_case: id_study_case,
                        analysis_type: 'investment scenario',
                        period_nbs: $('#period_nbs').val(),
                        period_analysis: $('#period_analysis').val(),
                        analysis_nbs: $("#analysis_nbs option:selected").val(),
                        analysis_currency: $("#analysis_currency option:selected").val(),
                        studycase_type: `{"country_currency" : "${$('#analysis_currency option:selected').text()}"}`,
                        annual_investment: $('#annual_investment').val(),
                        rellocated_remainder: $("#rellocated_check").is(':checked'),
                        nbsactivities: '1' + JSON.stringify(nbsactivities),
                        currencys: '1' + JSON.stringify(currencys),
                        change_year: $('#climate_year').val(),
                        analisys_storm: $('#analysis_storm').val(),
                        storm_duration:  $('#storm_duration').val(),
                        quantile: quantileValue
                    })
                    .then(data => {
                        $('#_thumbnail_processing').modal('hide');
                        $('#smartwizard').smartWizard("next");
                        autoAdjustHeightTabContent();
                        //$("#form").submit();
                        locationHref();
                    })
                    .catch(error => {
                        console.error("Error saving analysis data:", error);
                        $('#_thumbnail_processing').modal('hide');
                        locationHref(); // Proceed anyway for user experience
                    });    
                }
            })
            .catch(error => {
                toggleLoadingStep("hide");
                console.error("Error fetching currencies:", error);
                showError('Error', 'Failed to fetch currency data: ' + error.message);
            });
        } else {
            showWarning(gettext('field_empty'), gettext('error_fields'));
            return;
        }
    }

    $('#custom_table').on('click', 'a', function () {
        var row = $(this).closest("tr");
        var tds = row.find("td");
        watershedName = "";
        each(tds, function (i, td) {
            if (i == 0) {
                watershedName = $(td).text();
            }
        });
        option = watershedName;
        id = row.attr("id").replace('custom-', '');
        $("#select_custom").append(new Option(option, id));
        row.remove();
        $('#add_wi').prop('disabled', false);
    });

    function saveStudyCaseBiophysicalParams() {
    
        const rows = document.querySelectorAll('#invest-table-info-body tr');
        let sc_bio = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const entry = {
            description: cells[0].innerText.trim(),
            lulcode: parseInt(cells[1].innerText.trim()),
            c_above: parseFloat(cells[2].innerText.trim()) || 0,
            c_below: parseFloat(cells[3].innerText.trim()) || 0,
            c_soil: parseFloat(cells[4].innerText.trim()) || 0,
            c_dead: parseFloat(cells[5].innerText.trim()) || 0
            };
            sc_bio.push(entry);
        });
        console.log(sc_bio);

        // Use fetch instead of $.ajax
        ajaxRequest({
            url: "/fastflood/savebio/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                id_study_case: id_study_case,
                sc_bio: sc_bio,
                watershed_id: localStorage.getItem("watershedId")
            })
        })
        .then(data => {
            console.log("Datos guardados:", data);
        })
        .catch(error => {
            console.error("Error al guardar biophysical data:", error);
        });
    }

    function saveDamageData() {
        const rows = document.querySelectorAll('#damage-table-body tr');
        const depthRows = document.querySelectorAll('#max-damage-table-body tr');
        let damageData = [];
        let maxDamageData = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const entry = {
                flood_depth: parseLocalizedFloat(cells[0].innerText),
                residential: parseLocalizedFloat(cells[1].innerText),
                commercial: parseLocalizedFloat(cells[2].innerText),
                industrial: parseLocalizedFloat(cells[3].innerText),
                infraroad: parseLocalizedFloat(cells[4].innerText),
                agriculture: parseLocalizedFloat(cells[5].innerText)
            };
            damageData.push(entry);
        });
        depthRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const maxEntry = {
                residential: parseLocalizedFloat(cells[0].innerText),
                commercial: parseLocalizedFloat(cells[1].innerText),
                industrial: parseLocalizedFloat(cells[2].innerText),
                infraroad: parseLocalizedFloat(cells[3].innerText),
                agriculture: parseLocalizedFloat(cells[4].innerText)
            };
            maxDamageData.push(maxEntry);
        });
        console.log(damageData);
        console.log(maxDamageData);

        ajaxRequest({
            url: "/fastflood/savedamage/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                id_study_case: id_study_case,
                damage_data: damageData,
                max_damage_data: maxDamageData
            }),
            dataType: "json"
        })
        .then(data => {
            console.log("Datos guardados:", data);
        })
        .catch(error => {
            console.error("Error al guardar:", error);
        });
    }

    function fillCsvDamageData(id_study_case) {
        console.log("fillCsvDamageData...");
        
        let actualWatershed = localStorage.getItem("watershedId");
        if (watershedId != undefined && watershedId != null && watershedId != "") {
            actualWatershed = watershedId;
        }        
        
        const dataCurve = [];
        const dataMax = [];

        $('#damage-table-body tr').each(function () {
            const cells = $(this).find('td');

            const obj = {
                "Flooddepth[m]": parseLocalizedFloat($(cells[0]).text()),
                "Residential": parseLocalizedFloat($(cells[1]).text()),
                "Commercial": parseLocalizedFloat($(cells[2]).text()),
                "Industrial": parseLocalizedFloat($(cells[3]).text()),
                "InfraRoads": parseLocalizedFloat($(cells[4]).text()),
                "Agriculture": parseLocalizedFloat($(cells[5]).text())
            };
            dataCurve.push(obj);
        });
        console.log(dataCurve);
        const dataJsonCurve = [
            dataCurve[0],dataCurve[1],dataCurve[2],dataCurve[3],dataCurve[4],dataCurve[5],dataCurve[6],dataCurve[7],dataCurve[8]
        ];

        $('#max-damage-table-body tr').each(function () {
            const cells = $(this).find('td');

            const obj = {
                residential: parseLocalizedFloat($(cells[0]).text()),
                commercial: parseLocalizedFloat($(cells[1]).text()),
                industrial: parseLocalizedFloat($(cells[2]).text()),
                infra_roads: parseLocalizedFloat($(cells[3]).text()),
                agriculture: parseLocalizedFloat($(cells[4]).text())
            };
            dataMax.push(obj);
        });        
        
        ajaxRequest({
            url: StudyCaseConfig.urls.createDamageFile,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                study_case_folder: studyCaseFolder,
                watershed_id: actualWatershed,
                max_damage_cost:{
                    Residential: dataMax[0].residential,
                    Commercial: dataMax[0].commercial,
                    Industrial: dataMax[0].industrial,
                    InfraRoads: dataMax[0].infra_roads,
                    Agriculture: dataMax[0].agriculture
                },
                damage_factor_curves: dataJsonCurve
            }),
            dataType: "json"
        })
        .then(data => {
            console.log("Folder created successfully");
        })
        .catch(error => {
            console.error("Request failed:", error);
        });
    }      

    function loadNBS() {
        var city_id = localStorage.cityId;
        // Use fetch instead of $.post
        postData("/fastflood/nbs/", {
            id_study_case: studyCaseId,
            city_id: city_id,
            process: "Edit"
        })
        .then(data => {
            content = ''
            each(data, function (index, nbs) {
                var name = nbs.name;
                var id = nbs.id;
                var def = nbs.default;
                content = '<li class="list-group-item"><div class="custom-control custom-checkbox">'
                if (def) {
                    content += '<input type="checkbox" class="custom-control-input" id="nbs-' + id + '" checked>';
                } else {
                    content += '<input type="checkbox" class="custom-control-input" id="nbs-' + id + '">';
                }
                content += '<label class="custom-control-label" for="nbs-' + id + '"> ' + name + '</label></div></li>'
                $("#nbs-ul").append(content);
            });
            autoAdjustHeightTabContent();
        })
        .catch(error => {
            console.error("Error loading NBS:", error);
            showError('Error', 'Failed to load NBS: ' + error.message);
        });
    }
    
    tableBody.addEventListener('blur', function (e) {
        if (e.target.classList.contains('editable')) {
            let value = e.target.innerText.trim().replace(',', '.');
            let number = parseFloat(value);
            
            if (isNaN(number) || number < 0) {
                showWarning(gettext('field_problem'), gettext('You must enter a number greater than 0'))
                // alert('Debe ingresar un número mayor a 0');
                e.target.innerText = '1'; 
            } else {
                e.target.innerText = number;
            }
        }
    }, true);

    autoAdjustHeightTabContent();

    $("#analysis_currency").on("change", function(e){
        $(".lbl-currency-budget").html("(" + $("#analysis_currency").val()+ ")");
        analysis_currency = $("#analysis_currency option:selected").val();
        toggleLoadingStep("show");      
        fetchCurrencies(id_study_case, analysis_currency)
        .then(currencies => {
            toggleLoadingStep("hide");
            $("#full-table tr").each(function (row, tr){
                if (row>0){
                    idInput = tr.children[1].getElementsByTagName("input")[0].id;
                    inputMinimun =  $("#" + idInput.replace("nbssc","minimun"))[0];
                    divLblminVal = $("#" + idInput.replace("nbssc","min-val-nbs"))[0];
                    nbsCurrency = inputMinimun.getAttribute("data-nbs-currency");
                    min = inputMinimun.value;

                    minInAnalysisCurrency = min;
                    if (currencies.length > 0){
                        let f = currencies.filter(c => c.currency == nbsCurrency);
                        if (f.length > 0){
                            minInAnalysisCurrency = min / parseFloat(f[0].value);
                        }
                    }
                    divLblminVal.innerText = `${gettext("minimum_value")} : ${Math.ceil(minInAnalysisCurrency).toLocaleString('en-US', { style: 'currency', currency: 'USD'})}`;
                    inputMinimun.setAttribute("data-min-val-currency", minInAnalysisCurrency);
                }
            })
        })
        .catch(error => {
            toggleLoadingStep("hide");
            console.error("Error fetching currencies:", error);
            showError('Error', 'Failed to fetch currency data: ' + error.message);
        });
    })

    // Initialize name validation using common functions
    initializeNameValidation();

    // Initialize storm duration info tooltip (function defined in study_cases_common.js)
    initializeStormDurationInfo();
});

// Note: initializeStormDurationInfo and buildStormDurationMessage functions
// have been moved to study_cases_common.js for code reuse