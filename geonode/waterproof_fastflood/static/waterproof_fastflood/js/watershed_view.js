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

var map;
var basinId;
var mapDelimit;
var mapDelimit2;
var snapMarker;
var snapMarkerMapDelimit;
var snapMarkerMapDelimit2;
var watershedPoly;
var catchmentPolyDelimit;
var editablepolygon;
var editablepolygon2;
var validPolygon;
var isFile;
var validGeometry = false;
var demSelected = false;
var delimitationFileType;
var copyCoordinates = [];

const delimitationFileEnum = {
    GEOJSON: 'geojson',
    SHP: 'shapefile'
}

var mapLoader;
$(document).ready(function () {


    let radios = document.querySelectorAll("input[name='resolution']");
    radios.forEach(radio => {
        radio.addEventListener("change", function () {
            $('#demValue').val(this.value)
            console.log("Seleccionado:", this.value);
        });
    });

    initializeMap();

    setIntakeCity();
    // disable enter key in form
    $(document).keypress(
        function (event) {
            if (event.which == '13') {
                event.preventDefault();
            }
        });

    $('#cityLabel').text(localStorage.city + ", " + localStorage.country);
    $("#countryLabel").html(localStorage.getItem('country'));
    // Interpolation with Wizard
    $("#intakeWECB").click(function () {

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
                <td class="text-center"><input type="text" class="form-control justify-number" value="${((m * index) + b).toFixed(2)}" disabled></td>
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
                <td class="text-center"><input type="text" class="form-control justify-number" value="${(b * (Math.pow(index, m))).toFixed(2)}" disabled></td>
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
                $('#intakeECTAG').append(`<tr><th class="text-center" scope="row">${index}</th>
                <td class="text-center">
                <input type="text" class="form-control justify-number" value="${((finalDataExtractionInterpolationValue) / (1 + ((finalDataExtractionInterpolationValue / initialDataExtractionInterpolationValue) - 1) * Math.exp(-r * index))).toFixed(2)}" disabled></td></tr>`);
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
    $('#btnManualTab').click(function () {
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
                    console.log("wxtraccion" + JSON.stringify(waterExtractionData));
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
    $('#externalSelect').change(function () {
        for (let t = 0; t < graphData.length; t++) {
            if (graphData[t].external == 'true') {
                $(`#table_${graphData[t].id}`).css('display', 'none');
            }
        }
        $(`#table_${$('#externalSelect').val()}`).css('display', 'block');
    });

    // Automatic height on clic next btn wizard
    $('#smartwizard').smartWizard("next").click(function () {
        $('#autoAdjustHeightF').css("height", "auto");
        mapDelimit.invalidateSize();
        mapDelimit2.invalidateSize();
        map.invalidateSize();
    });

    // Generate Input Manual Interpolation
    $('#intakeNIBYMI').click(function () {

        if ($('#intakeNIYMI').val() < 10 || $('#intakeNIYMI').val() > 100) {
            Swal.fire({
                icon: 'warning',
                title: gettext('field_problem'),
                text: gettext('Error number of years (10-100) Year'),
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
                <td class="text-center"><input name="manualInputData" oninput="validity.valid||(value='');" min="0" yearValue="${index}" type="number" class="form-control justify-number"></td>
              </tr>
            `);
        }
    });

    // Generate table external Input
    function externalInput(numYear) {
        var rows = "";
        var numberExternal = 0;
        let headTbl = headTblExternalInput();
        let lblExternalInput = gettext('External Input');
        let lblSelectOption = gettext('Select an option');
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
                                <td class="text-center" scope="col"><input oninput="validity.valid||(value='');" min="0" name="waterVolume_${index + 1}_${graphData[p].id}" type="number" class="form-control justify-number"></td>
                                <td class="text-center" scope="col"><input oninput="validity.valid||(value='');" min="0" name="sediment_${index + 1}_${graphData[p].id}" type="number" class="form-control justify-number"></td>
                                <td class="text-center" scope="col"><input oninput="validity.valid||(value='');" min="0" name="nitrogen_${index + 1}_${graphData[p].id}" type="number" class="form-control justify-number"></td>
                                <td class="text-center" scope="col"><input oninput="validity.valid||(value='');" min="0" name="phosphorus_${index + 1}_${graphData[p].id}" type="number" class="form-control justify-number"></td>
                            </tr>`);
                }
                $('#IntakeTDLE').append(`
                        <table class="table" id="table_${graphData[p].id}" style="display: none">
                            ${headTbl}
                            <tbody>${rows}</tbody>
                        </table>    
                `);
            }
        }
        $('#ExternalNumbersInputs').html(numberExternal)
    }

    function headTblExternalInput() {
        let lblYear = gettext('Year');
        let lblWaterVolume = gettext('Water Volume');
        let lblSediment = gettext('Sediment');
        let lblNitrogen = gettext('Nitrogen');
        let lblPhosphorus = gettext('Phosphorus');
        return `<thead>
                <tr>
                    <th class="text-center" scope="col">${lblYear}</th>
                    <th class="text-center" scope="col">${lblWaterVolume} (m3)</th>
                    <th class="text-center" scope="col">${lblSediment} (Ton)</th>
                    <th class="text-center" scope="col">${lblNitrogen} (Kg)</th>
                    <th class="text-center" scope="col">${lblPhosphorus} (Kg)</th>
                </tr>
            </thead>`;
    }

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
            removeDoneStepOnNavigateBack: false,
            markAllPreviousStepsAsDone: false,
            anchorClickable: false,
            enableAllAnchors: false,
            markDoneStep: false,
        }
    });

    $("#smartwizard").on("showStep", function (e, anchorObject, stepIndex, stepDirection) {
        console.log(stepIndex)
        if (stepIndex != 0) {
            if (watershedPoly) {
                console.log(watershedPoly)
                mapDelimit.invalidateSize();
                mapDelimit2.invalidateSize();
                mapDelimit.fitBounds(watershedPoly.getBounds());
                mapDelimit2.fitBounds(watershedPoly.getBounds());
                // console.log('380: ', mapDelimit)
                // console.log('381: ', mapDelimit2)
            } else {
                mapDelimit.invalidateSize();
                mapDelimit2.invalidateSize();
                $('#autoAdjustHeightF').css("height", "auto");
            }
            changeFileEvent();
        }
        if (stepIndex == 0) {
            if (watershedPoly) {
                map.invalidateSize();
                map.fitBounds(watershedPoly.getBounds());
            } else {
                map.invalidateSize();
                $('#autoAdjustHeightF').css("height", "auto");
            }
        }
    });

    //Validated of steps
    $('#step1NextBtn').click(function () {
        if ($('#id_name').val() != '' && $('#id_description').val() != '' && $('#id_water_source_name').val() != '' && watershedPoly != undefined) {
            var intakePolygonJson = watershedPoly.toGeoJSON();            
            let minResolution = localStorage.minResolution;
            if (minResolution != "undefined") {
                intakeStepOne();
                
            }else{
                Swal.fire({
                    icon: 'warning',
                    title: gettext('Watershed area problem'),
                    text: gettext('There is a problem with the watershed location, please try again or try with another location'),
                });
                return;
            }
            disableResolutions();

        } else {
            Swal.fire({
                icon: 'warning',
                title: gettext('Field empty'),
                text: gettext('Please complete all required information')
            });
            return;
        }
    });

    $('#step3PrevBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step2PrevBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step2NextBtn').click(function () {
        
        // disableResolutions();
        validateDemSelection();
        if (!demSelected) {
            Swal.fire({
                icon: 'error',
                title: gettext('DEM value resoltion is empty'),
                text: gettext('Please select an option for DEM value'),
            })
        }else{
            intakeStepTwo();
        }
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
            intakeStepThree();
        }
    });

    mapLoader.hide();
    // createEditor(editorUrl);    
    var menu1Tab = document.getElementById('mapid');
    var menu2Tab = document.getElementById('mapid2');
    var observer2 = new MutationObserver(function () {
        if (menu1Tab.style.display != 'none' && menu2Tab.style.display) {
            mapDelimit.invalidateSize();
        }
    });
    var observer3 = new MutationObserver(function () {
        if (menu1Tab.style.display != 'none' && menu2Tab.style.display) {
            mapDelimit2.invalidateSize();
        }
    });
    observer2.observe(menu1Tab, { attributes: true });
    observer3.observe(menu2Tab, { attributes: true });
    defaultCurrencyId = '233';
    defaultCurrentyName = $("#currencyCost option[value=233]").text();

    updateTooltips();

    function updateTooltips() {
        let mxImgsBtn = $("#toolbar .mxToolbarMode");
        mxImgsBtn.each((i, b) => {
            $(b).attr("data-toggle", "tooltip");
            $(b).attr("data-placement", "bottom");
            $(b).attr("title", gettext($(b).attr("title")));
        });
        $('[data-toggle="tooltip"]').tooltip();
    }

    function initializeMap() {
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
        mapDelimit2 = L.map('mapid2', { editable: true }).setView(initialCoords, zoom);
        var osm = L.tileLayer(OSM_BASEMAP_URL, {
            attribution: attr,
        });
        var osmid = L.tileLayer(OSM_BASEMAP_URL, {
            attribution: attr,
        });
        var osmid2 = L.tileLayer(OSM_BASEMAP_URL, {
            attribution: attr,
        });
        map.addLayer(osm);


 

        $('#btnDelimitArea').on("click", delimitIntakeArea)
        $('#btnValidateArea').on("click", validateIntakeArea)
        if (!mapLoader) {
            mapLoader = L.control.loader().addTo(map);
        }

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

        mapDelimit.addLayer(osmid);
        mapDelimit2.addLayer(osmid2);
        console.log(intakePolygons)
        if (intakePolygons[0] != undefined) {
            $('#watershedId').val(intakePolygons[0].id);

        }
        intakePolygons.forEach(feature => {
            console.log(feature)
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
                delimitPolyCoord.forEach(function (geom) {
                    var coordinates = [];
                    coordinates.push(geom[1]);
                    coordinates.push(geom[0]);
                    copyCoordinates.push(coordinates);
                })
            }

            watershedPoly = L.geoJSON(JSON.parse(feature.polygon)).addTo(map);
            catchmentPolyDelimit = L.geoJSON(JSON.parse(feature.polygon)).addTo(mapDelimit);
            catchmentPolyDelimit2 = L.geoJSON(JSON.parse(feature.polygon)).addTo(mapDelimit2);
            map.fitBounds(watershedPoly.getBounds());
            zoom = 8;
            map.setView(watershedPoly.getBounds().getCenter(), zoom);
            // mapDelimit.setView(watershedPoly.getBounds().getCenter(), zoom);
            mapDelimit2.setView(initialCoords, 8)

            mapDelimit2.setView(initialCoords, 8)
            // mapDelimit2.setView(watershedPoly.getBounds().getCenter(), zoom);
            editablepolygon = L.polygon(copyCoordinates, { color: 'red' });
            // editablepolygon.addTo(mapDelimit2);
        });

        if (!mapLoader) {
            mapLoader = L.control.loader().addTo(map);
        }

        mapLoader.hide();
        // createEditor(editorUrl);
        var menu1Tab = document.getElementById('mapid');
        var observer2 = new MutationObserver(function () {
            if (menu1Tab.style.display != 'none') {
                mapDelimit.invalidateSize();
            }
        });
        observer2.observe(menu1Tab, { attributes: true });
        localStorage.setItem('minResolution',demValue);
    }

});


function calculateDownloadInfo(areaHa) {
    const resoluciones = [20, 40, 150, 300, 600];
    const factorBase = 50; // Para los píxeles
    const factorMB = 0.000008; // Para el tamaño de descarga
    const proporcion = 15.085;
    const areaKm2 = areaHa / 100; // Convertir hectáreas a kilómetros cuadrados
    
    resoluciones.forEach(resolucion => {
        const pixelesTotales = factorBase * areaKm2 * Math.pow(600 / resolucion, 2);  
        const ancho = Math.round(Math.sqrt(pixelesTotales / proporcion));
        const alto = Math.round(ancho * 0.935);
        const ajuste = 0.9 + (resolucion / 600);
        const downloadSize = factorMB * areaKm2 * Math.pow(600 / resolucion, 2) * ajuste;

        // Asignar al DOM
        const resolutionElement = document.getElementById(`map-${resolucion}`);
        const downloadElement = document.getElementById(`download-${resolucion}`);

        if (resolutionElement) {
            resolutionElement.textContent = `Map size: ${ancho}x${alto}px`;
        }

        if (downloadElement) {
            downloadElement.textContent = `Download size: ${downloadSize.toFixed(2)} mb`;
        }
    });
}

//window.onbeforeunload = function() { return mxResources.get('changesLost'); };

function disableResolutions() {
    let initialCoords = [4.5, -74.4];
    console.log("fix map")
    let selectedDem = demValue;
    const minResolution = localStorage.minResolution;
    resolutions = [20, 40, 150, 300, 600];
    resolutions.forEach(e => {
        if (e < minResolution) {
            document.getElementById(`resolution-${e}`).disabled = true;
        }
        if (e == selectedDem && selectedDem == minResolution) {
            // console.log(e)
            // console.log(selectedDem)
            // console.log(minResolution)
            document.getElementById(`resolution-${e}`).setAttribute("checked", "true");
        }
    });
    var cityCoords = localStorage.getItem('cityCoords');
    if (cityCoords == undefined) {
        cityCoords = initialCoords;
    } else {
        initialCoords = JSON.parse(cityCoords);
    }
    waterproof["cityCoords"] = cityCoords;

    if (typeof mapDelimit !== 'undefined' && mapDelimit !== null) {
        mapDelimit.setView(initialCoords, 8); // Solo mueve el mapa sin reinicializarlo
        mapDelimit.invalidateSize();

    } else if (typeof mapDelimit2 !== 'undefined' && mapDelimit2 !== null) {
        mapDelimit2.setView(initialCoords, 8); // Solo mueve el mapa sin reinicializarlo
        mapDelimit2.invalidateSize();
    } else {
        mapDelimit = L.map('mapid', { editable: true }).setView(initialCoords, 8);
        mapDelimit2 = L.map('mapid2', { editable: true }).setView(initialCoords, 8);
        mapDelimit.invalidateSize();
        mapDelimit2.invalidateSize();
    }

}

/**
 * Info Message to validate Adjust Coordinates
 */
function prevalidateAdjustCoordinates() {
    
}

function setIntakeCity() {
    console.log("setWatershedCity, localStorage.cityId: ", localStorage.cityId);
    /** 
     * Get a city by name
     * @param {String} url   activities URL 
     * @param {Object} data  lang,city parameters 
     *
     * @return {Object} City
     */
    if (localStorage.cityId) {
        $('#watershedCity').val(localStorage.cityId);
    } else {
        $.ajax({
            url: '/parameters/load-cityByName/',
            data: {
                'lang': lang,
                'city': localStorage.city
            },
            success: function (result) {
                let resultCity = JSON.parse(result);
                $('#watershedCity').val(resultCity[0].pk);
            },
            error: function (error) {
                console.log(error);
            }
        });
    }

}

function validateDemSelection() {
    console.log(demSelected)
    let radios = document.querySelectorAll("input[name='resolution']");
    radios.forEach(radio => {
        if (radio.checked) {
            $('#demValue').val(radio.value)
            console.log("Seleccionado:", radio.value);
            demSelected = true;
        }
    });
}
/** 
 * Intake step one creation
 *
 * @return {boolean} true if is saved
 */
function intakeStepOne() {
    $('#smartwizard').smartWizard("next");
}
/** 
 * Intake step two creation
 *
 * @return {boolean} true if is saved
 */
function intakeStepTwo() {
$('#smartwizard').smartWizard("next");
}
/** 
 * Intake step three creation
 *
 * @return {boolean} true if is saved
 */
function intakeStepThree() {
    location.href = "/fastflood/?city=" + cityId;
}

/** 
 * Delimit manually the intake polygon
 */
function delimitIntakeArea() {
    isFile = false;
    var copyCoordinates = [];
    console.log('Delimiting');
    var polygonKeys = Object.keys(watershedPoly._layers);
    var keyNamePolygon = polygonKeys[0];
    var geometryCoordinates = watershedPoly._layers[keyNamePolygon].feature.geometry.coordinates[0];
    geometryCoordinates.forEach(function (geom) {
        var coordinates = [];
        coordinates.push(geom[1]);
        coordinates.push(geom[0]);
        copyCoordinates.push(coordinates);
    })
    console.log(editablepolygon)
    console.log(editablepolygon2)
    console.log(mapDelimit)
    console.log(mapDelimit2)
    if (editablepolygon2) {
        // mapDelimit.removeLayer(editablepolygon);
        mapDelimit2.removeLayer(editablepolygon2);
    }
    // editablepolygon = L.polygon(copyCoordinates, { color: 'red' });
    editablepolygon2 = L.polygon(copyCoordinates, { color: 'red' });
    // editablepolygon.addTo(mapDelimit)
    editablepolygon2.addTo(mapDelimit2)
    // editablepolygon.enableEdit();
    editablepolygon2.enableEdit();
    // editablepolygon.on('dblclick', L.DomEvent.stop).on('dblclick', editablepolygon.toggleEdit);
    editablepolygon2.on('dblclick', L.DomEvent.stop).on('dblclick', editablepolygon2.toggleEdit);
}

function validateIntakeArea() {
    var editablePolygonJson = editablepolygon2.toGeoJSON();
    var intakePolygonJson = watershedPoly.toGeoJSON();    
    /** 
     * Get filtered activities by transition id 
     * @param {String} url   activities URL 
     * @param {Object} data  transition id  
     *
     * @return {String} activities in HTML option format
     */
    $.ajax({
        url: '/fastflood/validateGeometry/',
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
                $('#watershedAreaPolygon').val(JSON.stringify(intakePolygonJson));                
                // Set delimited area geom in hidden input for posterior reading
                $('#delimitArea').val(JSON.stringify(editablePolygonJson));                
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
 Si */
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
                                shp(contents).then(function (geojs) {
                                    if (validateGeometryAndCount(geojs)) {
                                        geojson = geojs;
                                        delimitationFileType = delimitationFileEnum.SHP;
                                        addEditablePolygonMap();
                                    } else {
                                        $('#intakeArea').val('');
                                        return;
                                    }
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
        // mapDelimit2.removeLayer(editablepolygon2);
    }
    if (editablepolygon2) {
        mapDelimit2.removeLayer(editablepolygon2);
    }
    console.log('antes del add:', editablepolygon)
    console.log('antes del add:', editablepolygon2)
    console.log('antes del add:', mapDelimit)
    console.log('antes del add:', mapDelimit2)
    editablepolygon = L.geoJSON(geojson, { style: polygonStyle })
    editablepolygon2 = L.geoJSON(geojson, { style: polygonStyle })
    editablepolygon.addTo(mapDelimit);
    editablepolygon2.addTo(mapDelimit2);
    mapDelimit.fitBounds(editablepolygon.getBounds());
    mapDelimit2.fitBounds(editablepolygon2.getBounds());
    console.log('despues del add:', editablepolygon)
    console.log('despues del add:', editablepolygon2)
    console.log('despues del add:', mapDelimit)
    console.log('despues del add:', mapDelimit2)
}