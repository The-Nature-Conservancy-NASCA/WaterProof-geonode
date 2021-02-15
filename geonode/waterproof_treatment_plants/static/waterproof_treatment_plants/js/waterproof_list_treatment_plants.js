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
    var letterPlant = null;
    initialize = function () {
        
        $('#submit').click(function (e) {
            var saveForm = true;
            if($('#idNamePlant').val() === "" || $('#idNamePlant').val() === null) {
                $('#idNamePlant').focusin()
                $('#idNamePlant').focusout()
                saveForm = false;
            }
            if($('#idDescriptionPlant').val() === "" || $('#idDescriptionPlant').val() === null) {
                $('#idDescriptionPlant').focusin()
                $('#idDescriptionPlant').focusout()
                saveForm = false;
            }
            if(letterPlant === null) {
                $('#idIntakePlant').focusin()
                $('#idIntakePlant').focusout()
                saveForm = false;
            }
            if(saveForm) {
                var urlDetail = "../../treatment_plants/setHeaderPlant/";
                $.ajax({
                    url: urlDetail,
                    method: 'PUT',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify({
                        "header": {
                            "plantName" : $('#idNamePlant').val(),
                            "plantDescription" : $('#idDescriptionPlant').val(),
                            "plantSuggest" : letterPlant
                        }
                    }),success: function(result) {
                        window.location.href ="../../treatment_plants/";
                    },error: function (err) {
                        Swal.fire({
                            title: 'Error',
                            text: "Problemas guardando la planta de tratamiento",
                            icon: 'error',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                        })
                    }
                });
            }
        });

        $('#idIntakePlant').change(function (e) {
            var validCsinfra = true;
            var textNameCsinfra = $('option:selected', this).attr("namelist");
            $("[name=nameListAdd]").each(function( index ) {
                if($("[name=nameListAdd]").get(index).getAttribute("nameList") === textNameCsinfra) {
                    validCsinfra = false;
                }
            });
            if(validCsinfra) {
                $('#idTbodyIntake').append('<tr id="child' + this.value + '"><td class="small text-center vat" name="nameListAdd" nameList="' + textNameCsinfra + '">' + textNameCsinfra + '</td><td class="small text-center vat">' + $('option:selected', this).attr("intake") + '</td><td class="small text-center vat">' + $('option:selected', this).attr("csinfra") + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + this.value + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
            } else {
                Swal.fire({
                    title: 'Information',
                    text: "No puedes agregar la fuente hidrica",
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                })
            }            
        });

        $('#idSendIntake').click(function (e) {
            if($('#idTbodyIntake').html().trim() === "") {
                $('#idIntakePlant').focusin()
                $('#idIntakePlant').focusout()
                $("[name=disableElement]").each(function( index ) {
                    $("[name=disableElement]").get(index).style.display = "block";
                    var idr =  $("[name=disableElement]").get(index).getAttribute("idr");
                    $('#' + idr ).css("background-color", "#ffffff");
                    $('#' + idr ).css("border-color", "#ffffff");
                });
                document.getElementById("idBackgroundGraph").style.display = "block";
            } else  {
                var urlDetail = "../../treatment_plants/getTypePtap/";
                letterPlant = null;
                $.getJSON(urlDetail, function (data) {

                    if(data.estado === true) {
                        letterPlant = data.resultado.ptap_type;
                        $("[name=disableElement]").each(function( index ) {
                            if($("[name=disableElement]").get(index).getAttribute("model").indexOf(data.resultado.ptap_type) < 0) {
                                $("[name=disableElement]").get(index).style.display = "block";
                                var idr =  $("[name=disableElement]").get(index).getAttribute("idr");
                                $('#' + idr ).css("background-color", "#ffffff");
                                $('#' + idr ).css("border-color", "#ffffff");
                            } else {
                                $("[name=disableElement]").get(index).style.display = "none";
                                var idr =  $("[name=disableElement]").get(index).getAttribute("idr");
                                $('#' + idr ).css("background-color", "#ffffff");
                                $('#' + idr ).css("border-color", "#039edc");
                            }
                        });
                    }
                });
                setTimeout(function(){
                    document.getElementById("idBackgroundGraph").style.display = "none";
                },3000);
            }
        });
        initMap();
    };
    deleteOption = function(e) {
        $("#child" + e).remove();
    };
    viewBranch = function(e, object) {
        if (document.getElementById(e) !== null) {
            if (document.getElementById(e).style.display === "none") {
                document.getElementById(e).style.display = "block";
                object.innerHTML = "-";
            } else {
                document.getElementById(e).style.display = "none";
                object.innerHTML = "+";
            }
        }
    };
    viewTree = function(e) {
        document.getElementById("mainTree").style.visibility = "hidden";
        var urlDetail = "../../treatment_plants/getInfoTree/?plantElement=" + e.getAttribute("plantElement");
        $.getJSON(urlDetail, function (data) {
            var lastSubprocess = "";
            $('#mainTree').html('<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'id' + e.getAttribute("plantElement") + '\', this)" >-</div><div class="text-tree">' + e.getAttribute("nameElement") +'</div><div class="detail-tree">% removal</div></div><div class="margin-main" id="id' + e.getAttribute("plantElement") + '"></div>')
            $.each( data, function( key, value ) {
                document.getElementById('idContainerVar').style.display = "block";
                $('#idTransportedWater').val(value.transportedWater)
                $('#idSedimentsRetained').val(value.sedimentsRetained)
                $('#idNitrogenRetained').val(value.nitrogenRetained)
                $('#idPhosphorusRetained').val(value.phosphorusRetained)
                if(value.subprocessAddId !== lastSubprocess) {
                    $('#id' + e.getAttribute("plantElement")).html($('#id' + e.getAttribute("plantElement")).html() + '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'subprocess' + value.idSubprocess + '\', this)" >-</div><div class="text-tree">' + value.subprocess + '</div></div><div class="margin-main" id="subprocess' + value.idSubprocess + '"></div>');
                    lastSubprocess = value.subprocessAddId;
                    $.each( data, function( keyTech, valueTech ) {
                        if(value.subprocessAddId === valueTech.subprocessAddId) {
                            $('#subprocess' + value.idSubprocess).html($('#subprocess' + value.idSubprocess).html() + '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'technology' + valueTech.idSubprocess + '\', this)">-</div><div class="text-tree">' + valueTech.technology + '</div></div><div class="margin-main" id="technology' + valueTech.idSubprocess + '"></div>');
                            $.each( data, function( keyCostFunction, valueCostFunction ) {
                                if(valueTech.technologyAddId === valueCostFunction.technologyAddId) {
                                    $('#technology' + valueTech.idSubprocess).html($('#technology' + valueTech.idSubprocess).html() + '<div class="title-tree-form"><div class="point-check" onclick="changeStatus(' + valueTech.idSubprocess + ')"><div class="change-state-tree" id="id' + valueTech.idSubprocess + '"></div></div><div class="text-tree">' + valueCostFunction.costFunction + '</div><div class="equation">' + valueCostFunction.function + '</div></div>');
                                    if(valueCostFunction.default) {
                                        changeStatus(valueTech.idSubprocess)
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }); 
        let MQ = window.MathQuill.getInterface(2);
        setTimeout(function(){
            document.querySelectorAll('.equation').forEach(container => {
                MQ.StaticMath(container);
            });
            document.getElementById("mainTree").style.visibility = "visible";
        }, 2000);

    };
    changeStatus = function(i) {
        var e = document.getElementById("id" + i);
        if(e.style.borderColor === "#039edc" || e.style.borderColor === "rgb(3, 158, 220)") {
            e.style.borderColor = "#ffffff";
            if (document.getElementById(e.id + "1d") !== null) {
                document.getElementById(e.id + "1d").style.display = "block";
            }
        } else {
            e.style.borderColor = "#039edc";
            if (document.getElementById(e.id + "1d") !== null) {
                document.getElementById(e.id + "1d").style.display = "none";
            }
        }
    };
    initMap = function () {
        if (typeof $('#mapid').css("width") !== "undefined") {
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
        }
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