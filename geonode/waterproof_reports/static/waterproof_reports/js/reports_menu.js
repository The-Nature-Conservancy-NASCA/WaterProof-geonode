/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */
 $(function () {
    var table = $('#example').DataTable({
        'dom': 'lrtip'
    });
    var countryDropdown = $('#countryNBS');
    var currencyDropdown = $('#currencyCost');
    var transitionsDropdown = $('#riosTransition');
    var transformations = [];
    var lastClickedLayer;
    var map;
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
        $('.btn-danger').click(function (evt) {
            Swal.fire({
                title: gettext('Delete intake'),
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
                    intakeId = evt.currentTarget.getAttribute('data-id')
                    /** 
                     * Get filtered activities by transition id 
                     * @param {String} url   activities URL 
                     * @param {Object} data  transition id  
                     *
                     * @return {String} activities in HTML option format
                     */
                    $.ajax({
                        url: '/intake/delete/' + intakeId,
                        type: 'POST',
                        success: function (result) {
                            Swal.fire({
                                icon: 'success',
                                title: gettext('Great!'),
                                text: gettext('The intake has been deleted')
                            })
                            if (localStorage.cityId){
                                cityId = localStorage.cityId;
                            }
                            setTimeout(function() { location.href = "/intake/?city="+cityId; }, 1000);
                        },
                        error: function (error) {
                            Swal.fire({
                                icon: 'error',
                                title: gettext('Error!'),
                                text: gettext('The intake has not been deleted, try again!')
                            })
                        }
                    });
                } else if (result.isDenied) {
                    return;
                }
            })
        });
        initMap();
    };
    /** 
     * Initialize map 
     */

    TILELAYER = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    IMAGE_LYR_URL = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}";
    HYDRO_LYR_URL = "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer/tile/{z}/{y}/{x}";
    CENTER = [4.582, -74.4879];
    MAXZOOM = 11;

    initMap = function () {

        map = L.map('mapidcuenca', {
            scrollWheelZoom: false,
            zoomControl: false,
            photonControl: true,
            photonControlOptions: {
                resultsHandler: showSearchPoints,
                selectedResultHandler: selectedResultHandler,
                placeholder: 'Search City...',
                position: 'topleft',
                url: SEARCH_CITY_API_URL
            }
        });
        let initialCoords = CENTER;
        // find in localStorage if cityCoords exist
        var cityCoords = localStorage.getItem('cityCoords');
        var city = localStorage.getItem('city');
        var initialZoom = 5;
       if(localStorage.length != 0){
           console.log(localStorage.length)
        var cityNameMap = localStorage.getItem('city').substr(0, 5);
       } else{
        var cityNameMap = localStorage.getItem('');
       }

        if (cityCoords == undefined) {
            table.search(cityNameMap).draw();
            cityCoords = initialCoords;
        } else {
            initialCoords = JSON.parse(cityCoords);
            drawPolygons(city);
            table.search(cityNameMap).draw();
            initialZoom = 9;
            try {
                $("#countryLabel").html(localStorage.getItem('country'));
                $("#cityLabel").html(localStorage.getItem('city'));
                $("#regionLabel").html(localStorage.getItem('region'));
                $("#currencyLabel").html(localStorage.getItem('currency'));
                $("#listIntakes").show();
            } catch (e) {

            }

        }
        waterproof["cityCoords"] = cityCoords;

        map.setView(initialCoords, initialZoom);

        searchPoints.addTo(map);

        var tilelayer = L.tileLayer(TILELAYER, { maxZoom: MAXZOOM, attribution: 'Data \u00a9 <a href="http://www.openstreetmap.org/copyright"> OpenStreetMap Contributors </a> Tiles \u00a9 Komoot' }).addTo(map);
        var images = L.tileLayer(IMAGE_LYR_URL);


        var hydroLyr = L.tileLayer(HYDRO_LYR_URL);

        var baseLayers = {
            OpenStreetMap: tilelayer,
            Images: images,
            /* Grayscale: gray,   */
        };

        var overlays = {
            "Hydro (esri)": hydroLyr,
        };


        var zoomControl = new L.Control.Zoom({ position: 'topright' }).addTo(map);
        L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);

        //var c = new L.Control.Coordinates();        
        //c.addTo(map);


        function onMapClick(e) {
            // c.setCoordinates(e);
        }
        map.on('click', onMapClick);
    }

    var searchPoints = L.geoJson(null, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name);
        }
    });

    function showSearchPoints(geojson) {
        console.log(localStorage.getItem('city'))
        searchPoints.clearLayers();

        let geojsonFilter = geojson.features.filter(feature => feature.properties.type == "city");
        searchPoints.addData(geojsonFilter);
        //let cityName = null
        /*if (cityCoords == undefined){
             cityName = geojsonFilter[0].properties.name;
        }else{
            cityName = localStorage.getItem('city')
        }*/
        let cityName = geojsonFilter[0].properties.name;
        //table.search(localStorage.getItem('city').substr(0, 2)).draw();
        drawPolygons(cityName);
        table.search(cityName.substr(0, 5)).draw();
    }

    function selectedResultHandler(feat) {

        waterproof["cityCoords"] = [feat.geometry.coordinates[1], feat.geometry.coordinates[0]];
        localStorage.setItem('cityCoords', JSON.stringify(waterproof["cityCoords"]));


        searchPoints.eachLayer(function (layer) {
            if (layer.feature.properties.osm_id != feat.properties.osm_id) {
                layer.remove();
            }
        });
        let country = feat.properties.country;
        let cityName = feat.properties.name;
        let countryCode = feat.properties.countrycode.toLowerCase();

        $("#countryLabel").html(country);
        $("#cityLabel").html(cityName);
        localStorage.setItem('city', cityName);

        drawPolygons(cityName);
        table.search(cityName.substr(0, 5)).draw();
        
        let urlAPI = SEARCH_COUNTRY_API_URL + countryCode;
        console.log(urlAPI)

        $.get(urlAPI, function(data){
            console.log("data en intakes es:"+data.region);
            $("#regionLabel").html(data.region);
            $("#currencyLabel").html(data.currencies[0].name + " - " + data.currencies[0].symbol);
            $("#listIntakes").show();
            
            localStorage.setItem('country', country);
            localStorage.setItem('region', data.region);
            localStorage.setItem('currency', data.currencies[0].name + " - " + data.currencies[0].symbol);
        });
    }

    udpateCreateUrl = function (countryId) {
        $('#createUrl').attr('href', 'create/' + countryId)
    };

    $('createUrlDisabled').html('<a>{% trans "Debe ser un usuario registrado para realizar esta acción" %}</a>' ); 


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

    //draw polygons
    drawPolygons = function (citySearch) {
        lyrsPolygons.forEach(lyr => map.removeLayer(lyr));
        lyrsPolygons = [];
        var bounds;
        intakePolygons.forEach((feature) => {
            if (citySearch.substr(0, 5) == feature.city.substr(0, 5)) {
                if (feature.polygon !== 'None' && feature.polygon != '') {
                    let poly = feature.polygon;
                    if (poly.indexOf("SRID") >= 0) {
                        poly = poly.split(";")[1];
                    }
                    var lyrPoly = omnivore.wkt.parse(poly).addTo(map);
                    lyrsPolygons.push(lyrPoly);
                    if (bounds == undefined) {
                        bounds = lyrPoly.getBounds();
                    } else {
                        bounds = bounds.extend(lyrPoly.getBounds());
                    }
                }
            }
        });
        if (bounds != undefined) {
            map.fitBounds(bounds);
        }

    }

    menu = function () {
        $('.topnav a').click(function () {
            $('#sideNavigation').style.width = "250px";
            $("#main").style.marginLeft = "250px";
        });
    }

    // Init 
    initialize();

});