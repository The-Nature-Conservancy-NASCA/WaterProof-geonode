/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */
$(function () {
    
    var countryDropdown = $('#countryNBS');
    var currencyDropdown = $('#currencyCost');
    var transitionsDropdown = $('#riosTransition');
    var transformations = [];
    var lastClickedLayer;
    
    //var lyrsPolygons = [];
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
        
        $('#tblIntakes tbody').on('click', '.btn-danger', function (evt) {
            intakeId = evt.currentTarget.getAttribute('data-id');
            var urlCountIntakes = "intakeUsedByPlantsAndStudyCases/?id=" + intakeId;
            var promise = $.ajax({
                url: urlCountIntakes,
                type: 'GET',
                dataType: 'json'
            });
            promise.done(function (data) {
                console.log(this);
                if (data.count > 0) {
                    evt.currentTarget.classList.add("disabled");
                    Swal.fire({
                        text: gettext("This intake is in use by other elements and can't be deleted."),
                    });
                } else{
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
                                    var cityId = 143873; //Default Bogota
                                    if (localStorage.cityId){
                                        cityId = localStorage.cityId;
                                    }
                                    setTimeout(function () { location.href = "/intake/?city="+cityId; }, 1000);
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
                }
            });            
        });        
    };
    
    showSearchPointsFunction = function showSearchPointsIntake(geojson) {
        console.log("showSearchPointsIntake");
        searchPoints.clearLayers();

        let geojsonFilter = geojson.features.filter(feature => feature.properties.type == "city");
        searchPoints.addData(geojsonFilter);        
        let cityName = geojsonFilter[0].properties.name;
        drawPolygons(cityName);
        table.search(cityName.substr(0, 5)).draw();
    }

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
    drawPolygons = function (map) {
        
        var bounds;
        let lf = [];
        listIntakes.forEach(intake => {
            if (intake.geom) {
                let g = JSON.parse(intake.geom);
                f = {'type' : 'Feature', 
                    'properties' : { 'id' : intake.id, 'name' : intake.name}, 
                    'geometry' : g
                };
                lf.push(f);
            }            
        });
        
        if (lf.length > 0){
            lyrIntakes = L.geoJSON(lf, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(`<div class="popup-content">
                                        <div class="leaflet-container">
                                            <b>Id:</b> ${feature.properties.id}
                                        </div>
                                        <div class="popup-body">
                                            <div class="popup-body-content">
                                                <div class="popup-body-content-text">
                                                    <p><b>Name:</b> ${feature.properties.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`);
                }
            }).addTo(map);
            map.fitBounds(lyrIntakes.getBounds());
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