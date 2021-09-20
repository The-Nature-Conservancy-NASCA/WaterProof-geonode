/**
 * @file Create Study Case wizard step
 * validations & interactions
 * @version 1.0
 */
var urlParams = (function (url) {
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
var intakes = [];
var ptaps = [];
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
var flagFunctionCost = false;

$(document).ready(function () {
    $('#autoAdjustHeightF').css("height", "auto");
    $('#cityLabel').text(localStorage.city + ", " + localStorage.country);
    $('#coeqCountry').text("CO2_country"+" ("+localStorage.country+")");
    var output = document.getElementById('MathPreview');
    var button = document.getElementById('btnValidatePyExp');
    var selectedCostId = 0;
    calculate_Personnel();
    calculate_Platform();
    loadIntakes();
    loadPtaps();
    loadNBS();

    if (funcostdb.length > 0) {
        $("#cost_table").removeClass('panel-hide');
    }
    funcostdb.forEach((f, index) => {
        funcost(index);
    });

    $('#custom').click(function () {
        if ($('#ptap_table').find('tbody > tr').length > 0) {
            Swal.fire({
                title: gettext('are_you_sure'),
                text: gettext('question_revert'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: gettext('response_delete'),
            }).then((result) => {
                if (result.isConfirmed) {
                    $("#panel-custom").removeClass("panel-hide");
                    $("#panel-cost").removeClass("panel-hide");
                    $("#panel-ptap").addClass("panel-hide");
                    $('#autoAdjustHeightF').css("height", "auto");
                    $("#ptap_table tbody tr").empty();
                    $('#ptap-required').text("");
                    $('#custom-required').text("*");
                } else {
                    $("input[name=type][value='1']").prop('checked', true);
                }
            })
        } else {
            $("#panel-custom").removeClass("panel-hide");
            $("#panel-ptap").addClass("panel-hide");
            $("#panel-cost").removeClass("panel-hide");
            $('#autoAdjustHeightF').css("height", "auto");
            $('#ptap-required').text("");
            $('#custom-required').text("*");
        }
    });

    $('#ptap').click(function () {
        $("#panel-ptap").removeClass("panel-hide");
        $("#panel-custom").removeClass("panel-hide");
        $("#panel-cost").addClass("panel-hide");
        autoAdjustHeight();
        $('#ptap-required').text("*");
        $('#custom-required').text("");
    });

    $('#btn-advanced_option').click(function () {
        if ($("#biophysical-panel").hasClass("panel-hide")) {
            $("#biophysical-panel").removeClass("panel-hide");
            $("#biophysical-panel").empty();
            loadBiophysicals();
            $('#txtGuide1').text(gettext("tables_text"));
            $('#txtGuide2').text(gettext("InVEST_documentation"));
        } else {
            $("#biophysical-panel").empty();
            $("#biophysical-panel").addClass("panel-hide");
            $('#txtGuide1').text("");
            $('#txtGuide2').text("");
        }
    });

    $('#btn-full').click(function () {
        if ($("#full-table").hasClass("panel-hide")) {
            $("#full-table").removeClass("panel-hide");
            nbsactivities = $("#full-table").find("input")
            nbsactivities.each(function () {
                total = 50
                if (total) {
                    value = total / nbsactivities.length
                    value = Number.parseFloat(value).toFixed(2);
                    var $this = $(this).val(value);
                } else {
                    var $this = $(this).val('');
                }
            });
            autoAdjustHeight();
            $('#column_investment').text("Percentage");
        } else {
            $("#full-table").addClass("panel-hide");
        }
    });

    $('#btn-investment').click(function () {
        if ($("#full-table").hasClass("panel-hide")) {
            $("#full-table").removeClass("panel-hide");
            autoAdjustHeight();
            $('#column_investment').text("Investment");
            nbsactivities = $("#full-table").find("input")
            nbsactivities.each(function () {
                total = $('#annual_investment').val() / 2
                if (total) {
                    value = total / nbsactivities.length
                    value = Number.parseFloat(value).toFixed(2);
                    var $this = $(this).val(value);
                } else {
                    var $this = $(this).val('');
                }
            });
        } else {
            $("#full-table").addClass("panel-hide");
        }
    });

    $('#full').click(function () {
        $("#panel-full").removeClass("panel-hide");
        $("#panel-investment").addClass("panel-hide");
        $("#full-table").addClass("panel-hide");
        autoAdjustHeight();
        $('#column_investment').text("Percentage");
        $("#full-table").find("input").each(function () {
            var $this = $(this).val('');
        });
    });

    $('#investment').click(function () {
        $("#panel-investment").removeClass("panel-hide");
        $("#panel-full").addClass("panel-hide");
        $("#full-table").addClass("panel-hide");
        autoAdjustHeight();
        $('#column_investment').text("Investment");
        $("#full-table").find("input").each(function () {
            var $this = $(this).val('');
        });
    });

    $('#add_wi').click(function () {
        text = $("#select_custom option:selected").text();
        value = $("#select_custom option:selected").val();
        if (value) {
            $('#select_custom option:selected').remove();
            var action = "<td><a class='btn btn-danger btn-right'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></a></td>";
            $.get("../../study_cases/intakebyid/" + value, function (data) {
                $.each(data, function (index, intake) {
                    var name = "<td>" + intake.name + "</td>";
                    var description = "<td>" + intake.description + "</td>";
                    var name_source = "<td>" + intake.water_source_name + "</td>";
                    var markup = "<tr id='custom-" + value + "'>" + name + description + name_source + action + "</tr>";
                    $("#custom_table").find('tbody').append(markup);
                });

                $('#autoAdjustHeightF').css("height", "auto");
            });
        }
    });

    $('#add_ptap').click(function () {
        text = $("#select_ptap option:selected").text();
        value = $("#select_ptap option:selected").val();
        if (value) {
            $('#select_ptap option:selected').remove();
            var action = "<td><a class='btn btn-danger btn-right'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></a></td>";
            $.get("../../study_cases/ptapbyid/" + value, function (data) {
                $.each(data, function (index, ptap) {
                    var name = "<td>" + ptap.plant_name + "</td>";
                    var description = "<td>" + ptap.plant_description + "</td>";
                    var markup = "<tr id='ptap-" + value + "'>" + name + description + action + "</tr>";
                    $("#ptap_table").find('tbody').append(markup);
                });
            });
            $('#autoAdjustHeightF').css("height", "auto");
        }
    });

    $('#step1NextBtn').click(function () {
        intakes = [];
        ptaps = [];
        valid_ptaps = true;
        valid_intakes = true;
        $('#custom_table').find('tbody > tr').each(function (index, tr) {
            id = tr.id.replace('custom-', '');
            intakes.push(id);
        });
        if (intakes.length <= 0) {
            valid_intakes = false;
        }
        var type = $("input[name='type']:checked").val();
        if (type == "1") {
            $('#ptap_table').find('tbody > tr').each(function (index, tr) {
                id = tr.id.replace('ptap-', '')
                ptaps.push(id)
            });
            if (ptaps.length <= 0) {
                valid_ptaps = false;
            } else {
                valid_intakes = true
            }
        }
        if (($('#name').val() != '' && $('#description').val() != '' && valid_intakes && valid_ptaps)) {
            $.post("../../study_cases/save/", {
                name: $('#name').val(),
                id_study_case: id_study_case,
                description: $('#description').val(),
                intakes: intakes,
                ptaps: ptaps,
                city_id: localStorage.cityId,
                country: localStorage.country,
                type: type,
                functions: JSON.stringify(funcostdb),
            }, function (data) {
                id_study_case = data.id_study_case;
                if (id_study_case == '') {
                    Swal.fire({
                        icon: 'warning',
                        title: gettext('study_case_exist'),
                        text: gettext('error_name')
                    });
                    return;
                } else {
                    $('#smartwizard').smartWizard("next");
                    autoAdjustHeight();
                }

            }, "json");
        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_empty'),
                text: gettext('error_fields')
            });
            return;
        }
    });

    $("#cb_check").click(function () {
        if ($(this).is(":checked")) // "this" refers to the element that fired the event
        {
            $("#cm_form").show();
            $('#autoAdjustHeightF').css("height", "auto");
        } else {
            $("#cm_form").hide();
        }
        autoAdjustHeight();
    })

    $('#step2PreviousBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step2NextBtn').click(function () {
        $.post("../../study_cases/save/", {
            id_study_case: id_study_case,
            carbon_market: $("#cb_check").is(':checked'),
            carbon_market_value: $('#id_cm').val(),
            carbon_market_currency: $("#cm_select option:selected").val()
        }, function (data) {
            $('#smartwizard').smartWizard("next");
            autoAdjustHeight();
        }, "json");
    });

    $('#step3PreviousBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step3NextBtn').click(function () {
        portfolios = [];
        $('#portfolios-ul input:checked').each(function () {
            id = $(this).attr("id").replace('portfolio-', '')
            portfolios.push(id)
        })
        if (portfolios.length > 0) {
            $.post("../../study_cases/save/", {
                id_study_case: id_study_case,
                portfolios: portfolios
            }, function (data) {
                $('#smartwizard').smartWizard("next");
                autoAdjustHeight();
            }, "json");
        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_empty'),
                text: gettext('error_fields')
            });
            return;
        }
    });

    $('#step4PreviousBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step4NextBtn').click(function () {
        biophysical = []
        $('#biophysical-panel').find('table').each(function (index, table) {
            id = table.id.split('_').pop()
            $('#' + table.id).find('tbody > tr.edit').each(function (index, tr) {
                bio = {
                    intake_id: id
                }
                $(" #" + tr.id).find('td').each(function (index, td) {
                    td_id = td.id
                    if (td_id) {
                        split = td_id.split('_')
                        split.pop();
                        name_td = split.join("_");
                        split = name_td.split('_')
                        split.pop();
                        name_td = split.join("_");
                        val = undefined
                        $('#' + td_id).find("input").each(function () {
                            val = $(this).val();
                        });
                        if (!val) {
                            val = $('#' + td.id).text();
                        }
                        bio[name_td] = val;
                    }
                });
                biophysical.push(bio)
            });

        });

        $.post("../../study_cases/savebio/", {
            id_study_case: id_study_case,
            biophysicals: '1' + JSON.stringify(biophysical),
            process: "Create",
        }, function (data) {
            $('#smartwizard').smartWizard("next");
            loadFinancialParameter();
            autoAdjustHeight();
        }, "json");

    });

    $('#step5PreviousBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
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
        if ($('#minimum').val() > $('#maximum').val()) {
            Swal.fire({
                icon: 'warning',
                title: gettext('minimum_value'),
                text: gettext('error_minimum')
            });
            valid = false
            return;
        }
        if (($('#discount').val() < $('#minimum').val()) || ($('#discount').val() > $('#maximum').val())) {
            Swal.fire({
                icon: 'warning',
                title: gettext('discount_value'),
                text: gettext('error_discount')
            });
            valid = false
            return;
        }

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
                maximum: $('#maximum').val(),
                transaction: $('#transaction').val(),
                travel: $('#travel').val(),
                contracts: $('#contracts').val(),
                others: $('#others').val(),
                total_platform: $('#total_platform').val(),
                financial_currency: $("#financial_currency option:selected").val()
            }, function (data) {
                loadNBS();
                $('#smartwizard').smartWizard("next");
                autoAdjustHeight();
            }, "json");
        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_empty'),
                text: gettext('error_fields')
            });
            return;
        }
    });

    $('#step6PreviousBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step6NextBtn').click(function () {
        nbs = [];
        $('#nbs-ul input:checked').each(function () {
            id = $(this).attr("id").replace('nbs-', '')
            nbs.push(id)
        })
        if (nbs.length > 0) {
            $.post("../../study_cases/save/", {
                id_study_case: id_study_case,
                nbs: nbs
            }, function (data) {
                loadNBSActivities();
            }, "json");
        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_empty'),
                text: gettext('error_fields')
            });
            return;
        }
    });

    $('#step7PreviousBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step7RunBtn').click(function () {
        var valid_edit = true;
        var valid_period = true;
        nbsactivities = []
        var valid_edit = true;
        var min = undefined;
        $("#full-table").find("input").each(function () {
            var $this = $(this);
            if ($this.val().length <= 0) {
                valid_edit = false;
                return false;
            } 
        });
        if (!valid_edit) {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_empty'),
                text: gettext('error_table'),
            });
        }
        if ($('#period_analysis').val() < 10 || $('#period_analysis').val() > 100) {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_problem'),
                text: gettext('error_period_analysis'),
            });
            valid_period = false;
            return
        }
        if ($('#period_analysis').val() != '' && $('#period_nbs').val() != '') {
            if (parseInt($('#period_analysis').val()) < parseInt($('#period_nbs').val())) {
                Swal.fire({
                    icon: 'warning',
                    title: gettext('field_problem'),
                    text: gettext('error_period_nbs'),
                });
                valid_period = false;
                return
            }
        } else {
            valid_period = false;
        }

        if ($('#period_analysis').val() != '' && $('#period_nbs').val() != '' && valid_edit && valid_period) {

            analysis_currency = $("#analysis_currency option:selected").val()
            html = '<div class="row" id="currencys-panel"> <div class="col-md-10 currency-panel">Currency for the execution this analisys</div><div class="col-md-2 currency-panel currency-text">' + analysis_currency
            html += '</div><div class="col-md-12 currency-panel">The following exchange rates will be applied for the analysis.</div>'
            html += '<div class="custom-control col-md-4 currency-value">Currency</div>'
            html += '<div class="custom-control col-md-8 currency-value">Exchange</div>'
            $.get("../../study_cases/currencys/", {
                id: id_study_case,
                currency: analysis_currency
            }, function (data) {
                valid_investment = true;
                conversion = 1;
                $.each(data, function (index, currency) {
                    value = Number.parseFloat(currency.value).toFixed(5);
                    if (currency.currency == 'USD') {
                        conversion = value;
                    }
                    if (currency.currency != analysis_currency) {
                        value = Number.parseFloat(currency.value).toFixed(5);
                        html += '<div class="col-md-4 currency-value"><label class="custom-control-label" for="currency">' + currency.currency + '</label></div>'
                        html += '<div class="custom-control col-md-8 currency-value"><input id="' + currency.currency + '" class="text-number" type="number" class="custom-control-input" value="' + value + '"></div>'
                    }
                });
                nbs_value = 0;
                nbs_min = 0;
                minimun = 0;
                valid_nbs = true
                $("#full-table").find("input").each(function (index, input) {
                    input_id = input.id
                    if ($("#" + input_id).hasClass("hiddennbs")) {
                        split = input_id.split('-')
                        nbssc_id = split.pop();
                        nbs_min = parseFloat($("#" + input_id).val());
                        nbs_min /= conversion
                        if (minimun) {
                            if (minimun > nbs_min) {
                                minimun = nbs_min;
                            }
                        } else {
                            minimun = nbs_min;
                        }
                        if (nbs_value < nbs_min && nbs_value > 0) {
                            valid_nbs = false
                            $('#nbssc-' + nbssc_id).css('border-color', 'red');
                            Swal.fire({
                                icon: 'warning',
                                title: gettext('field_problem'),
                                text: gettext('error_minimun_nbs') + nbs_min,
                            });
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
                    Swal.fire({
                        icon: 'warning',
                        title: gettext('field_problem'),
                        text: gettext('error_annual_investment') + minimun,
                    });
                    return false
                }
                if (valid_nbs) {
                Swal.fire({
                    title: gettext('exchange_rate'),
                    html: html,
                    showCancelButton: true,
                    confirmButtonText: gettext('save'),
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
                        return currencys
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        $('#_thumbnail_processing').modal('toggle');
                        let description = gettext("run_processing_description");
                        let desc = document.createElement("div");
                        desc.innerHTML = description;
                        $('#_thumbnail_processing .modal-body').append(desc);

                        $("#full-table").find("input").each(function (index, input) {
                            nbsactivity = {}
                            input_id = input.id
                            input_type = input.type
                            if (input_id && input_type != 'hidden') {
                                split = input_id.split('-')
                                nbssc_id = split.pop();
                                val = $("#" + input_id).val()
                                nbsactivity['id'] = nbssc_id;
                                nbsactivity['value'] = val;
                                nbsactivities.push(nbsactivity)
                            }
                        });
                        $.post("../../study_cases/save/", {
                            id_study_case: id_study_case,
                            analysis_type: 'investment scenario',
                            period_nbs: $('#period_nbs').val(),
                            period_analysis: $('#period_analysis').val(),
                            analysis_nbs: $("#analysis_nbs option:selected").val(),
                            analysis_currency: $("#analysis_currency option:selected").val(),
                            annual_investment: $('#annual_investment').val(),
                            rellocated_remainder: $("#rellocated_check").is(':checked'),
                            nbsactivities: '1' + JSON.stringify(nbsactivities),
                            currencys: '1' + JSON.stringify(result.value),
                        }, function (data) {
                            $.ajax({
                                url : servermodelApi+"preprocRIOS?id_case="+id_study_case+"%26id_usuario="+id_user,
                                type : 'GET',
                                dataType : 'json',
                                success : function(json) {
                                    if(json.status == 'success'){
                                        $.post("../../study_cases/run/", {
                                            id_study_case: id_study_case,
                                            run_analysis: 'true'
                                        }, function (data) {
                                        $('#_thumbnail_processing').modal('hide');
                                        autoAdjustHeight();
                                        //$("#form").submit();
                                        location.href = "/study_cases/?city="+localStorage.cityId; 
                                    }, "json");
                                    }else{
                                        $('#_thumbnail_processing').modal('hide');
                                        Swal.fire({
                                            icon: 'error',
                                            title: gettext('error_api'),
                                            text: gettext('error_model_api'),
                                        });  
                                        location.href = "/study_cases/?city="+localStorage.cityId; 
                                    }
                                },
                                error : function(xhr, status) {
                                    if (xhr.status != 504) {
                                        $('#_thumbnail_processing').modal('hide');
                                        Swal.fire({
                                            icon: 'error',
                                            title: gettext('error_api'),
                                            text: gettext('error_model_api'),
                                        });
                                        location.href = "/study_cases/?city="+localStorage.cityId;
                                    }
                                }
                            })

                            let urlQueryAnalisysResult = servermodelApi+"queryStudyCaseAnalisysResult?id_case="+id_study_case;
                            let validationInterval = setInterval(queryAnalisysResult, 30000);
                            let iteration = 1;

                            function queryAnalisysResult(){
                                console.log("queryAnalisysResult, iteracion: " + iteration);
                                if (iteration < 3) {
                                    console.log("iteration after 10 minutes, the process does´nt query yet");
                                    iteration++;
                                    return;
                                }else if (iteration == 18){
                                    console.log("iteration: " + iteration + ", waiting for the process to finish");
                                    clearInterval(validationInterval);
                                    location.href = "/study_cases/?city="+localStorage.cityId; 
                                }
                                $.ajax({
                                    url : urlQueryAnalisysResult,
                                    type : 'GET',
                                    dataType : 'json',
                                    success : function(json) {                                    
                                        if (json.status[0]) {
                                            $('#_thumbnail_processing').modal('hide');
                                            console.log("finish interval execution");
                                            clearInterval(validationInterval);
                                            location.href = "/study_cases/?city="+localStorage.cityId; 
                                        }
                                        iteration++;                                        
                                    },
                                    error : function(xhr, status) {
                                        $('#_thumbnail_processing').modal('hide');
                                        location.href = "/study_cases/?city="+localStorage.cityId;                
                                    }
                                });
                            } 
                        }, "json");
                    }
                })
            }
            });

        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_empty'),
                text: gettext('error_fields')
            });
            return;
        }

    });

    $('#step7EndBtn').click(function () {
        var valid_edit = true;
        var valid_period = true;
        nbsactivities = []
        var valid_edit = true;
        var min = undefined;
        $("#full-table").find("input").each(function () {
            var $this = $(this);
            if ($this.val().length <= 0) {
                valid_edit = false;
                return false;
            } 
        });
        if (!valid_edit) {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_empty'),
                text: gettext('error_table'),
            });
        }
        if ($('#period_analysis').val() < 10 || $('#period_analysis').val() > 100) {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_problem'),
                text: gettext('error_period_analysis'),
            });
            valid_period = false;
            return
        }
        if ($('#period_analysis').val() != '' && $('#period_nbs').val() != '') {
            if (parseInt($('#period_analysis').val()) < parseInt($('#period_nbs').val())) {
                Swal.fire({
                    icon: 'warning',
                    title: gettext('field_problem'),
                    text: gettext('error_period_nbs'),
                });
                valid_period = false;
                return
            }
        } else {
            valid_period = false;
        }
        if ($('#period_analysis').val() != '' && $('#period_nbs').val() != '' && valid_edit && valid_period) {
            analysis_currency = $("#analysis_currency option:selected").val()
            html = '<div class="row" id="currencys-panel"> <div class="col-md-10 currency-panel">Currency for the execution this analisys</div><div class="col-md-2 currency-panel currency-text">' + analysis_currency
            html += '</div><div class="col-md-12 currency-panel">The following exchange rates will be applied for the analysis.</div>'
            html += '<div class="custom-control col-md-4 currency-value">Currency</div>'
            html += '<div class="custom-control col-md-8 currency-value">Exchange</div>'
            $.get("../../study_cases/currencys/", {
                id: id_study_case,
                currency: analysis_currency
            }, function (data) {
                valid_investment = true;
                conversion = 1;
                $.each(data, function (index, currency) {
                    value = Number.parseFloat(currency.value).toFixed(5);
                    if (currency.currency == 'USD') {
                        conversion = value;
                    }
                    if (currency.currency != analysis_currency) {
                        value = Number.parseFloat(currency.value).toFixed(5);
                        html += '<div class="col-md-4 currency-value"><label class="custom-control-label" for="currency">' + currency.currency + '</label></div>'
                        html += '<div class="custom-control col-md-8 currency-value"><input id="' + currency.currency + '" class="text-number" type="number" class="custom-control-input" value="' + value + '"></div>'
                    }
                });
                nbs_value = 0;
                nbs_min = 0;
                minimun = 0;
                valid_nbs = true
                $("#full-table").find("input").each(function (index, input) {
                    input_id = input.id
                    if ($("#" + input_id).hasClass("hiddennbs")) {
                        split = input_id.split('-')
                        nbssc_id = split.pop();
                        nbs_min = parseFloat($("#" + input_id).val());
                        nbs_min /= conversion
                        if (minimun) {
                            if (minimun > nbs_min) {
                                minimun = nbs_min;
                            }
                        } else {
                            minimun = nbs_min;
                        }
                        if (nbs_value < nbs_min && nbs_value > 0) {
                            valid_nbs = false
                            $('#nbssc-' + nbssc_id).css('border-color', 'red');
                            Swal.fire({
                                icon: 'warning',
                                title: gettext('field_problem'),
                                text: gettext('error_minimun_nbs') + nbs_min,
                            });
                            return false
                        }
                    } else {
                        nbs_value = parseFloat($("#" + input_id).val());
                        if (nbs_value > 0)
                            valid_investment = false
                        $("#" + input_id).css('border-color', '#eeeeee');
                    }
                });
                $('#annual_investment').css('border-color', '#eeeeee');
                if (valid_investment && $('#annual_investment').val() < minimun) {
                    valid_nbs = false;
                    $('#annual_investment').css('border-color', 'red');
                    Swal.fire({
                        icon: 'warning',
                        title: gettext('field_problem'),
                        text: gettext('error_annual_investment') + minimun,
                    });
                    return false
                }

                if (valid_nbs) {
                Swal.fire({
                    title: gettext('exchange_rate'),
                    html: html,
                    showCancelButton: true,
                    confirmButtonText: gettext('save'),
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
                        return currencys
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        $('#_thumbnail_processing').modal('toggle');
                        $("#full-table").find("input").each(function (index, input) {
                            nbsactivity = {}
                            input_id = input.id
                            input_type = input.type
                            if (input_id && input_type != 'hidden') {
                                split = input_id.split('-')
                                nbssc_id = split.pop();
                                val = $("#" + input_id).val()
                                nbsactivity['id'] = nbssc_id;
                                nbsactivity['value'] = val;
                                nbsactivities.push(nbsactivity)
                            }
                        });
                        $.post("../../study_cases/save/", {
                            id_study_case: id_study_case,
                            analysis_type: 'investment scenario',
                            period_nbs: $('#period_nbs').val(),
                            period_analysis: $('#period_analysis').val(),
                            analysis_nbs: $("#analysis_nbs option:selected").val(),
                            analysis_currency: $("#analysis_currency option:selected").val(),
                            annual_investment: $('#annual_investment').val(),
                            rellocated_remainder: $("#rellocated_check").is(':checked'),
                            nbsactivities: '1' + JSON.stringify(nbsactivities),
                            currencys: '1' + JSON.stringify(result.value),
                            run_analysis: false
                        }, function (data) {
                            $('#_thumbnail_processing').modal('hide');
                            $('#smartwizard').smartWizard("next");
                            $('#autoAdjustHeightF').css("height", "auto");
                            //$("#form").submit();
                            location.href = "/study_cases/?city="+localStorage.cityId; 
                        }, "json");
                    }
                })
            }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_empty'),
                text: gettext('error_fields')
            });
            return;
        }

    });

    $('#custom_table').on('click', 'a', function () {
        var row = $(this).closest("tr");
        var tds = row.find("td");
        intake_name = "";
        $.each(tds, function (i) {
            if (i == 0) {
                intake_name = $(this).text();
            }
        });
        option = intake_name;
        id = row.attr("id").replace('custom-', '');
        $("#select_custom").append(new Option(option, id));
        row.remove();

    });

    $('#ptap_table').on('click', 'a', function () {
        var row = $(this).closest("tr")
        var tds = row.find("td");
        ptap_name = "";
        $.each(tds, function (i) {
            if (i == 0) {
                ptap_name = $(this).text();
            }
        });
        option = ptap_name
        id = row.attr("id").replace('ptap-', '')
        $.get("../../study_cases/intakebyptap/" + id, function (data) {
            $.each(data, function (index, intake) {
                id = intake.csinfra_elementsystem__intake__id
                option = intake.csinfra_elementsystem__intake__name
                $("#select_custom").append(new Option(option, id));
            });
        });
        $("#select_ptap").append(new Option(option, id));
        row.remove();

    });

    function loadFinancialParameter() {
        $.get("../../study_cases/parametersbycountry/" + localStorage.cityId, function (data) {
            $.each(data, function (index, financialParameters) {
                if (!$("#director").val())
                    $("#director").val(financialParameters.Program_Director_USD_YEAR);
                if (!$("#evaluation").val())
                    $("#evaluation").val(financialParameters.Monitoring_and_Evaluation_Manager_USD_YEAR);
                if (!$("#finance").val())
                    $("#finance").val(financialParameters.Finance_Manager_USD_YEAR);
                if (!$("#implementation").val())
                    $("#implementation").val(financialParameters.Implementation_Manager_USD_YEAR);
                if (!$("#office").val())
                    $("#office").val(financialParameters.Office_Costs_USD_YEAR);
                if (!$("#equipment").val())
                    $("#equipment").val(financialParameters.Equipment_Purchased_In_Year_1_USD);
                if (!$("#overhead").val())
                    $("#overhead").val(financialParameters.Overhead_USD_YEAR);
                if (!$("#discount").val())
                    $('#discount').val(financialParameters.drt_discount_rate_medium);
                if (!$("#minimum").val())
                    $('#minimum').val(financialParameters.drt_discount_rate_lower_limit);
                if (!$("#maximum").val())
                    $('#maximum').val(financialParameters.drt_discount_rate_upper_limit);
                if (!$("#transaction").val())
                    $('#transaction').val(financialParameters.Transaction_cost);
                if (!$("#contracts").val())
                    $('#contracts').val(0);
                if (!$("#travel").val())
                    $('#travel').val(0);
                if (!$("#others").val())
                    $('#others').val(0);
                calculate_Personnel();
                calculate_Platform();
            });
        });
    }

    $('#biophysical-panel').on('keyup change', 'table tr input', function () {
        var row = $(this).closest("tr")
        row.addClass("edit");

    });

    $("#director").keyup(function () {
        calculate_Personnel();
        calculate_Platform();
    });

    $("#evaluation").keyup(function () {
        calculate_Personnel();
        calculate_Platform();
    });

    $("#finance").keyup(function () {
        calculate_Personnel();
        calculate_Platform();
    });

    $("#implementation").keyup(function () {
        calculate_Personnel();
        calculate_Platform();
    });

    $("#office").keyup(function () {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#travel").keyup(function () {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#equipment").keyup(function () {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#overhead").keyup(function () {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#contracts").keyup(function () {
        calculate_Personnel();
        calculate_Platform();
    });
    $("#others").keyup(function () {
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


    function loadIntakes() {
        var city_id = localStorage.cityId
        $.get("../../study_cases/intakebycity/" + city_id, function (data) {
            if (data.length > 0) {
                $.each(data, function (index, intake) {
                    contains = false
                    $('#custom_table').find('tbody > tr').each(function (index, tr) {
                        id = tr.id.replace('custom-', '')
                        if (id == intake.id) {
                            contains = true
                            return false
                        }
                    });
                    if (!contains) {
                        var name = intake.name;
                        option = name
                        $("#select_custom").append(new Option(option, intake.id));
                    }
                });
                $("#div-customcase").removeClass("panel-hide");
                autoAdjustHeight();
            } else {
                $("#div-emptyintakes").removeClass("panel-hide");
            }

        });
    }

    function loadPtaps() {
        var city_id = localStorage.cityId
        $.get("../../study_cases/ptapbycity/" + city_id, function (data) {
            if (data.length > 0) {
                $.each(data, function (index, ptap) {
                    contains = false
                    $('#ptap_table').find('tbody > tr').each(function (index, tr) {
                        id = tr.id.replace('ptap-', '')
                        if (id == ptap.id) {
                            contains = true
                            return false
                        }
                    });
                    if (!contains) {
                        var name = ptap.plant_name;
                        option = name
                        $("#select_ptap").append(new Option(option, ptap.id));
                    }

                });
                $("#div-ptaps").removeClass("panel-hide");
                autoAdjustHeight();
            } else {
                $("#radio-ptap").addClass("panel-hide");
                $("#div-emptyptaps").removeClass("panel-hide");
            }

        });
    }

    function loadNBS() {
        var city_id = localStorage.cityId
        $.post("../../study_cases/nbs/", {
            id_study_case: id_study_case,
            city_id: city_id,
            process: "Edit"
        }, function (data) {
            content = ''
            $.each(data, function (index, nbs) {
                var name = nbs.name;
                var id = nbs.id
                var def = nbs.default
                content = '<li class="list-group-item"><div class="custom-control custom-checkbox">'
                if (def) {
                    content += '<input type="checkbox" class="custom-control-input" id="nbs-' + id + '" checked>'
                } else {
                    content += '<input type="checkbox" class="custom-control-input" id="nbs-' + id + '">'
                }
                content += '<label class="custom-control-label" for="nbs-' + id + '"> ' + name + '</label></div></li>'
                $("#nbs-ul").append(content);
            });
            autoAdjustHeight();

        });
    }

    function loadNBSActivities() {
        var city_id = localStorage.cityId
        $.post("../../study_cases/nbs/", {
            id_study_case: id_study_case,
            city_id: city_id,
            process: "Edit"
        }, function (data) {
            content = ''
            invesment = 0.0;
            min = 0.0;
            $.each(data, function (index, nbs) {
                var name = nbs.name;
                var id = nbs.id_nbssc
                var def = nbs.default
                var val = nbs.value;
                var min = (parseFloat(nbs.unit_implementation_cost) + parseFloat(nbs.unit_maintenance_cost) /parseFloat(nbs.periodicity_maitenance) + parseFloat(nbs.unit_oportunity_cost)) * 10;
                if (nbs.country__global_multiplier_factor){
                    min *= parseFloat(nbs.country__global_multiplier_factor)
                }
                if (def) {
                    if (!val) {
                        val = 0
                    }
                    if ($('#nbssc-' + id).length <= 0) {
                        console.log(min)
                        console.log(nbs)
                        content += '<tr><td>' + name + '</td>'
                        content += '<td><input class="text-number" type="number" id="nbssc-' + id + '" value="' + val + '"> </td></tr > '
                        content += '<input class="hiddennbs" id="minimun-' + id + '" " type="hidden" value="' + min + '">'
                    }
                }
            });
            $("#full-table").find('tbody').append(content);
            $('#smartwizard').smartWizard("next");
            $('#autoAdjustHeightF').css("height", "auto");
        });
    }


    function loadBiophysicals() {
        promises = []
        if (ptaps.length > 0) {
            $.each(ptaps, function (index, id_ptap) {
                promise = $.get("../../study_cases/intakebyptap/" + id_ptap);
                promises.push(promise)

            });

        }
        if (intakes.length > 0) {
            $.each(intakes, function (index, id_intake) {
                promise = $.get("../../study_cases/intakebyid/" + id_intake);
                promises.push(promise)
            });
        }
        Promise.all(promises).then(values => {
            promisesIntake = []
            $.each(values, function (i, data) {
                $.each(data, function (j, intake) {
                    if (intake.csinfra_elementsystem__intake__id)
                        promise = loadBiophysical(intake.csinfra_elementsystem__intake__id, intake.csinfra_elementsystem__intake__name);
                    else
                        promise = loadBiophysical(intake.id, intake.name)
                    promisesIntake.push(promise)
                });
            });

            Promise.all(promisesIntake).then(valuesIntake => {
                $.each(valuesIntake, function (i, content) {
                    $("#biophysical-panel").append(content);
                    autoAdjustHeight();
                });
            });
        });
    }

    function loadBiophysical(id_intake, name) {
        var deferred = $.Deferred();
        $.post("../../study_cases/bio/", {
            id_intake: id_intake,
            id_study_case: id_study_case,
        }, function (data) {
            labels = data[0]
            content = '<div class="col-md-12"><legend><label>Intake ' + name + '</span> </label></legend>'
            content += '<table id="bio_table_' + id_intake + '" class="table table-striped table-bordered table-condensed" style="width:100%"><thead><tr class="info">'
            content += '<th scope="col" class="small text-center vat text-description-bio">description</th>'
            content += '<th scope="col" class="small text-center vat">lucode</th>'
            $.each(labels, function (key, v) {
                if (key != 'lucode' && key != 'default' && key != 'lulc_desc' && key != 'description' && key != 'user_id' && key != 'intake_id' && key != 'study_case_id' && key != 'id' && key != 'macro_region' && key != 'kc'&& key != 'edit') {
                    content += '<th scope="col" class="small text-center vat">' + key + '</th>'
                }
            });
            content += '</tr></thead><tbody>'
            $.each(data, function (index, bio) {
                if (bio.edit) {
                    content += '<tr class="edit" id="' + id_intake + '_' + bio.id + '">'
                } else {
                    content += '<tr id="' + id_intake + '_' + bio.id + '">'
                }
                content += '<td id="description_' + id_intake + '_' + bio.id + '" class="text-description-bio">' + bio.description + '</td>'
                content += '<td id="lucode_' + id_intake + '_' + bio.id + '">' + bio.lucode + '</td>'
                $.each(bio, function (key, v) {
                    if(v){
                        v = Number.parseFloat(v).toFixed(6);
                    }
                    if (key != 'lucode' && key != 'default' && key != 'lulc_desc' && key != 'description' && key != 'user_id' && key != 'intake_id' && key != 'study_case_id' && key != 'id' && key != 'macro_region' && key != 'kc'&& key != 'edit') {
                        content += '<td id="' + key + '_' + id_intake + '_' + bio.id + '"><input class="text-number-bio" step="0.000001" oninput="validity.valid||(value=\'\');" type="number" value="' + v + '"/></td>'
                    }
                });
                content += '</tr>'
            });
            content += '</tbody></table></div>'
            deferred.resolve(content);
        });
        return deferred.promise();
    }

    $("#add_cost").click(function () {
        setVarCost();
    });

    function setVarCost() {
        $('#CalculatorModalLabel').text('Modify Cost ');
        $('#VarCostListGroup div').remove();
        let listIntakes = [];
        $('#custom_table').find('tbody > tr').each(function (index, tr) {
            id = tr.id.replace('custom-', '');
            listIntakes.push({
                id: id,
                name: tr.cells[0].innerText
            });
        });

        var costVars = ['Q', 'CSed', 'CN', 'CP', 'WSed', 'WN', 'WP', 'WSedRet', 'WNRet', 'WPRet'];

        for (const intake of listIntakes) {
            var costlabel = "";
            for (const iterator of costVars) {
                costlabel += `<a value="${iterator}${intake.id}" class="list-group-item list-group-item-action" style="padding-top: 4px;padding-bottom: 4px;">${iterator}${intake.id}</a>`
            }
            $('#VarCostListGroup').append(`
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <h4 class="panel-title">
                            <a data-toggle="collapse" data-parent="#VarCostListGroup" href="#VarCostListGroup_${intake.id}">${intake.id} <label> ${intake.name} </label></a>
                        </h4>
                    </div>
                    <div id="VarCostListGroup_${intake.id}" class="panel-collapse collapse">
                        ${costlabel}
                    </div>
                </div>
            `);
        }
    }

    //Set var into calculator
    $(document).on('click', '.list-group-item', function () {
        var el = document.getElementById("python-expression");
        typeInTextarea($(this).attr('value'), el);
    });

    function typeInTextarea(newText, el) {
        const [start, end] = [el.selectionStart, el.selectionEnd];
        el.setRangeText(newText, start, end, 'select');
        el.focus();
        document.getSelection().removeAllRanges();
        el.selectionStart = start + newText.length;
        el.selectionEnd = el.selectionStart;
    }

    $('#python-expression').on('keypress', function (evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        let symbols = [40, 41, 42, 43, 45, 60, 61, 62, 106, 107, 109, 111];
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return (symbols.indexOf(charCode) >= 0);

        return true;
    })

    $('#btnValidatePyExp').click(function () {
        validatePyExpression();
    });

    async function validatePyExpression() {
        let pyExp = $('#python-expression').val().trim();
        if (pyExp.length > 0) {
            pyExpEncode = encodeURIComponent(pyExp);
            localApi = location.protocol + "//" + location.host;
            let url = localApi + "/intake/validatePyExpression?expression=" + pyExpEncode;
            let response = await fetch(url);
            let result = await response.json();
            if (result) {
                is_valid = result.valid;
                latex = result.latex
                console.log(result.latex);
                typesetInput(result.latex);
                if (is_valid) {
                    $("#python-expression").removeClass("invalid_expression");
                    $("#python-expression").addClass("valid_expression");
                } else {
                    $("#python-expression").addClass("invalid_expression");
                    $("#python-expression").removeClass("valid_expression");
                }
            }
        }
    }

    function typesetInput(expression) {
        button.disabled = true;
        output.innerHTML = expression;
        MathJax.texReset();
        MathJax.typesetClear();
        MathJax.typesetPromise([output]).catch(function (err) {
            output.innerHTML = '';
            output.appendChild(document.createTextNode(err.message));
            console.error(err);
        }).then(function () {
            button.disabled = false;
        });
    }

    //KeyBoard calculator funcion cost
    $('button[name=mathKeyBoard]').click(function () {
        var el = document.getElementById("python-expression");
        typeInTextarea($(this).attr('value'), el);
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

    $('#autoAdjustHeightF').css("height", "auto");

});

$("#ModalAddCostBtn").click(function () {
    flagFunctionCost = true;
    $('#costFunctionName').val('');
    $('#costFuntionDescription').val('');
    $('#currencyCost').val('');
    $('#global_multiplier_factorCalculator').val('');
    $('#python-expression').val('');
    setVarCost();
    validatePyExpression();
});

$('#saveAndValideCost').click(function () {
    if (flagFunctionCost) {
        //true = nueva
        var pyExp = $('#python-expression').val();
        funcostdb.push({
            'function': {
                'value': pyExp,
                'name': $('#costFunctionName').val() == '' ? 'Undefined name' : $('#costFunctionName').val(),
                'description': $('#costFuntionDescription').val(),
                'factor': $('#global_multiplier_factorCalculator').val(),
                'currencyCost': $('#currencyCost option:selected').val(),
                'currencyCostName': $('#currencyCost option:selected').text(),
            }
        });
    } else {
        //false = editar
        var temp = {
            'value': $('#python-expression').val(),
            'name': $('#costFunctionName').val() == '' ? 'Undefined name' : $('#costFunctionName').val(),
            'description': $('#costFuntionDescription').val(),
            'factor': $('#global_multiplier_factorCalculator').val(),
            'currencyCost': $('#currencyCost option:selected').val(),
            'currencyCostName': $('#currencyCost option:selected').text(),
        }

        if (selectedCostId == 0) {
            $.extend(funcostdb[selectedCostId].function, temp);
        } else {
            let clonedFunCost = JSON.parse(JSON.stringify(funcostdb[0]));
            $.extend(clonedFunCost.function, temp);
            funcostdb[selectedCostId] = clonedFunCost;
        }

        var pyExp = $('#python-expression').val();
        funcostdb[selectedCostId].function.value = pyExp;
    }

    $('#funcostgenerate tr').remove();
    $('#funcostgenerate').empty();

    if (funcostdb.length > 0) {
        $("#cost_table").removeClass('panel-hide');
    }

    for (let index = 0; index < funcostdb.length; index++) {
        funcost(index);
    }
    $('#CalculatorModal').modal('hide');
});

//Edit funcion cost 
$(document).on('click', 'a[name=glyphicon-edit]', function () {
    flagFunctionCost = false;
    $('#CalculatorModal').modal('show');
    selectedCostId = parseInt($(this).attr('idvalue'));
    $('#costFunctionName').val(funcostdb[selectedCostId].function.name);
    $('#costFuntionDescription').val(funcostdb[selectedCostId].function.description);
    $('#CalculatorModalLabel').text('Modify Cost - ' + $('#titleCostFunSmall').text());
    $('#currencyCost').val(funcostdb[selectedCostId].function.currencyCost);
    $('#global_multiplier_factorCalculator').val(funcostdb[selectedCostId].function.factor);
    setVarCost();
    let value = funcostdb[selectedCostId].function.value;
    $('#python-expression').val();
    if (value != "") {
        $('#python-expression').val(value);
    }
    validatePyExpression();
});

//Delete funcion cost 
$(document).on('click', 'a[name=glyphicon-trash]', function () {
    Swal.fire({
        title: gettext('Are you sure?'),
        text: gettext("You won't be able to revert this!"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: gettext('Yes, delete it!')
    }).then((result) => {
        if (result.isConfirmed) {
            var id = $(this).attr('idvalue');
            $(`#funcostgenerate tr[idvalue = 'fun_${id}']`).remove();
            funcostdb.splice(id, 1);
            $('#funcostgenerate tr').remove();
            $('#funcostgenerate').empty();
            for (let index = 0; index < funcostdb.length; index++) {
                funcost(index);
            }

            Swal.fire(
                gettext('Deleted!'),
                gettext('Your function has been deleted'),
                'success'
            );
        }
    })
});

function setVarCost() {

    $('#CalculatorModalLabel').text('Modify Cost ');
    $('#VarCostListGroup div').remove();
    let listIntakes = [];
    $('#custom_table').find('tbody > tr').each(function (index, tr) {
        id = tr.id.replace('custom-', '');
        listIntakes.push({
            id: id,
            name: tr.cells[0].innerText
        });
    });

    var costVars = ['Q', 'CSed', 'CN', 'CP', 'WSed', 'WN', 'WP', 'WSedRet', 'WNRet', 'WPRet'];

    for (const intake of listIntakes) {
        var costlabel = "";
        for (const iterator of costVars) {
            costlabel += `<a value="${iterator}${intake.id}" class="list-group-item list-group-item-action" style="padding-top: 4px;padding-bottom: 4px;">${iterator}${intake.id}</a>`
        }
        $('#VarCostListGroup').append(`
            <div class="panel panel-info">
                <div class="panel-heading">
                    <h4 class="panel-title">
                        <a data-toggle="collapse" data-parent="#VarCostListGroup" href="#VarCostListGroup_${intake.id}">${intake.id} <label> ${intake.name} </label></a>
                    </h4>
                </div>
                <div id="VarCostListGroup_${intake.id}" class="panel-collapse collapse">
                    ${costlabel}
                </div>
            </div>
        `);
    }
}

function funcost(index) {
    var currencyCostName = funcostdb[index].function.currencyCostName != undefined ? funcostdb[index].function.currencyCostName : funcostdb[index].function.currency;
    var factor = funcostdb[index].function.factor;
    if (currencyCostName == undefined) {
        currencyCostName = "";
    }
    if (factor == undefined) {
        factor = localStorage.getItem("factor");
    }
    $('#funcostgenerate').append(
        `<tr idvalue="fun_${index}">
    <td aling="center">${funcostdb[index].function.name}</td>
    <td class="small text-center vat" style="width: 160px">
    <a class="btn btn-info" idvalue="${index}" name="fun_display_btn">fx</a>
    <div id="fun_display_${index}" style="position: absolute; left: 50%; width: auto; display: none;">
    <div class="alert alert-info mb-0" style="position: relative; left: -25%; bottom: 90px;" role="alert">
    <p name="render_ecuation" style="font-size: 1.8rem; width:100%;">${funcostdb[index].function.value}</p>
     </div>
    </div>
    </td>
    <td class="small text-center vat">${currencyCostName}</td>
    <td class="small text-center vat">${factor}</td>
    <td class="small text-center vat" style="width: 85px">
        <div class="btn-group btn-group-table" role="group">
            <a class="btn btn-info" name="glyphicon-edit" idvalue="${index}"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>
            <a class="btn btn-danger" name="glyphicon-trash" idvalue="${index}"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a>
        </div>
    </td>
</tr>`);
    autoAdjustHeight();
}

//add function set autoAdjustHeight
function autoAdjustHeight() {
    $('#autoAdjustHeightF').css("height", "auto");
}

$(document).on('click', 'a[name=fun_display_btn]', function () {
    var idx = $(this).attr('idvalue');
    $(`#fun_display_${idx}`).toggle();
});

window.onbeforeunload = function () {
    return mxResources.get('changesLost');
};