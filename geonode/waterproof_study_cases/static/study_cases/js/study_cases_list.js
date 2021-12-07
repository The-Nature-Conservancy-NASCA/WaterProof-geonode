/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */
$(function() {
    //console.log("Study cases list :: init");    
    var countryDropdown = $('#countryNBS');
    var currencyDropdown = $('#currencyCost');
    var transitionsDropdown = $('#riosTransition');
    var transformations = [];
    var lastClickedLayer;
    var lyrsPolygons = [];
    var highlighPolygon = {
        fillColor: "#337ab7",
        color: "#333333",
        weight: 0.2,
        fillOpacity: 0.7
    };
    // Default layer style
    var defaultStyle = {
        fillColor: "#337ab7",
        color: "#333333",
        weight: 0.2,
        fillOpacity: 0
    };
    initialize = function() {
        console.log('init event loaded');
        // Transformations widget change option event
        $('#menu-toggle').click(function(e) {
            e.preventDefault();
            $('#wrapper').toggleClass('toggled');
        });

        // show/hide div with checkbuttons 
        $("#riosTransition").change(function() {
            dato = $("#riosTransition").val();
            var data_value = $(`#selectlanduse${dato}`).attr('data-value');
            $('div[name=selectlanduse]').each(function() {
                $('div[name=selectlanduse]').css({
                    "display": "none"
                });
                $('div[name=selectlanduse]').find('input[type=checkbox]:checked').each(function(idx, input) {
                    input.checked = false;
                });
            });
            if (dato == data_value) {
                $(`#selectlanduse${dato}`).css({
                    "display": "block"
                })
            }
        });

        viewCurrencys = function(id, currency_sc) {
            console.log(currency_sc);
            let lblInfo = gettext('The following exchange rates has been applied for the analysis');
            let quantity = gettext('Quantity');
            let currency = gettext('Currency');
            let exchange = gettext('Exchange');

            html = `<div class="row" id="currencys-panel"> <div class="col-md-12 currency-panel">${lblInfo}</div>
                    <div class="custom-control col-md-3 currency-value">${quantity}</div>
                    <div class="custom-control col-md-4 currency-value">${currency}</div>
                    <div class="custom-control col-md-5 currency-value">${exchange}</div>`;
            $.get("../../study_cases/currencys/", {
                id: id,
                currency: ""
            }, function(data) {
                $.each(data, function(index, currency) {
                    value = parseFloat(currency.value).toFixed(4).replace(".",",");
                    html += '<div class="custom-control col-md-3 currency-value">1 ' + currency_sc + '</div>'
                    html += '<div class="col-md-4 currency-value"><label class="custom-control-label" for="currency">' + currency.currency + '</label></div>'
                    html += '<div class="custom-control col-md-5 currency-value">' + value + '</div>'
                });
                Swal.fire({
                    title: gettext('exchange_rate'),
                    html: html
                })
            })
        };

        $('#tbl-studycases tbody').on('click', '.btn-danger', function (evt) {
            let dataId = evt.currentTarget.getAttribute('data-id');
            let dateCreate = evt.currentTarget.getAttribute('date-create');
            let userId = evt.currentTarget.getAttribute('user-id');
            console.log(userId+'_'+dataId+'_'+dateCreate); // validar que si lo envio bien
            Swal.fire({
                title: gettext('Delete study case'),
                text: gettext("Are you sure?") + gettext("You won't be able to revert this!"),
                icon: 'warning',
                showCancelButton: false,
                showDenyButton: true,
                confirmButtonColor: '#d33',
                denyButtonColor: '#3085d6',
                confirmButtonText: gettext('Yes, delete it!'),
                denyButtonText: gettext('Cancel')
            }).then((result) => {
                if (result.isConfirmed) {
                    studycaseId = evt.currentTarget.getAttribute('data-id')
                    /** 
                     * Get filtered activities by transition id 
                     * @param {String} url   activities URL 
                     * @param {Object} data  transition id  
                     *
                     * @return {String} activities in HTML option format
                     */
                    $.ajax({
                        url: '/study_cases/delete/' + studycaseId,
                        type: 'POST',
                        success: function(result) {
                            Swal.fire({
                                icon: 'success',
                                title: gettext('Great!'),
                                text: gettext('The study case has been deleted')
                            })
                            setTimeout(function() {
                                if (location.pathname.indexOf("my_cases") >= 0){
                                    location.href = "/study_cases/my_cases/"; 
                                }else{
                                    location.href = "/study_cases/?city="+localStorage.cityId; 
                                }
                                
                            }, 500);
                         //borrar directorios de salida
                        $.ajax({
                            url : serverApi+"/wf-models/delete?study_case_id="+dataId+"&user_id="+userId+"&date="+dateCreate,
                            type : 'GET',
                            dataType : 'json',
                            success : function(json) {
                                console.log('works')
                                    },
                                    error: function(error) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: gettext('Error!'),
                                            text: gettext('The file has not been deleted from DB!')
                                        })
                                    }
                                }); 
                        },
                        error: function(error) {
                            Swal.fire({
                                icon: 'error',
                                title: gettext('Error!'),
                                text: gettext('The study case has not been deleted, try again!')
                            })
                        }
                    });
                } else if (result.isDenied) {
                    return;
                }
            })
        });
        fillTransitionsDropdown(transitionsDropdown);

        changeCountryEvent(countryDropdown, currencyDropdown);
        changeFileEvent();
        
    };

    $('#tbl-studycases tbody').on('click', '.btn-public', function (evt) {
        Swal.fire({
            title: gettext('Public study case'),
            text: gettext("Are you sure?"),
            icon: 'warning',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonColor: '#d33',
            denyButtonColor: '#3085d6',
            confirmButtonText: gettext('Yes, public it!'),
            denyButtonText: gettext('Cancel')
        }).then((result) => {
            if (result.isConfirmed) {
                studycaseId = evt.currentTarget.getAttribute('data-id')
                /** 
                 * Get filtered activities by transition id 
                 * @param {String} url   activities URL 
                 * @param {Object} data  transition id  
                 *
                 * @return {String} activities in HTML option format
                 */
                $.ajax({
                    url: '/study_cases/public/' + studycaseId,
                    type: 'POST',
                    success: function(result) {
                        Swal.fire({
                            icon: 'success',
                            title: gettext('Great!'),
                            text: gettext('The study case has been public')
                        })
                        setTimeout(function() {
                            city_id = localStorage.cityId;
                            location.href = "/study_cases/?city="+localStorage.cityId; 
                        }, 1000);
                    },
                    error: function(error) {
                        Swal.fire({
                            icon: 'error',
                            title: gettext('Error!'),
                            text: gettext('The study case has not been public, try again!')
                        })
                    }
                });
            } else if (result.isDenied) {
                return;
            }
        })
    });

    $('#tbl-studycases tbody').on('click', '.btn-private', function (evt) {
        Swal.fire({
            title: gettext('Private study case'),
            text: gettext("Are you sure?"),
            icon: 'warning',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonColor: '#d33',
            denyButtonColor: '#3085d6',
            confirmButtonText: gettext('Yes, private it!'),
            denyButtonText: gettext('Cancel')
        }).then((result) => {
            if (result.isConfirmed) {
                studycaseId = evt.currentTarget.getAttribute('data-id')
                /** 
                 * Get filtered activities by transition id 
                 * @param {String} url   activities URL 
                 * @param {Object} data  transition id  
                 *
                 * @return {String} activities in HTML option format
                 */
                $.ajax({
                    url: '/study_cases/private/' + studycaseId,
                    type: 'POST',
                    success: function(result) {
                        Swal.fire({
                            icon: 'success',
                            title: gettext('Great!'),
                            text: gettext('The study case has been private')
                        })
                        setTimeout(function() {
                            city_id = localStorage.cityId;
                            location.href = "/study_cases/?city="+localStorage.cityId; 
                        }, 1000);
                    },
                    error: function(error) {
                        Swal.fire({
                            icon: 'error',
                            title: gettext('Error!'),
                            text: gettext('The study case has not been private, try again!')
                        })
                    }
                });
            } else if (result.isDenied) {
                return;
            }
        })
    });

    udpateCreateUrl = function(countryId) {
        $('#createUrl').attr('href', 'create/' + countryId)
    };
    /** 
     * Get the transformations selected
     * @param {Array} transformations transformations selected
     */
    getTransformationsSelected = function() {
        var transformations = [];
        // Obtención de valores de los check de la solución
        $('input[name=itemRT]:checked').each(function() {
            transformations.push($(this).val());
        });
        return transformations;
    };
    /** 
     * Change currency option based in country selected
     * @param {HTML} countryDropdown    Country dropdown
     * @param {HTML} currencyDropdown   Currency  dropdown
     *
     */
    changeCountryEvent = function(countryDropdown, currencyDropdown) {
        // Rios transitions dropdown listener
        countryDropdown.click(function(event, params) {
            // Get load activities from urls Django parameter
            var country_id = $(this).val();
            var countryName = $(this).find(':selected').text();
            var countryCode = $(this).find(':selected').attr('data-value');
            if (params) {
                if (!params.mapClick) {
                    updateCountryMap(countryCode);
                }
            } else {
                updateCountryMap(countryCode);
            }
            /** 
             * Get filtered activities by transition id 
             * @param {String} url   activities URL 
             * @param {Object} data  transition id  
             *
             * @return {String} activities in HTML option format
             */
            $.ajax({
                url: '/waterproof_nbs_ca/load-currencyByCountry/',
                data: {
                    'country': country_id
                },
                success: function(result) {
                    result = JSON.parse(result);
                    currencyDropdown.val(result[0].pk);
                    $('#currencyLabel').text('(' + result[0].fields.code + ') - ' + result[0].fields.name);
                    $('#countryLabel').text(countryName);
                    /** 
                     * Get filtered activities by transition id 
                     * @param {String} url   activities URL 
                     * @param {Object} data  transition id  
                     *
                     * @return {String} activities in HTML option format
                     */
                    $.ajax({
                        url: '/waterproof_nbs_ca/load-regionByCountry/',
                        data: {
                            'country': country_id
                        },
                        success: function(result) {
                            result = JSON.parse(result);
                            $('#regionLabel').text(result[0].fields.name);

                        }
                    });
                }
            });
        });
    };
    updateCountryMap = function(countryCode) {
        map.eachLayer(function(layer) {
            if (layer.feature) {
                if (layer.feature.id == countryCode) {
                    if (lastClickedLayer) {
                        lastClickedLayer.setStyle(defaultStyle);
                    }
                    layer.setStyle(highlighPolygon);
                    map.fitBounds(layer.getBounds());
                    lastClickedLayer = layer;
                }
            }
        });

    }

    viewPtap = function(id) {
        localStorage.loadInf = "true";
        localStorage.plantId = id;
        window.open('../../treatment_plants/view/' + id, '_blank');
    };

    /** 
     * Validate input file on change
     * @param {HTML} dropdown Dropdown selected element
     */
    changeFileEvent = function() {
        $('#restrictedArea').change(function(evt) {
            var file = evt.currentTarget.files[0];
            var extension = validExtension(file);
            // Validate file's extension
            if (extension.valid) { //Valid
                console.log('Extension valid!');
                // Validate file's extension
                if (extension.extension == 'geojson') { //GeoJSON
                    var readerGeoJson = new FileReader();
                    readerGeoJson.onload = function(evt) {
                        var contents = evt.target.result;
                        geojson = JSON.parse(contents);
                        loadFile(geojson, file.name);
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
                                    if (prj.toLocaleLowerCase().indexOf("gcs_wgs_1984") == -1) {
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
    };
    checkEmptyFile = function() {

    };
    /** 
     * Populate transitions options in dropdown 
     * @param {HTML} dropdown Dropdown selected element
     *
     */
    fillTransitionsDropdown = function(dropdown) {
        $.ajax({
            url: '/waterproof_nbs_ca/load-transitions',
            success: function(result) {
                result = JSON.parse(result);
                $.each(result, function(index, transition) {
                    dropdown.append($("<option />").val(transition.pk).text(transition.fields.name));
                });
                dropdown.val(1).change();
            }
        });
    };
    /** 
     * Get if file has a valid shape or GeoJSON extension 
     * @param {StriFileng} file   zip or GeoJSON file
     *
     * @return {Object} extension Object contain extension and is valid
     */
    validExtension = function(file) {
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
    };
    loadFile = function(file, name) {
        console.log('Start loading file function!');
    };
    // Init 
    initialize();

    //draw polygons
    drawPolygons = function (map) {
        
        let lf = [];
        listIntakes.forEach(intake => {
            if (intake.geom) {
                //let g = JSON.parse(intake.geom);
                f = {'type' : 'Feature', 
                    'properties' : { 'id' : intake.study_case_id, 
                                    'studyCase' : intake.study_case_name,
                                    'intake' : intake.intake_name,
                                    'intakeId' : intake.intake_id}, 
                    'geometry' : intake.geom
                };
                lf.push(f);
            }            
        });
        
        if (lf.length > 0){
            lyrIntakes = L.geoJSON(lf, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(`<div class="popup-content">
                                        <div class="leaflet-container">
                                            <b>Id</b>: ${feature.properties.id}
                                        </div>
                                        <div class="popup-body">
                                            <div class="popup-body-content">
                                                <div class="popup-body-content-text">
                                                    <p><b>Study Case</b> :${feature.properties.studyCase}</p>
                                                    <p><b>Intake </b>: ${feature.properties.intake}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`);
                }
            }).addTo(map);
            map.fitBounds(lyrIntakes.getBounds());
        }
    }

    menu = function() {
        $('.topnav a').click(function() {
            $('#sideNavigation').style.width = "250px";
            $("#main").style.marginLeft = "250px";
        });
    }

    async function deleteDirAPIStudyCase(e) {

        const deleteDir = "deleteDir";
        let center =  waterproof.cityCoords == undefined ? map.getCenter(): waterproof.cityCoords;
        let amp = "&";
        if (serverApi.indexOf("proxy") >=0){
          amp = "%26";
        }
        let url = serverApi + deleteDir + "?x=" + center[1] + amp + "y=" + center[0];
        let response = await fetch(url);
        
        let result = await response.json();
        if (result.status) {
        }
    }
});
