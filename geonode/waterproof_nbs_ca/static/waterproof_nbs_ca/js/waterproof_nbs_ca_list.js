/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */
$(function () {

    var search;
    var lastClickedLayer;
    var map;
    var currentCountryFilter = null; // Variable to store current country filter

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
        'searching': true,  // Enable searching to allow custom filters
        'dom': 'lrtip',     // Hide search box but keep other elements (length, processing, info, pagination)
        'columnDefs': [{
            "targets": [11],
            'orderable': false,
        },
        {
            "targets": [4],
            "visible": false,
        }],
        'language': {
            url: urlJson
        },
        'drawCallback': function() {
            // Re-initialize tooltips after each table redraw (pagination, filtering, etc.)
            // Tooltips for disabled delete buttons with custom class for wider display
            $('span[data-toggle="tooltip"][title*="Cannot delete"]').tooltip({
                template: '<div class="tooltip tooltip-delete-disabled" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
            });
            // Regular tooltips for other buttons
            $('[data-toggle="tooltip"]:not([title*="Cannot delete"])').tooltip();
        }
    });


    initialize = function () {
        console.log('init event loaded');
        // Transformations widget change option event
        $('#menu-toggle').click(function (e) {
            e.preventDefault();
            $('#wrapper').toggleClass('toggled');
        });

        $('#regionLabel').text(localStorage.getItem('region') == undefined ? '' : localStorage.getItem('region'));
        $('#currencyLabel').text('(' + (localStorage.getItem('currencyCode') == undefined ? '' : localStorage.getItem('currencyCode')) + ')');

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
            // Check if NBS is referenced
            const isReferenced = evt.currentTarget.getAttribute('data-referenced') === 'true';

            if (isReferenced) {
                // Show info message about why it cannot be deleted
                Swal.fire({
                    icon: 'info',
                    title: gettext('Cannot Delete'),
                    text: gettext('This NBS is being used by one or more study cases and cannot be deleted. Please remove it from the study cases first.'),
                    confirmButtonText: gettext('OK')
                });
                return; // Stop execution
            }

            // Original delete confirmation
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
                            let errorMessage = gettext('The NBS has not been deleted, try again!');

                            // Check if server provided a specific reason
                            if (error.responseJSON && error.responseJSON.reason) {
                                errorMessage = error.responseJSON.reason;
                            }

                            Swal.fire({
                                icon: 'error',
                                title: gettext('Error!'),
                                text: errorMessage
                            });
                        }
                    });
                } else if (result.isDenied) {
                    return;
                }
            })
        });
        
        
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

        // Initialize Bootstrap tooltips
        // Tooltips for disabled delete buttons with custom class for wider display
        $('span[data-toggle="tooltip"][title*="Cannot delete"]').tooltip({
            template: '<div class="tooltip tooltip-delete-disabled" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
        // Regular tooltips for other buttons
        $('[data-toggle="tooltip"]:not([title*="Cannot delete"])').tooltip();
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

        // Define filter function
        function filterTableByCountry(countryCode) {
            console.log('filterTableByCountry called with:', countryCode);

            // Update the global filter variable
            currentCountryFilter = countryCode;

            // Use DataTables search with a custom function
            $.fn.dataTable.ext.search = [];  // Clear previous search functions

            if (countryCode) {
                // Add custom search function
                $.fn.dataTable.ext.search.push(
                    function(settings, data, dataIndex) {
                        // Only apply to our table
                        if (settings.nTable.id !== 'tblNbs') {
                            return true;
                        }

                        var row = $(settings.aoData[dataIndex].nTr);
                        var rowCountryIso3 = row.data('country-iso3');
                        var rowRole = row.data('user-role');
                        // Show USA or matching country
                        return rowRole == 'ADMIN' || rowCountryIso3 === countryCode;
                    }
                );
            }

            // Redraw the table to apply the filter
            table.draw();

            console.log('Filtering completed');
        }

        // When countries layer is loaded fire dropdown event change
        countries.on("data:loaded", function (evt) {
            if (userCountryCode == undefined) {
                userCountryCode = localStorage.getItem('countryCode');
            }
            let center = updateCountryMap(userCountryCode, evt.target);
            updateGeographicLabels(userCountryCode);

            // Filter table by initial country
            filterTableByCountry(userCountryCode);

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
            let layerClicked = feature.target;
            if (lastClickedLayer) {
                lastClickedLayer.setStyle(defaultStyle);
            }
            layerClicked.setStyle(highlighPolygon);
            let countryCode = feature.sourceTarget.feature.id;
            //localStorage.countryCode = countryCode;

            // Filter table by country iso3
            filterTableByCountry(countryCode);

            updateGeographicLabels(countryCode);
            lastClickedLayer = feature.target;
        }        
    }
    
    /**
     * Fetch country data by ISO3 code
     * @param {string} code - ISO3 country code
     * @returns {Promise<Array>} Country data
     */
    async function fetchCountryByCode(code) {
        const response = await fetch(`/parameters/load-countryByCode/?code=${code}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return typeof data === 'string' ? JSON.parse(data) : data;
    }

    /**
     * Fetch region data by country ISO3
     * @param {string} countryIso - ISO3 country code
     * @returns {Promise<Array>} Region data
     */
    async function fetchRegionByCountry(countryIso) {
        const response = await fetch(`/parameters/load-regionByCountry/?country=${countryIso}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return typeof data === 'string' ? JSON.parse(data) : data;
    }

    /**
     * Fetch currency data by country ISO3
     * @param {string} countryIso - ISO3 country code
     * @returns {Promise<Array>} Currency data
     */
    async function fetchCurrencyByCountry(countryIso) {
        const response = await fetch(`/parameters/load-currencyByCountry/?country=${countryIso}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return typeof data === 'string' ? JSON.parse(data) : data;
    }

    /**
     * Update a single cost cell with formatting
     * @param {number} rowIndex - Row index
     * @param {number} columnIndex - Column index
     * @param {string|number} value - Original value
     * @param {number} factor - Multiplier factor
     */
    function updateCostCell(rowIndex, columnIndex, value, factor) {
        const numericValue = parseFloat(value);
        const newValue = (numericValue * factor).toFixed(2);
        $(table.cell({ row: rowIndex, column: columnIndex }).node()).html(newValue);
    }

    /**
     * Update table costs based on country and user role
     * @param {string} countryName - Country name
     * @param {string} countryIso3 - ISO3 country code
     * @param {number} multiplicatorFactor - Global multiplier factor
     */
    function updateTableCosts(countryName, countryIso3, multiplicatorFactor) {
        const search = table.search('(ADMIN|' + countryName + ')', true, true);
        const filteredData = search.rows({ search: 'applied' }).data();
        const filterIndexes = search.rows({ search: 'applied' }).indexes();

        for (let index = 0; index < filteredData.length; index++) {
            const userRole = filteredData[index][4];
            const rowIndex = filterIndexes[index];

            if (userRole === 'ADMIN') {
                if (countryIso3 === 'USA') {
                    // Show original values for USA
                    updateCostCell(rowIndex, 7, filteredData[index][7], 1);
                    updateCostCell(rowIndex, 8, filteredData[index][8], 1);
                    updateCostCell(rowIndex, 9, filteredData[index][9], 1);
                } else {
                    // Apply multiplier factor for other countries
                    updateCostCell(rowIndex, 7, filteredData[index][7], multiplicatorFactor);
                    updateCostCell(rowIndex, 8, filteredData[index][8], multiplicatorFactor);
                    updateCostCell(rowIndex, 9, filteredData[index][9], multiplicatorFactor);
                }
                // Update country column
                $(table.cell({ row: rowIndex, column: 5 }).node()).html(countryName);
            }

            if (userRole === 'ANALYS') {
                if (countryIso3 === 'USA') {
                    // Show original values for USA
                    updateCostCell(rowIndex, 7, filteredData[index][7], 1);
                    updateCostCell(rowIndex, 8, filteredData[index][8], 1);
                    updateCostCell(rowIndex, 9, filteredData[index][9], 1);
                    $(table.cell({ row: rowIndex, column: 5 }).node()).html(countryName);
                }
            }
        }

        search.draw();
    }

    /**
     * Update geographic labels and costs based on selected country
     * @param {string} countryCode - ISO3 country code
     */
    updateGeographicLabels = async function (countryCode) {
        try {
            // Fetch country data
            const countryData = await fetchCountryByCode(countryCode);

            if (!countryData || countryData.length === 0) {
                console.error('No country data found for code:', countryCode);
                return;
            }

            const country = countryData[0];
            const countryFields = country.fields;
            const multiplicatorFactor = parseFloat(countryFields.global_multiplier_factor);

            // Update country label
            $('#countryLabel').text(countryFields.name);

            // Update table costs
            updateTableCosts(countryFields.name, countryFields.iso3, multiplicatorFactor);

            // Fetch region and currency in parallel
            const [regionData, currencyData] = await Promise.all([
                fetchRegionByCountry(countryFields.iso3),
                fetchCurrencyByCountry(countryFields.iso3)
            ]);

            // Update region label
            if (regionData && regionData.length > 0) {
                $('#regionLabel').text(regionData[0].fields.name);
            } else {
                $('#regionLabel').text("");
            }

            // Update currency label
            if (currencyData && currencyData.length > 0) {
                $('#currencyLabel').text('(' + currencyData[0].fields.currency + ') - ' + currencyData[0].fields.name);
                $("#countryNBS").val(localStorage.countryCode);
            }

        } catch (error) {
            console.error('Error updating geographic labels:', error);
            // Optionally show user-friendly error message
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: gettext('Error'),
                    text: gettext('Failed to update country information'),
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        }
    }
    udpateCreateUrl = function (countryId) {
        $('#createUrl').attr('href', 'create/' + countryId);
        $('#nbs-createUrl').attr('href', 'create/' + countryId);
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
        
    // Init 
    initialize();
});