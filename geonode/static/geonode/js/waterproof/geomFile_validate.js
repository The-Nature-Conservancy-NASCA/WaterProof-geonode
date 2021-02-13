/**
 * @file Validate geom files GeoJSON &
 * shapefiles 
 * @version 1.0
 */
const coordBounds = {
    lat: [
        -180.00,
        180.00
    ],
    lng: [
        -90.00,
        90.00
    ]
};
/** 
 * Get if file has a valid shape or GeoJSON extension 
 * @param {Object} file   zip or GeoJSON file
 *
 * @return {Object} extension Object contain extension and is valid
 */
function validExtension(file) {
    var fileExtension = {};
    if (file.name.lastIndexOf(".") > 0) {
        var extension = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length);
        fileExtension.extension = extension;
        if (file.type !== "") {
            if (file.type == 'application/x-zip-compressed' || file.type == 'application/zip') {
                fileExtension.valid = true;
            } else if (file.type == 'application/geo+json') {
                fileExtension.valid = true;
            } else {
                fileExtension.valid = false;
            }
        }
        else {
            if (file.extension === 'geojson') {
                fileExtension.valid = true;
            }
            else if (file.extension === 'zip') {
                fileExtension.valid = true;
            }
            else {
                fileExtension.valid = false;
            }
        }
    }
    else {
        fileExtension.valid = false;
    }
    return fileExtension;
}
function validateShapeFile(zip) {
    return new Promise((resolve, reject) => {
        var filename, readShp = false,
            readDbf = true,
            readShx = false,
            readPrj = false,
            prj, coord = true,
            prjName;
        let shapeFile = {};
        shapeFile.valid = false;
        shapeFile.epsg = 0;
        zip.forEach(function (relativePath, zipEntry) {
            filename = zipEntry.name.toLocaleLowerCase();
            if (filename.indexOf(".shp") !== -1) {
                readShp = true;
            }
            if (filename.indexOf(".dbf") !== -1) {
                readDbf = true;
            }
            if (filename.indexOf(".shx") !== -1) {
                readShx = true;
            }
            if (filename.indexOf(".prj") !== -1) {
                readPrj = true;
                prjName = zipEntry.name;
            }
        });
        if (readShp && readDbf && readPrj && readShx) {
            zip.file(prjName).async("string").then(function (data) {
                prj = data;
                // Validar sistema de referencia
                let epsgProjection = prj.indexOf("PROJECTION")
                if (epsgProjection !== -1) { // Is projected
                    if (prj.indexOf("Mercator_Auxiliary_Sphere") !== -1) {
                        shapeFile.valid = true;
                        shapeFile.epsg = 3857;
                        resolve(shapeFile);
                    }
                    else if (prj.indexOf("Mercator_1SP") !== -1) {
                        shapeFile.valid = true;
                        shapeFile.epsg = 3857;
                        resolve(shapeFile);
                    }
                    else {
                        Swal.fire({
                            icon: 'error',
                            title: gettext('Error!'),
                            text: gettext('The CRS is not correct!')
                        })
                        resolve(shapeFile);
                    }
                }
                else { //Geographic
                    let geogcs = prj.indexOf("GEOGCS");
                    if (geogcs !== -1) {
                        let gcs84 = prj.indexOf("GCS_WGS_1984");
                        if (gcs84 !== -1) {
                            shapeFile.valid = true;
                            shapeFile.epsg = 4326;
                            resolve(shapeFile);
                        }
                        else {
                            Swal.fire({
                                icon: 'error',
                                title: gettext('Error!'),
                                text: gettext('The CRS is not correct!')
                            })
                            resolve(shapeFile);
                        }
                    }
                }

            });
        }
        else { // Missing req files
            // Miss .shp
            if (!readShp) {
                Swal.fire({
                    icon: 'error',
                    title: gettext('Shapefile error'),
                    text: gettext('Missing shp')
                })
                resolve(shapeFile);

            }
            // Miss .dbf
            if (!readDbf) {
                Swal.fire({
                    icon: 'error',
                    title: gettext('Shapefile error'),
                    text: gettext('Missing dbf')
                })
                resolve(shapeFile);
            }
            // Miss .shx
            if (!readShx) {
                Swal.fire({
                    icon: 'error',
                    title: gettext('Shapefile error'),
                    text: gettext('Missing shx')
                })
                resolve(shapeFile);
            }
            // Miss .prj
            if (!readPrj) {
                Swal.fire({
                    icon: 'error',
                    title: gettext('Shapefile error'),
                    text: gettext('Missing prj')
                })
                resolve(shapeFile);
            }
        }
    });
}
/** 
 * Validate GeoJSON structure in base of RFC 7946
 * & coordinates range to WSG84  
 * @param {Object} geojson   GeoJSON object
 *
 * @return {Boolean} True|False is a valid GeoJSON
 */
function validateGeoJson(geojson) {
    isValid = false;
    let validGeojson = {};
    validGeojson.coord = false;
    validGeojson.struct = false;
    validGeojson.typeGeom = false;
    if (typeof (geojson) === 'object' && geojson !== void (0)) {
        if (geojson.type) {
            if (geojson.type == 'FeatureCollection') {
                if (geojson.features && geojson.features.length > 0) {
                    geojson.features.forEach(function (feature) {
                        console.log(feature);
                        if (feature.geometry.type === 'Polygon') {
                            validGeojson.typeGeom = true;
                            if (feature.geometry.coordinates.length > 0) {
                                validGeojson.struct = true;
                                feature.geometry.coordinates[0].forEach(function (coord) {
                                    if (coord[0] >= coordBounds.lat[0] && coord[1] <= coordBounds.lng[1]) {
                                        if (coord[1] >= coordBounds.lng[0] && coord[1] <= coordBounds.lng[1]) {
                                            validGeojson.coord = true;
                                        }
                                    }
                                });
                            }
                        }
                    })
                }
            }
            else if (geojson.type == 'Feature') {
                if (geojson.geometry) {
                    if (geojson.geometry.type === 'Polygon') {
                        validGeojson.typeGeom = true;
                        if (geojson.geometry.coordinates.length > 0) {
                            validGeojson.struct = true;
                            geojson.geometry.coordinates[0].forEach(function (coord) {
                                if (coord[0] >= coordBounds.lat[0] && coord[1] <= coordBounds.lng[1]) {
                                    if (coord[1] >= coordBounds.lng[0] && coord[1] <= coordBounds.lng[1]) {
                                        validGeojson.coord = true;
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    if (validGeojson.coord && validGeojson.struct && validGeojson.typeGeom)
        isValid = true;
    else if (!validGeojson.typeGeom) {
        Swal.fire({
            icon: 'error',
            title: gettext('GeoJSON file error'),
            text: gettext('Geometry must be polygon')
        })
    }
    else if (!validGeojson.struct) {
        Swal.fire({
            icon: 'error',
            title: gettext('GeoJSON file error'),
            text: gettext('Bad geojson structure')
        })
    }
    else {
        Swal.fire({
            icon: 'error',
            title: gettext('GeoJSON file error'),
            text: gettext('Coordinates out of WSG84')
        })
    }
    return isValid;
}
/** 
 * Validate dbf required attributes 
 * action & activity_n shapefile
 * @param {Object} geojson   GeoJSON object
 *
 * @return {Boolean} True|False is a valid dbf
 */
function validateDbfFields(geojson) {
    const actionType = {
        prevent: 'prevent',
        prefer: 'prefer'
    };
    validDbf = {};
    validDbf.action = false;
    validDbf.activity = false;
    if (geojson.features && geojson.features.length > 0) {
        geojson.features.forEach(function (feature, index) {
            if (feature.properties) {
                if (feature.properties.action === actionType.prevent || feature.properties.action === actionType.prefer) {
                    validDbf.action = true;
                }
                if (feature.properties.activity_n) {
                    validDbf.activity = true;
                }
            }
        });
    }
    else {
        if (geojson.properties) {
            if (geojson.properties.action === actionType.prevent || geojson.properties.action === actionType.prefer) {
                validDbf.action = true;
            }
            if (geojson.properties.activity_n) {
                validDbf.activity = true;
            }
        }
    }
    if (validDbf.action && validDbf.activity) {
        return true;
    }
    else if (!validDbf.action) {
        Swal.fire({
            icon: 'error',
            title: gettext('Shapefile error'),
            text: gettext('Dbf action field missing')
        })
        return false;
    }
    else {
        Swal.fire({
            icon: 'error',
            title: gettext('Shapefile error'),
            text: gettext('Dbf activity field missing')
        })
        return false;
    }
}
/** 
 * Validate max file upload
 * @param {Object} file   file uploaded
 *
 * @return {Boolean} True|False is a valid size
 */
function validFileSize(file) {
    let size =file.size / 1024 / 1024;
    if (size > 0 && size <= 10) {
        return true;
    } else {
        Swal.fire({
            icon: 'error',
            title: gettext('File size error'),
            text: gettext('File exceed size')
        })
        return false;
    }
}
