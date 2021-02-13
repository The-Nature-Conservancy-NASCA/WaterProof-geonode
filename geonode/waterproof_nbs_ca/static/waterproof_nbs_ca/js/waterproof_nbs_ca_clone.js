/**
 * @file Edit form validations
 * @version 1.0
 */
$(function () {
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
    var transformations = [];
    var lastClickedLayer;
    initialize = function () {
        $('#example').DataTable();
        console.log('init event loaded');
        var dato;
        var countryDropdown = $('#countryNBS');
        var currencyDropdown = $('#currencyCost');
        var transitionsDropdown = $('#riosTransition');
        var activitiesDropdown = $('#riosActivity');
        var transformDropdown = $('#riosTransformation');
        var loadAreaChecked = $('#loadArea');

        // show/hide div with checkbuttons 
        $("#riosTransition").change(function () {
            dato = $("#riosTransition").val();
            var data_value = $(`#selectlanduse${dato}`).attr('data-value');
            $('div[name=selectlanduse]').each(function (idx, input) {
                $('div[name=selectlanduse]').css({
                    "display": "none"
                });
                var valueInput = input.getAttribute('data-value')
                if (valueInput !== dato) {
                    $(`#selectlanduse${valueInput}`).find('input[type=checkbox]:checked').each(function (idx, input) {
                        input.checked = false;
                    });
                }
            });
            if (dato == data_value) {
                $(`#selectlanduse${dato}`).css({
                    "display": "block"
                })
            }
            else {
                $('div[name=selectlanduse]').find('input[type=checkbox]:checked').each(function (idx, input) {
                    input.checked = false;
                });
            }
        });
        // Event to show or hide restricted area edition
        loadAreaChecked.click(function (e) {
            var checked = e.currentTarget.checked
            if (checked)
                $('#areas').show();
            else
                $('#areas').hide();
        });

        // Populate countries options
        // Populate currencies options
        fillCurrencyDropdown(currencyDropdown);
        fillTransitionsDropdown(transitionsDropdown);
        // Change transition dropdown event listener
        changeTransitionEvent(transitionsDropdown, activitiesDropdown);
        // Change country dropdown event listener 
        changeCountryEvent(countryDropdown, currencyDropdown);
        submitFormEvent();
        changeFileEvent();
        initMap();
    };
    submitFormEvent = function () {
        console.log('submit event loaded');
        var formData = new FormData();
        var uploadNewArea = false;
        $('#form').validator().on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                // handle the invalid form...
            } else {
                e.preventDefault();
                var loadAreaChecked = ('#loadArea');
                var sbnId = $('#sbnId').val();
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
                formData.append('benefitTimePorc', parseFloat($('#benefitTimePorc').val()));
                // NBS Consecution Time Total Benefits
                formData.append('totalConsecTime', $('#totalConsecTime').val());
                // NBS Maintenance Perodicity
                formData.append('maintenancePeriod', $('#maintenancePeriod').val());
                // NBS Unit Implementation Cost (US$/ha)
                formData.append('implementCost', parseFloat($('#implementCost').val()));
                // NBS Unit Maintenace Cost (US$/ha)
                formData.append('maintenanceCost', parseFloat($('#maintenanceCost').val()));
                // NBS Unit Oportunity Cost (US$/ha)
                formData.append('oportunityCost', parseFloat($('#oportunityCost').val()));
                // NBS RIOS Transformations selected
                formData.append('riosTransformation', getTransformationsSelected());

                // Validate if user want's to be upload new restricted area
                if ($('#loadArea')[0].checked) { // Upload new restricted area
                    var file = $('#restrictedArea')[0].files[0];
                    uploadNewArea = true;
                    formData.append('uploadNewArea', uploadNewArea);
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
                            url: '/waterproof_nbs_ca/clone/' + sbnId,
                            data: formData,
                            cache: false,
                            processData: false,
                            contentType: false,
                            enctype: 'multipart/form-data',
                            success: function () {
                                Swal.fire(
                                    gettext('Great!'),
                                    gettext('The NBS has been saved'),
                                    'success'
                                )
                                location.href = "/waterproof_nbs_ca/"
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
                    }
                    else { // ZIP

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
                                    url: '/waterproof_nbs_ca/clone/' + sbnId,
                                    data: formData,
                                    cache: false,
                                    processData: false,
                                    contentType: false,
                                    enctype: 'multipart/form-data',
                                    success: function () {
                                        Swal.fire(
                                            gettext('Great!'),
                                            gettext('The NBS has been saved'),
                                            'success'
                                        )
                                        setTimeout(function () { location.href = "/waterproof_nbs_ca/"; }, 1000);
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
                            });
                        };
                        reader.onerror = function (event) {
                            console.error("File could not be read! Code " + event.target.error.code);
                            //alert("El archivo no pudo ser cargado: " + event.target.error.code);
                        };
                        reader.readAsArrayBuffer(file);
                    }
                }
                else { // Maintain same restricted area
                    // Type action for view
                    formData.append('action', 'edit-nbs');
                    uploadNewArea = false;
                    formData.append('uploadNewArea', uploadNewArea);
                    // Required session token
                    formData.append('csrfmiddlewaretoken', token);
                    $.ajax({
                        type: 'POST',
                        url: '/waterproof_nbs_ca/clone/' + sbnId,
                        data: formData,
                        cache: false,
                        processData: false,
                        contentType: false,
                        enctype: 'multipart/form-data',
                        success: function () {
                            Swal.fire(
                                gettext('Great!'),
                                gettext('The NBS has been saved'),
                                'success'
                            )
                            setTimeout(function () { location.href = "/waterproof_nbs_ca/"; }, 1000);
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
                }
            }
        });
    };
    /** 
     * Validate input file on change
     *
     */
    changeFileEvent = function () {
        $('#restrictedArea').change(function (evt) {
            var file = evt.currentTarget.files[0];
            var size = validFileSize(file);
            if (!size) {
                return;//Invalid file size
            }
            else { //Valid size
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
                                if (!validGeojson) {
                                    $('#restrictedArea').val('');
                                    return;
                                }
                                else {
                                    let validDbf = validateDbfFields(geojson);
                                    if (validDbf) {
                                        Swal.fire({
                                            icon: 'success',
                                            title: gettext('Great!'),
                                            text: gettext('The GeoJSON is valid!'),
                                        })
                                    }
                                    else {
                                        $('#restrictedArea').val('');
                                        return;
                                    }
                                }
                            } catch (e) {
                                Swal.fire({
                                    icon: 'error',
                                    title: gettext('GeoJSON file error'),
                                    text: gettext('Character errors in GeoJSON file'),
                                })
                                $('#restrictedArea').val('');
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
                                    if (!resultFile.valid) {
                                        $('#restrictedArea').val('');
                                        return;
                                    }
                                    else {
                                        shp(contents).then(function (shpToGeojson) {
                                            geojson = shpToGeojson;
                                            let validDbf = validateDbfFields(geojson);
                                            if (validDbf) {
                                                Swal.fire({
                                                    icon: 'success',
                                                    title: gettext('Great!'),
                                                    text: gettext('The shapefile is valid!'),
                                                })
                                            }
                                            else {
                                                $('#restrictedArea').val('');
                                                return;
                                            }
                                        });
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
                                $('#restrictedArea').val('');
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
            }
        });
    };
    /** 
   * Initialize map 
   */
    initMap = function () {
        map = L.map('mapid').setView([51.505, -0.09], 13);

        // Basemap layer
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(map);
        // Countries layer
        let countries = new L.GeoJSON.AJAX(countriesLayerUrl,
            {
                style: defaultStyle,
                onEachFeature: onEachFeature
            }
        );
        countries.addTo(map);

        // When countries layer is loaded fire dropdown event change
        countries.on("data:loaded", function () {
            let mapClick = false;
            // Preload selected country form list view
            $('#countryNBS option[value=' + countryId + ']').attr('selected', true).trigger('click', { mapClick });

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
            $('#countryNBS option[data-value=' + countryCode + ']').attr('selected', true).trigger('click', { mapClick });

            lastClickedLayer = feature.target;
        }
        //map.on('click', onMapClick);
    }
    /** 
   * Get the transformations selected
   * @param {Array} transformations transformations selected
   */
    getTransformationsSelected = function () {
        var transformations = [];
        // Obtención de valores de los check de la solución
        $('input[data-value=itemRT]:checked').each(function () {
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
                url: '/waterproof_nbs_ca/load-currencyByCountry/',
                data: {
                    'country': country_id
                },
                success: function (result) {
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
                        success: function (result) {
                            result = JSON.parse(result);
                            $('#regionLabel').text(result[0].fields.name);

                        }
                    });
                }
            });
        });
    };
    updateCountryMap = function (countryCode) {
        map.eachLayer(function (layer) {
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
    };
    /** 
     * Change acitivy option based in transition selected
     * @param {HTML} transDropdown Transitions dropdown
     * @param {HTML} activDropdown Activities  dropdown
     *
     */
    changeTransitionEvent = function (transDropdown, activDropdown) {
        // Rios transitions dropdown listener
        transDropdown.change(function () {
            // Get load activities from urls Django parameter
            var transition_id = $(this).val();

            /** 
             * Get filtered activities by transition id 
             * @param {String} url   activities URL 
             * @param {Object} data  transition id  
             *
             * @return {String} activities in HTML option format
             */
            $.ajax({
                url: '/waterproof_nbs_ca/load-activityByTransition/',
                data: {
                    'transition': transition_id
                },
                success: function (result) {
                    result = JSON.parse(result);
                    // Empty before poupulate new options
                    activDropdown.empty();
                    $.each(result, function (index, activity) {
                        activDropdown.append($("<option />").val(activity.pk).text(activity.fields.name));
                    });
                    //activDropdown.val($('#' + activDropdown[0].id + ' option:first').val()).change();
                }
            });
        });
    };

    /** 
     * Populate countries options in dropdown 
     * @param {HTML} dropdown Dropdown selected element
     *
     */
    fillCountryDropdown = function (dropdown) {
        $.ajax({
            url: '/waterproof_nbs_ca/load-allCountries',
            success: function (result) {
                result = JSON.parse(result);
                $.each(result, function (index, country) {
                    dropdown.append($("<option />").val(country.pk).text(country.fields.name));
                });
                dropdown.val(countryNbs).change();
            }
        });
    };
    /** 
     * Populate currencies options in dropdown 
     * @param {HTML} dropdown Dropdown selected element
     *
     */
    fillCurrencyDropdown = function (dropdown) {
        $.ajax({
            url: '/waterproof_nbs_ca/load-allCurrencies',
            success: function (result) {
                result = JSON.parse(result);
                $.each(result, function (index, currency) {
                    dropdown.append($("<option />").val(currency.pk).text(currency.fields.code + ' (' + currency.fields.symbol + ') - ' + currency.fields.name));
                });
            }
        });
    };
    /** 
     * Populate transitions options in dropdown 
     * @param {HTML} dropdown Dropdown selected element
     *
     */
    fillTransitionsDropdown = function (dropdown) {
        dropdown.change();
    };
    checkPercentage = function (event, value) {
        commaNum = null;
        let regexp = /^(?=.*[0-9])([0-9]{0,12}(?:,[0-9]{1,2})?)$/gm;
        valid = regexp.test(value);
        // Validate string
        if (valid) {
            let splitedValue = value.split(",");
            let intNumber = parseInt(splitedValue[0]);
            if (intNumber >= 0 && intNumber <= 100)
                return true;
            else
                event.target.value = "100,00";
        }
        else {
            //Remove extra decimals
            value = value.replace(/^(\d+,?\d{0,2})\d*$/, "$1");
            //Remove especial symbols included letters
            value = value.replace(/[^0-9\,]/g, "");
            if (value.match(/,/g) !== null) {
                commaNum = (value.match(/,/g)).length;
                if (commaNum == 1) {
                    let result = value.substring(0, value.indexOf(","));
                    if (result == "") {
                        event.target.value = "";
                        return false;
                    }
                }
            }
            if (commaNum !== null && commaNum > 1) {
                // Remove comma at start or end
                value = value.replace(/^,|,$/g, '');
            }
            event.target.value = value;
            let splitedValue = value.split(",");
            let intNumber = parseInt(splitedValue[0]);
            if (intNumber >= 0 && intNumber <= 100)
                return true;
            else
                event.target.value = "";
        }
    }
    checkDecimalFormat = function (event, value) {
        commaNum = null;
        let regexp = /^(?=.*[1-9])([0-9]{0,12}(?:,[0-9]{1,2})?)$/gm;
        valid = regexp.test(value);
        // Validate string
        if (valid) {
            return true;
        }
        else {
            //Remove extra decimals
            value = value.replace(/^(\d+,?\d{0,2})\d*$/, "$1");
            //Remove especial symbols included letters
            value = value.replace(/[^0-9\,]/g, "");
            if (value.match(/,/g) !== null) {
                commaNum = (value.match(/,/g)).length;
                if (commaNum == 1) {
                    let result = value.substring(0, value.indexOf(","));
                    if (result == "") {
                        event.target.value = "";
                        return false;
                    }
                }
            }
            if (commaNum !== null && commaNum > 1) {
                // Remove comma at start or end
                value = value.replace(/^,|,$/g, '');
            }
            event.target.value = value;
        }
    }

    checkTime = function (event, value) {
        commaNum = null;
        let regexp = /^(?=.*[0-9])([0-9]{0,12}(?:,[0-9]{1,2})?)$/gm;
        valid = regexp.test(value);
        // Validate string
        if (valid) {
            let splitedValue = value.split(",");
            let intNumber = parseInt(splitedValue[0]);
            if (intNumber >= 0 && intNumber <= 200)
                return true;
            else
                event.target.value = "200";
        }
        else {
            //Remove extra decimals
            value = value.replace(/^(\d+,?\d{0,2})\d*$/, "$1");
            //Remove especial symbols included letters
            value = value.replace(/[^0-9]/g, "");
            if (value.match(/,/g) !== null) {
                commaNum = (value.match(/,/g)).length;
                if (commaNum == 1) {
                    let result = value.substring(0, value.indexOf(","));
                    if (result == "") {
                        event.target.value = "";
                        return false;
                    }
                }
            }
            if (commaNum !== null && commaNum > 1) {
                // Remove comma at start or end
                value = value.replace(/^,|,$/g, '');
            }
            event.target.value = value;
            let splitedValue = value.split(",");
            let intNumber = parseInt(splitedValue[0]);
            if (intNumber >= 0 && intNumber <= 200)
                return true;
            else
                event.target.value = "";
        }
    };
    // Init 
    initialize();
});