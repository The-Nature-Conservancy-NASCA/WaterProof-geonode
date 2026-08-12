/**
 * Common watershed functions shared across components
 * Functions extracted from watershed_create.js and watershed_clone.js
 */

async function downloadInputs(id, bbox, resolution) {
    console.log('Descargando inputs: ', id, bbox, resolution);

    bboxPrj = transformGeographicToProjected(bbox.split(',').map(Number));
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Con": "a",
        "Content-Type": "application/json"
    }

    let bodyContent = JSON.stringify({
        "watershed_id": id,
        "bbox": "[" + bboxPrj.toString() +"]",
        "resolution": resolution,
    });

    let baseUrl = serverApi.replace("/wf-models/","/").replace("/proxy/?url=","") + "/wp-fastflood/";
    let fastfloodDownloadUrl = baseUrl + "fastflood-download-inputs/";

    try {
        // Primera llamada al endpoint de descarga
        let response = await fetch(fastfloodDownloadUrl, {
            method: "POST",
            body: bodyContent,
            headers: headersList
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();
        console.log('Primera respuesta:', data);

        if (!data.task_id) {
            throw new Error('No se recibió task_id en la respuesta');
        }

        // Polling del primer task hasta que sea SUCCESS
        console.log('Iniciando polling de tarea:', data.task_id);
        let taskStatus = await pollTaskStatus(baseUrl, data.task_id);

        if (taskStatus !== 'SUCCESS') {
            throw new Error(`Tarea fallida con status: ${taskStatus}`);
        }

        console.log('Primera tarea completada exitosamente');

        // Obtener geometría de watershedPoly
        let geometry = watershedPoly.toGeoJSON();

        // Llamar al endpoint filter-storm-duration
        let filterBodyContent = JSON.stringify({
            "watershed_id": id,
            "geometry": geometry
        });

        console.log('Llamando a filter-storm-duration...');
        let filterResponse = await fetch(baseUrl + "filter-storm-duration/", {
            method: "POST",
            body: filterBodyContent,
            headers: headersList
        });

        if (!filterResponse.ok) {
            throw new Error(`HTTP error en filter-storm-duration! status: ${filterResponse.status}`);
        }

        let filterData = await filterResponse.json();
        console.log('Respuesta de filter-storm-duration:', filterData);

        if (!filterData.task_id) {
            throw new Error('No se recibió task_id en la respuesta de filter-storm-duration');
        }

        // Polling del segundo task hasta que sea diferente de pending
        console.log('Iniciando polling de segunda tarea:', filterData.task_id);
        let filterTaskStatus = await pollTaskUntilNotPending(baseUrl, filterData.task_id);

        console.log('Segunda tarea completada con status:', filterTaskStatus);

        return filterData;
    } catch (error) {
        console.error('Error en downloadInputs:', error);
        throw error;
    }
}

// Función auxiliar para hacer polling del status de una tarea hasta que sea SUCCESS
async function pollTaskStatus(baseUrl, taskId) {
    const maxAttempts = 100; // Máximo 5 minutos (100 * 3 segundos)
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            let taskResponse = await fetch(baseUrl + "tasks/" + taskId);

            if (!taskResponse.ok) {
                console.error(`Error consultando task ${taskId}: ${taskResponse.status}`);
                await sleep(3000);
                attempts++;
                continue;
            }

            let taskData = await taskResponse.json();
            console.log(`Task ${taskId} status:`, taskData.status);

            if (taskData.status === 'SUCCESS') {
                return taskData.status;
            }

            if (taskData.status === 'FAILURE') {
                throw new Error(`Tarea ${taskId} falló`);
            }

            // Esperar 3 segundos antes de la siguiente consulta
            await sleep(3000);
            attempts++;
        } catch (error) {
            console.error(`Error en pollTaskStatus para task ${taskId}:`, error);
            await sleep(3000);
            attempts++;
        }
    }

    throw new Error(`Timeout esperando por task ${taskId}`);
}

// Función auxiliar para hacer polling del status de una tarea hasta que NO sea pending
async function pollTaskUntilNotPending(baseUrl, taskId) {
    const maxAttempts = 100; // Máximo 5 minutos
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            let taskResponse = await fetch(baseUrl + "tasks/" + taskId);

            if (!taskResponse.ok) {
                console.error(`Error consultando task ${taskId}: ${taskResponse.status}`);
                await sleep(3000);
                attempts++;
                continue;
            }

            let taskData = await taskResponse.json();
            console.log(`Task ${taskId} status:`, taskData.status);

            if (taskData.status !== 'PENDING' && taskData.status !== 'pending') {
                return taskData.status;
            }

            // Esperar 3 segundos antes de la siguiente consulta
            await sleep(3000);
            attempts++;
        } catch (error) {
            console.error(`Error en pollTaskUntilNotPending para task ${taskId}:`, error);
            await sleep(3000);
            attempts++;
        }
    }

    throw new Error(`Timeout esperando por task ${taskId}`);
}

// Función auxiliar para esperar
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleLoadingStep(showHide){
    $('#smartwizard').smartWizard("loader", showHide)
}

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
        mapDelimit.setView(initialCoords, 8);
        mapDelimit.invalidateSize();
    } else if (typeof mapDelimit2 !== 'undefined' && mapDelimit2 !== null) {
        mapDelimit2.setView(initialCoords, 8);
        mapDelimit2.invalidateSize();
    } else {
        mapDelimit = L.map('mapid', { editable: true }).setView(initialCoords, 8);
        mapDelimit2 = L.map('mapid2', { editable: true }).setView(initialCoords, 8);
        mapDelimit.invalidateSize();
        mapDelimit2.invalidateSize();
    }
}

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
        mapDelimit2.removeLayer(editablepolygon2);
    }
    editablepolygon2 = L.polygon(copyCoordinates, { color: 'red' });
    editablepolygon2.addTo(mapDelimit2)
    editablepolygon2.enableEdit();
    editablepolygon2.on('dblclick', L.DomEvent.stop).on('dblclick', editablepolygon2.toggleEdit);
}

function validateIntakeArea() {
    var editablePolygonJson = editablepolygon2.toGeoJSON();
    var intakePolygonJson = watershedPoly.toGeoJSON();
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
            } else {
                validGeometry = true;
                Swal.fire(
                    gettext('Great!'),
                    gettext("Is a valid polygon inside basin's geometries"),
                    'success'
                );
                $('#watershedAreaPolygon').val(JSON.stringify(intakePolygonJson));
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

function changeFileEvent() {
    $('#intakeArea').change(function (evt) {
        var file = evt.currentTarget.files[0];
        var extension = validExtension(file);
        if (extension.valid) {
            console.log('Extension valid!');
            isFile = true;
            if (extension.extension == 'geojson') {
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
            } else {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var contents = evt.target.result;
                    JSZip.loadAsync(file).then(function (zip) {
                        shapeValidation = validateShapeFile(zip);
                        shapeValidation.then(function (resultFile) {
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
                };
                reader.readAsArrayBuffer(file);
            }
        } else {
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

// ==== WATERSHED NAME VALIDATION ====
// Global variable to track if watershed name exists
var watershedNameExistsGlobal = false;

/**
 * Checks if a watershed name already exists for the current user
 * @param {string} name - Watershed name to check
 * @returns {Promise<boolean>} Promise resolving to true if name exists, false otherwise
 */
function checkWatershedName(name) {
    if (!name || name.trim() === '') {
        hideWatershedNameExistsIndicator();
        return Promise.resolve(false);
    }

    return fetch('/fastflood/watershed-exist-by-name/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({
            'name': name.trim()
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data === true) {
            showWatershedNameExistsIndicator();
            watershedNameExistsGlobal = true;
            disableWatershedNextButton();
            return true;
        } else {
            hideWatershedNameExistsIndicator();
            watershedNameExistsGlobal = false;
            enableWatershedNextButton();
            return false;
        }
    })
    .catch(error => {
        console.error('Error checking watershed name:', error);
        hideWatershedNameExistsIndicator();
        watershedNameExistsGlobal = false;
        enableWatershedNextButton();
        return false;
    });
}

/**
 * Shows the watershed name exists indicator
 */
function showWatershedNameExistsIndicator() {
    const indicator = document.getElementById('watershed-name-exists-indicator');
    if (indicator) {
        indicator.style.display = 'block';
    }
}

/**
 * Hides the watershed name exists indicator
 */
function hideWatershedNameExistsIndicator() {
    const indicator = document.getElementById('watershed-name-exists-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

/**
 * Disables the Next button in step 1
 */
function disableWatershedNextButton() {
    const nextBtn = document.getElementById('step1NextBtn');
    if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.6';
    }
}

/**
 * Enables the Next button in step 1
 */
function enableWatershedNextButton() {
    const nextBtn = document.getElementById('step1NextBtn');
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
    }
}

/**
 * Initializes watershed name validation for the name input field
 * Should be called on document ready
 */
function initializeWatershedNameValidation() {
    console.log("Initializing watershed name validation");
    const nameInput = document.getElementById('watershedName');

    if (nameInput) {
        // Add blur event listener
        nameInput.addEventListener('blur', function() {
            console.log("checkWatershedName on blur");
            checkWatershedName(this.value);
        });

        // Add input event listener to enable Next button when user modifies name
        nameInput.addEventListener('input', function() {
            if (watershedNameExistsGlobal) {
                hideWatershedNameExistsIndicator();
                watershedNameExistsGlobal = false;
                enableWatershedNextButton();
            }
        });
    }
}

/**
 * Helper function to get CSRF token from DOM
 * @returns {string} CSRF token value or empty string
 */
function getCsrfToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}