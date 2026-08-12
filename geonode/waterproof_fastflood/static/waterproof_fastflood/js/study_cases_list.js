/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */
$(function() {
    //console.log("Study cases list :: init");    
    var countryDropdown = $('#countryNBS');
    var currencyDropdown = $('#currencyCost');    
    var lastClickedLayer;
    
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
    initialize = function() {

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

        if (localStorage.getItem("intakesByCity") != null){
            localStorage.removeItem("intakesByCity");        
        }

        $('#countryLabelStudy').text(localStorage.getItem('country'));
        $('#cityLabelStudy').text(localStorage.getItem('city'));
        $('#regionLabelStudy').text(localStorage.getItem('region'));
        $('#currencyLabelStudy').text(localStorage.getItem('currencyCode'));

        console.log('init event loaded');

        viewCurrencys = function(id, currency_sc) {
            console.log(currency_sc);
            let lblInfo = gettext('The following exchange rates has been applied for the analysis');
            let quantity = gettext('Quantity');
            let currency = gettext('Currency');
            let exchange = gettext('Exchange');

            html = `<div class="row" id="currencys-panel"> <div class="col-md-12 currency-panel">${lblInfo}</div>
                    <div class="custom-control col-md-3 currency-value">${quantity}</div>
                    <div class="custom-control col-md-4 currency-value">${currency}</div>
                    <div class="custom-control col-md-5 currency-value">${exchange}</div>`;
            $.get("../../study_cases/currencys/", {
                id: id,
                currency: ""
            }, function(data) {
                $.each(data, function(index, currency) {
                    value = parseFloat(currency.value).toFixed(4).replace(".",",");
                    html += '<div class="custom-control col-md-3 currency-value">1 ' + currency_sc + '</div>'
                    html += '<div class="col-md-4 currency-value"><label class="custom-control-label" for="currency">' + currency.currency + '</label></div>'
                    html += '<div class="custom-control col-md-5 currency-value">' + value + '</div>'
                });
                Swal.fire({
                    title: gettext('exchange_rate'),
                    html: html
                })
            })
        };

        $('#tbl-studycases tbody').on('click', '.btn-danger', function (evt) {
            let dataId = evt.currentTarget.getAttribute('data-id');
            let dateCreate = evt.currentTarget.getAttribute('date-create');
            let userId = evt.currentTarget.getAttribute('user-id');
            console.log(userId+'_'+dataId+'_'+dateCreate); // validar que si lo envio bien
            Swal.fire({
                title: gettext('Delete study case'),
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
                    studycaseId = evt.currentTarget.getAttribute('data-id')
                    /** 
                     * Get filtered activities by transition id 
                     * @param {String} url   activities URL 
                     * @param {Object} data  transition id  
                     *
                     * @return {String} activities in HTML option format
                     */
                    $.ajax({
                        url: '/fastflood/studyCase/delete/' + studycaseId,
                        type: 'POST',
                        success: function(result) {
                            //borrar directorios de salida
                            let amp = "&";
                            if (serverApi.indexOf("proxy") >=0){
                                amp = "%26";
                            }
                            let url = `${serverApi}delete?study_case_id=${dataId}${amp}user_id=${userId}${amp}date=${dateCreate}`;
                            doneDeleteAction();

                    },error: function(error) {
                        Swal.fire({
                            icon: 'error',
                            title: gettext('Error!'),
                            text: gettext('The study case has not been deleted, try again!')
                        })
                    }});
                } else if (result.isDenied) {
                    return;
                }
            })
        });
        changeCountryEvent(countryDropdown, currencyDropdown);        
    };

    doneDeleteAction = function(result) {
        Swal.fire({
            icon: 'success',
            title: gettext('Great!'),
            text: gettext('The study case has been deleted')
        })                                   
        if (location.pathname.indexOf("my_cases") >= 0){
            location.href = "/fastflood/studyCase/my_cases/"; 
        }else{
            location.href = "/fastflood/studyCase/?city="+localStorage.cityId; 
        }
    }

    $('#tbl-studycases tbody').on('click', '.btn-public', function (evt) {
        Swal.fire({
            title: gettext('Public study case'),
            text: gettext("Are you sure?"),
            icon: 'warning',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonColor: '#d33',
            denyButtonColor: '#3085d6',
            confirmButtonText: gettext('Yes, public it!'),
            denyButtonText: gettext('Cancel')
        }).then((result) => {
            if (result.isConfirmed) {
                studycaseId = evt.currentTarget.getAttribute('data-id')
                /** 
                 * Get filtered activities by transition id 
                 * @param {String} url   activities URL 
                 * @param {Object} data  transition id  
                 *
                 * @return {String} activities in HTML option format
                 */
                $.ajax({
                    url: '/fastflood/studyCase/public/' + studycaseId,
                    type: 'POST',
                    success: function(result) {
                        Swal.fire({
                            icon: 'success',
                            title: gettext('Great!'),
                            text: gettext('The study case has been public')
                        })
                        setTimeout(function() {
                            city_id = localStorage.cityId;
                            location.href = "/fastflood/studyCase/?city="+localStorage.cityId; 
                        }, 1000);
                    },
                    error: function(error) {
                        Swal.fire({
                            icon: 'error',
                            title: gettext('Error!'),
                            text: gettext('The study case has not been public, try again!')
                        })
                    }
                });
            } else if (result.isDenied) {
                return;
            }
        })
    });

    $('#tbl-studycases tbody').on('click', '.btn-private', function (evt) {
        Swal.fire({
            title: gettext('Private study case'),
            text: gettext("Are you sure?"),
            icon: 'warning',
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonColor: '#d33',
            denyButtonColor: '#3085d6',
            confirmButtonText: gettext('Yes, private it!'),
            denyButtonText: gettext('Cancel')
        }).then((result) => {
            if (result.isConfirmed) {
                studycaseId = evt.currentTarget.getAttribute('data-id')
                /** 
                 * Get filtered activities by transition id 
                 * @param {String} url   activities URL 
                 * @param {Object} data  transition id  
                 *
                 * @return {String} activities in HTML option format
                 */
                $.ajax({
                    url: '/fastflood/studyCase/private/' + studycaseId,
                    type: 'POST',
                    success: function(result) {
                        Swal.fire({
                            icon: 'success',
                            title: gettext('Great!'),
                            text: gettext('The study case has been private')
                        })
                        setTimeout(function() {
                            city_id = localStorage.cityId;
                            location.href = "/fastflood/studyCase/?city="+localStorage.cityId; 
                        }, 1000);
                    },
                    error: function(error) {
                        Swal.fire({
                            icon: 'error',
                            title: gettext('Error!'),
                            text: gettext('The study case has not been private, try again!')
                        })
                    }
                });
            } else if (result.isDenied) {
                return;
            }
        })
    });

    udpateCreateUrl = function(countryId) {
        $('#createUrl').attr('href', 'create/' + countryId)
    };

    /** 
     * Change currency option based in country selected
     * @param {HTML} countryDropdown    Country dropdown
     * @param {HTML} currencyDropdown   Currency  dropdown
     *
     */
    changeCountryEvent = function(countryDropdown, currencyDropdown) {
        // Rios transitions dropdown listener
        countryDropdown.click(function(event, params) {
            // Get load activities from urls Django parameter
            var country_id = $(this).val();
            var countryName = $(this).find(':selected').text();
            var countryCode = $(this).find(':selected').attr('data-value');
            if (params) {
                if (!params.mapClick) {
                    updateCountryMap(countryCode);
                }
            } else {
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
                success: function(result) {
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
                        success: function(result) {
                            result = JSON.parse(result);
                            $('#regionLabel').text(result[0].fields.name);

                        }
                    });
                }
            });
        });
    };
    updateCountryMap = function(countryCode) {
        map.eachLayer(function(layer) {
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

    }

    // Init 
    initialize();

    //draw polygons
    drawPolygons = function (map) {
        
        let lf = [];
        watershedGeoms.forEach(wsg => {
            if (wsg.geom) {
                f = {'type' : 'Feature', 
                    'properties' : { 'id' : wsg.study_case_ids.join(", "), 
                                    'studyCase' : wsg.study_case_names.join(", "),
                                    'watershed' : wsg.intake_name,
                                    'watershedId' : wsg.intake_id}, 
                    'geometry' : wsg.geom
                };
                lf.push(f);
            }            
        });
        
        if (lf.length > 0){
            lyrIntakes = L.geoJSON(lf, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(`<div class="popup-content">
                                        <div class="leaflet-container">
                                            <b>Id</b>: ${feature.properties.id}
                                        </div>
                                        <div class="popup-body">
                                            <div class="popup-body-content">
                                                <div class="popup-body-content-text">
                                                    <p><b>Study Case</b> :${feature.properties.studyCase}</p>
                                                    <p><b>Watershed </b>: ${feature.properties.watershed}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`);
                }
            }).addTo(map);
            map.fitBounds(lyrIntakes.getBounds());
        }
    }

    menu = function() {
        $('.topnav a').click(function() {
            $('#sideNavigation').style.width = "250px";
            $("#main").style.marginLeft = "250px";
        });
    }
});
