/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */

$(function () {
    var TILELAYER = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    var IMAGE_LYR_URL = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}";
    var HYDRO_LYR_URL = "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer/tile/{z}/{y}/{x}";
    var CENTER = [4.582, -74.4879];
    var MAXZOOM = 11;
    var table = $('#example').DataTable();
    var countryDropdown = $('#countryNBS');
    var currencyDropdown = $('#currencyCost');
    var transitionsDropdown = $('#riosTransition');
    var transformations = [];
    var lastClickedLayer;
    var map;
    var lyrsPolygons = [];
    var onlyReadPlant = false;
    var loadInfoTree = false;
    var lastGraphId = null;
    var arrayFunction = [];
    var arrayLoadingFunction = [];
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
        onOff: false
    }, {
        graphId: 2,
        normalizeCategory: 'MEZCLARAPIDA',
        onOff: false
    }, {
        graphId: 3,
        normalizeCategory: 'MEZCLALENTA',
        onOff: false
    }, {
        graphId: 4,
        normalizeCategory: 'SEDIMENTACION',
        onOff: false
    }, {
        graphId: 5,
        normalizeCategory: 'FILTRACIONRAPIDACONLECHOMIXTO',
        onOff: false
    }, {
        graphId: 6,
        normalizeCategory: 'FILTRACIONPORMEMBRANANIVEL1',
        onOff: false
    }, {
        graphId: 7,
        normalizeCategory: 'FILTRACIONPORMEMBRANANIVEL2',
        onOff: false
    }, {
        graphId: 8,
        normalizeCategory: 'FILTRACIONPORMEMBRANANIVEL3',
        onOff: false
    }, {
        graphId: 9,
        normalizeCategory: 'FILTRACIONPORMEMBRANANIVEL4',
        onOff: false
    }, {
        graphId: 10,
        normalizeCategory: 'INTERCAMBIOIONICO',
        onOff: false
    }, {
        graphId: 11,
        normalizeCategory: 'DESINFECCION',
        onOff: false
    }, {
        graphId: 12,
        normalizeCategory: 'DOSIFICACION',
        onOff: false
    }, {
        graphId: 13,
        normalizeCategory: 'TRATAMIENTODELODOS',
        onOff: false
    }]
    var letterPlant = null;
    var searchPoints = L.geoJson(null, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(feature.properties.name);
        }
    });
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

            var arrayCsinfra = [];
            $("[name=nameListAdd]").each(function( index ) {
                arrayCsinfra.push({
                    name: $("[name=nameListAdd]").get(index).getAttribute("nameList"),
                    graphId: $("[name=nameListAdd]").get(index).getAttribute("graphIdlist"),
                    csinfra: $("[name=nameListAdd]").get(index).getAttribute("csinfraList"),
                    intake: $("[name=nameListAdd]").get(index).getAttribute("idIntake")
                })
            });

            if(saveForm) {
                var urlDetail = "../../treatment_plants/setHeaderPlant/";
                $.ajax({
                    url: urlDetail,
                    method: 'PUT',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify({
                        "header": {
                            "plantId" : localStorage.plantId,
                            "cityId" : localStorage.idCityTreatmentPlant,
                            "plantName" : $('#idNamePlant').val(),
                            "plantDescription" : $('#idDescriptionPlant').val(),
                            "plantSuggest" : letterPlant,
                            "element" : arrayPlant,
                            "function" : arrayFunction,
                            "csinfra" : arrayCsinfra
                        }
                    }),success: function(result) {
                        window.location.href ="../../treatment_plants/";
                        localStorage.plantId = null;
                    },error: function (err) {
                        localStorage.plantId = null;
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
                $('#idTbodyIntake').append('<tr id="child' + this.value + '"><td class="small text-center vat" name="nameListAdd" idIntake="' + $('option:selected', this).attr("value") + '" nameList="' + textNameCsinfra + '"  graphIdlist="' + $('option:selected', this).attr("graphIdlist") + '"  csinfraList="' + $('option:selected', this).attr("csinfra") + '">' + textNameCsinfra + '</td><td class="small text-center vat">' + $('option:selected', this).attr("intake") + '</td><td class="small text-center vat">' + $('option:selected', this).attr("csinfra") + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + this.value + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
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
            arrayFunction = [];

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
                var arrayCsinfra = [];
                $("[name=nameListAdd]").each(function( index ) {
                    arrayCsinfra.push($("[name=nameListAdd]").get(index).getAttribute("idIntake"))
                });

                $.ajax({
                    url: "../../treatment_plants/getTypePtap/",
                    method: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify({
                        "csinfras": arrayCsinfra
                    }),success: function(result) {
                        localStorage.setItem('csInfra', result);
                        letterPlant = result.resultado.ptap_type;
                        activePlantGraph(letterPlant)
                        setTimeout(function(){
                            document.getElementById("idBackgroundGraph").style.display = "none";
                        },3000);
                    },error: function (err) {
                        localStorage.plantId = null;
                        Swal.fire({
                            title: 'Error',
                            text: "Problemas calculando la planta sugerida",
                            icon: 'error',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                        })
                    }
                });
            }
        });
        initMap();

        $('#createUrl').attr('href','create/' + userCountryId)
        if(localStorage.clonePlant === "true") {
            localStorage.clonePlant = "false";
            document.getElementById("titleFormTreatmentPlant").innerHTML = "Clone Treatment Plant";
            var urlDetail = "../../treatment_plants/getTreatmentPlant/?plantId=" + localStorage.plantId;
            $.getJSON(urlDetail, function (data) {
                localStorage.plantId = null;
                $.each( data.plant, function( key, value ) {
                    document.getElementById("idNamePlant").value = value.plantName + " (Cloned)";                  
                    document.getElementById("idDescriptionPlant").value = value.plantDescription;
                    letterPlant = value.plantSuggest;
                });

                $.each( data.csinfra, function( key, value ) {
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '"><td class="small text-center vat" name="nameListAdd" idIntake="' + value.id + '" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + '"  csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraName + ' - ' + value.csinfraCode + ' - ' + value.csinfraGraphId + '</td><td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + value.csinfraId + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
                });

                $.each( data.element, function( key, value ) {
                    if(value.elementOnOff) {
                        $("[name=disableElement]").each(function( index ) {
                            if(parseInt($("[name=disableElement]").get(index).getAttribute("graphid")) === value.elementGraphId) {
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

                $.each( data.function, function( key, value ) {
                    arrayFunction.push({
                        technology: value.functionTechnology,
                        nameFunction: value.functionName,
                        functionValue: value.functionValue,
                        currency: value.functionCurrency,
                        factor: value.functionFactor,
                        idSubprocess: value.functionIdSubProcess,
                        sedimentsRetained: value.functionSedimentsRetained,
                        nitrogenRetained: value.functionNitrogenRetained,
                        phosphorusRetained: value.functionPhosphorusRetained
                    })
                });

                arrayLoadingFunction = data.function;
                document.getElementById("idBackgroundGraph").style.display = "none";
                loadInfoTree = true;
            });
        }

        if(localStorage.updatePlant === "true") {
            document.getElementById("titleFormTreatmentPlant").innerHTML = "Update Treatment Plant";
            localStorage.updatePlant = "false";
            var urlDetail = "../../treatment_plants/getTreatmentPlant/?plantId=" + localStorage.plantId;
            $.getJSON(urlDetail, function (data) {
                $.each( data.plant, function( key, value ) {
                    document.getElementById("idNamePlant").value = value.plantName;                    
                    document.getElementById("idDescriptionPlant").value = value.plantDescription;
                    letterPlant = value.plantSuggest;
                });

                $.each( data.csinfra, function( key, value ) {
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '"><td class="small text-center vat" name="nameListAdd" idIntake="' + value.id + '" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + '"  csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraName + ' - ' + value.csinfraCode + ' - ' + value.csinfraGraphId + '</td><td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + value.csinfraId + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
                });

                $.each( data.element, function( key, value ) {
                    if(value.elementOnOff) {
                        $("[name=disableElement]").each(function( index ) {
                            if(parseInt($("[name=disableElement]").get(index).getAttribute("graphid")) === value.elementGraphId) {
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

                $.each( data.function, function( key, value ) {
                    arrayFunction.push({
                        technology: value.functionTechnology,
                        nameFunction: value.functionName,
                        functionValue: value.functionValue,
                        currency: value.functionCurrency,
                        factor: value.functionFactor,
                        idSubprocess: value.functionIdSubProcess,
                        sedimentsRetained: value.functionSedimentsRetained,
                        nitrogenRetained: value.functionNitrogenRetained,
                        phosphorusRetained: value.functionPhosphorusRetained
                    })
                });

                arrayLoadingFunction = data.function;
                document.getElementById("idBackgroundGraph").style.display = "none";
                loadInfoTree = true;
            });
        }
        if(localStorage.loadInf === "true") {
            document.getElementById("titleFormTreatmentPlant").innerHTML = "View Treatment Plant";
            localStorage.loadInf = "false";
            var urlDetail = "../../treatment_plants/getTreatmentPlant/?plantId=" + localStorage.plantId;
            $.getJSON(urlDetail, function (data) {
                localStorage.plantId = null;
                
                $.each( data.plant, function( key, value ) {
                    document.getElementById("idNamePlant").value = value.plantName;                    
                    document.getElementById("idDescriptionPlant").value = value.plantDescription;
                    letterPlant = value.plantSuggest;
                });

                $.each( data.csinfra, function( key, value ) {
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '"><td class="small text-center vat" name="nameListAdd" idIntake="' + value.id + '" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + '"  csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraName + ' - ' + value.csinfraCode + ' - ' + value.csinfraGraphId + '</td><td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"></td></tr>');
                });

                $.each( data.element, function( key, value ) {
                    if(value.elementOnOff) {
                        $("[name=disableElement]").each(function( index ) {
                            if(parseInt($("[name=disableElement]").get(index).getAttribute("graphid")) === value.elementGraphId) {
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

                arrayLoadingFunction = data.function;
                document.getElementById("idNamePlant").readOnly = true;
                document.getElementById("idDescriptionPlant").readOnly = true;
                document.getElementById("idIntakePlant").style.display = "none";
                document.getElementById("idSendIntake").style.display = "none";
                document.getElementById("idBackgroundGraph").style.display = "none";
                document.getElementById("submit").style.display = "none";
                
                onlyReadPlant = true;
            });
        }
    };
    activePlantGraph = function(ptapType) {
        $("[name=disableElement]").each(function( index ) {
            if($("[name=disableElement]").get(index).getAttribute("model").indexOf(ptapType) < 0) {
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
    drawPolygons = function(citySearch) {
        lyrsPolygons.forEach(lyr => map.removeLayer(lyr));
        lyrsPolygons = [];
        var bounds;
        intakePolygons.forEach((feature) => {
            if (citySearch.substr(0, 5) == feature.city.substr(0, 5)) {
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

        });
        if (bounds != undefined) {
            map.fitBounds(bounds);
        }

    };
    changeRetained =  function(i, validInput) {
        if(parseInt(validInput.value) < parseInt(validInput.getAttribute("min"))) {
            validInput.value = validInput.getAttribute("min");
        }
        if(parseInt(validInput.value) > parseInt(validInput.getAttribute("max"))) {
            validInput.value = validInput.getAttribute("max");
        }
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
        }

        $("[name=listFunction]").each(function( index ) {
            if($("[name=listFunction]").get(index).style.borderColor !== "rgb(3, 158, 220)") {
                for (var funVar = 0; funVar < arrayFunction.length; funVar++) {
                    if(arrayFunction[funVar].nameFunction === $("[name=listFunction]").get(index).getAttribute("nameFunction") &&
                        arrayFunction[funVar].technology === $("[name=listFunction]").get(index).getAttribute("technology")) {
                        arrayFunction.splice(funVar,1);
                    }
                }
            }
        });
        setTimeout(function(){
            changeStatus(i);
        }, 500);
    };
    viewTree = function(e) {
        var readOnlyTextTree = "";
        if(onlyReadPlant) {
            readOnlyTextTree = "readonly";
        }
        document.getElementById("mainTree").style.visibility = "hidden";
        lastGraphId = e.getAttribute("graphid");
        var urlDetail = "../../treatment_plants/getInfoTree/?plantElement=" + e.getAttribute("plantElement");
        $.getJSON(urlDetail, function (data) {
            var lastSubprocess = "";
            $('#mainTree').html('<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'id' + e.getAttribute("plantElement") + '\', this)" >-</div><div class="text-tree">' + e.getAttribute("nameElement") +'</div><div class="detail-tree"></div></div><div class="margin-main" id="id' + e.getAttribute("plantElement") + '"></div>')
            $.each( data, function( key, value ) {
                if(value.subprocessAddId !== lastSubprocess) {
                    $('#id' + e.getAttribute("plantElement")).html($('#id' + e.getAttribute("plantElement")).html() + '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'subprocess' + value.idSubprocess + '\', this)" >-</div><div class="text-tree">' + value.subprocess + '</div></div><div class="margin-main" id="subprocess' + value.idSubprocess + '"></div>');
                    lastSubprocess = value.subprocessAddId;
                    $.each( data, function( keyTech, valueTech ) {
                        if(value.subprocessAddId === valueTech.subprocessAddId) {
                            $('#subprocess' + value.idSubprocess).html($('#subprocess' + value.idSubprocess).html() + '<div class="title-tree" id="contentTechnology' + valueTech.idSubprocess + '"><div class="point-tree" onclick="viewBranch(\'technology' + valueTech.idSubprocess + '\', this)">-</div><div class="text-tree">' + valueTech.technology + '</div></div><div class="margin-main overflow-form" id="technology' + valueTech.idSubprocess + '"></div>');
                            $.each( data, function( keyCostFunction, valueCostFunction ) {
                                if(valueTech.technologyAddId === valueCostFunction.technologyAddId) {
                                    var loadHtml = true;
                                    var buttonsHtml = "";
                                    var activateHtml = "";
                                    if(onlyReadPlant) {
                                        loadHtml = false;
                                        $.each( arrayLoadingFunction, function( keyLoading, valueLoading ) {
                                            if(valueTech.technology === valueLoading.functionTechnology &&
                                                valueCostFunction.costFunction === valueLoading.functionName) {
                                                loadHtml = true;
                                                valueCostFunction.sedimentsRetained = valueLoading.functionSedimentsRetained;
                                                valueCostFunction.nitrogenRetained = valueLoading.functionNitrogenRetained;
                                                valueCostFunction.phosphorusRetained = valueLoading.functionPhosphorusRetained;
                                                valueCostFunction.costFunction = valueLoading.functionName;
                                                valueCostFunction.function = valueLoading.functionValue;
                                                valueCostFunction.currency = valueLoading.functionCurrency;
                                                valueCostFunction.factor = valueLoading.functionFactor;
                                            }
                                        });
                                    } else if (loadInfoTree) {
                                        $.each( arrayLoadingFunction, function( keyLoading, valueLoading ) {
                                            if(valueTech.technology === valueLoading.functionTechnology &&
                                                valueCostFunction.costFunction === valueLoading.functionName) {
                                                valueCostFunction.sedimentsRetained = valueLoading.functionSedimentsRetained;
                                                valueCostFunction.nitrogenRetained = valueLoading.functionNitrogenRetained;
                                                valueCostFunction.phosphorusRetained = valueLoading.functionPhosphorusRetained;
                                                valueCostFunction.costFunction = valueLoading.functionName;
                                                valueCostFunction.function = valueLoading.functionValue;
                                                valueCostFunction.currency = valueLoading.functionCurrency;
                                                valueCostFunction.factor = valueLoading.functionFactor;
                                                valueTech.idSubprocess = valueLoading.functionIdSubProcess;
                                                valueTech.technology = valueLoading.functionTechnology;
                                                loadHtml = true;
                                            }
                                            buttonsHtml = '<a class="btn btn-info""><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>';
                                            activateHtml = '<div class="point-check" onclick="changeStatus(' + valueTech.idSubprocess + ')"><div name="listFunction" technology="' + valueTech.technology + '" idSubprocess="' + valueTech.idSubprocess + '" nameFunction="' + valueCostFunction.costFunction + '"  function="' + valueCostFunction.function + '" currency="' + valueCostFunction.currency + '" factor="' + valueCostFunction.factor + '" class="change-state-tree" id="id' + valueTech.idSubprocess + '"></div></div>';
                                        });                                                
                                    } else {
                                        loadHtml = true;
                                        buttonsHtml = '<a class="btn btn-info""><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>';
                                        activateHtml = '<div class="point-check" onclick="changeStatus(' + valueTech.idSubprocess + ')"><div name="listFunction"  subProcessMaster="' + value.idSubprocess + '" technology="' + valueTech.technology + '" idSubprocess="' + valueTech.idSubprocess + '" nameFunction="' + valueCostFunction.costFunction + '"  function="' + valueCostFunction.function + '" currency="' + valueCostFunction.currency + '" factor="' + valueCostFunction.factor + '" class="change-state-tree" id="id' + valueTech.idSubprocess + '"></div></div>';
                                    }

                                    if(loadHtml) {
                                        var tableVar = '<div class="container-var" id="idContainerVar"><div><div class="input-var"><div class="form-group"><label>% Transported Water</label><input class="form-control" id="idTransportedWater" value="100" readonly><div class="help-block with-errors"></div></div></div><div class="input-var"><div class="form-group"><label>% Sediments Retained</label><input min="' + valueCostFunction.minimalSedimentsRetained + '" max="' + valueCostFunction.maximalSedimentsRetained + '" ' + readOnlyTextTree + ' value="' + valueCostFunction.sedimentsRetained + '" step="0.0001" type="number" class="form-control" onblur="changeRetained(' + valueTech.idSubprocess + ', this)" id="idSedimentsRetained' + valueTech.idSubprocess + '" placeholder="Enter Ssediments retained" ><div class="help-block with-errors"></div></div></div></div><div><div class="input-var"><div class="form-group"><label>% Nitrogen Retained</label><input min="' + valueCostFunction.minimalNitrogenRetained + '" max="' + valueCostFunction.maximalNitrogenRetained + '"  ' + readOnlyTextTree + ' value="' + valueCostFunction.nitrogenRetained + '"  step="0.0001" type="number" class="form-control" onblur="changeRetained(' + valueTech.idSubprocess + ', this)" id="idNitrogenRetained' + valueTech.idSubprocess + '" placeholder="Enter nitrogen retained"><div class="help-block with-errors"></div></div></div><div class="input-var"><div class="form-group"><label>% Phosphorus Retained</label><input min="' + valueCostFunction.minimalPhosphorusRetained + '" max="' + valueCostFunction.maximalPhosphorusRetained + '"  ' + readOnlyTextTree + ' value="' + valueCostFunction.phosphorusRetained + '"  step="0.0001" type="number" class="form-control" onblur="changeRetained(' + valueTech.idSubprocess + ', this)" id="idPhosphorusRetained' + valueTech.idSubprocess + '" placeholder="Enter phosphorus retained"><div class="help-block with-errors"></div></div></div></div></div>';
                                        var tableFunct = '<table class="table table-striped table-bordered table-condensed" style="width:100%"><thead><tr class="info"><th scope="col" class="small text-center vat">Activate</th><th scope="col" class="small text-center vat">Function name</th><th scope="col" class="small text-center vat">Function</th><th scope="col" class="small text-center vat">Currency</th><th scope="col" class="small text-center vat">Factor</th><th scope="col" class="small text-center vat">Options</th></tr></thead><tbody><tr><td aling="center">' + activateHtml + '</td><td class="small text-center vat">' + valueCostFunction.costFunction + '</td><td class="small text-center vat"><div class="open-popup-form" onclick="document.getElementById(\'popupForm' + valueTech.idSubprocess + '\').style.display=\'block\'">fx</div><div id="popupForm' + valueTech.idSubprocess + '" class="form-popup"><div class="close-form-popup" onclick="document.getElementById(\'popupForm' + valueTech.idSubprocess + '\').style.display=\'none\'">X</div><div class="equation">' + valueCostFunction.function + '</div></div></td><td class="small text-center vat">' + valueCostFunction.currency + '</td><td class="small text-center vat">' + valueCostFunction.factor + '</td><td aling="center">' + buttonsHtml + '</td></tr></tbody></table>';
                                        $('#technology' + valueTech.idSubprocess).html($('#technology' + valueTech.idSubprocess).html() + tableVar + tableFunct);
                                        if(valueCostFunction.default) {
                                            changeStatus(valueTech.idSubprocess)
                                        }
                                    } else {
                                        document.getElementById('contentTechnology' + valueTech.idSubprocess).style.display = "none";
                                        document.getElementById('technology' + valueTech.idSubprocess).style.display = "none";
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
        if(!onlyReadPlant) {
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
                $("[name=listFunction]").each(function( index ) {
                    if($("[name=listFunction]").get(index).getAttribute("id") !== ("id" + i)) {
                        if($("[name=listFunction]").get(index).getAttribute("subProcessMaster") === document.getElementById("id" + i).getAttribute("subProcessMaster")){
                            $("[name=listFunction]").get(index).style.borderColor = "#ffffff";
                            if (document.getElementById($("[name=listFunction]").get(index).id + "1d") !== null) {
                                document.getElementById($("[name=listFunction]").get(index).id + "1d").style.display = "block";
                                for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                                    if(arrayPlant[indexArray].graphId === parseInt(document.getElementById("black" + i).getAttribute("graphId"))) {
                                        arrayPlant[indexArray].onOff = false;
                                    }
                                }
                            }
                        }
                    }
                });
            }
            $("[name=listFunction]").each(function( index ) {
                if($("[name=listFunction]").get(index).style.borderColor === "rgb(3, 158, 220)") {
                    var addFunctionToArray = true;
                    for (var funVar = 0; funVar < arrayFunction.length; funVar++) {
                        if(arrayFunction[funVar].nameFunction === $("[name=listFunction]").get(index).getAttribute("nameFunction") &&
                            arrayFunction[funVar].technology === $("[name=listFunction]").get(index).getAttribute("technology")) {
                            addFunctionToArray = false;
                        }
                    }

                    if(addFunctionToArray) {
                        arrayFunction.push({
                            technology: $("[name=listFunction]").get(index).getAttribute("technology"),
                            nameFunction: $("[name=listFunction]").get(index).getAttribute("nameFunction"),
                            functionValue: $("[name=listFunction]").get(index).getAttribute("function"),
                            currency: $("[name=listFunction]").get(index).getAttribute("currency"),
                            factor: $("[name=listFunction]").get(index).getAttribute("factor"),
                            idSubprocess: $("[name=listFunction]").get(index).getAttribute("idSubprocess"),
                            sedimentsRetained: document.getElementById("idSedimentsRetained" + $("[name=listFunction]").get(index).getAttribute("idSubprocess")).value,
                            nitrogenRetained: document.getElementById("idNitrogenRetained" + $("[name=listFunction]").get(index).getAttribute("idSubprocess")).value,
                            phosphorusRetained: document.getElementById("idPhosphorusRetained" + $("[name=listFunction]").get(index).getAttribute("idSubprocess")).value
                        })
                    }
                } else {
                    for (var funVar = 0; funVar < arrayFunction.length; funVar++) {
                        if(arrayFunction[funVar].nameFunction === $("[name=listFunction]").get(index).getAttribute("nameFunction") &&
                            arrayFunction[funVar].technology === $("[name=listFunction]").get(index).getAttribute("technology")) {
                            arrayFunction.splice(funVar,1);
                        }
                    }
                }
            });
        }
    };
    selectedResultHandler = function (feat) {

        waterproof["cityCoords"] = [feat.geometry.coordinates[1], feat.geometry.coordinates[0]];
        localStorage.setItem('cityCoords', JSON.stringify(waterproof["cityCoords"]));


        searchPoints.eachLayer(function(layer) {
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

        let urlAPI = '{{ SEARCH_COUNTRY_API_URL }}' + countryCode;

        $.get(urlAPI, function(data) {
            $("#regionLabel").html(data.region);
            $("#currencyLabel").html(data.currencies[0].name + " - " + data.currencies[0].symbol);
            $("#listIntakes").show();

            localStorage.setItem('country', country);
            localStorage.setItem('region', data.region);
            localStorage.setItem('currency', data.currencies[0].name + " - " + data.currencies[0].symbol);
        });
    }
    showSearchPoints = function(geojson) {
        console.log(localStorage.getItem('city'))
        searchPoints.clearLayers();
        let geojsonFilter = geojson.features.filter(feature => feature.properties.type == "city");
        searchPoints.addData(geojsonFilter);
        let cityName = geojsonFilter[0].properties.name;
        drawPolygons(cityName);
        table.search(cityName.substr(0, 5)).draw();
    }
    initMap = function () {
        if (typeof $('#mapid').css("width") !== "undefined") {
            map = L.map('mapid', {
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
            var cityNameMap = localStorage.getItem('city').substr(0, 5);

            if (cityCoords == undefined) {
                cityCoords = initialCoords;
            } else {
                initialCoords = JSON.parse(cityCoords);
                drawPolygons(city);
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

            table.search(cityNameMap).draw();

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
        } else {
            document.getElementById("nameCity").innerHTML = localStorage.getItem('city');
            var urlDetail = "../../treatment_plants/getIntakeList/?cityName=" + localStorage.getItem('city');
            $.getJSON(urlDetail, function (data) {
                document.getElementById("idIntakePlant").length = 1;
                $.each( data, function( key, value ) {
                    localStorage.setItem('idCityTreatmentPlant', value.cityId);
                    var option = document.createElement("option");
                    option.text = value.nameIntake;
                    option.setAttribute("value", value.id);
                    option.setAttribute("namelist", value.name);
                    option.setAttribute("graphIdlist", value.graphId);
                    option.setAttribute("intake", value.nameIntake);
                    option.setAttribute("csinfra", value.csinfra);
                    document.getElementById("idIntakePlant").add(option);
                });
            });
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
    sendOptionTable = function() {
        alert(123);
    };
    viewInformationPlant = function(plantId) {
        localStorage.loadInf = "true";
        localStorage.plantId = plantId;
        window.location.href ="../../treatment_plants/create/" + userCountryId;
    };
    updatePlant = function(plantId) {
        localStorage.updatePlant = "true";
        localStorage.plantId = plantId;
        window.location.href ="../../treatment_plants/create/" + userCountryId;
    };
    clonePlant = function(plantId) {
        localStorage.clonePlant = "true";
        localStorage.plantId = plantId;
        window.location.href ="../../treatment_plants/create/" + userCountryId;
    };
    deletePlant = function(plantId) {
        if (confirm("You want delete tratment plant")) {
            var urlDetail = "../../treatment_plants/setHeaderPlant/";
            $.ajax({
                url: urlDetail,
                method: 'DELETE',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    "plantId" : plantId
                }),success: function(result) {
                    window.location.href ="../../treatment_plants/";
                    localStorage.plantId = null;
                },error: function (err) {
                    localStorage.plantId = null;
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
    };
    initialize();
});