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
    LOGISTICS: 'LOGISTICS'
}

var mapLoader;
$(document).ready(function() {
    $('#custom').click(function() {
        $("#panel-custom").removeClass("panel-hide");
    });

    $('#add_wi').click(function() {
        selected = $("#select_custom option:selected").text();
        $('#select_custom option:selected').remove();
        var markup = "<tr><td>" + selected + "</td></tr>";
        $("table tbody").append(markup);
    });


    $('#step1NextBtn').click(function() {
        if ($('#id_name').val() != '' && $('#id_description').val() != '' && $('table tr').length > 1) {
            $('#smartwizard').smartWizard("next");
            $("#form").submit();
        } else {
            Swal.fire({
                icon: 'warning',
                title: `Field empty`,
                text: `Please full every fields`
            });
            return;
        }
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

    /*$("#smartwizard").on("showStep", function(e, anchorObject, stepIndex, stepDirection) {
        if (stepIndex == 3) {
            if (catchmentPoly)
                mapDelimit.fitBounds(catchmentPoly.getBounds());
            changeFileEvent();
        }
    });

    /*
        var menu1Tab = document.getElementById('mapid');
        var observer2 = new MutationObserver(function() {
            if (menu1Tab.style.display != 'none') {
                mapDelimit.invalidateSize();
            }
        });
        observer2.observe(menu1Tab, {
            attributes: true
        });
    */
});


window.onbeforeunload = function() {
    return mxResources.get('changesLost');
};

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
    editablepolygon = L.polygon(copyCoordinates, {
        color: 'red'
    });
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
                    title: 'Error de Geometría',
                    text: 'El polígono editado no es válido, por favor intente de nuevo',
                })
            } else if (!result.polygonContains) {
                Swal.fire({
                    icon: 'error',
                    title: 'El polígono debe estar dentro del área de la captación',
                    text: 'El polígono editado no es válido, por favor intente de nuevo',
                })
                // Correct geometry
            } else {
                Swal.fire(
                    'Excelente',
                    'El polígono es válido y está dentro de la captación',
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
 */
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
                    geojson = JSON.parse(contents);
                    delimitationFileType = delimitationFileEnum.GEOJSON;
                    let polygonStyle = {
                        fillColor: "red",
                        color: "#333333",
                        weight: 0.2,
                        fillOpacity: 0.3
                    };
                    editablepolygon = L.geoJSON(geojson, {
                        style: polygonStyle
                    })
                    editablepolygon.addTo(mapDelimit);
                    mapDelimit.fitBounds(editablepolygon.getBounds())
                    //loadShapefile(geojson, file.name);
                }
                readerGeoJson.readAsText(file);
            } else { //Zip
                var reader = new FileReader();
                var filename, readShp = false,
                    readDbf = false,
                    readShx = false,
                    readPrj = false,
                    prj, coord = true;
                var prjName;
                reader.onload = function(evt) {
                    var contents = evt.target.result;
                    JSZip.loadAsync(file).then(function(zip) {
                        zip.forEach(function(relativePath, zipEntry) {
                            filename = zipEntry.name.toLocaleLowerCase();
                            if (filename.indexOf(".shp") != -1) {
                                readShp = true;
                            }
                            if (filename.indexOf(".dbf") != -1) {
                                readDbf = true;
                            }
                            if (filename.indexOf(".shx") != -1) {
                                readShx = true;
                            }
                            if (filename.indexOf(".prj") != -1) {
                                readPrj = true;
                                prjName = zipEntry.name;
                            }
                        });
                        // Valid shapefile with minimum files req
                        if (readShp && readDbf && readPrj && readShx) {
                            zip.file(prjName).async("string").then(function(data) {
                                prj = data;
                                // Validar sistema de referencia
                                if (!prj) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error en shapefile',
                                        text: 'Sistema de proyección incorrecto',
                                    })
                                }
                                // Shapefile válido
                                else {
                                    shp(contents).then(function(shpToGeojson) {
                                        geojson = shpToGeojson;
                                        delimitationFileType = delimitationFileEnum.SHP;
                                        let polygonStyle = {
                                            fillColor: "#337ab7",
                                            color: "#333333",
                                            weight: 0.2,
                                            fillOpacity: 0.3
                                        };
                                        editablepolygon = L.geoJSON(geojson, {
                                            style: polygonStyle
                                        })
                                        editablepolygon.addTo(mapDelimit);
                                        mapDelimit.fitBounds(editablepolygon.getBounds())
                                        //loadShapefile(geojson, file.name);
                                    }).catch(function(e) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error en shapefile',
                                            text: 'Ha ocurrido un error de lectura en el shapefile',
                                        })
                                        console.log("Ocurrió error convirtiendo el shapefile " + e);
                                    });
                                }
                            });
                        } else { // Missing req files
                            // Miss .shp
                            if (!readShp) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error en shapefile',
                                    text: 'Falta el archivo .shp requerido',
                                })
                            }
                            // Miss .dbf
                            if (!readDbf) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error en shapefile',
                                    text: 'Falta el archivo .dbf requerido',
                                })
                            }
                            // Miss .shx
                            if (!readShx) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error en shapefile',
                                    text: 'Falta el archivo .shx requerido',
                                })
                            }
                            // Miss .prj
                            if (!readPrj) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error en shapefile',
                                    text: 'Falta el archivo .prj requerido',
                                })
                            }
                        }
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
                title: 'Error de extensión',
                text: 'La extensión del archivo no está soportada, debe ser GeoJSON o un shapefile .zip',
            })
        }
    });
}
/** 
 * Get if file has a valid shape or GeoJSON extension 
 * @param {StriFileng} file   zip or GeoJSON file
 *
 * @return {Object} extension Object contain extension and is valid
 */
function validExtension(file) {
    var fileExtension = {};
    if (file.name.lastIndexOf(".") > 0) {
        var extension = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length);
        fileExtension.extension = extension;
    }
    if (file.type == 'application/x-zip-compressed' || file.type == 'application/zip') {
        fileExtension.valid = true;
    } else if (file.type == 'application/geo+json') {
        fileExtension.valid = true;
    } else {
        fileExtension.valid = false;
    }
    return fileExtension;
}