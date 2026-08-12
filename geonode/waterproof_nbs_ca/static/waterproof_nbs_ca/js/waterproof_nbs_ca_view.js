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
                    input.disabled = true;
                } else {
                    input.disabled = true;
                    input.value = '';
                }
            });
        }
    
        // Función para habilitar inputs al primer click
        function handleFirstClick(event) {
            const radioButton = event.target;
            handleRadioChange(event); // Ejecutar la lógica normal
            
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
        

        // Populate countries options
        // Populate currencies options
        fillTransitionsDropdown(transitionsDropdown);
        // Change transition dropdown event listener
        changeTransitionEvent(transitionsDropdown, activitiesDropdown);
        // Change country dropdown event listener 
        changeCountryEvent(countryDropdown, currencyDropdown);
        changeCurrencyEvent(currencyDropdown);
        initMap();
    };

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
                    if (e == $(this).attr("name").slice(0, -2)) {
                        const value=$(this).val().replace(",", ".");
                        manning.push(Number(value));
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
                    if (e == $(this).attr("name").slice(0, -2)) {
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
                    if (e == $(this).attr("name").slice(0, -2)) {
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