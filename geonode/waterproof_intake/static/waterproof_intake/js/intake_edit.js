/**
 * @file Create Intake wizard step
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
var banderaExternal = 0;

var mxLanguage = urlParams['lang'];
var map;
var basinId;
var mapDelimit;
var snapMarker;
var snapMarkerMapDelimit;
var catchmentPoly;
var catchmentPolyDelimit;
var copyCoordinates = [];
var editablepolygon;
var validGeometry = true;
var validPolygon;
var isFile;
var delimitationFileType;
var xmlGraph;
var waterExtractionData = {};
var waterExtractionValue;
var lyrsPolygons = [];
var saveDataStep4 = false;
const delimitationFileEnum = {
    GEOJSON: 'geojson',
    SHP: 'shapefile'
}
const interpMethodInput = $('#typeProcessInterpolation');
const numYearsInput = $('#numberYearsInterpolationValue');
const initialExtraction = $('#initialDataExtractionInterpolationValue');
const finalExtraction = $('#finalDataExtractionInterpolationValue');
const interpolationType = {
    LINEAR: 'LINEAR',
    POTENTIAL: 'POTENTIAL',
    EXPONENTIAL: 'EXPONENTIAL',
    LOGISTICS: 'LOGISTICS',
    MANUAL: 'MANUAL'
}

var mapLoader;
var banderaInpolation = 0;
$(document).ready(function () {
    
    // disable enter key in form
    $(document).keypress(
        function(event){
          if (event.which == '13') {
            event.preventDefault();
          }
    });

    $("#intakeWECB").click(function () {
        generateWaterExtraction();
    });
    setInterpolationParams();
    // setTimeout(() => {
    //     loadExternalDataOnInit();
    //     loadExternalInput();
    // }, 1000);    

    function loadExternalDataOnInit() {
        for (let id = 0; id < graphData.length; id++) {
            if (graphData[id].external == 'true') {
                graphData[id].externaldata = [];
                var filterExternal = intakeExternalInputs.filter(e => e.xmlId == parseInt(graphData[id].id));
                if (filterExternal.length > 0) {
                    console.log(filterExternal);
                    filterExternal[0].waterExtraction.forEach(function (external) {
                        graphData[id].externaldata.push({
                            "year": external.year,
                            "waterVol": external.waterVol,
                            "sediment": external.sediment,
                            "nitrogen": external.nitrogen,
                            "phosphorus": external.phosphorus
                        });
                    });
                }
                graphData[id].externaldata = JSON.stringify(graphData[id].externaldata);
            }
        }
        $('#graphElements').val(JSON.stringify(graphData));
    }    

    $('#externalSelect').change(function () {
        for (let t = 0; t < graphData.length; t++) {
            if (graphData[t].external == 'true') {
                $(`#table_${graphData[t].id}`).css('display', 'none');
            }
        }
        $(`#table_${$('#externalSelect').val()}`).css('display', 'block');
    });

    $('#smartwizard').smartWizard("next").click(function () {
        $('#autoAdjustHeightF').css("height", "auto");
        mapDelimit.invalidateSize();
        map.invalidateSize();
    });

    // Generate Input Manual Interpolation
    $('#intakeNIBYMI').click(function () {
        if ($('#intakeNIYMI').val() < 10 || $('#intakeNIYMI').val() > 100) {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_problem'),
                text: gettext('Error number of years  (10-100) Year'),
            });
            valid_period = false;
            return;
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
        for (let index = 0; index <= intakeNIYMI; index++) {
            $('#intakeWEMI').append(`
            <tr>
                <th class="text-center" scope="row">${index}</th>
                <td class="text-center"><input name="manualInputData" yearValue="${index}" type="number" class="form-control justify-number"></td>
              </tr>
            `);
        }
    });

    $('#smartwizard').smartWizard("next").click(function () {
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

    $("#smartwizard").on("showStep", function (e, anchorObject, stepIndex, stepDirection) {
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
    $('#step1NextBtn').click(function () {
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
                text: gettext('Please complete all required information')
            });
            return;
        }
    });

    $('#step2PrevBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step2NextBtn').click(function () {
        if (!bandera) {
            $('#smartwizard').smartWizard("stepState", [3], "hide");
            for (const item of graphData) {
                if (item.external != null && item.external != 'false') {
                    $('#smartwizard').smartWizard("stepState", [3], "show");
                }
            }
            clearDataHtml();
            generateWaterExtraction();
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

    $('#step3PrevBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step3NextBtn').click(function () {
        console.log("execute clic of generate button");
        
        if ($('#intakeECTAG')[0].childNodes.length > 1 || $('#intakeWEMI')[0].childNodes.length > 1) {
            if (waterExtractionData.typeInterpolation == interpolationType.MANUAL) {
                waterExtractionValue = [];
                $('input[name=manualInputData]').each(function (i, l) {
                    if ($(l).val() == '' || $('#intakeNIYMI').val() == '') {
                        Swal.fire({
                            icon: 'warning',
                            title: gettext('Data analysis empty'),
                            text: gettext('Please complete all required information')
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
                if (waterExtractionData.yearCount == waterExtractionData.yearValues.length-1) {
                    intakeStepThree();
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: `Data analysis empty`,
                        text: gettext(`Please complete all required information`)
                    });
                    return;
                }
            } else {
                loadExternalDataOnInit();
                loadExternalInput();
                intakeStepThree();
            }
        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('Data analysis empty'),
                text: gettext('Please complete all required information')
            });
            return;
        }
    });

    $('#step4PrevBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step5PrevBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#submit').click(function (event) {
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

    function loadExternalInput() {
        if (graphData.length == 0) {
            return;
        }
        let lblSelectOption = gettext('Select an option');
        let headTbl = headTblExternalInput();
        let lblExternalInput = gettext('External input');

        $('#externalSelect').append(`<option value="null" selected>${lblSelectOption}</option>`);
        var extractionFilter = graphData.filter(g => g.external == 'true');
        if (extractionFilter.length > 0) {
            var extractionData = extractionFilter[0];
            if (extractionData.externaldata) {
                extractionData.externaldata = JSON.parse(extractionData.externaldata);
                if (extractionData.externaldata.length > 0) {
                    $('#externalSelect').append(`<option value="${extractionData.id}">${extractionData.id} - ${lblExternalInput}</option>`);
                    var rows = "";
                    for (const iterator of extractionData.externaldata) {
                        rows += (`<tr>
                                    <th class="text-center" scope="col" name="year_${extractionData.id}" year_value="${iterator.year}">${iterator.year}</th>
                                    <td class="text-center" scope="col"><input type="number" class="form-control justify-number" value="${iterator.waterVol}" name="waterVolume_${iterator.year}_${extractionData.id}"></td>
                                    <td class="text-center" scope="col"><input type="number" class="form-control justify-number" value="${iterator.sediment}" name="sediment_${iterator.year}_${extractionData.id}"></td>
                                    <td class="text-center" scope="col"><input type="number" class="form-control justify-number" value="${iterator.nitrogen}" name="nitrogen_${iterator.year}_${extractionData.id}" ></td>
                                    <td class="text-center" scope="col"><input type="number" class="form-control justify-number" value="${iterator.phosphorus}" name="phosphorus_${iterator.year}_${extractionData.id}"></td>
                            </tr>`);
                    }

                    $('#IntakeTDLE').append(`
                            <table class="table" id="table_${extractionData.id}" style="display: none;">
                                    ${headTbl}
                                    <tbody>${rows}</tbody>
                            </table>    
                    `);
                    $('#externalSelect').val(extractionData.id);
                    $(`#table_${$('#externalSelect').val()}`).css('display', 'block');
                }else{
                    numberYearsInterpolationValue = Number($("#numberYearsInterpolationValue").val());
                    externalInput(numberYearsInterpolationValue);
                }
                
            }
        }
    }

    // Change Option Manual Tab
    $('#btnManualTab').click(function () {
        if (initialExtraction.val() != '' || finalExtraction.val() != '' || $('#numberYearsInterpolationValue').val() != '') {
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
                    $('#intakeECTAG tr').remove();
                    $('#IntakeTDLE table').remove();
                    $('#externalSelect option').remove();
                    $('#intakeECTAG').empty();
                    $('#IntakeTDLE').empty();
                    $('#externalSelect').empty();
                    waterExtractionData = {};
                    $('#waterExtraction').val(JSON.stringify(waterExtractionData));
                    initialExtraction.val('');
                    finalExtraction.val('');
                    $('#numberYearsInterpolationValue').val('');
                } else if (result.isDenied) {
                    $('[href="#automatic"]').tab('show');
                }
            })
        }
    });

    // Change Option Automatic with Wizard Tab
    $('#btnAutomaticTab').click(function () {
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
                    waterExtractionData = {};
                    $('#waterExtraction').val(JSON.stringify(waterExtractionData));
                    $('#intakeNIYMI').val('');
                } else if (result.isDenied) {
                    $('[href="#manual"]').tab('show');
                }
            })
        }
    });

    let initialCoords = [4.5, -74.4];
    let zoom = 5;    
    let attr = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
    var cityCoords = localStorage.getItem('cityCoords');
    if (cityCoords == undefined) {
        cityCoords = initialCoords;
    } else {
        initialCoords = JSON.parse(cityCoords);
        zoom = 10;
    }

    map = L.map('map', {}).setView(initialCoords, zoom);
    mapDelimit = L.map('mapid', { editable: true }).setView(initialCoords, zoom);
    var osm = L.tileLayer(OSM_BASEMAP_URL, {
        attribution: attr,
    });
    var osmid = L.tileLayer(OSM_BASEMAP_URL, {
        attribution: attr,
    });
    map.addLayer(osm);
    var images = L.tileLayer(IMG_BASEMAP_URL);
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
        /* Grayscale: gray,   */
    };
    var overlays = {
        "Hydro Network": wmsHydroNetworkLyr,
        "Hydro (esri)": hydroLyr,
    };
    var c = new L.Control.Coordinates().addTo(map);
    var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright' }).addTo(map);
    L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);
    mapDelimit.addLayer(osmid);
    var defExtD = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright' }).addTo(mapDelimit);
    intakePolygons.forEach(feature => {
        if (feature.delimitArea !== 'None') {
            let delimitPolygon = feature.delimitArea;
            if (delimitPolygon.indexOf("SRID") >= 0) {
                delimitPolygon = delimitPolygon.split(";")[1];
            }
            let delimitLayerTransformed = omnivore.wkt.parse(delimitPolygon);
            let delimitLayerKeys = Object.keys(delimitLayerTransformed._layers);
            let keyNameDelimitPol = delimitLayerKeys[0];
            let delimitPolyCoord = delimitLayerTransformed._layers[keyNameDelimitPol].feature.geometry.coordinates[0];
            delimitPolyCoord.forEach(function (geom) {
                var coordinates = [];
                coordinates.push(geom[1]);
                coordinates.push(geom[0]);
                copyCoordinates.push(coordinates);
            })
            editablepolygon = L.polygon(copyCoordinates, { color: 'red' });
            editablepolygon.addTo(mapDelimit);
            var editablePolygonJson = editablepolygon.toGeoJSON();
        }

        let ll = new L.LatLng(feature.point.geometry.coordinates[1], feature.point.geometry.coordinates[0]);
        snapMarker = L.marker(null, {});
        snapMarkerMapDelimit = L.marker(null, {});
        snapMarker.setLatLng(ll);
        snapMarkerMapDelimit.setLatLng(ll);
        snapMarker.addTo(map);
        snapMarkerMapDelimit.addTo(mapDelimit);
        var jsPolygon = JSON.parse(feature.polygon);
        // validate if polygon have more than one Ring and take only external Ring
        try {
            if (jsPolygon.features[0].geometry.coordinates.length > 1) {
                jsPolygon = {
                    type: jsPolygon.type,
                    features: [{
                        type: jsPolygon.features[0].type,
                        properties: jsPolygon.features[0].properties,
                        geometry: {
                            type: jsPolygon.features[0].geometry.type,
                            coordinates: [jsPolygon.features[0].geometry.coordinates[0]]
                        }
                    }]
                };
            }
            // if (jsPolygon.features[0].geometry.coordinates[0].length > MAX_NUM_POINTS) {
            //     console.log("too many points : " + jsPolygon.features[0].geometry.coordinates[0].length + " ... simplifying");
            //     var polygonSimplified = simplifyPolygon(jsPolygon.features[0].geometry.coordinates[0]);
            //     if (polygonSimplified.geometry.coordinates[0].length > 0) {
            //         jsPolygon = polygonSimplified;
            //         console.log("new num points in polygon : " + polygonSimplified.geometry.coordinates[0].length);
            //     }
            // }
        } catch (err) {
            console.log(err);
        }

        catchmentPoly = L.geoJSON(jsPolygon).addTo(map);
        catchmentPolyDelimit = L.geoJSON(jsPolygon).addTo(mapDelimit);
        map.fitBounds(catchmentPoly.getBounds());
        map.setView(catchmentPoly.getBounds().getCenter(), zoom);
        mapDelimit.setView(catchmentPoly.getBounds().getCenter(), zoom);
        var intakePolygonJson = catchmentPoly.toGeoJSON();
        var pointIntakeJson = snapMarker.toGeoJSON();
        basinId = feature.basin;
        $('#intakeAreaPolygon').val(JSON.stringify(intakePolygonJson));
        $('#basinId').val(basinId);
        // Set delimited area geom in hidden input for posterior reading
        $('#delimitArea').val(JSON.stringify(editablePolygonJson));
        $('#pointIntake').val(JSON.stringify(pointIntakeJson));
        $('#isFile').val(JSON.stringify(isFile));
        $('#typeDelimit').val(JSON.stringify(delimitationFileType));
    });

    $("#validateBtn").on("click", function () {
        Swal.fire({
            title: gettext('Basin point delimitation'),
            text: gettext('The point coordinates will be ajusted'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: gettext('Yes, adjust!'),
            cancelButtonText: gettext('Cancel'),
        }).then((result) => {
            if (result.isConfirmed) {
                mapLoader = L.control.loader().addTo(map);
                validateCoordinateWithApi();
            }
        })
    });
    $('#btnDelimitArea').on("click", delimitIntakeArea);
    $('#btnValidateArea').on("click", validateIntakeArea);
    if (!mapLoader) {
        mapLoader = L.control.loader().addTo(map);
    }

    mapLoader.hide();
    createEditor(editorUrl);

    var menu1Tab = document.getElementById('mapid');
    var observer2 = new MutationObserver(function () {
        if (menu1Tab.style.display != 'none') {
            mapDelimit.invalidateSize();
        }
    });
    observer2.observe(menu1Tab, { attributes: true });

    function updateTooltips() {
        let mxImgsBtn = $("#toolbar .mxToolbarMode");
        mxImgsBtn.forEach( b => {
            $(b).attr("data-toggle", "tooltip");
            $(b).attr("data-placement", "bottom");
            $(b).attr("title", gettext($b.attr("title"))) ;
        });


        $('[data-toggle="tooltip"]').tooltip();
    }

});

function generateWaterExtraction(){
    if ($('#numberYearsInterpolationValue').val() < 10 || $('#numberYearsInterpolationValue').val() > 100) {
        Swal.fire({
            icon: 'warning',
            title: gettext('field_problem'),
            text: gettext('Error number of years for time series  (10-100) Year'),
        });
        valid_period = false;
        return;
    }

    if ($("#numberYearsInterpolationValue").val() == '' || $("#initialDataExtractionInterpolationValue").val() == '' || $("#finalDataExtractionInterpolationValue").val() == '') {
        Swal.fire({
            icon: 'warning',
            title: gettext('Data analysis empty'),
            text: gettext('Please complete all required information')
        });
        return;
    }
    banderaInpolation += 1;
    banderaExternal += 1;
    $('#intakeECTAG tr').remove();
    $('#IntakeTDLE table').remove();
    $('#externalSelect option').remove();
    $('#intakeECTAG').empty();
    $('#IntakeTDLE').empty();
    $('#externalSelect').empty();
    $('#autoAdjustHeightF').css("height", "auto");
    typeProcessInterpolation = Number($("#typeProcessInterpolation").val());
    numberYearsInterpolationValue = Number($("#numberYearsInterpolationValue").val());
    initialDataExtractionInterpolationValue = parseFloat($("#initialDataExtractionInterpolationValue").val());
    finalDataExtractionInterpolationValue = parseFloat($("#finalDataExtractionInterpolationValue").val());

    waterExtractionValue = [];
    // Linear interpolation
    if (typeProcessInterpolation == 1) {        
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
                <td class="text-center"><input type="number" class="form-control justify-number" value="${((m * index) + b).toFixed(2)}" disabled></td>
            </tr>`);
        }
    }

    // Potencial interpolation
    if (typeProcessInterpolation == 2) {        
        waterExtractionData.typeInterpolation = interpolationType.POTENTIAL;
        m = (Math.log(finalDataExtractionInterpolationValue) - Math.log(initialDataExtractionInterpolationValue)) / ((Math.log(numberYearsInterpolationValue + 1) - Math.log(1)));
        b = Math.exp((-1 * m * Math.log(1)) + Math.log(initialDataExtractionInterpolationValue));
        for (let index = 0; index <= numberYearsInterpolationValue; index++) {
            var yearData = {};
            yearData.year = index;
            yearData.value = (b * (Math.pow(index, m))).toFixed(2);
            waterExtractionValue.push(yearData);
            $('#intakeECTAG').append(`<tr>
            <th class="text-center" scope="row">${index}</th>
            <td class="text-center"><input type="text" class="form-control justify-number" value="${(b * (Math.pow(index+1, m))).toFixed(2)}" disabled></td>
          </tr>`);
        }
    }

    // Exponential interpolation
    if (typeProcessInterpolation == 3) {
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
        waterExtractionData.typeInterpolation = interpolationType.LOGISTICS;
        r = (-Math.log(0.000000001) / initialDataExtractionInterpolationValue);
        for (let index = 0; index <= numberYearsInterpolationValue; index++) {
            var yearData = {};
            yearData.year = index + 1;
            yearData.value = ((finalDataExtractionInterpolationValue) / (1 + ((finalDataExtractionInterpolationValue / initialDataExtractionInterpolationValue) - 1) * Math.exp(-r * index))).toFixed(2);
            waterExtractionValue.push(yearData);
            $('#intakeECTAG').append(`<tr>
            <th class="text-center" scope="row">${index}</th>
            <td class="text-center"><input type="text" class="form-control justify-number" value="${((finalDataExtractionInterpolationValue) / (1 + ((finalDataExtractionInterpolationValue / initialDataExtractionInterpolationValue) - 1) * Math.exp(-r * index))).toFixed(2)}" disabled></td>
          </tr>`);
        }
    }

    if (banderaExternal != 1) {
        externalInput(numberYearsInterpolationValue);
    }
    // Set object data for later persistence
    waterExtractionData.yearCount = numberYearsInterpolationValue;
    waterExtractionData.initialValue = initialDataExtractionInterpolationValue;
    waterExtractionData.finalValue = finalDataExtractionInterpolationValue;
    waterExtractionData.yearValues = waterExtractionValue;
    $('#waterExtraction').val(JSON.stringify(waterExtractionData));
}

// Generate table external Input
function externalInput(numYear) {
    var rows = "";
    var numberExternal = 0;
    let headTbl = headTblExternalInput();
    
    let lblExternalInput = gettext('External Input');
    let lblSelectOption = gettext('Select an option');
    $('#externalSelect').empty();
    $('#externalSelect').append(`<option value="null" selected>${lblSelectOption}</option>`);    
    for (let p = 0; p < graphData.length; p++) {
        if (graphData[p].external == 'true') {
            numberExternal += 1
            $('#externalSelect').append(`<option value="${graphData[p].id}">${graphData[p].id} - ${lblExternalInput}</option>`);
            rows = "";
            for (let index = 0; index <= numYear; index++) {
                rows += (`<tr>
                            <th class="text-center" scope="col" name="year_${graphData[p].id}" year_value="${index}">${index}</th>
                            <td class="text-center" scope="col"><input type="number" class="form-control justify-number" name="waterVolume_${index}_${graphData[p].id}"></td>
                            <td class="text-center" scope="col"><input type="number" class="form-control justify-number" name="sediment_${index}_${graphData[p].id}"></td>
                            <td class="text-center" scope="col"><input type="number" class="form-control justify-number" name="nitrogen_${index}_${graphData[p].id}" ></td>
                            <td class="text-center" scope="col"><input type="number" class="form-control justify-number" name="phosphorus_${index}_${graphData[p].id}"></td>
                        </tr>`);
            }
            $('#IntakeTDLE').append(`
                    <table class="table" id="table_${graphData[p].id}" style="display: none">
                        ${headTbl}
                        <tbody>${rows}</tbody>
                    </table>`);
        }
    }
    $('#ExternalNumbersInputs').html(numberExternal)
}

function headTblExternalInput(){
    let lblYear = gettext('Year');
    let lblWaterVolume = gettext('Water Volume');
    let lblSediment = gettext('Sediment');
    let lblNitrogen = gettext('Nitrogen');
    let lblPhosphorus = gettext('Phosphorus');
    return`<thead>
            <tr>
                <th class="text-center" scope="col">${lblYear}</th>
                <th class="text-center" scope="col">${lblWaterVolume} (m3)</th>
                <th class="text-center" scope="col">${lblSediment} (Ton)</th>
                <th class="text-center" scope="col">${lblNitrogen} (Kg)</th>
                <th class="text-center" scope="col">${lblPhosphorus} (Kg)</th>
            </tr>
        </thead>`;
}

/*Set values for interpolation
parameters*/
function setInterpolationParams() {
    switch (intakeInterpolationParams.type) {
        // LINEAR INTERPOLATION
        case interpolationType.LINEAR:
            // Method interpolation select
            interpMethodInput.val(1);            
            break;
        // POTENTIAL INTERPOLATION
        case interpolationType.POTENTIAL:
            interpMethodInput.val(2);            
            break;
        // EXPONENTIAL INTERPOLATION
        case interpolationType.EXPONENTIAL:
            interpMethodInput.val(3);            
            break;

        // LOGISTICS INTERPLATION
        case interpolationType.LOGISTICS:
            interpMethodInput.val(4);
            break;
    }
    // Years number for time series
    numYearsInput.val(intakeInterpolationParams.yearsNum);
    // Initial extraction value
    initialExtraction.val(intakeInterpolationParams.initialExtract.toFixed(2));
    // Final extraction value
    finalExtraction.val(intakeInterpolationParams.endingExtract.toFixed(2));
    //generateWaterExtraction();
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
    // Edit condition
    formData.append('edit', true);
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
        success: function (response) {
            console.log(response);
            $('#intakeId').val(response.intakeId);
            $('#smartwizard').smartWizard("next");
        },
        error: function (xhr, errmsg, err) {
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
        success: function (response) {
            console.log(response);
            $('#smartwizard').smartWizard("next");
        },
        error: function (xhr, errmsg, err) {
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
    // Edit condition
    formData.append('edit', true);
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
        success: function (response) {
            console.log(response);
            $('#smartwizard').smartWizard("next");
        },
        error: function (xhr, errmsg, err) {
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
    formData.append('edit', 'true');
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
        success: function (response) {
            console.log(response);
            $('#smartwizard').smartWizard("next");
        },
        error: function (xhr, errmsg, err) {
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
    // Intake area polygon
    formData.append('intakeAreaPolygon', $('#intakeAreaPolygon').val());
    // Intake delimit area polygon
    formData.append('delimitArea', $('#delimitArea').val());
    // Intake basin 
    formData.append('basinId', $('#basinId').val());
    // Intake type delimit
    formData.append('typeDelimit', $('#typeDelimit').val());
    // Intake is File?
    formData.append('isFile', $('#isFile').val());
    //console.log(formData);
    $('#_thumbnail_processing').modal('toggle');
    $('#_thumbnail_processing .modal-header h1')[0].innerText=gettext('The water intake is being saved');
    $('#_thumbnail_processing .progress div')[0].innerText=gettext('Please wait');
    
    $.ajax({
        type: 'POST',
        url: '/intake/create/',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function (response) {
            //console.log(response);
            $('#_thumbnail_processing').modal('hide');
            Swal.fire({
                icon: 'success',
                text: gettext('The water intake is being saved'),
                allowOutsideClick: true,
                showConfirmButton: false
            });
            var cityId = 143873; //Default Bogota
            if (localStorage.cityId) {
                cityId = localStorage.cityId;
            }
            setTimeout(function () { location.href = "/intake/?city=" + cityId; }, 1000);
        },
        error: function (xhr, errmsg, err) {
            // console.log(xhr.status + ":" + xhr.responseText);
            $('#_thumbnail_processing').modal('hide');
            let response = JSON.parse(xhr.responseText);
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
    validGeometry = false;
    copyCoordinates = [];
    console.log('Delimiting');
    var polygonKeys = Object.keys(catchmentPoly._layers);
    var keyNamePolygon = polygonKeys[0];
    var geometryCoordinates = catchmentPoly._layers[keyNamePolygon].feature.geometry.coordinates[0];
    geometryCoordinates.forEach(function (geom) {
        var coordinates = [];
        coordinates.push(geom[1]);
        coordinates.push(geom[0]);
        copyCoordinates.push(coordinates);
    })
    if (editablepolygon !== void (0))
        mapDelimit.removeLayer(editablepolygon);
    editablepolygon = L.polygon(copyCoordinates, { color: 'red' });
    editablepolygon.addTo(mapDelimit)
    editablepolygon.enableEdit();
    editablepolygon.on('dblclick', L.DomEvent.stop).on('dblclick', editablepolygon.toggleEdit);
}

function validateIntakeArea() {

    var intakePolygonJson = catchmentPoly.toGeoJSON();
    var editablePolygonJson;
    if (editablepolygon == undefined) {
        if (intakePolygonJson.type == 'FeatureCollection') {
            editablePolygonJson = intakePolygonJson.features[0];
        } else {
            editablePolygonJson = JSON.parse(JSON.stringify(intakePolygonJson));
        }

    } else {
        editablePolygonJson = editablepolygon.toGeoJSON();
    }
    var pointIntakeJson = snapMarker.toGeoJSON();
    isFile = (isFile == undefined ? false : isFile);
    delimitationFileType = (delimitationFileType == undefined ? delimitationFileEnum.GEOJSON : delimitationFileType);
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
        success: function (result) {
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
        error: function (error) {
            console.log(error);
        }
    });
}

/** 
 * Validate input file on change
 * @param {HTML} dropdown Dropdown selected element
 */
function changeFileEvent() {
    $('#intakeArea').change(function (evt) {
        var file = evt.currentTarget.files[0];
        var extension = validExtension(file);
        // Validate file's extension
        if (extension.valid) { //Valid
            console.log('Extension valid!');
            isFile = true;
            // Validate file's extension
            if (extension.extension == 'geojson') { //GeoJSON
                var readerGeoJson = new FileReader();
                readerGeoJson.onload = function (evt) {
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

                readerGeoJson.onerror = function () {
                    console.log(readerGeoJson.error);
                };
                readerGeoJson.readAsText(file);
            } else { //Zip
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var contents = evt.target.result;
                    JSZip.loadAsync(file).then(function (zip) {
                        shapeValidation = validateShapeFile(zip);
                        shapeValidation.then(function (resultFile) {
                            //is valid shapefile
                            if (resultFile.valid) {
                                shp(contents).then(function (shpToGeojson) {
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
                    }).catch(function (e) {
                        Swal.fire({
                            icon: 'error',
                            title: gettext('Shapefile error'),
                            text: gettext("There's been an error reading the shapefile"),
                        })
                        console.log("Ocurrió error convirtiendo el shapefile " + e);
                        $('#intakeArea').val('');
                    });
                };
                reader.onerror = function (event) {
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
    editablepolygon = L.geoJSON(geojson, { style: polygonStyle });
    editablepolygon.addTo(mapDelimit);
    mapDelimit.fitBounds(editablepolygon.getBounds());
}