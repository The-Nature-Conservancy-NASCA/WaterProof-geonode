
$(document).ready(function () {
    console.log();
    var osm = L.tileLayer(OSM_BASEMAP_URL, {
        maxZoom: MAXZOOM,
        attribution: 'Data \u00a9 <a href="http://www.openstreetmap.org/copyright"> OpenStreetMap Contributors </a> Tiles \u00a9 Komoot'
    });
    var images = L.tileLayer(IMG_BASEMAP_URL);
    var grayLyr = L.tileLayer(GRAY_BASEMAP_URL, {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });

    var baseLayers = {
        OpenStreetMap: osm,
        Images: images,
        Grayscale: grayLyr,
    };
    
    let initialCoords = CENTER;
    // find in localStorage if cityCoords exist
    var cityCoords = localStorage.getItem('cityCoords');
    var zoom = 5;
    if (cityCoords == undefined) {
        cityCoords = initialCoords;
    } else {
        initialCoords = JSON.parse(cityCoords);
        zoom = 12;
        try {
            $("#countryLabel").html(localStorage.getItem('country'));
            $("#cityLabel").html(localStorage.getItem('city'));
            $("#regionLabel").html(localStorage.getItem('region'));
            $("#currencyLabel").html(localStorage.getItem('currency'));
        } catch (e) {

        }
    }
    waterproof["cityCoords"] = cityCoords;
    map = L.map('map', {
        scrollWheelZoom: false,
        layers: [osm],
        zoomControl: false,
        photonControl: true,        
        zoom: zoom,
        center: initialCoords,
        photonControlOptions: {
            resultsHandler: showSearchPointsFunction,
            selectedResultHandler: selectedCityResultHandler,
            placeholder: gettext('Search City') + '...',
            position: 'topleft', url: SEARCH_CITY_API_URL
        }
    });

    //map.setView(initialCoords, zoom);
    searchPoints.addTo(map);

    L.control.layers(baseLayers, {}, { position: 'topleft' }).addTo(map);
    var defaultExtent = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright'}).addTo(map);
    var zoomControl = new L.Control.Zoom({ position: 'topright' }).addTo(map);

    $(".listStudyCases").click(function () {
        var cityId = localStorage.cityId;
        if (cityId == null) {
            Swal.fire({
                icon: 'warning',
                title: gettext('Search City'),
                text: gettext('Please Search a City in the Map.')
            });
            return;
            cityId = "";
        } else {
            window.location.href = URL_LIST_STUDY_CASES + cityId;
        }
    });

});

var searchPoints = L.geoJson(null, {
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.name);
    }
});

function showSearchPoints(geojson) {
    searchPoints.clearLayers();
    //let geojsonFilter = geojson.features.filter(feature  => (feature.properties.type == "city"));
    searchPoints.addData(geojson);
}


function selectedCityResultHandler(feat) {
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

    let urlAPI = SEARCH_COUNTRY_API_URL + countryCode;
    console.log(urlAPI);

    $.get(urlAPI, function (data) {
        console.log("data in search city is: " + data.region);
        $("#regionLabel").html(data.region);
        $("#currencyLabel").html(data.currencies[0].name + " - " + data.currencies[0].symbol);
        localStorage.setItem('countryCode',data.alpha3Code);
        localStorage.setItem('country', country);
        localStorage.setItem('region', data.region);
        localStorage.setItem('currency', data.currencies[0].name + " - " + data.currencies[0].symbol);
    });

    urlAPI = location.protocol + "//" + location.host + "/parameters/getClosetsCities/?x=" + feat.geometry.coordinates[0] + "&y=" + feat.geometry.coordinates[1];
    $.get(urlAPI, function (data) {

        if (data.length > 0) {
            let filterData = data.filter(c => feat.properties.name.toLocaleLowerCase() == c[1].toLocaleLowerCase());
            let cityData = data[0];
            if (filterData.length > 0) {
                cityData = filterData[0];
            }
            let cityId = cityData[0];
            localStorage.setItem('cityId', cityId);
            localStorage.setItem('factor', cityData[2]);
            if (URL_REFRESH_CITY != '') {
                window.location.href = URL_REFRESH_CITY + cityId;
            }
        }
    });
}