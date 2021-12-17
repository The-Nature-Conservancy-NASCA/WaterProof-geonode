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
var copyCoordinates = [];
var editablepolygon;
var validPolygon;
var isFile;
var delimitationFileType;
var xmlGraph;
var waterExtractionData = {};
var waterExtractionValue;
var lyrsPolygons = [];
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
$(document).ready(function() {
    // Interpolation with Wizard
    $("#intakeWECB").click(function() {
        //generateInterpolationResult();
    });

    function externalInput(numYear) {
        var rows = "";
        var numberExternal = 0;
        let headTbl = headTblExternalInput();
        let lblSelectOption = gettext('Select an option');
        let lblExternalInput = gettext('External Input');
        $('#externalSelect').append(`<option value="null" selected>${lblSelectOption}</option>`);        
        for (let p = 0; p < graphData.length; p++) {
            if (graphData[p].external == 'true') {
                numberExternal += 1
                $('#externalSelect').append(`
                            <option value="${graphData[p].id}">${graphData[p].id} - ${lblExternalInput}</option>
                    `);
                rows = "";
                for (let index = 0; index <= numYear; index++) {
                    rows += (`<tr>
                                <th class="text-center" scope="col" name="year_${graphData[p].id}" year_value="${index + 1}">${index + 1}</th>
                                <td class="text-center" scope="col"><input type="text" class="form-control" name="waterVolume_${index + 1}_${graphData[p].id}"></td>
                                <td class="text-center" scope="col"><input type="text" class="form-control" name="sediment_${index + 1}_${graphData[p].id}"></td>
                                <td class="text-center" scope="col"><input type="text" class="form-control" name="nitrogen_${index + 1}_${graphData[p].id}" ></td>
                                <td class="text-center" scope="col"><input type="text" class="form-control" name="phosphorus_${index + 1}_${graphData[p].id}"></td>
                            </tr>`);
                }
                $('#IntakeTDLE').append(`
                        <table class="table" id="table_${graphData[p].id}" style="display: none">
                            ${headTbl}
                            <tbody>${rows}</tbody>
                        </table>`);
            }
        }
        $('#ExternalNumbersInputs').html(numberExternal);
    }
    
    function loadExternalInput() {
        let headTbl = headTblExternalInput();
        let lblSelectOption = gettext('Select an option');
        for (const extractionData of intakeExternalInputs) {
            $('#externalSelect').append(`<option value="${extractionData.xmlId}">${extractionData.xmlId} - ${lblExternalInput}</option>`);
            rows = "";
            for (let index = 0; index < extractionData.waterExtraction.length; index++) {
                rows += (`<tr>
                        <th class="text-center" scope="col" name="year_${extractionData.waterExtraction[index].year}" year_value="${index + 1}">${index + 1}</th>
                        <td class="text-center" scope="col"><input type="text" value="${extractionData.waterExtraction[index].waterVol}" class="form-control" name="waterVolume_${index + 1}_${extractionData.xmlId}"></td>
                        <td class="text-center" scope="col"><input type="text" value="${extractionData.waterExtraction[index].sediment}" class="form-control" name="sediment_${index + 1}_${extractionData.xmlId}"></td>
                        <td class="text-center" scope="col"><input type="text" value="${extractionData.waterExtraction[index].nitrogen}" class="form-control" name="nitrogen_${index + 1}_${extractionData.xmlId}" ></td>
                        <td class="text-center" scope="col"><input type="text" value="${extractionData.waterExtraction[index].phosphorus}" class="form-control" name="phosphorus_${index + 1}_${extractionData.xmlId}"></td>
                  </tr>`);

            }
            $('#IntakeTDLE').append(`
                    <table class="table" id="table_${extractionData.xmlId}" style="display: none;">
                        ${headTbl}
                        <tbody>${rows}</tbody>
                    </table>    
          `);
        }

        $('#step4PrevBtn').click(function() {
            $('#smartwizard').smartWizard("prev");
        });
    
        $('#step5PrevBtn').click(function() {
            $('#smartwizard').smartWizard("prev");
        });
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

    function setInterpolationParams() {

        // Years number for time series
        numYearsInput.val(intakeInterpolationParams.yearsNum);
        // Initial extraction value
        initialExtraction.val(intakeInterpolationParams.initialExtract.toFixed(2));
        // Final extraction value
        finalExtraction.val(intakeInterpolationParams.endingExtract.toFixed(2));
        //generateInterpolationResult();
    }

    setInterpolationParams();
    
    $('#step1NextBtn').click(function() {
        $('#smartwizard').smartWizard("stepState", [3], "hide");
        for (const item of graphData) {
            if (item.external != null && item.external != 'false') {
                $('#smartwizard').smartWizard("stepState", [3], "show");
            }
        }
        $('#smartwizard').smartWizard("next");
    });

    $('#step2PrevBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step2NextBtn').click(function() {
        console.log("pasó al tercer paso")
            $('#smartwizard').smartWizard("stepState", [3], "hide");
            for (const item of graphData) {
                if (item.external != null && item.external != 'false') {
                    $('#smartwizard').smartWizard("stepState", [3], "show");
                    generateInterpolationResult();

                }
            }
            clearDataHtml();
            $('#smartwizard').smartWizard("next");
    });

    $('#step3PrevBtn').click(function() {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step3NextBtn').click(function() {
        if ($('#intakeECTAG')[0].childNodes.length > 1 || $('#intakeWEMI')[0].childNodes.length > 1) {
            if (waterExtractionData.typeInterpolation == interpolationType.MANUAL) {
                waterExtractionValue = [];
                $(`input[name=manualInputData]`).each(function() {
                    if ($(this).val() == '' || $('#intakeNIYMI').val() == '') {
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
                    $('#smartwizard').smartWizard("next");
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: `Data analysis empty`,
                        text: gettext('Please complete all required information')
                    });
                    return;
                }
            } else {
                $('#smartwizard').smartWizard("next");
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

    // Change Option Manual Tab
    $('#btnManualTab').click(function() {
        if ($('#initialDataExtractionInterpolationValue').val() != '' || $('#finalDataExtractionInterpolationValue').val() != '' || $('#numberYearsInterpolationValue').val() != '') {
            {
                $('#intakeECTAG tr');
                $('#IntakeTDLE table');
                $('#externalSelect option');
                $('#intakeECTAG');
                $('#IntakeTDLE');
                $('#externalSelect');
                $('#waterExtraction');
                $('#initialDataExtractionInterpolationValue');
                $('#finalDataExtractionInterpolationValue');
                $('#numberYearsInterpolationValue');
            }
        }
    });

    // Change Option Automatic with Wizard Tab
    $('#btnAutomaticTab').click(function() {
        if ($('#intakeNIYMI').val() != '') {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: false,
                showDenyButton: true,
                confirmButtonColor: '#d33',
                denyButtonColor: '#3085d6',
                confirmButtonText: 'Yes, change it!',
                denyButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    $('#intakeWEMI tr').remove();
                    $('#IntakeTDLE table').remove();
                    $('#externalSelect option').remove();
                    $('#intakeWEMI').empty();
                    $('#IntakeTDLE').empty();
                    $('#externalSelect').empty();
                    waterExtractionData = [];
                    $('#waterExtraction').val(JSON.stringify(waterExtractionData));
                    $('#intakeNIYMI').val('');
                } else if (result.isDenied) {
                    $('[href="#manual"]').tab('show');
                }
            })
        }
    });

    // Sabe External Input Data
    $('#saveExternalData').click(function() {
        for (let id = 0; id < graphData.length; id++) {
            if (graphData[id].external) {
                graphData[id].externaldata = [];
                $(`th[name=year_${graphData[id].id}]`).each(function() {
                    let watersita = $(`input[name="waterVolume_${$(this).attr('year_value')}_${graphData[id].id}"]`).val();
                    let sedimentsito = $(`input[name="sediment_${$(this).attr('year_value')}_${graphData[id].id}"]`).val();
                    let nitrogenito = $(`input[name="nitrogen_${$(this).attr('year_value')}_${graphData[id].id}"]`).val();
                    let phospharusito = $(`input[name="phosphorus_${$(this).attr('year_value')}_${graphData[id].id}"]`).val();
                    if (watersita != '' || sedimentsito != '' || nitrogenito != '' || phospharusito != '') {
                        graphData[id].externaldata.push({
                            "year": $(this).attr('year_value'),
                            "water": watersita,
                            "sediment": sedimentsito,
                            "nitrogen": nitrogenito,
                            "phosphorus": phospharusito
                        });
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: gettext('Field empty'),
                            text: gettext('Please complete all required information')
                        });
                        return;
                    }
                });
                graphData[id].externaldata = JSON.stringify(graphData[id].externaldata);
            }
        }

        $('#graphElements').val(JSON.stringify(graphData));
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
    if ($('#smartwizard')[0] != undefined) {
        $('#smartwizard').smartWizard("next").click(function() {
            $('#autoAdjustHeightF').css("height", "auto");
            if (mapDelimit != null) {            
                mapDelimit.invalidateSize();
                map.invalidateSize();
            }
        });

        $('#smartwizard').smartWizard({
            selected: 0,
            theme: 'dots',
            enableURLhash: false,
            autoAdjustHeight: true,
            transition: {
                animation: 'slide-horizontal', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
            },
            toolbarSettings: {
                showNextButton: false,
                showPreviousButton: false,
            },
            keyboardSettings: {
                keyNavigation: false
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
            }
            if (stepIndex == 0) {
                if (catchmentPoly) {
                    map.invalidateSize();
                    map.fitBounds(catchmentPoly.getBounds());
                } else {
                    if (map != undefined) {
                        map.invalidateSize();
                    }
                    $('#autoAdjustHeightF').css("height", "auto");
                }
            }
        });
    }

    if (location.pathname.indexOf("viewDemand") == -1){
        loadExternalInput();
        initializeMap();
    }

    function generateInterpolationResult(){
        if ($("#numberYearsInterpolationValue").val() == '' || 
            $("#initialDataExtractionInterpolationValue").val() == '' || 
            $("#finalDataExtractionInterpolationValue").val() == '') {
            Swal.fire({
                icon: 'warning',
                title: gettext('Data analysis empty'),
                text: gettext('Please complete all required information')
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

            for (let index = 1; index <= numberYearsInterpolationValue + 1; index++) {
                var yearData = {};
                yearData.year = index;
                yearData.value = (b * (Math.pow(index, m))).toFixed(2);
                waterExtractionValue.push(yearData);
                $('#intakeECTAG').append(`<tr>
                <th class="text-center" scope="row">${index - 1}</th>
                <td class="text-center"><input type="text" class="form-control" value="${(b * (Math.pow(index, m))).toFixed(2)}" disabled></td>
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
                <td class="text-center"><input type="text" class="form-control" value="${(b * (Math.exp(m * index))).toFixed(2)}" disabled></td>
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
                <td class="text-center"><input type="text" class="form-control" value="${((finalDataExtractionInterpolationValue) / (1 + ((finalDataExtractionInterpolationValue / initialDataExtractionInterpolationValue) - 1) * Math.exp(-r * index))).toFixed(2)}" disabled></td>
              </tr>`);
            }
        }

        externalInput(numberYearsInterpolationValue);
        // Set object data for later persistence
        waterExtractionData.yearCount = numberYearsInterpolationValue;
        waterExtractionData.initialValue = initialDataExtractionInterpolationValue;
        waterExtractionData.finalValue = finalDataExtractionInterpolationValue;
        waterExtractionData.yearValues = waterExtractionValue;
        $('#waterExtraction').val(JSON.stringify(waterExtractionData));
    }

    function initializeMap(){
        let initialCoords = [4.5, -74.4];
        let zoom = 5;        
        let attr = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
        // find in localStorage if cityCoords exist
        var cityCoords = localStorage.getItem('cityCoords');
        if (cityCoords == undefined) {
            cityCoords = initialCoords;
        } else {
            initialCoords = JSON.parse(cityCoords);
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
        var esriHydroOverlayURL = HYDRO_BASEMAP_URL;
        var hydroLyr = L.tileLayer(esriHydroOverlayURL);
        var baseLayers = {
            OpenStreetMap: osm,
            Images: images,
            /* Grayscale: gray,   */
        };
        var overlays = {
            "Hydro (esri)": hydroLyr,
        };
        L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);
        mapDelimit.addLayer(osmid);
        
        intakePolygons.forEach(feature => {
            let poly = feature.polygon;
            let point = feature.point;
            let delimitPolygon = feature.delimitArea;
            if (feature.delimitArea != "None") {
                if (delimitPolygon.indexOf("SRID") >= 0) {
                    delimitPolygon = delimitPolygon.split(";")[1];
                }
        
                let delimitLayerTransformed = omnivore.wkt.parse(delimitPolygon);
                let delimitLayerKeys = Object.keys(delimitLayerTransformed._layers);
                let keyNameDelimitPol = delimitLayerKeys[0];
                let delimitPolyCoord = delimitLayerTransformed._layers[keyNameDelimitPol].feature.geometry.coordinates[0];
                delimitPolyCoord.forEach(function(geom) {
                    var coordinates = [];
                    coordinates.push(geom[1]);
                    coordinates.push(geom[0]);
                    copyCoordinates.push(coordinates);
                })               
            }
            
            let ll = new L.LatLng(feature.point.geometry.coordinates[1], feature.point.geometry.coordinates[0]);
            snapMarker = L.marker(null, {});
            snapMarkerMapDelimit = L.marker(null, {});
            snapMarker.setLatLng(ll);
            snapMarkerMapDelimit.setLatLng(ll);
            snapMarker.addTo(map);
            snapMarkerMapDelimit.addTo(mapDelimit);
            catchmentPoly = L.geoJSON(JSON.parse(feature.polygon)).addTo(map);
            catchmentPolyDelimit = L.geoJSON(JSON.parse(feature.polygon)).addTo(mapDelimit);
            map.fitBounds(catchmentPoly.getBounds());
            //zoom = 9;
            map.setView(catchmentPoly.getBounds().getCenter(), zoom);
            mapDelimit.setView(catchmentPoly.getBounds().getCenter(), zoom);
            editablepolygon = L.polygon(copyCoordinates, { color: 'red' });
            editablepolygon.addTo(mapDelimit);    
        });

        if (!mapLoader) {
            mapLoader = L.control.loader().addTo(map);
        }

        var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright'}).addTo(map);
        defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright'}).addTo(mapDelimit);

        mapLoader.hide();
        createEditor(editorUrl);
        var menu1Tab = document.getElementById('mapid');
        var observer2 = new MutationObserver(function() {
            if (menu1Tab.style.display != 'none') {
                mapDelimit.invalidateSize();
            }
        });
        observer2.observe(menu1Tab, { attributes: true });

    }
});

//draw polygons
drawPolygons = function() {
    // TODO: Next line only for test purpose
    //intakePolygons = polygons;

    lyrsPolygons.forEach(lyr => map.removeLayer(lyr));

    intakePolygons.forEach(feature => {
        let poly = feature.polygon;
        if (poly.indexOf("SRID") >= 0) {
            poly = poly.split(";")[1];
        }
        lyrsPolygons.push(omnivore.wkt.parse(poly).addTo(map));
    });
}