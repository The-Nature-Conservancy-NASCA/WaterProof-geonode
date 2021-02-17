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
    var lastGraphId = null;
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
    var arrayPlant = [{
        graphId: 1,
        normalizeCategory: 'PTAP Input',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 2,
        normalizeCategory: 'MEZCLARAPIDA',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 3,
        normalizeCategory: 'MEZCLALENTA',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 4,
        normalizeCategory: 'SEDIMENTACION',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 5,
        normalizeCategory: 'FILTRACIONRAPIDACONLECHOMIXTO',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 6,
        normalizeCategory: 'FILTRACIONPORMEMBRANANIVEL1',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 7,
        normalizeCategory: 'FILTRACIONPORMEMBRANANIVEL2',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 8,
        normalizeCategory: 'FILTRACIONPORMEMBRANANIVEL3',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 9,
        normalizeCategory: 'FILTRACIONPORMEMBRANANIVEL4',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 10,
        normalizeCategory: 'INTERCAMBIOIONICO',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }, {
        graphId: 11,
        normalizeCategory: 'DESINFECCION',
        sedimentsRetained: "0",
        nitrogenRetained: "0",
        phosphorusRetained: "0",
        onOff: false
    }]
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
            var arrayFunction = [];
            $("[name=listFunction]").each(function( index ) {
                if($("[name=listFunction]").get(index).style.borderColor === "rgb(3, 158, 220)") {
                    arrayFunction.push({
                        nameFunction: $("[name=listFunction]").get(index).getAttribute("nameFunction"),
                        functionValue: $("[name=listFunction]").get(index).getAttribute("function"),
                        currency: $("[name=listFunction]").get(index).getAttribute("currency"),
                        factor: $("[name=listFunction]").get(index).getAttribute("factor"),
                        idSubprocess: $("[name=listFunction]").get(index).getAttribute("idSubprocess")
                    })
                }
            });

console.log(arrayFunction);

saveForm = false;

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
                            "plantSuggest" : letterPlant,
                            "element" : arrayPlant
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
                        arrayPlant[0].sedimentsRetained = data.resultado.sedimentsRetained;
                        arrayPlant[0].nitrogenRetained = data.resultado.nitrogenRetained;
                        arrayPlant[0].phosphorusRetained = data.resultado.phosphorusRetained;
                        letterPlant = data.resultado.ptapType;
                        $("[name=disableElement]").each(function( index ) {
                            if($("[name=disableElement]").get(index).getAttribute("model").indexOf(data.resultado.ptapType) < 0) {
                                $("[name=disableElement]").get(index).style.display = "block";
                                var idr =  $("[name=disableElement]").get(index).getAttribute("idr");
                                $('#' + idr ).css("background-color", "#ffffff");
                                $('#' + idr ).css("border-color", "#ffffff");
                            } else {
                                var idr =  $("[name=disableElement]").get(index).getAttribute("idr");
                                for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                                    if(arrayPlant[indexArray].graphId === parseInt($("[name=disableElement]").get(index).getAttribute("graphId"))) {
                                        arrayPlant[indexArray].onOff = true;
                                    }
                                }
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
    changeRetained =  function(e) {
        for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
            if(arrayPlant[indexArray].graphId === parseInt(lastGraphId)) {
                if("idSedimentsRetained" === e.id) {
                    arrayPlant[indexArray].sedimentsRetained = e.value;
                } else if("idNitrogenRetained" === e.id) {
                    arrayPlant[indexArray].nitrogenRetained = e.value;
                } else if("idPhosphorusRetained" === e.id) {
                    arrayPlant[indexArray].phosphorusRetained = e.value;
                }
            }
        }
        console.log(arrayPlant);
    };
    viewTree = function(e) {
        document.getElementById("mainTree").style.visibility = "hidden";
        lastGraphId = e.getAttribute("graphid");
        var urlDetail = "../../treatment_plants/getInfoTree/?plantElement=" + e.getAttribute("plantElement");
        $.getJSON(urlDetail, function (data) {
            var lastSubprocess = "";
            $('#mainTree').html('<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'id' + e.getAttribute("plantElement") + '\', this)" >-</div><div class="text-tree">' + e.getAttribute("nameElement") +'</div><div class="detail-tree">% removal</div></div><div class="margin-main" id="id' + e.getAttribute("plantElement") + '"></div>')
            $.each( data, function( key, value ) {
                
                if(e.getAttribute("plantElement") === "DOSIFICACION" || e.getAttribute("plantElement") === "TRATAMIENTODELODOS") {
                    document.getElementById('idContainerVar').style.display = "none";
                    $('#idTransportedWater').val("100,00")
                    $('#idSedimentsRetained').val("0,00")
                    $('#idNitrogenRetained').val("0,00")
                    $('#idPhosphorusRetained').val("0,00")
                    for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                        if(arrayPlant[indexArray].graphId === parseInt(e.getAttribute("graphid"))) {
                            arrayPlant[indexArray].sedimentsRetained = "0";
                            arrayPlant[indexArray].nitrogenRetained = "0";
                            arrayPlant[indexArray].phosphorusRetained = "0";
                        }
                    }
                } else {
                    document.getElementById('idContainerVar').style.display = "block";
                    $('#idTransportedWater').val("100,00")
                    $('#idSedimentsRetained').val(value.sedimentsRetained)
                    $('#idNitrogenRetained').val(value.nitrogenRetained)
                    $('#idPhosphorusRetained').val(value.phosphorusRetained)

                    for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                        if(arrayPlant[indexArray].graphId === parseInt(e.getAttribute("graphid"))) {
                            arrayPlant[indexArray].sedimentsRetained = value.sedimentsRetained;
                            arrayPlant[indexArray].nitrogenRetained = value.nitrogenRetained;
                            arrayPlant[indexArray].phosphorusRetained = value.phosphorusRetained;
                        }
                    }
                }

                if(value.subprocessAddId !== lastSubprocess) {
                    $('#id' + e.getAttribute("plantElement")).html($('#id' + e.getAttribute("plantElement")).html() + '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'subprocess' + value.idSubprocess + '\', this)" >-</div><div class="text-tree">' + value.subprocess + '</div></div><div class="margin-main" id="subprocess' + value.idSubprocess + '"></div>');
                    lastSubprocess = value.subprocessAddId;
                    $.each( data, function( keyTech, valueTech ) {
                        if(value.subprocessAddId === valueTech.subprocessAddId) {
                            $('#subprocess' + value.idSubprocess).html($('#subprocess' + value.idSubprocess).html() + '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'technology' + valueTech.idSubprocess + '\', this)">-</div><div class="text-tree">' + valueTech.technology + '</div></div><div class="margin-main" id="technology' + valueTech.idSubprocess + '"></div>');
                            $.each( data, function( keyCostFunction, valueCostFunction ) {
                                if(valueTech.technologyAddId === valueCostFunction.technologyAddId) {
                                    $('#technology' + valueTech.idSubprocess).html($('#technology' + valueTech.idSubprocess).html() + 

'<table class="table table-striped table-bordered table-condensed" style="width:100%">'+
'                <thead>'+
'                    <tr class="info">'+
'                        <th scope="col" class="small text-center vat">Function name</th>'+
'                        <th scope="col" class="small text-center vat">Function</th>'+
'                        <th scope="col" class="small text-center vat">Currency</th>'+
'                        <th scope="col" class="small text-center vat">Factor</th>'+
'                        <th scope="col" class="small text-center vat">Options</th>'+
'                    </tr>'+
'                </thead>'+
'                <tbody id="idTbodyIntake">'+
'                       <tr>'+
'                           <td class="small text-center vat">' + valueCostFunction.costFunction + '</td>'+
'                           <td class="small text-center vat"><div class="equation">' + valueCostFunction.function + '</div></td>'+
'                           <td class="small text-center vat">' + valueCostFunction.currency + '</td>'+
'                           <td class="small text-center vat">' + valueCostFunction.factor + '</td>'+
'                           <td aling="center"><a class="btn btn-info""><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>'+
'                           <div class="point-check" onclick="changeStatus(' + valueTech.idSubprocess + ')"><div name="listFunction" idSubprocess="' + valueTech.idSubprocess + '" nameFunction="' + valueCostFunction.costFunction + '"  function="' + valueCostFunction.function + '" currency="' + valueCostFunction.currency + '" factor="' + valueCostFunction.factor + '" class="change-state-tree" id="id' + valueTech.idSubprocess + '"></div></div></td></tr>'+
'                </tbody>'+
'            </table>');
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
                for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                    if(arrayPlant[indexArray].graphId === parseInt(document.getElementById("black" + i).getAttribute("graphId"))) {
                        arrayPlant[indexArray].onOff = false;
                    }
                }
            }
        } else {
            e.style.borderColor = "#039edc";
            if (document.getElementById(e.id + "1d") !== null) {
                document.getElementById(e.id + "1d").style.display = "none";
                for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                    if(arrayPlant[indexArray].graphId === parseInt(document.getElementById("black" + i).getAttribute("graphId"))) {
                        arrayPlant[indexArray].onOff = true;
                    }
                }
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