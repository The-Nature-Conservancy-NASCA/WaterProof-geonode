/**
 * @file Create Intake wizard step
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
var validGeometry = false;
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
    LOGISTICS: 'LOGISTICS',
    MANUAL: 'MANUAL'
}

var mapLoader;
$(document).ready(function() {
    setIntakeCity();
    var countryNameStorage = localStorage.country;
    $('#cityLabel').text(localStorage.city+", "+localStorage.country);
    $("#countryLabel").html(localStorage.getItem('country'));
    // Interpolation with Wizard
    $("#intakeWECB").click(function() {

        if ($('#numberYearsInterpolationValue').val() < 10 || $('#numberYearsInterpolationValue').val() > 100) {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_problem'),
                text: gettext('Error number of years for time series  (10-100) Year'),
            });
            valid_period = false;
            return
        }

        if ($("#numberYearsInterpolationValue").val() == '' || $("#initialDataExtractionInterpolationValue").val() == '' || $("#finalDataExtractionInterpolationValue").val() == '') {
            Swal.fire({
                icon: 'warning',
                title: gettext('Data analysis empty'),
                text: gettext('Please Generate Data analysis')
            });
            return
        }
        $('#intakeECTAG tr').remove();
        $('#IntakeTDLE table').remove();
        $('#externalSelect option').remove();
        $('#intakeECTAG').empty();
        $('#IntakeTDLE').empty();
        $('#externalSelect').empty();

        $('#autoAdjustHeightF').css("height", "auto");
        typeProcessInterpolation = Number($("#typeProcessInterpolation").val());
        numberYearsInterpolationValue = Number($("#numberYearsInterpolationValue").val());
        initialDataExtractionInterpolationValue = Number($("#initialDataExtractionInterpolationValue").val());
        finalDataExtractionInterpolationValue = Number($("#finalDataExtractionInterpolationValue").val());

        // Linear interpolation
        if (typeProcessInterpolation == 1) {
            waterExtractionValue = [];
            waterExtractionData.typeInterpolation = interpolationType.LINEAR;
            m = (finalDataExtractionInterpolationValue - initialDataExtractionInterpolationValue) / (numberYearsInterpolationValue - 0)
            b = (-1 * m * 0) + initialDataExtractionInterpolationValue;

            for (let index = 0; index <= numberYearsInterpolationValue; index++) {
                var yearData = {};
                yearData.year = index + 1;
                yearData.value = ((m * index) + b).toFixed(2);
                waterExtractionValue.push(yearData);
                $('#intakeECTAG').append(`<tr>
                <th class="text-center" scope="row">${index}</th>
                <td class="text-center"><input type="text" class="form-control justify-number" value="${((m * index) + b).toFixed(2)}" disabled></td>
              </tr>`);
            }
        }

        // Potencial interpolation
        if (typeProcessInterpolation == 2) {
            waterExtractionValue = [];
            waterExtractionData.typeInterpolation = interpolationType.POTENTIAL;
            m = (Math.log(finalDataExtractionInterpolationValue) - Math.log(initialDataExtractionInterpolationValue)) / ((Math.log(numberYearsInterpolationValue + 1) - Math.log(1)));
            b = Math.exp((-1 * m * Math.log(1)) + Math.log(initialDataExtractionInterpolationValue));

            for (let index = 1; index <= numberYearsInterpolationValue + 1; index++) {
                var yearData = {};
                yearData.year = index;
                yearData.value = (b * (Math.pow(index, m))).toFixed(2);
                waterExtractionValue.push(yearData);
                $('#intakeECTAG').append(`<tr>
                <th class="text-center" scope="row">${index - 1}</th>
                <td class="text-center"><input type="text" class="form-control justify-number" value="${(b * (Math.pow(index, m))).toFixed(2)}" disabled></td>
              </tr>`);
            }
        }

        // Exponential interpolation
        if (typeProcessInterpolation == 3) {
            waterExtractionValue = [];
            waterExtractionData.typeInterpolation = interpolationType.EXPONENTIAL;
            m = (Math.log(finalDataExtractionInterpolationValue) - Math.log(initialDataExtractionInterpolationValue)) / (numberYearsInterpolationValue - 0)
            b = Math.exp((-1 * m * 0) + Math.log(initialDataExtractionInterpolationValue));

            for (let index = 0; index <= numberYearsInterpolationValue; index++) {
                var yearData = {};
                yearData.year = index + 1;
                yearData.value = (b * (Math.exp(m * index))).toFixed(2);
                waterExtractionValue.push(yearData);
                $('#intakeECTAG').append(`<tr>
                <th class="text-center" scope="row">${index}</th>
                <td class="text-center"><input type="text" class="form-control justify-number" value="${(b * (Math.exp(m * index))).toFixed(2)}" disabled></td>
              </tr>`);
            }

        }

        // Interpolación Logistica
        if (typeProcessInterpolation == 4) {
            waterExtractionValue = [];
            waterExtractionData.typeInterpolation = interpolationType.LOGISTICS;
            r = (-Math.log(0.000000001) / initialDataExtractionInterpolationValue);

            for (let index = 0; index <= numberYearsInterpolationValue; index++) {
                var yearData = {};
                yearData.year = index + 1;
                yearData.value = ((finalDataExtractionInterpolationValue) / (1 + ((finalDataExtractionInterpolationValue / initialDataExtractionInterpolationValue) - 1) * Math.exp(-r * index))).toFixed(2);
                waterExtractionValue.push(yearData);
                $('#intakeECTAG').append(`<tr><th class="text-center" scope="row">${index}</th><td class="text-center"><input type="text" class="form-control justify-number" value="${((finalDataExtractionInterpolationValue) / (1 + ((finalDataExtractionInterpolationValue / initialDataExtractionInterpolationValue) - 1) * Math.exp(-r * index))).toFixed(2)}" disabled></td></tr>`);
            }
        }

        externalInput(numberYearsInterpolationValue);
        // Set object data for later persistence
        waterExtractionData.yearCount = numberYearsInterpolationValue;
        waterExtractionData.initialValue = initialDataExtractionInterpolationValue;
        waterExtractionData.finalValue = finalDataExtractionInterpolationValue;
        waterExtractionData.yearValues = waterExtractionValue;
        $('#waterExtraction').val(JSON.stringify(waterExtractionData));

    });

    // Change Option Manual Tab
    $('#btnManualTab').click(function() {
        if ($('#initialDataExtractionInterpolationValue').val() != '' || $('#finalDataExtractionInterpolationValue').val() != '' || $('#numberYearsInterpolationValue').val() != '') {
            Swal.fire({
                title: gettext('Are you sure?'),
                text: gettext("You won't be able to revert this!"),
                icon: 'warning',
                showCancelButton: false,
                showDenyButton: true,
                confirmButtonColor: '#d33',
                denyButtonColor: '#3085d6',
                confirmButtonText: gettext('Yes, change it!'),
                denyButtonText: gettext('Cancel')
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log("wxtraccion"+ JSON.stringify(waterExtractionData));
                    $('#intakeECTAG tr').remove();
                    $('#IntakeTDLE table').remove();
                    $('#externalSelect option').remove();
                    $('#intakeECTAG').empty();
                    $('#IntakeTDLE').empty();
                    $('#externalSelect').empty();
                    $('#waterExtraction').empty();
                    //waterExtractionData = [];
                    $('#waterExtraction').val(JSON.stringify(waterExtractionData));
                    $('#initialDataExtractionInterpolationValue').val('');
                    $('#finalDataExtractionInterpolationValue').val('');
                    $('#numberYearsInterpolationValue').val('');
                } else if (result.isDenied) {
                    $('[href="#automatic"]').tab('show');
                }
            })
        }
    });

    // Change Option Automatic with Wizard Tab
    $('#btnAutomaticTab').click(function() {
        if ($('#intakeNIYMI').val() != '') {
            Swal.fire({
                title: gettext('Are you sure?'),
                text: gettext("You won't be able to revert this!"),
                icon: 'warning',
                showCancelButton: false,
                showDenyButton: true,
                confirmButtonColor: '#d33',
                denyButtonColor: '#3085d6',
                confirmButtonText: gettext('Yes, change it!'),
                denyButtonText: gettext('Cancel')
            }).then((result) => {
                if (result.isConfirmed) {
                    $('#intakeWEMI tr').remove();
                    $('#IntakeTDLE table').remove();
                    $('#externalSelect option').remove();
                    $('#intakeWEMI').empty();
                    $('#IntakeTDLE').empty();
                    $('#externalSelect').empty();
                    $('#waterExtraction').empty();
                    //waterExtractionData = [];
                    $('#waterExtraction').val(JSON.stringify(waterExtractionData));
                    $('#numberYearsInterpolationValue').val('');
                    $('#intakeNIYMI').val('');
                } else if (result.isDenied) {
                    $('[href="#manual"]').tab('show');
                }
            })
        }
    });

    // Change Table external input
    $('#externalSelect').change(function() {
        for (let t = 0; t < graphData.length; t++) {
            if (graphData[t].external == 'true') {
                $(`#table_${graphData[t].id}`).css('display', 'none');
            }
        }
        $(`#table_${$('#externalSelect').val()}`).css('display', 'block');
    });


    // Automatic height on clic next btn wizard
    $('#smartwizard').smartWizard("next").click(function() {
        $('#autoAdjustHeightF').css("height", "auto");
        mapDelimit.invalidateSize();
        map.invalidateSize();
    });

    // Generate Input Manual Interpolation
    $('#intakeNIBYMI').click(function() {

        if ($('#intakeNIYMI').val() < 10 || $('#intakeNIYMI').val() > 100) {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_problem'),
                text: gettext('Error number of years  (10-100) Year'),
            });
            valid_period = false;
            return
        }

        $('#intakeWEMI tr').remove();
        $('#intakeWEMI').empty();
        intakeNIYMI = Number($("#intakeNIYMI").val());
        waterExtractionData.typeInterpolation = interpolationType.MANUAL;
        waterExtractionData.yearCount = intakeNIYMI;
        $('#IntakeTDLE table').remove();
        $('#IntakeTDLE').empty();
        $('#externalSelect option').remove();
        $('#externalSelect').empty();
        externalInput(intakeNIYMI - 1);
        for (let index = 0; index < intakeNIYMI; index++) {
            $('#intakeWEMI').append(`
            <tr>
                <th class="text-center" scope="row">${index + 1}</th>
                <td class="text-center"><input name="manualInputData" yearValue="${index + 1}" type="number" class="form-control justify-number"></td>
              </tr>
            `);
        }
    });

    // Generate table external Input
    function externalInput(numYear) {
        var rows = "";
        var numberExternal = 0;
        $('#externalSelect').append(`<option value="null" selected>Choose here</option>`);
        for (let p = 0; p < graphData.length; p++) {
            if (graphData[p].external == 'true') {
                numberExternal += 1
                $('#externalSelect').append(`
                            <option value="${graphData[p].id}">${graphData[p].id} - External Input</option>
                    `);
                rows = "";
                for (let index = 0; index <= numYear; index++) {
                    rows += (`<tr>
                                <th class="text-center" scope="col" name="year_${graphData[p].id}" year_value="${index + 1}">${index + 1}</th>
                                <td class="text-center" scope="col"><input name="waterVolume_${index + 1}_${graphData[p].id}" type="number" class="form-control justify-number"></td>
                                <td class="text-center" scope="col"><input name="sediment_${index + 1}_${graphData[p].id}" type="number" class="form-control justify-number"></td>
                                <td class="text-center" scope="col"><input name="nitrogen_${index + 1}_${graphData[p].id}" type="number" class="form-control justify-number"></td>
                                <td class="text-center" scope="col"><input name="phosphorus_${index + 1}_${graphData[p].id}" type="number" class="form-control justify-number"></td>
                            </tr>`);
                }
                $('#IntakeTDLE').append(`
                        <table class="table" id="table_${graphData[p].id}" style="display: none">
                            <thead>
                                <tr>
                                    <th class="text-center" scope="col">Year</th>
                                    <th class="text-center" scope="col">Water Volume (m3)</th>
                                    <th class="text-center" scope="col">Sediment (Ton)</th>
                                    <th class="text-center" scope="col">Nitrogen (Kg)</th>
                                    <th class="text-center" scope="col">Phosphorus (Kg)</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>    
                `);
            }
        }
        $('#ExternalNumbersInputs').html(numberExternal)
    }

    $('#smartwizard').smartWizard("next").click(function() {
        $('#autoAdjustHeightF').css("height", "auto");
        map.invalidateSize();
    });
    $('#smartwizard').smartWizard({
        selected: 0,
        theme: 'dots',
        enableURLhash: false,
        autoAdjustHeight: true,
        transition: {
            animation: 'fade', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
        },
        keyboardSettings: {
            keyNavigation: false
        },
        toolbarSettings: {
            showNextButton: false,
            showPreviousButton: false,
        },
        anchorSettings: {
            emoveDoneStepOnNavigateBack: false,
            markAllPreviousStepsAsDone: false,
            anchorClickable: false,
            enableAllAnchors: false,
            markDoneStep: false,
        }
    });

    $("#smartwizard").on("showStep", function(e, anchorObject, stepIndex, stepDirection) {
        if (stepIndex == 4) {
            if (catchmentPoly) {
                mapDelimit.invalidateSize();
                mapDelimit.fitBounds(catchmentPoly.getBounds());
            } else {
                mapDelimit.invalidateSize();
                $('#autoAdjustHeightF').css("height", "auto");
            }
            changeFileEvent();
        }
        if (stepIndex == 0) {
            if (catchmentPoly) {
                map.invalidateSize();
                map.fitBounds(catchmentPoly.getBounds());
            } else {
                map.invalidateSize();
                $('#autoAdjustHeightF').css("height", "auto");
            }
        }
    });

    //Validated of steps
    $('#step1NextBtn').click(function() {
        if ($('#id_name').val() != '' && $('#id_description').val() != '' && $('#id_water_source_name').val() != '' && catchmentPoly != undefined) {
            var intakePolygonJson = catchmentPoly.toGeoJSON();
            var pointIntakeJson = snapMarker.toGeoJSON();
            $('#intakeAreaPolygon').val(JSON.stringify(intakePolygonJson));
            $('#pointIntake').val(JSON.stringify(pointIntakeJson));
            $('#basinId').val(basinId);
            intakeStepOne();

        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('Field empty'),
                text: gettext('Please fill every fields')
            });
            return;
        }
    });

    $('#step2PrevBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step2NextBtn').click(function() {
        if (!bandera) {
            $('#smartwizard').smartWizard("stepState", [3], "hide");
            for (const item of graphData) {
                if (item.external != null && item.external != 'false') {
                    $('#smartwizard').smartWizard("stepState", [3], "show");
                }
            }
            clearDataHtml();
            intakeStepTwo();
        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('Validate graph'),
                text: gettext('Please validate graph')
            });
            return;
        }
    });

    $('#step3PrevBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step3NextBtn').click(function() {
        console.log("execute clic of generate button");
        $("#intakeWECB").click();
        if ($('#intakeECTAG')[0].childNodes.length > 1 || $('#intakeWEMI')[0].childNodes.length > 1) {
            if (waterExtractionData.typeInterpolation == interpolationType.MANUAL) {
                waterExtractionValue = [];
                $(`input[name=manualInputData]`).each(function() {
                    if ($(this).val() == '' || $('#intakeNIYMI').val() == '') {
                        Swal.fire({
                            icon: 'warning',
                            title: gettext('Data analysis empty'),
                            text: gettext('Please Generate Data analysis')
                        });
                        return;
                    } else {
                        var yearData = {};
                        yearData.year = Number($(this).attr('yearValue'));
                        yearData.value = $(this).val();
                        waterExtractionValue.push(yearData);
                    }

                });
                waterExtractionData.yearValues = waterExtractionValue;
                $('#waterExtraction').val(JSON.stringify(waterExtractionData));
                if (waterExtractionData.yearCount == waterExtractionData.yearValues.length) {
                    intakeStepThree();
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: gettext('Data analysis empty'),
                        text: gettext('Please Generate Data analysis')
                    });
                    return;
                }
            } else {
                intakeStepThree();
            }
        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('Data analysis empty'),
                text: gettext('Please Generate Data analysis')
            });
            return;
        }

    });

    $('#step4PrevBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step5PrevBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#submit').click(function(event) {
        if (!validGeometry) {
            event.preventDefault();
            Swal.fire({
                icon: 'error',
                title: gettext('Geometry error'),
                text: gettext('You must validate the basin geometry')
            })
        } else {
            intakeStepFive();
        }
    });

    let initialCoords = [4.5, -74.4];
    // find in localStorage if cityCoords exist
    var cityCoords = localStorage.getItem('cityCoords');
    if (cityCoords == undefined) {
        cityCoords = initialCoords;
    } else {
        initialCoords = JSON.parse(cityCoords);
    }
    waterproof["cityCoords"] = cityCoords;

    map = L.map('map', {}).setView(initialCoords, 8);
    mapDelimit = L.map('mapid', { editable: true }).setView(initialCoords, 5);
    let attr = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
    var osm = L.tileLayer(OSM_BASEMAP_URL, {
        attribution: attr,
    });
    var osmid = L.tileLayer(OSM_BASEMAP_URL, {
        attribution: attr,
    });
    map.addLayer(osm);

    var c = new L.Control.Coordinates({
        actionAfterDragEnd: prevalidateAdjustCoordinates
    }).addTo(map);
    var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright'}).addTo(map);

    var images = L.tileLayer(IMG_BASEMAP_URL);
    /* var gray = L.tileLayer(GRAY_BASEMAP_URL, {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }); */

    var hydroLyr = L.tileLayer(HYDRO_BASEMAP_URL);
    var wmsHydroNetworkLyr = L.tileLayer.wms(GEOSERVER_WMS, {
        layers: HYDRO_NETWORK_LYR,
        format: 'image/png',
        transparent: 'true',
        opacity: 0.35,
        minZoom: 6,
    });

    var baseLayers = {
        OpenStreetMap: osm,
        Images: images,
        /* Grayscale: gray, */
    };

    var overlays = {
        "Hydro Network": wmsHydroNetworkLyr,
        "Hydro (esri)": hydroLyr,        
    };
    L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);

    mapDelimit.addLayer(osmid);
    var defExtMapd = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright'}).addTo(mapDelimit);

    $("#validateBtn").on("click", prevalidateAdjustCoordinates);
    $('#btnDelimitArea').on("click", delimitIntakeArea)
    $('#btnValidateArea').on("click", validateIntakeArea)
    if (!mapLoader) {
        mapLoader = L.control.loader().addTo(map);
    }

    mapLoader.hide();

    createEditor(editorUrl);

    var menu1Tab = document.getElementById('mapid');
    var observer2 = new MutationObserver(function() {
        if (menu1Tab.style.display != 'none') {
            mapDelimit.invalidateSize();
        }
    });
    observer2.observe(menu1Tab, { attributes: true });

    defaultCurrencyId = '233';
    defaultCurrentyName = $("#currencyCost option[value=233]").text();

});


//window.onbeforeunload = function() { return mxResources.get('changesLost'); };


/**
 * Info Message to validate Adjust Coordinates
 */
function prevalidateAdjustCoordinates() {
    Swal.fire({
        title: gettext('Basin point delimitation'),
        text: gettext('The point coordinates will be ajusted'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: gettext('Yes, ajust!'),
        cancelButtonText: gettext('Cancel'),
    }).then((result) => {
        if (result.isConfirmed) {
            mapLoader = L.control.loader().addTo(map);
            validateCoordinateWithApi();
        }
    })
}

function setIntakeCity() {
    console.log("setIntakeCity, localStorage.cityId: ", localStorage.cityId);
    /** 
     * Get a city by name
     * @param {String} url   activities URL 
     * @param {Object} data  lang,city parameters 
     *
     * @return {Object} City
     */
    if (localStorage.cityId){
        $('#intakeCity').val(localStorage.cityId);
    }else{
        $.ajax({
            url: '/parameters/load-cityByName/',
            data: {
                'lang': lang,
                'city': localStorage.city
            },
            success: function(result) {
                let resultCity = JSON.parse(result);
                $('#intakeCity').val(resultCity[0].pk);
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
    
}
/** 
 * Intake step one creation
 *
 * @return {boolean} true if is saved
 */
function intakeStepOne() {
    console.log("Saving step one");
    var formData = new FormData();
    // Intake step
    formData.append('step', '1');
    // Intake step
    formData.append('edit', 'false');
    // Intake name
    formData.append('intakeName', $('#intakeName').val());
    // Intake id
    formData.append('intakeId', $('#intakeId').val());
    // Intake description
    formData.append('intakeDesc', $('#intakeDesc').val());
    // Intake water source name
    formData.append('intakeWaterSource', $('#waterSource').val());
    // Intake basin 
    formData.append('basinId', $('#basinId').val());
    // Intake point
    formData.append('pointIntake', $('#pointIntake').val());
    // Intake city
    formData.append('intakeCity', $('#intakeCity').val());
    // Intake area polygon
    formData.append('intakeAreaPolygon', $('#intakeAreaPolygon').val());
    console.log(formData);
    $.ajax({
        type: 'POST',
        url: '/intake/create/',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function(response) {
            console.log(response);
            $('#intakeId').val(response.intakeId);
            $('#smartwizard').smartWizard("next");
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ":" + xhr.responseText);
            let response = JSON.parse(xhr.responseText);
            Swal.fire({
                icon: 'error',
                title: gettext('Nbs saving error'),
                text: response.message,
            })
        }
    });
    return true;
}
/** 
 * Intake step two creation
 *
 * @return {boolean} true if is saved
 */
function intakeStepTwo() {
    console.log("Saving step two");
    var formData = new FormData();
    // Intake step
    formData.append('step', '2');
    // Intake id
    formData.append('intakeId', $('#intakeId').val());
    // Intake xml graph
    formData.append('xmlGraph', $('#xmlGraph').val());
    // Intake graph elements object
    formData.append('graphElements', $('#graphElements').val());
    // Intake graph connections object
    formData.append('graphConnections', $('#graphConnections').val());
    console.log(formData);
    $.ajax({
        type: 'POST',
        url: '/intake/create/',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function(response) {
            console.log(response);
            $('#smartwizard').smartWizard("next");
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ":" + xhr.responseText);
            let response = JSON.parse(xhr.responseText);
            Swal.fire({
                icon: 'error',
                title: gettext('Intake saving error'),
                text: response.message,
            })
        }
    });
    return true;
}
/** 
 * Intake step three creation
 *
 * @return {boolean} true if is saved
 */
function intakeStepThree() {
    console.log("Saving step three");
    var formData = new FormData();
    // Intake step
    formData.append('step', '3');
    // Intake id
    formData.append('intakeId', $('#intakeId').val());
    // Intake xml graph
    formData.append('waterExtraction', $('#waterExtraction').val());
    console.log(formData);
    $.ajax({
        type: 'POST',
        url: '/intake/create/',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function(response) {
            console.log(response);
            $('#smartwizard').smartWizard("next");
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ":" + xhr.responseText);
            let response = JSON.parse(xhr.responseText);
            Swal.fire({
                icon: 'error',
                title: gettext('Intake saving error'),
                text: response.message,
            })
        }
    });
    return true;
}
/** 
 * Intake step four creation
 *
 * @return {boolean} true if is saved
 */
function intakeStepFour() {
    console.log("Saving step four");
    var formData = new FormData();
    // Intake step
    formData.append('step', '4');
    // Intake id
    formData.append('intakeId', $('#intakeId').val());
    // Intake edit
    formData.append('edit', 'false');
    // Intake xml graph
    formData.append('graphElements', $('#graphElements').val());
    console.log(formData);
    $.ajax({
        type: 'POST',
        url: '/intake/create/',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function(response) {
            console.log(response);
            $('#smartwizard').smartWizard("next");
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ":" + xhr.responseText);
            let response = JSON.parse(xhr.responseText);
            Swal.fire({
                icon: 'error',
                title: gettext('Intake saving error'),
                text: response.message,
            })
        }
    });
    return true;
}
/** 
 * Intake step five creation
 *
 * @return {boolean} true if is saved
 */
function intakeStepFive() {
    console.log("Saving step five");
    var formData = new FormData();
    // Intake step
    formData.append('step', '5');
    // Intake id
    formData.append('intakeId', $('#intakeId').val());
    // Intake basin 
    formData.append('basinId', $('#basinId').val());
    // Intake area polygon
    formData.append('intakeAreaPolygon', $('#intakeAreaPolygon').val());
    // Intake delimit area polygon
    formData.append('delimitArea', $('#delimitArea').val());
    // Intake type delimit
    formData.append('typeDelimit', $('#typeDelimit').val());
    // Intake is File?
    formData.append('isFile', $('#isFile').val());
    //console.log(formData);
    $('#_thumbnail_processing').modal('toggle');
    $.ajax({
        type: 'POST',
        url: '/intake/create/',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function(response) {
            //console.log(response);
            $('#_thumbnail_processing').modal('hide');
            Swal.fire({
                icon: 'success',
                text: gettext('The water intake is being saved'),
                allowOutsideClick: true,
                showConfirmButton: false
            });
            var cityId = 143873; //Default Bogota
            if (localStorage.cityId){
                cityId = localStorage.cityId;
            }
            setTimeout(function() { 
                location.href = "/intake/?city="+cityId; 
            }, 1000);
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ":" + xhr.responseText);
            let response = JSON.parse(xhr.responseText);
            $('#_thumbnail_processing').modal('hide');
            Swal.fire({
                icon: 'error',
                title: gettext('Intake saving error'),
                text: response.message,
            })
            return false;
        }
    });

}
/** 
 * Delimit manually the intake polygon
 */
function delimitIntakeArea() {
    isFile = false;
    var copyCoordinates = [];
    console.log('Delimiting');
    var polygonKeys = Object.keys(catchmentPoly._layers);
    var keyNamePolygon = polygonKeys[0];
    var geometryCoordinates = catchmentPoly._layers[keyNamePolygon].feature.geometry.coordinates[0];
    geometryCoordinates.forEach(function(geom) {
        var coordinates = [];
        coordinates.push(geom[1]);
        coordinates.push(geom[0]);
        copyCoordinates.push(coordinates);
    })
    if (editablepolygon) {
        mapDelimit.removeLayer(editablepolygon);
    }
    editablepolygon = L.polygon(copyCoordinates, { color: 'red' });
    editablepolygon.addTo(mapDelimit)
    editablepolygon.enableEdit();
    editablepolygon.on('dblclick', L.DomEvent.stop).on('dblclick', editablepolygon.toggleEdit);
}

function validateIntakeArea() {
    var editablePolygonJson = editablepolygon.toGeoJSON();
    var intakePolygonJson = catchmentPoly.toGeoJSON();
    var pointIntakeJson = snapMarker.toGeoJSON();
    /** 
     * Get filtered activities by transition id 
     * @param {String} url   activities URL 
     * @param {Object} data  transition id  
     *
     * @return {String} activities in HTML option format
     */
    $.ajax({
        url: '/intake/validateGeometry/',
        type: 'POST',
        data: {
            'editablePolygon': JSON.stringify(editablePolygonJson),
            'intakePolygon': JSON.stringify(intakePolygonJson),
            'isFile': JSON.stringify(isFile),
            'typeDelimit': delimitationFileType
        },
        success: function(result) {
            if (!result.validPolygon) {
                Swal.fire({
                    icon: 'error',
                    title: gettext('Geometry error'),
                    text: gettext('The edited polygon is not valid')
                })
            } else if (!result.polygonContains) {
                Swal.fire({
                        icon: 'error',
                        title: gettext('Geometry error'),
                        text: gettext('The polygon geometries must be inside basin geometry'),
                    })
                    // Correct geometry
            } else {
                validGeometry = true;
                Swal.fire(
                    gettext('Great!'),
                    gettext("Is a valid polygon inside basin's geometries"),
                    'success'
                );
                // Set original intake area geom in hidden input for posterior reading
                $('#intakeAreaPolygon').val(JSON.stringify(intakePolygonJson));
                $('#basinId').val(basinId);
                // Set delimited area geom in hidden input for posterior reading
                $('#delimitArea').val(JSON.stringify(editablePolygonJson));
                $('#pointIntake').val(JSON.stringify(pointIntakeJson));
                $('#isFile').val(JSON.stringify(isFile));
                $('#typeDelimit').val(JSON.stringify(delimitationFileType));
            }
        },
        error: function(error) {
            console.log(error);
        }
    });
}

/** 
 * Validate input file on change
 * @param {HTML} dropdown Dropdown selected element
 Si */
function changeFileEvent() {
    $('#intakeArea').change(function(evt) {
        var file = evt.currentTarget.files[0];
        var extension = validExtension(file);
        // Validate file's extension
        if (extension.valid) { //Valid
            console.log('Extension valid!');
            isFile = true;
            // Validate file's extension
            if (extension.extension == 'geojson') { //GeoJSON
                var readerGeoJson = new FileReader();
                readerGeoJson.onload = function(evt) {
                    var contents = evt.target.result;
                    try {
                        geojson = JSON.parse(contents);
                        validGeojson = validateGeoJson(geojson);
                        if (validGeojson) {
                            delimitationFileType = delimitationFileEnum.GEOJSON;
                            addEditablePolygonMap();
                        } else {
                            $('#intakeArea').val('');
                            return;
                        }
                    } catch (e) {
                        Swal.fire({
                            icon: 'error',
                            title: gettext('GeoJSON file error'),
                            text: gettext('Character errors in GeoJSON file'),
                        })
                        $('#intakeArea').val('');
                        return;
                    };
                };

                readerGeoJson.onerror = function() {
                    console.log(readerGeoJson.error);
                };
                readerGeoJson.readAsText(file);
            } else { //Zip
                var reader = new FileReader();
                reader.onload = function(evt) {
                    var contents = evt.target.result;
                    JSZip.loadAsync(file).then(function(zip) {
                        shapeValidation = validateShapeFile(zip);
                        shapeValidation.then(function(resultFile) {
                            //is valid shapefile
                            if (resultFile.valid) {
                                shp(contents).then(function(shpToGeojson) {
                                    geojson = shpToGeojson;
                                    delimitationFileType = delimitationFileEnum.SHP;
                                    addEditablePolygonMap();
                                });
                            } else {
                                $('#intakeArea').val('');
                                return;
                            }
                        });
                        //loadShapefile(geojson, file.name);
                    }).catch(function(e) {
                        Swal.fire({
                            icon: 'error',
                            title: gettext('Shapefile error'),
                            text: gettext("There's been an error reading the shapefile"),
                        })
                        console.log("Ocurrió error convirtiendo el shapefile " + e);
                        $('#intakeArea').val('');
                    });
                };
                reader.onerror = function(event) {
                    console.error("File could not be read! Code " + event.target.error.code);
                    //alert("El archivo no pudo ser cargado: " + event.target.error.code);
                };
                reader.readAsArrayBuffer(file);
            }
        } else { //Invalid extension
            Swal.fire({
                icon: 'error',
                title: gettext('Extension file error'),
                text: gettext('Not supported file extension'),
            })
            $('#intakeArea').val('');
        }
    });
}

function addEditablePolygonMap() {
    let polygonStyle = {
        fillColor: "red",
        color: "#333333",
        weight: 0.2,
        fillOpacity: 0.3
    };
    if (editablepolygon) {
        mapDelimit.removeLayer(editablepolygon);
    }
    editablepolygon = L.geoJSON(geojson, { style: polygonStyle })
    editablepolygon.addTo(mapDelimit);
    mapDelimit.fitBounds(editablepolygon.getBounds());
}