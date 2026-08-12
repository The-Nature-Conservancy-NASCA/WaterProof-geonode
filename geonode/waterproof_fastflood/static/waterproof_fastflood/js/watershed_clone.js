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
var snapMarker;
var mapDelimit;
var mapDelimit2;
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
var waterExtractionData = {};
var waterExtractionValue;
const delimitationFileEnum = {
    GEOJSON: 'geojson',
    SHP: 'shapefile'
}

var mapLoader;
$(document).ready(function () {

    $('#basinId').val(basinId);
    let radios = document.querySelectorAll("input[name='resolution']");
    radios.forEach(radio => {
        radio.addEventListener("change", function () {
            $('#demValue').val(this.value)
            console.log("Seleccionado:", this.value);
        });
    });

    // Validación de campos para habilitar el botón step1NextBtn
    function validateStep1Fields() {
        var watershedName = $('#watershedName').val().trim();
        var watershedDesc = $('#watershedDesc').val().trim();

        if (watershedName !== '' && watershedDesc !== '') {
            $('#step1NextBtn').prop('disabled', false);
        } else {
            $('#step1NextBtn').prop('disabled', true);
        }
    }

    // Agregar eventos de input a los campos
    $('#watershedName, #watershedDesc').on('input', validateStep1Fields);

    // Validar al cargar la página (los campos pueden tener valores iniciales)
    validateStep1Fields();

    initializeMap();

    setWatershedCity();
    // disable enter key in form
    $(document).keypress(
        function (event) {
            if (event.which == '13') {
                event.preventDefault();
            }
        });

    $('#cityLabel').text(localStorage.city + ", " + localStorage.country);
    $("#countryLabel").html(localStorage.getItem('country'));

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
        // Check if watershed name already exists before proceeding
        if (watershedNameExistsGlobal) {
            Swal.fire({
                icon: 'warning',
                title: gettext('Watershed name already exists'),
                text: gettext('A watershed with this name already exists. Please choose a different name.'),
            });
            return;
        }

        if ($('#id_name').val() != '' && $('#id_description').val() != '' && $('#id_water_source_name').val() != '' && watershedPoly != undefined) {
            var intakePolygonJson = watershedPoly.toGeoJSON();
            console.log(intakePolygonJson);
            $('#watershedAreaPolygon').val(JSON.stringify(intakePolygonJson));
            let minResolution = localStorage.minResolution;
            if (minResolution != "undefined") {
                watershedStepOne();
                
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
            watershedStepTwo();
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
            watershedStepThree();
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

        var c = new L.Control.Coordinates({
            actionAfterDragEnd: prevalidateAdjustCoordinates
        }).addTo(map);
        
        $("#validateBtn").on("click", prevalidateAdjustCoordinates);
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
        L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);
        mapDelimit.addLayer(osmid);
        mapDelimit2.addLayer(osmid2);
        console.log(watershedPolygons)
        if (watershedPolygons[0] != undefined) {
            $('#watershedId').val(watershedPolygons[0].id);

        }
        watershedPolygons.forEach(feature => {
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

        var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright' }).addTo(map);
        defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright' }).addTo(mapDelimit);

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

    // Initialize watershed name validation
    initializeWatershedNameValidation();
});

//window.onbeforeunload = function() { return mxResources.get('changesLost'); };

/**
 * Watershed step one creation
 *
 * @return {boolean} true if is saved
 */
function watershedStepOne() {
    if (watershedPolygons[0] != undefined) {
        $('#watershedId').val(watershedPolygons[0].id);
    }
    console.log("Saving step one");
    var formData = new FormData();
    // Watershed step
    formData.append('step', '1');
    formData.append('edit', 'false');
    formData.append('watershedAreaValue', $('#watershedAreaValue').val());
    formData.append('bboxCoors', $('#bboxCoors').val());
    formData.append('watershedName', $('#watershedName').val());
    formData.append('watershedId', $('#watershedId').val());
    formData.append('watershedDesc', $('#watershedDesc').val());    
    formData.append('watershedCity', $('#watershedCity').val());
    formData.append('watershedAreaPolygon', $('#watershedAreaPolygon').val());
    formData.append('basinId', $('#basinId').val());

    let valueInfo = calculateDownloadInfo($('#watershedAreaValue').val());
    console.log(valueInfo);
    console.log(formData);
    $.ajax({
        type: 'POST',
        url: '/fastflood/create/',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function(response) {
            //console.log(response);
            $('#watershedId').val(response.watershedId);
            $('#smartwizard').smartWizard("next");
            localStorage.removeItem("intakesByCity");
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
 * Watershed step two creation
 *
 * @return {boolean} true if is saved
 */
function watershedStepTwo() {
    console.log("Saving step two");
    var formData = new FormData();
    // Intake step
    formData.append('step', '2');
    // Intake id
    formData.append('watershedId', $('#watershedId').val());
    console.log($('#watershedId').val())
    // DEM Value
    formData.append('demValue', $('#demValue').val());
    console.log($('#demValue').val())
    // Selected resolution
    // formData.append('resolution', $('#resolution').val());
    // console.log($('#resolution').val())

    console.log(formData);
    $.ajax({
        type: 'POST',
        url: '/fastflood/create/',
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
function watershedStepThree() {
    console.log("Saving step three");
    var watershedId = $('#watershedId').val();
    var formData = new FormData();
    formData.append('step', '3');
    formData.append('watershedId', $('#watershedId').val());    
    formData.append('watershedAreaPolygon', $('#watershedAreaPolygon').val());
    formData.append('delimitArea', $('#delimitArea').val());
    formData.append('typeDelimit', $('#typeDelimit').val());
    formData.append('isFile', $('#isFile').val());
    $('#_thumbnail_processing').modal('toggle');
    $('#_thumbnail_processing .modal-header h1')[0].innerText = gettext('The water intake is being saved');
    $('#_thumbnail_processing .progress div')[0].innerText = gettext('Please wait');
    $.ajax({
        type: 'POST',
        url: '/fastflood/create/',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',
        success: function (response) {
            //console.log(response);
            
            var cityId = 143873; //Default Bogota
            if (localStorage.cityId) {
                cityId = localStorage.cityId;
            }

            $('#_thumbnail_processing .modal-header h1')[0].innerText = gettext('Configuring the watershed');
            $('#_thumbnail_processing .progress div')[0].innerText = gettext('Please wait');

            downloadInputs(watershedId, $('#bboxCoors').val(), $('#demValue').val()).then(function (data) {
                console.log('Descargando inputs: ', data)
                dataObj = JSON.parse(data);
                localStorage.setItem('watershedId', watershedId);
                localStorage.setItem('watershedTaskId', dataObj.task_id);
                localStorage.setItem('watershedStatus', dataObj.status);
                let url= serverApi.replace("/wf-models/","/").replace("/proxy/?url=","") + "wp-fastflood/tasks/" + dataObj.task_id;
                
                function checkTaskStatus() {
                    fetch(url).then(response => {
                        return response.json();
                    }).then(data => {
                        console.log('Task status:', data.status);                        
                        if (data.status === 'SUCCESS') {
                            $('#_thumbnail_processing').modal('hide');
                            Swal.fire({
                                icon: 'success',
                                text: gettext('The watershed is being saved'),
                                allowOutsideClick: true,
                                showConfirmButton: false
                            });
                            if (data.result && data.result.status == 'error') {
                                if (data.result.message.indexOf("Errno 17") >= 0) {
                                    console.log("There is already a watershed with that name");
                                    returnToWatershedList();
                                }
                            } else {
                                returnToWatershedList();
                            }
                        } else if (data.status === 'PENDING' || data.status === 'PROGRESS') {
                            console.log('Task still processing, checking again in 2 seconds...');
                            setTimeout(checkTaskStatus, 2000);
                        } else {
                            console.log('Task failed or unknown status:', data.status);
                            $('#_thumbnail_processing').modal('hide');
                        }
                    }).catch(error => {
                        console.error('Error checking task status:', error);
                        $('#_thumbnail_processing').modal('hide');
                    });
                }                
                checkTaskStatus();                
            }).catch(function (error) {
                console.error('Error al descargar los inputs:', error);
                returnToWatershedList();
            });
        },
        error: function (xhr) {
            //console.log(xhr.status + ":" + xhr.responseText);
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

function returnToWatershedList() {
    setTimeout(function () {
        location.href = "/fastflood/?city=" + localStorage.cityId;
    }, 250);
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