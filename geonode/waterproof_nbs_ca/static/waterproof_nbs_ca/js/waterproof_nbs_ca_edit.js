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

    function disableInputText() {
        // Función para manejar el cambio en los radio buttons
        console.log("Funciona")
        function handleRadioChange(event) {
            const radioButton = event.target;
            const row = radioButton.closest('tr');
            const radioName = radioButton.name;
            
            const textInputs = row.querySelectorAll('input[type="text"], input[type="number"]');
            
            textInputs.forEach(input => {

                if (input.name === radioName) {
                    input.disabled = false;
                } else {
                    input.disabled = true;
                    input.value = '';
                }
            });
        }
    
        // Función para habilitar inputs al primer click
        function handleFirstClick(event) {
            const radioButton = event.target;
            handleRadioChange(event); 
            
            // Remover el event listener de primer click después de usarlo
            radioButton.removeEventListener('click', handleFirstClick);
            // Agregar el event listener para cambios posteriores
            radioButton.addEventListener('change', handleRadioChange);
        }
        
        // Agregar el event listener de primer click a todos los radio buttons
        const radioButtons = document.querySelectorAll('input[data-value="itemRT"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('click', handleFirstClick);
            
            // Si hay un radio button checked por defecto, habilitar sus inputs correspondientes
            if (radio.checked) {
                handleRadioChange({ target: radio });
            }
        });
    };
    
    var lastClickedLayer;
    initialize = function () {
        disableInputText();
        $('#example').DataTable();
        console.log('init event loaded');
        var dato;
        var countryDropdown = $('#countryNBS');
        var currencyDropdown = $('#currencyCost');
        var transitionsDropdown = $('#riosTransition');
        var activitiesDropdown = $('#riosActivity');
        var loadAreaChecked = $('#loadArea');

        $('#currencyLabel').text($("#currencyCost option:selected").text());
        updateCostLabels($("#currencyCost option:selected").text().substring(1,4));
        updateRegionByCountry($("#countryNBS").val());

        // show/hide div with checkbuttons 
        $("#riosTransition").change(function () {
            dato = $("#riosTransition").val();
            var data_value = $(`#selectlanduse${dato}`).attr('data-value');
            $('div[name=selectlanduse]').each(function (idx, input) {
                $('div[name=selectlanduse]').css({
                    "display": "none"
                });
                var valueInput = input.getAttribute('data-value');
                $('.changeSelectTransition').on('click', function(){
                    if (valueInput !== dato) {
                        $(`#selectlanduse${valueInput}`).find('input[type=radio]:checked').each(function (idx, input) {
                            input.checked = false;
                        });
                    }
                });
            });
            if (dato == data_value) {
                $(`#selectlanduse${dato}`).css({
                    "display": "block"
                })
            }
            else {
                $('div[name=selectlanduse]').find('input[type=radio]:checked').each(function (idx, input) {
                    input.checked = false;
                });
            }
        });
        $("#clear_options").click(function () {
            $('div[name=selectlanduse]').find('input[type=radio]:checked').each(function (idx, input) {
                input.checked = false;
            });
            getManningSelected();
            getInfiltrationSelected();
            const allTextInputs = document.querySelectorAll('input[data-value="itemManning"], input[data-value="itemInfiltration"]');
            allTextInputs.forEach(input => {
                input.value = '';
                input.placeholder = "";
                input.disabled = true;
            });
        });
        // Event to show or hide restricted area edition
        loadAreaChecked.click(function (e) {
            var checked = e.currentTarget.checked;
            if (checked)
                $('#areas').show();
            else
                $('#areas').hide();
        });

        // Populate countries options
        // Populate currencies options
        fillTransitionsDropdown(transitionsDropdown);
        // Change transition dropdown event listener
        changeTransitionEvent(transitionsDropdown, activitiesDropdown);
        // Change country dropdown event listener 
        changeCountryEvent(countryDropdown, currencyDropdown);
        changeCurrencyEvent(currencyDropdown);
        submitFormEvent();
        changeFileEvent();
        initMap();
    };
    submitFormEvent = function () {
        console.log('submit event loaded');
        var formData = new FormData();
        var uploadNewArea = false;
        $('#form').on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                // handle the invalid form...
            } else {
                e.preventDefault();

                // Validate Manning and Infiltration fields
                const validation = validateManningAndInfiltrationFields();
                if (!validation.isValid) {
                    Swal.fire({
                        icon: 'warning',
                        title: gettext('Required fields'),
                        text: validation.message,
                    });
                    return false;
                }
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
                // NBS lulcodes
                formData.append('lulCodes', getLulcode());
                // NBS manning values
                formData.append('manningValues', getManningSelected());
                // NBS infiltration values
                formData.append('infiltrationValues', getInfiltrationSelected());

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
                            url: '/waterproof_nbs_ca/edit/',
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
                            shp(contents).then(function (geojsonResult) {
                                if (geojsonResult.features[0].geometry.type == 'Polygon') {
                                    geojsonResult.name = 'MultiPolygon';
                                    geojsonResult.features.forEach(function (feature) {
                                        feature.geometry.type = 'MultiPolygon';
                                        feature.geometry.coordinates = [feature.geometry.coordinates];
                                    });
                                }
                                var restrictedArea = JSON.stringify(geojsonResult);
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
                                    url: '/waterproof_nbs_ca/edit/' + sbnId,
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
                        url: '/waterproof_nbs_ca/edit/' + sbnId,
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
            var extension = validExtension(file);
            var size = validFileSize(file);
            if (!size) {
                return;//Invalid file size
            }
            else { //Valid size
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
        let center = [4.0, -74.6];
        map = L.map('mapid').setView(center, 7);

        // Basemap layer
        L.tileLayer(OSM_BASEMAP_URL, {
            maxZoom: 20,
            attribution: 'Data \u00a9 <a href="http://www.openstreetmap.org/copyright"> OpenStreetMap Contributors </a> Tiles \u00a9 Komoot'
        }).addTo(map);
        // Countries layer
        let countries = new L.GeoJSON.AJAX(countriesLayerUrl,
            {
                style: defaultStyle,
                onEachFeature: onEachFeature
            }
        );
        countries.addTo(map);
        var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright'}).addTo(map);

        // When countries layer is loaded fire dropdown event change
        countries.on("data:loaded", function () {
            let mapClick = false;
            // Preload selected country form list view
            $('#countryNBS option[value=' + countryId + ']').attr('selected', true).trigger('click', { mapClick });
            if (!disableMap) {
                countryDropdown.val(localStorage.countryCode);
                countryDropdown.trigger('click');
                $.ajax({
                    url: '/parameters/load-currencyByCountry/',
                    data: {
                        'country': localStorage.countryCode
                    },
                    success: function (result) {
                        result = JSON.parse(result);
                        var implementation = parseFloat($('#implementCost').val().replace(/,/g, '.'));
                        var maintenance = parseFloat($('#maintenanceCost').val().replace(/,/g, '.'));
                        var oportunity = parseFloat($('#oportunityCost').val().replace(/,/g, '.'));
                        var implementCost = implementation * result[0].fields.global_multiplier_factor;
                        implementCost = implementCost.toString();
                        implementCost = implementCost.slice(0, (implementCost.indexOf(".")) + 3).replace(".", ",");
                        var maintenanceCost = maintenance * result[0].fields.global_multiplier_factor;
                        maintenanceCost = maintenanceCost.toString();
                        maintenanceCost = maintenanceCost.slice(0, (maintenanceCost.indexOf(".")) + 3).replace(".", ",");
                        var oportunityCost = oportunity * result[0].fields.global_multiplier_factor;
                        oportunityCost = oportunityCost.toString();
                        oportunityCost = oportunityCost.slice(0, (oportunityCost.indexOf(".")) + 3).replace(".", ",");
                        $('#implementCost').val(implementCost);
                        $('#maintenanceCost').val(maintenanceCost);
                        $('#oportunityCost').val(oportunityCost);
                    }
                });
            }
        });

        function onEachFeature(feature, layer) {
            layer.on({
                click: updateDropdownCountry
            });
        }

        function updateDropdownCountry(feature) {
            if (!disableMap) {
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
            else {
                return;
            }
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
        console.log(transformations)
        return transformations;
    };

    /** 
    * Get the manning selected
    * @param {Array} manning manning selected
    */
    getManningSelected = function () {
        var manning = [];
        $('input[data-value=itemManning]').each(function () {
            if ($(this).val() != "") {                
                var lulcode = ["Ice","Water","Forest","Grassland","Agriculture","Urban","Bare area","Shrublands","Sparse vegetation"];
                lulcode.forEach(e => {
                    if ($(this).attr("name").includes(e) && $(this).val() != undefined) {
                        const value=$(this).val().replace(",", ".");
                        const number = parseFloat(value);
                        if (!isNaN(number)) {
                            manning.push(number);
                        } else {
                            console.warn("Valor no permitido", value);
                        }
                    }
                }); 
            }
        });
        console.log(manning);
        return manning;
    };

    /** 
    * Get the infiltration selected
    * @param {Array} infiltration infiltration selected
    */
    getLulcode = function () {
        var lulitem = [];
        $('input[data-value=itemInfiltration]').each(function () {
            if ($(this).val() != "") {                
                var lulcode = ["Ice","Water","Forest","Grassland","Agriculture","Urban","Bare area","Shrublands","Sparse vegetation"];
                lulcode.forEach(e => {
                    if ($(this).attr("name").includes(e)) {
                        lulitem.push( lulcode.indexOf(e));
                    }
                }); 
            }
        });
        console.log(lulitem);
        return lulitem;
    };
    /** 
    * Get the infiltration selected
    * @param {Array} infiltration infiltration selected
    */
    getInfiltrationSelected = function () {
        var infiltration = [];
        var lulitem = [];
        $('input[data-value=itemInfiltration]').each(function () {
            if ($(this).val() != "") {                
                var lulcode = ["Ice","Water","Forest","Grassland","Agriculture","Urban","Bare area","Shrublands","Sparse vegetation"];
                lulcode.forEach(e => {
                    if ($(this).attr("name").includes(e)) {
                        const value=$(this).val().replace(",", ".");
                        infiltration.push(Number(value));
                    }
                }); 
            }
        });
        console.log(infiltration);
        return infiltration;
    };

    /** 
  * Change currency option based in country selected
  * @param {HTML} countryDropdown    Country dropdown
  * @param {HTML} currencyDropdown   Currency  dropdown
  *
  */
    changeCountryEvent = function (countryDropdown, currencyDropdown) {
        // Rios transitions dropdown listener
        countryDropdown.change(function (event, params) {
            // Get load activities from urls Django parameter
            var countryId = $(this).val();
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
            $.ajax({
                url: '/parameters/load-currencyByCountry/',
                data: {
                    'country': countryId
                },
                success: function (result) {
                    result = JSON.parse(result);
                    currencyDropdown.val(result[0].fields.iso3);
                    $('#currencyLabel').text('(' + result[0].fields.currency + ') - ' + result[0].fields.name);
                    $('#countryLabel').text(countryName);                    
                    updateCostLabels(result[0].fields.currency);
                    updateRegionByCountry(countryId);
                }
            });
        });
    };
    changeCurrencyEvent = function (currencyDropdown) {
        currencyDropdown.change(function (event) {
            let currencyText = event.currentTarget.selectedOptions[0].text;
            let currencySplitText = currencyText.split("-");
            let currencyCode = currencySplitText[0].replace(/[{()}]/g, '').replace(" ", "");
            $('#currencyLabel').text(currencyText);
            updateCostLabels(currencyCode);            
        })
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
            url: '/parameters/load-allCountries',
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
     * Populate transitions options in dropdown 
     * @param {HTML} dropdown Dropdown selected element
     *
     */
    fillTransitionsDropdown = function (dropdown) {
        dropdown.change();
    };

    updateRegionByCountry = function(countryId){
        $.ajax({
            url: '/parameters/load-regionByCountry/',
            data: {
                'country': countryId
            },
            success: function (result) {
                result = JSON.parse(result);
                $('#regionLabel').text(result[0].fields.name);

            }
        });
    }

    updateCostLabels = function(currency){
        let lblImplCost = interpolate(gettext("Implementation cost (%s/ha) "), [currency]);
        let lblMaintenanceCost = interpolate(gettext("Maintenace cost (%s/ha) "), [currency]);
        let lblOpportunityCost = interpolate(gettext("Oportunity cost (%s/ha) "), [currency]);
        const span = '<span class="text-danger-wp">(*)</span>';
        $('#implementCostLabel').text(lblImplCost).append(span);
        $('#maintenanceCostLabel').text(lblMaintenanceCost).append(span);
        $('#oportunityCostLabel').text(lblOpportunityCost).append(span);
    }

    // Init 
    initialize();
});