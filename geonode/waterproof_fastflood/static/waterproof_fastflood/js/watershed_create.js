/**
 * @file Create Watershed wizard step
 * validations & interactions
 * @version 1.0
 */

var map;
var mapDelimit;
var mapDelimit2;
var snapMarker;
var snapMarkerMapDelimit;
var watershedPoly;
var editablepolygon;
var editablepolygon2;
var validPolygon;
var isFile;
var validGeometry = false;
var demSelected = false;
var basinId;
var delimitationFileType;
const delimitationFileEnum = {
    GEOJSON: 'geojson',
    SHP: 'shapefile'
}

var mapLoader;
$(document).ready(function () {
    console.log("Document ready");
    let radios = document.querySelectorAll("input[name='resolution']");
    radios.forEach(radio => {
        radio.addEventListener("change", function () {
            $('#demValue').val(this.value)
            console.log("Seleccionado:", this.value);
        });
    });

    // Deshabilitar el botón inicialmente
    //$('#step1NextBtn').prop('disabled', true);

    // Función para validar los inputs y habilitar/deshabilitar el botón
    // function validateStep1Fields() {
    //     var watershedName = $('#watershedName').val().trim();
    //     var watershedDesc = $('#watershedDesc').val().trim();

    //     if (watershedName !== '' && watershedDesc !== '') {
    //         $('#step1NextBtn').prop('disabled', false);
    //     } else {
    //         $('#step1NextBtn').prop('disabled', true);
    //     }
    // }

    // Agregar eventos de input a los campos
    //$('#watershedName, #watershedDesc').on('input', validateStep1Fields);

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
    // Interpolation with Wizard

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


    $('#smartwizard').smartWizard("next").click(function () {
        //$('#smartwizard').smartWizard("loader", "show");
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
        console.log("showStep:", stepIndex);
        if (stepIndex != 0) {
            if (watershedPoly) {
                mapDelimit.invalidateSize();
                mapDelimit2.invalidateSize();
                mapDelimit.fitBounds(watershedPoly.getBounds());
                mapDelimit2.fitBounds(watershedPoly.getBounds());                
            } else {
                mapDelimit.invalidateSize();
                mapDelimit2.invalidateSize();
                $('#autoAdjustHeightF').css("height", "auto");
                // Initialize watershed name validation                
            }
            changeFileEvent();
        }else {
            if (watershedPoly) {
                map.invalidateSize();
                map.fitBounds(watershedPoly.getBounds());
            } else {
                map.invalidateSize();
                $('#autoAdjustHeightF').css("height", "auto");
            }
            initializeWatershedNameValidation();
        }
        //$('#smartwizard').smartWizard("loader", "hide");
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

        if ($('#watershedName').val() != '' && $('#id_description').val() != '' && $('#id_water_source_name').val() != '' && watershedPoly != undefined ) {

            let minResolution = localStorage.minResolution;
            if (minResolution != "undefined") {
                $('#basinId').val(basinId);
                watershedStepOne();                
            }else{
                Swal.fire({
                    icon: 'warning',
                    title: gettext('Watershed area problem'),
                    text: gettext('There is a problem with the watershed location, please try again or try with another location'),
                });
                return;
            }
            // $('#smartwizard').smartWizard("next");
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

    $('#step2PrevBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step3PrevBtn').click(function () {
        $('#smartwizard').smartWizard("prev");
    });

    $('#step2NextBtn').click(function () {
        disableResolutions();
        validateDemSelection();
        if (!demSelected) {
            Swal.fire({
                icon: 'error',
                title: gettext('DEM value resoltion is empty'),
                text: gettext('Please select an option for DEM value'),
            })
        } else {
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
    mapDelimit2 = L.map('mapid2', { editable: true }).setView(initialCoords, 5);
    
    let attr = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
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
    var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright' }).addTo(map);

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
        /* Grayscale: gray, */
    };

    var overlays = {
        "Hydro Network": wmsHydroNetworkLyr,
        "Hydro (esri)": hydroLyr,
    };
    L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);

    mapDelimit.addLayer(osmid);
    mapDelimit2.addLayer(osmid2);
    var defExtMapd = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright' }).addTo(mapDelimit);
    var defExtMapd2 = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright' }).addTo(mapDelimit2);

    $("#validateBtn").on("click", prevalidateAdjustCoordinates);
    $('#btnDelimitArea').on("click", delimitWatershedArea)
    $('#btnValidateArea').on("click", validateWatershedArea)
    if (!mapLoader) {
        mapLoader = L.control.loader().addTo(map);
    }

    mapLoader.hide();
    
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

function disableResolutions() {
    const minResolution = localStorage.minResolution;
    console.log(minResolution)
    resolutions = [20, 40, 150, 300, 600];
    resolutions.forEach(e => {
        if (e < minResolution) {
            document.getElementById(`resolution-${e}`).disabled = true;
        }
    });
    var cityCoords = localStorage.getItem('cityCoords');
    if (cityCoords == undefined) {
        cityCoords = initialCoords;
    } else {
        initialCoords = JSON.parse(cityCoords);
    }
    waterproof["cityCoords"] = cityCoords;
    console.log(cityCoords)
    console.log(initialCoords)
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
    Swal.fire({
        title: gettext('Basin point delimitation'),
        text: gettext('The point coordinates will be adjusted to the nearest water source'),
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
}

function setWatershedCity() {
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
 * Watershed step one creation
 *
 * @return {boolean} true if is saved
 */
function watershedStepOne() {
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
    formData.append('basinId', $('#basinId').val());
    
    toggleLoadingStep("show");
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
            $('#watershedId').val(response.watershedId);
            $('#smartwizard').smartWizard("next");
            localStorage.removeItem("intakesByCity");
            toggleLoadingStep("hide");
        },
        error: function (xhr, errmsg, err) {
            console.log(xhr.status + ":" + xhr.responseText);
            let response = JSON.parse(xhr.responseText);
            toggleLoadingStep("hide");
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
    // Watershed step
    formData.append('step', '2');
    formData.append('watershedId', $('#watershedId').val());
    console.log($('#watershedId').val())
    // DEM Value
    formData.append('demValue', $('#demValue').val());
    console.log($('#demValue').val())
    
    toggleLoadingStep("show");
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
            toggleLoadingStep("hide");   
        },
        error: function (xhr, errmsg, err) {
            console.log(xhr.status + ":" + xhr.responseText);
            let response = JSON.parse(xhr.responseText);
            toggleLoadingStep("hide");
            Swal.fire({
                icon: 'error',
                title: gettext('Watershed saving error'),
                text: response.message,
            })
        }
    });
    return true;
}
/** 
 * Watershed step three creation
 *
 * @return {boolean} true if is saved
 */
function watershedStepThree() {
    console.log("Saving step three");
    var watershedId = $('#watershedId').val();
    var formData = new FormData();
    formData.append('step', '3');
    formData.append('watershedId', watershedId);
    formData.append('watershedAreaPolygon', $('#watershedAreaPolygon').val());
    formData.append('delimitArea', $('#delimitArea').val());
    formData.append('typeDelimit', $('#typeDelimit').val());
    formData.append('isFile', $('#isFile').val());
    $('#_thumbnail_processing').modal('toggle');
    $('#_thumbnail_processing .modal-header h1')[0].innerText = gettext('The watershed is being saved');
    $('#_thumbnail_processing .progress div')[0].innerText = gettext('Please wait');
    toggleLoadingStep("show");
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
                console.log('Descargando inputs: ', dataObj)                
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
                title: gettext('Watershed saving error'),
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
 * Delimit manually the watershed polygon
 */
function delimitWatershedArea() {
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

function validateWatershedArea() {
    var editablePolygonJson = editablepolygon2.toGeoJSON();
    var intakePolygonJson = watershedPoly.toGeoJSON();
    toggleLoadingStep("show");
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
            toggleLoadingStep("hide");
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
                // Set original watershed area geom in hidden input for posterior reading
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
    editablepolygon = L.geoJSON(geojson, { style: polygonStyle })
    editablepolygon2 = L.geoJSON(geojson, { style: polygonStyle })
    editablepolygon.addTo(mapDelimit);
    editablepolygon2.addTo(mapDelimit2);
    mapDelimit.fitBounds(editablepolygon.getBounds());
    mapDelimit2.fitBounds(editablepolygon2.getBounds());    
}
