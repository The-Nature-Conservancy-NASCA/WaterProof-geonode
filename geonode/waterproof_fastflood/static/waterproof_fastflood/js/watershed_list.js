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

        if (localStorage.getItem("cityId") == null) {
            localStorage.setItem("cityId", "128587");
            localStorage.setItem("country", "United States");
            localStorage.setItem("currencyCode", "USD");
            localStorage.setItem("countryCode", "USA");
            localStorage.setItem("factor", "1.00");
            localStorage.setItem("city", "Washington");
            localStorage.setItem("cityCoords", "[38.8949924,-77.0365581]");
            localStorage.setItem("region", "North America");
        }

        $('#countryLabelIntake').text(localStorage.getItem('country'));
        $('#cityLabelIntake').text(localStorage.getItem('city'));
        $('#regionLabelIntake').text(localStorage.getItem('region'));
        $('#currencyLabelIntake').text(localStorage.getItem('currencyCode'));
        
        $('#tblIntakes tbody').on('click', '.btn-danger', function (evt) {
            watershedId = evt.currentTarget.getAttribute('data-id');
            var urlCount = "watershedUsedByStudyCases/" + watershedId;
            var promise = $.ajax({
                url: urlCount,
                type: 'GET',
                dataType: 'json'
            });
            promise.done(function (data) {
                console.log(this);
                if (data.count > 0) {
                    evt.currentTarget.classList.add("disabled");
                    Swal.fire({
                        text: gettext("This Watershed is in use by other elements and can't be deleted."),
                    });
                } else{
                    Swal.fire({
                        title: gettext('Delete Watershed'),
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
                                url: '/fastflood/delete/' + watershedId,
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
                                    setTimeout(function () { location.href = "/fastflood/?city="+cityId; }, 1000);
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
        
        $('#tblIntakes tbody').on('click', '.btn-info', function (evt) {
            let watershedId = evt.currentTarget.getAttribute('data-id');
            var urlCountIntakes = "watershedUsedByStudyCases/" + watershedId;
            var promise = $.ajax({
                url: urlCountIntakes,
                type: 'GET',
                dataType: 'json'
            });
            promise.done(function (data) {
                console.log(this);
                if (data.count <= 0){
                    window.location.href = "/fastflood/edit/"+watershedId;
                }
                
                else{
                    evt.currentTarget.classList.add("disabled");
                    Swal.fire({
                        text: gettext("This watershed is in use by other elements and can't be edited."),
                    })
                    window.location.href = "#";
                }
                
            });            
        });

        $(".watershed-status").on("click", function (e) {
            dataId = e.currentTarget.getAttribute("data-id");
            if (localStorage.getItem("watershedId") != null && localStorage.getItem("watershedId") == dataId) {
                taskId = localStorage.getItem("watershedTaskId");
                urlQueryTask = 'https://dev.water-proof.org/wp-fastflood/tasks/' + taskId;
                $.ajax({
                    url: urlQueryTask,
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == "pending" || data.status == "running") {
                            Swal.fire({
                                icon: 'warning',
                                title: gettext('Warning!'),
                                text: gettext('The task is running, please wait until it finishes')
                            })
                        } else {
                            localStorage.removeItem("watershedId");
                            localStorage.removeItem("watershedTaskId");
                            localStorage.removeItem("watershedStatus");
                            console.log("localStorage watershed vars removed");                            
                        }
                    }
                });
            }
        });   

    }
    
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
        watershedGeoms.forEach(wsg => {
            if (wsg.geom) {
                f = {'type' : 'Feature', 
                    'properties' : { 'id' : wsg.id, 'name' : wsg.name}, 
                    'geometry' : wsg.geom
                };
                lf.push(f);
            }            
        });
        
        if (lf.length > 0){
            lyrWatersheds = L.geoJSON(lf, {
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
            map.fitBounds(lyrWatersheds.getBounds());
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