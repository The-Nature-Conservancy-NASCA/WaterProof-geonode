/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */
$(function () {
    
    var search;
    var countryDropdown = $('#countryNBS');
    var currencyDropdown = $('#currencyCost');
    var transitionsDropdown = $('#riosTransition');
    var transformations = [];
    var lastClickedLayer;
    var map;
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
    var table = $('#tblNbs').DataTable({
        'searching': false,
        'columnDefs': [{
            "targets": [12],
            'orderable': false,
        },
        {
            "targets": [4],
            "visible": false,   
        }],
        'language': {
            url: urlJson
        }
    });


    initialize = function () {
        console.log('init event loaded');
        // Transformations widget change option event
        $('#menu-toggle').click(function (e) {
            e.preventDefault();
            $('#wrapper').toggleClass('toggled');
        });

        // show/hide div with checkbuttons 
        $("#riosTransition").change(function () {
            dato = $("#riosTransition").val();
            var data_value = $(`#selectlanduse${dato}`).attr('data-value');
            $('div[name=selectlanduse]').each(function () {
                $('div[name=selectlanduse]').css({
                    "display": "none"
                });
                $('div[name=selectlanduse]').find('input[type=checkbox]:checked').each(function (idx, input) {
                    input.checked = false;
                });
            });
            if (dato == data_value) {
                $(`#selectlanduse${dato}`).css({
                    "display": "block"
                })
            }
        });
        $('#tblNbs tbody').on('click', '.btn-danger', function (evt) {
            Swal.fire({
                title: gettext('Delete NBS'),
                text: gettext("Are you sure?") + " " + gettext("You won't be able to revert this!"),
                icon: 'warning',
                showCancelButton: false,
                showDenyButton: true,
                confirmButtonColor: '#d33',
                denyButtonColor: '#3085d6',
                confirmButtonText: gettext('Yes, delete it!'),
                denyButtonText: gettext('Cancel')
            }).then((result) => {
                if (result.isConfirmed) {
                    nbsId = evt.currentTarget.getAttribute('data-id')
                    /** 
                    * Get filtered activities by transition id 
                    * @param {String} url   activities URL 
                    * @param {Object} data  transition id  
                    *
                    * @return {String} activities in HTML option format
                    */
                    $.ajax({
                        url: '/waterproof_nbs_ca/delete/' + nbsId,
                        type: 'POST',
                        success: function (result) {
                            Swal.fire({
                                icon: 'success',
                                title: gettext('Great!'),
                                text: gettext('The NBS has been deleted')
                            })
                            setTimeout(function () { location.href = "/waterproof_nbs_ca/"; }, 1000);
                        },
                        error: function (error) {
                            Swal.fire({
                                icon: 'error',
                                title: gettext('Error!'),
                                text: gettext('The NBS has not been deleted, try again!')
                            })
                        }
                    });
                } else if (result.isDenied) {
                    return;
                }
            })
        });
        fillTransitionsDropdown(transitionsDropdown);
        submitFormEvent();
        changeCountryEvent(countryDropdown, currencyDropdown);
        changeFileEvent();
        if (localStorage.getItem("cityId") == null) {
            localStorage.setItem("cityId", "128587");
            localStorage.setItem("country", "United States");
            localStorage.setItem("currency", "USD");
            localStorage.setItem("countryCode", "USA");
            localStorage.setItem("factor", "1.00");
            localStorage.setItem("city", "Washington");
            localStorage.setItem("cityCoords", "[38.8949924,-77.0365581]");
        }
        initMap();
    };
    submitFormEvent = function () {
        console.log('submit event loaded');
        var formData = new FormData();
        $('#submit').on('click', function () {
            // NBS name
            formData.append('nameNBS', $('#nameNBS').val());
            // NBS description
            formData.append('descNBS', $('#descNBS').val());
            // NBS country
            formData.append('countryNBS', $('#countryNBS').val());
            // NBS currency cost
            formData.append('currencyCost', $('#currencyCost').val());
            // NBS Time required to generate maximun benefit (yr)
            formData.append('maxBenefitTime', $('#maxBenefitTime').val());
            // NBS Percentage of benefit associated with interventions at time t=0
            formData.append('benefitTimePorc', $('#benefitTimePorc').val());
            // NBS Maintenance Perodicity
            formData.append('maintenancePeriod', $('#maintenancePeriod').val());
            // NBS Unit Implementation Cost (US$/ha)
            formData.append('implementCost', $('#implementCost').val());
            // NBS Unit Maintenace Cost (US$/ha)
            formData.append('maintenanceCost', $('#maintenanceCost').val());
            // NBS Unit Oportunity Cost (US$/ha)
            formData.append('oportunityCost', $('#oportunityCost').val());
            // NBS RIOS Transformations selected
            formData.append('riosTransformation', getTransformationsSelected());
            var file = $('#restrictedArea')[0].files[0];
            // validate extension file
            var extension = validExtension(file);
            if (extension.extension == 'geojson') { //GeoJSON
                // Restricted area extension file
                formData.append('extension', 'geojson');
                // NBS restricted area geographic file
                formData.append('restrictedArea', $('#restrictedArea')[0].files[0]);
                // Type action for view
                formData.append('action', 'create-nbs');
                // Required session token
                formData.append('csrfmiddlewaretoken', token);
                $.ajax({
                    type: 'POST',
                    url: '/waterproof_nbs_ca/create/' + countryId,
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                    enctype: 'multipart/form-data',
                    success: function () {
                        Swal.fire(
                            'Excelente',
                            'La SBN ha sido guardada con éxito',
                            'success'
                        )
                        setTimeout(function () { location.href = "/waterproof_nbs_ca/"; }, 1000);
                    },
                    error: function (xhr, errmsg, err) {
                        console.log(xhr.status + ":" + xhr.responseText)
                    }
                });
            } else { // ZIP
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var contents = evt.target.result;
                    shp(contents).then(function (shpToGeojson) {
                        var restrictedArea = JSON.stringify(shpToGeojson);
                        // Restricted area extension file
                        formData.append('extension', 'zip');
                        // NBS restricted area geographic file
                        formData.append('restrictedArea', restrictedArea);
                        // Type action for view
                        formData.append('action', 'create-nbs');
                        // Required session token
                        formData.append('csrfmiddlewaretoken', token);
                        $.ajax({
                            type: 'POST',
                            url: '/waterproof_nbs_ca/create/' + countryId,
                            data: formData,
                            cache: false,
                            processData: false,
                            contentType: false,
                            enctype: 'multipart/form-data',
                            success: function () {
                                Swal.fire(
                                    'Excelente',
                                    'La SBN ha sido guardada con éxito',
                                    'success'
                                )
                                setTimeout(function () { location.href = "/waterproof_nbs_ca/"; }, 1000);
                            },
                            error: function (xhr, errmsg, err) {
                                console.log(xhr.status + ":" + xhr.responseText)
                            }
                        });
                    });
                };
                reader.onerror = function (event) {
                    console.error("File could not be read! Code " + event.target.error.code);
                    //alert("El archivo no pudo ser cargado: " + event.target.error.code);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    };
    /** 
    * Initialize map 
    */
    initMap = function () {
        CENTER = [4.582, -74.4879];
        var zoom = 5;
        // Basemap layer
        var osm = L.tileLayer(OSM_BASEMAP_URL, {
            maxZoom: MAXZOOM,
            attribution: 'Data \u00a9 <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap Contributors </a> Tiles \u00a9 Komoot'
        });
        var images = L.tileLayer(IMG_BASEMAP_URL);
        //var hydroLyr = L.tileLayer(HYDRO_BASEMAP_URL);
        var grayLyr = L.tileLayer(GRAY_BASEMAP_URL, {
            maxZoom: 20,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        });

        var baseLayers = {
            OpenStreetMap: osm,
            Images: images,
            /* Grayscale: grayLyr, */
        };

        map = L.map('mapid', {
            scrollWheelZoom: false,
            layers: [osm],
        });

        // Countries layer
        let countries = new L.GeoJSON.AJAX(countriesLayerUrl,
            {
                style: defaultStyle,
                onEachFeature: onEachFeature
            }
        ).addTo(map);
        var overlays = {
            "Countries": countries,
        };

        let initialCoords = CENTER;
        if (localStorage.getItem('cityCoords') != null){
            initialCoords = JSON.parse(localStorage.getItem('cityCoords'));
            zoom = 3;
        }


        // When countries layer is loaded fire dropdown event change
        countries.on("data:loaded", function (evt) {
            let mapClick = false;
            // Preload selected country form list view
            if (userCountryCode == undefined) {
                userCountryCode = localStorage.getItem('countryCode');
            }
            let center = updateCountryMap(userCountryCode, evt.target);
            $.ajax({
                url: '/parameters/load-countryByCode/',
                data: {
                    'code': userCountryCode
                },
                success: function (result) {
                    result = JSON.parse(result);
                    //console.log(result);
                    userCountryName = result[0].fields.name;
                    userCountryId = result[0].pk;
                    // Filter datables with country name
                    //table.search(userCountryName).draw();
                    // Update url to create with country id parameter
                    //udpateCreateUrl(userCountryId);
                    updateGeographicLabels(userCountryCode);
                }
            });
            if (center != undefined) {
                initialCoords = center;
            }
            map.setView(initialCoords, zoom);
            L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);
            var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright' }).addTo(map);
        });

        function onEachFeature(feature, layer) {
            layer.on({
                click: updateDropdownCountry
            });
        }

        function updateDropdownCountry(feature) {
            let mapClick = true;
            let layerClicked = feature.target;
            if (lastClickedLayer) {
                lastClickedLayer.setStyle(defaultStyle);
            }
            layerClicked.setStyle(highlighPolygon);
            let countryCode = feature.sourceTarget.feature.id;
            localStorage.countryCode=countryCode;
            updateGeographicLabels(countryCode);
            lastClickedLayer = feature.target;
        }
        //map.on('click', onMapClick);
    }
    setMultiplicationFactor = function (row, index, factor) {
        //if (row[4] === 'ADMIN') {
            // Implementation cost 
            // oldImplCost = search2.cell({ row: index, column: 7 }).data();
            // search.cell({ row: index, column: 7 }).data((parseFloat(oldImplCost) * parseFloat(factor)).toFixed(2));
            // oldMaintCost = search2.cell({ row: index, column: 8 }).data();
            // search.cell({ row: index, column: 8 }).data((parseFloat(oldMaintCost) * parseFloat(factor)).toFixed(2));
            // oldOportCost = search2.cell({ row: index, column: 9 }).data();
            // search.cell({ row: index, column: 9 }).data((parseFloat(oldOportCost) * parseFloat(factor)).toFixed(2));
        //}
    }
    updateGeographicLabels = function (countryCode) {
        $.ajax({
            url: '/parameters/load-countryByCode/',
            data: {
                'code': countryCode
            },
            success: function (result) {
                result = JSON.parse(result);
                $('#countryLabel').text(result[0].fields.name);
                search = table.search('(ADMIN|' + result[0].fields.name + ')', true, true);
                let filteredData = search.rows({ search: 'applied' }).data();
                let filterIndexes = search.rows({ search: 'applied' }).indexes();
                let multiplicatorFactor = parseFloat(result[0].fields.global_multiplier_factor);
                for (let index = 0; index < filteredData.length; index++) {
                    //console.log(filteredData[index]);
                    //console.log(result);
                    if (filteredData[index][4] === 'ADMIN') {
                        if (result[0].fields.iso3 === 'USA') {
                            let oldImplCost = parseFloat(table.cell({ row: filterIndexes[index], column: 7 }).data());
                            let oldMaintCost = parseFloat(table.cell({ row: filterIndexes[index], column: 8 }).data());
                            let oldOportCost = parseFloat(table.cell({ row: filterIndexes[index], column: 9 }).data());
                            $(table.cell({ row: filterIndexes[index], column: 7 }).node()).html(oldImplCost.toFixed(2));
                            $(table.cell({ row: filterIndexes[index], column: 8 }).node()).html(oldMaintCost.toFixed(2));
                            $(table.cell({ row: filterIndexes[index], column: 9 }).node()).html(oldOportCost.toFixed(2));
                            $(table.cell({ row: filterIndexes[index], column: 5 }).node()).html(result[0].fields.name);
                        }
                        else {
                            let oldImplCost = parseFloat(filteredData[index][7]);
                            let newImplCost = ((oldImplCost * multiplicatorFactor)).toFixed(2);
                            let oldMaintCost = parseFloat(table.cell({ row: filterIndexes[index], column: 8 }).data());
                            let newMaintConst = ((oldMaintCost * multiplicatorFactor)).toFixed(2);
                            let oldOportCost = parseFloat(table.cell({ row: filterIndexes[index], column: 9 }).data());
                            let newOportCost = ((oldOportCost * multiplicatorFactor)).toFixed(2);
                            $(table.cell({ row: filterIndexes[index], column: 7 }).node()).html(newImplCost);
                            $(table.cell({ row: filterIndexes[index], column: 8 }).node()).html(newMaintConst);
                            $(table.cell({ row: filterIndexes[index], column: 9 }).node()).html(newOportCost);
                            $(table.cell({ row: filterIndexes[index], column: 5 }).node()).html(result[0].fields.name);
                        }
                    }
                    if (filteredData[index][4] === 'ANALYS') {
                        if (result[0].fields.iso3 === 'USA') {
                            let oldImplCost = parseFloat(table.cell({ row: filterIndexes[index], column: 7 }).data());
                            let oldMaintCost = parseFloat(table.cell({ row: filterIndexes[index], column: 8 }).data());
                            let oldOportCost = parseFloat(table.cell({ row: filterIndexes[index], column: 9 }).data());
                            $(table.cell({ row: filterIndexes[index], column: 7 }).node()).html(oldImplCost.toFixed(2));
                            $(table.cell({ row: filterIndexes[index], column: 8 }).node()).html(oldMaintCost.toFixed(2));
                            $(table.cell({ row: filterIndexes[index], column: 9 }).node()).html(oldOportCost.toFixed(2));
                            $(table.cell({ row: filterIndexes[index], column: 5 }).node()).html(result[0].fields.name);
                        }
                        else {
                            let oldImplCost = parseFloat(filteredData[index][7]);
                            let newImplCost = ((oldImplCost * multiplicatorFactor)).toFixed(2);
                            let oldMaintCost = parseFloat(table.cell({ row: filterIndexes[index], column: 8 }).data());
                            let newMaintConst = ((oldMaintCost * multiplicatorFactor)).toFixed(2);
                            let oldOportCost = parseFloat(table.cell({ row: filterIndexes[index], column: 9 }).data());
                            let newOportCost = ((oldOportCost * multiplicatorFactor)).toFixed(2);
                            $(table.cell({ row: filterIndexes[index], column: 7 }).node()).html(newImplCost);
                            $(table.cell({ row: filterIndexes[index], column: 8 }).node()).html(newMaintConst);
                            $(table.cell({ row: filterIndexes[index], column: 9 }).node()).html(newOportCost);
                            $(table.cell({ row: filterIndexes[index], column: 5 }).node()).html(result[0].fields.name);
                        }
                    }
                }
                search.draw();
                let countryId = result[0].pk;
                let countryIso=result[0].fields.iso3;
                console.log(countryIso);
                $.ajax({
                    url: '/parameters/load-regionByCountry/',
                    data: {
                        'country': countryIso
                    },
                    success: function (result) {
                        result = JSON.parse(result);
                        $('#regionLabel').text("");
                        if (result.length > 0) {
                            $('#regionLabel').text(result[0].fields.name);
                        }
                    }
                });
                $.ajax({
                    url: '/parameters/load-currencyByCountry/',
                    data: {
                        'country': countryIso
                    },
                    success: function (result) {
                        result = JSON.parse(result);
                        $('#currencyLabel').text('(' + result[0].fields.currency + ') - ' + result[0].fields.name);
                        $("#countryNBS").val(localStorage.countryCode);
                    }
                });
            }
        });
    }
    udpateCreateUrl = function (countryId) {
        $('#createUrl').attr('href', 'create/' + countryId);
        $('#nbs-createUrl').attr('href', 'create/' + countryId);
    };
    /** 
    * Get the transformations selected
    * @param {Array} transformations transformations selected
    */
    getTransformationsSelected = function () {
        var transformations = [];
        // Obtención de valores de los check de la solución
        $('input[name=itemRT]:checked').each(function () {
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
    changeCountryEvent = function (countryDropdown, currencyDropdown) {
        // Rios transitions dropdown listener
        countryDropdown.click(function (event, params) {
            // Get load activities from urls Django parameter
            var country_id = $(this).val();
            var countryName = $(this).find(':selected').text();
            var countryCode = $(this).find(':selected').attr('data-value');
            if (params) {
                if (!params.mapClick) {
                    updateCountryMap(countryCode);
                }
            }
            else {
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
                url: '/parameters/load-currencyByCountry/',
                data: {
                    'country': country_id
                },
                success: function (result) {
                    result = JSON.parse(result);
                    currencyDropdown.val(result[0].pk);
                    $('#currencyLabel').text('(' + result[0].fields.currency + ') - ' + result[0].fields.name);
                    $('#countryLabel').text(countryName);
                    $('#countryfilterAdmin').append(
                        function(evt){
                            let filterlist = evt.currentTarget.getAttribute('sbncountry');
                            `
                                {% if ${filterlist}  == ${countryName} %}
                                    <p>${filterlist}</p>
                                {% endif %}
                            `
                        }
                        
                    )
                    $('#countryfilterAnalist').append(
                        function(evt){
                            let filterlist = evt.currentTarget.getAttribute('sbncountry');
                            `
                                {% if ${filterlist}  == ${countryName} %}
                                    <p>${filterlist}</p>
                                {% endif %}
                            `
                        }
                        
                    )
                    /** 
                     * Get filtered activities by transition id 
                     * @param {String} url   activities URL 
                     * @param {Object} data  transition id  
                     *
                     * @return {String} activities in HTML option format
                     */
                    $.ajax({
                        url: '/parameters/load-regionByCountry/',
                        data: {
                            'country': country_id
                        },
                        success: function (result) {
                            result = JSON.parse(result);
                            $('#regionLabel').text(result[0].fields.name);

                        }
                    });
                }
            });
        });
    };
    updateCountryMap = function (countryCode, lyr) {
        let center;
        lyr.eachLayer(function (layer) {
            if (layer.feature.id == countryCode) {
                if (lastClickedLayer) {
                    lastClickedLayer.setStyle(defaultStyle);
                }
                layer.setStyle(highlighPolygon);
                map.fitBounds(layer.getBounds());
                center = layer.getBounds().getCenter();
                lastClickedLayer = layer;
            }
        });
        return center;
    }
    /** 
     * Validate input file on change
     * @param {HTML} dropdown Dropdown selected element
     */

    changeFileEvent = function () {
        $('#restrictedArea').change(function (evt) {
            var file = evt.currentTarget.files[0];
            var extension = validExtension(file);
            // Validate file's extension
            if (extension.valid) { //Valid
                console.log('Extension valid!');
                // Validate file's extension
                if (extension.extension == 'geojson') { //GeoJSON
                    var readerGeoJson = new FileReader();
                    readerGeoJson.onload = function (evt) {
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
                    reader.onload = function (evt) {
                        var contents = evt.target.result;
                        JSZip.loadAsync(file).then(function (zip) {
                            zip.forEach(function (relativePath, zipEntry) {
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
                                zip.file(prjName).async("string").then(function (data) {
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
                                        shp(contents).then(function (shpToGeojson) {
                                            geojson = shpToGeojson;
                                            //loadShapefile(geojson, file.name);
                                        }).catch(function (e) {
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
                    reader.onerror = function (event) {
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
    checkEmptyFile = function () {

    };
    /** 
     * Populate transitions options in dropdown 
     * @param {HTML} dropdown Dropdown selected element
     *
     */
    fillTransitionsDropdown = function (dropdown) {
        $.ajax({
            url: '/waterproof_nbs_ca/load-transitions',
            success: function (result) {
                result = JSON.parse(result);
                $.each(result, function (index, transition) {
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
    validExtension = function (file) {
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
    loadFile = function (file, name) {
        console.log('Start loading file function!');
    };
    // Init 
    initialize();
});