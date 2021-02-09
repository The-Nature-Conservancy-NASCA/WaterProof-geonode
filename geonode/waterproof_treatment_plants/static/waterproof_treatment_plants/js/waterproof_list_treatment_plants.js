/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */

$(function () {
    var table = $('#example').DataTable();
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
    var defaultStyle = {
        fillColor: "#337ab7",
        color: "#333333",
        weight: 0.2,
        fillOpacity: 0
    };
    initialize = function () {
        initMap();
        $('#idViewTreeTreatmentPlant').click(function (e) {
            alert(1412)
        });

        $('#idIntakePlant').change(function (e) {
            $('#listSelectIntake').append('<div id="child' + this.value + '" onclick="deleteOption(' + this.value + ')"><div class="delete-intake">X</div><div class="name-intake">' + $(this).find('option').filter(':selected').text() + '</div></div>')
        });

        $('#idSendIntake').click(function (e) {
            if($('#listSelectIntake').html() === "") {
                Swal.fire({
                    title: 'Information?',
                    text: "You have to select a Water Intake!",
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                })
            } else  {
                var urlDetalle = "../../treatment_plants/getTypePtap/";
                $.getJSON(urlDetalle, function (data) {
                    if(data.estado === true) {
                        $("[name=disableElement]").each(function( index ) {
                            if($("[name=disableElement]").get(index).getAttribute("model").indexOf(data.resultado.ptap_type) < 0) {
                                $("[name=disableElement]").get(index).style.display = "block";
                                var idr =  $("[name=disableElement]").get(index).getAttribute("idr");
                                $('#' + idr ).css("background-color", "#20b741");
                            } else {
                                $("[name=disableElement]").get(index).style.display = "none";
                                var idr =  $("[name=disableElement]").get(index).getAttribute("idr");
                                $('#' + idr ).css("background-color", "#b72020");
                            }
                        });
                    }
                });
            }
        });
    };
    deleteOption = function(e) {
        $("#child" + e).remove();
    };
    changeStatus =  function(e) {
        if(e.style.backgroundColor === "#b72020" || e.style.backgroundColor === "rgb(183, 32, 32)") {
            e.style.backgroundColor = "#20b741";
            document.getElementById(e.id + "1d").style.display = "block";
        } else {
            e.style.backgroundColor = "#b72020";
            document.getElementById(e.id + "1d").style.display = "none";
        }
    } ;
    initMap = function () {
        map = L.map('mapid').setView([51.505, -0.09], 13);
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(map);
        let countries = new L.GeoJSON.AJAX(countriesLayerUrl,
            {
                style: defaultStyle
            }
        );
        countries.addTo(map);

        countries.on("data:loaded", function () {
            let mapClick = false;
            updateCountryMap(userCountryCode);
        });
        $('#createUrl').attr('href','create/' + userCountryId)
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
    initialize();
});