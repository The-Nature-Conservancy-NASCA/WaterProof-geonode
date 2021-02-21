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

            var arrayCsinfra = [];
            $("[name=nameListAdd]").each(function( index ) {
                arrayCsinfra.push({
                    name: $("[name=nameListAdd]").get(index).getAttribute("nameList"),
                    graphId: $("[name=nameListAdd]").get(index).getAttribute("graphIdlist"),
                    csinfra: $("[name=nameListAdd]").get(index).getAttribute("csinfraList")
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
                $('#idTbodyIntake').append('<tr id="child' + this.value + '"><td class="small text-center vat" name="nameListAdd" nameList="' + textNameCsinfra + '"  graphIdlist="' + $('option:selected', this).attr("graphIdlist") + '"  csinfraList="' + $('option:selected', this).attr("csinfra") + '">' + textNameCsinfra + '</td><td class="small text-center vat">' + $('option:selected', this).attr("intake") + '</td><td class="small text-center vat">' + $('option:selected', this).attr("csinfra") + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + this.value + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
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
                var urlDetail = "../../treatment_plants/getTypePtap/";
                letterPlant = null;
                $.getJSON(urlDetail, function (data) {
                    if(data.estado === true) {
                        letterPlant = data.resultado.ptapType;
                        activePlantGraph(data.resultado.ptapType)
                    }
                });
                setTimeout(function(){
                    document.getElementById("idBackgroundGraph").style.display = "none";
                },3000);
            }
        });
        initMap();


        if(localStorage.clonePlant === "true") {
            localStorage.clonePlant = "false";
            var urlDetail = "../../treatment_plants/getTreatmentPlant/?plantId=" + localStorage.plantId;
            $.getJSON(urlDetail, function (data) {
                localStorage.plantId = null;
                $.each( data.plant, function( key, value ) {
                    document.getElementById("idNamePlant").value = value.plantName + " (Copy)";                  
                    document.getElementById("idDescriptionPlant").value = value.plantDescription;
                    letterPlant = value.plantSuggest;
                });

                $.each( data.csinfra, function( key, value ) {
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '"><td class="small text-center vat" name="nameListAdd" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + '"  csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraName + ' - ' + value.csinfraCode + ' - ' + value.csinfraGraphId + '</td><td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + value.csinfraId + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
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
            localStorage.updatePlant = "false";
            var urlDetail = "../../treatment_plants/getTreatmentPlant/?plantId=" + localStorage.plantId;
            $.getJSON(urlDetail, function (data) {
                $.each( data.plant, function( key, value ) {
                    document.getElementById("idNamePlant").value = value.plantName;                    
                    document.getElementById("idDescriptionPlant").value = value.plantDescription;
                    letterPlant = value.plantSuggest;
                });

                $.each( data.csinfra, function( key, value ) {
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '"><td class="small text-center vat" name="nameListAdd" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + '"  csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraName + ' - ' + value.csinfraCode + ' - ' + value.csinfraGraphId + '</td><td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + value.csinfraId + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
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
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '"><td class="small text-center vat" name="nameListAdd" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + '"  csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraName + ' - ' + value.csinfraCode + ' - ' + value.csinfraGraphId + '</td><td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"></td></tr>');
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
    changeRetained =  function(i) {
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
            $('#mainTree').html('<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'id' + e.getAttribute("plantElement") + '\', this)" >-</div><div class="text-tree">' + e.getAttribute("nameElement") +'</div><div class="detail-tree">% removal</div></div><div class="margin-main" id="id' + e.getAttribute("plantElement") + '"></div>')
            $.each( data, function( key, value ) {
                if(value.subprocessAddId !== lastSubprocess) {
                    $('#id' + e.getAttribute("plantElement")).html($('#id' + e.getAttribute("plantElement")).html() + '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'subprocess' + value.idSubprocess + '\', this)" >-</div><div class="text-tree">' + value.subprocess + '</div></div><div class="margin-main" id="subprocess' + value.idSubprocess + '"></div>');
                    lastSubprocess = value.subprocessAddId;
                    $.each( data, function( keyTech, valueTech ) {
                        if(value.subprocessAddId === valueTech.subprocessAddId) {
                            $('#subprocess' + value.idSubprocess).html($('#subprocess' + value.idSubprocess).html() + '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'technology' + valueTech.idSubprocess + '\', this)">-</div><div class="text-tree">' + valueTech.technology + '</div></div><div class="margin-main" id="technology' + valueTech.idSubprocess + '"></div>');
                            $.each( data, function( keyCostFunction, valueCostFunction ) {
                                if(valueTech.technologyAddId === valueCostFunction.technologyAddId) {
                                    var loadHtml = true;
                                    var buttonsHtml = "";
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
                                            buttonsHtml = '<a class="btn btn-info""><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a><div class="point-check" onclick="changeStatus(' + valueTech.idSubprocess + ')"><div name="listFunction" technology="' + valueTech.technology + '" idSubprocess="' + valueTech.idSubprocess + '" nameFunction="' + valueCostFunction.costFunction + '"  function="' + valueCostFunction.function + '" currency="' + valueCostFunction.currency + '" factor="' + valueCostFunction.factor + '" class="change-state-tree" id="id' + valueTech.idSubprocess + '"></div></div>';
                                        });                                                
                                    } else {
                                        loadHtml = true;
                                        buttonsHtml = '<a class="btn btn-info""><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a><div class="point-check" onclick="changeStatus(' + valueTech.idSubprocess + ')"><div name="listFunction" technology="' + valueTech.technology + '" idSubprocess="' + valueTech.idSubprocess + '" nameFunction="' + valueCostFunction.costFunction + '"  function="' + valueCostFunction.function + '" currency="' + valueCostFunction.currency + '" factor="' + valueCostFunction.factor + '" class="change-state-tree" id="id' + valueTech.idSubprocess + '"></div></div>';
                                    }

                                    if(loadHtml) {
                                        var tableVar = '<div class="container-var" id="idContainerVar"><div><div class="input-var"><div class="form-group"><label>% Transported Water</label><input class="form-control" id="idTransportedWater" value="100" readonly><div class="help-block with-errors"></div></div></div><div class="input-var"><div class="form-group"><label>% Sediments Retained</label><input ' + readOnlyTextTree + ' value="' + valueCostFunction.sedimentsRetained + '" step="0.0001" type="number" class="form-control" onblur="changeRetained(' + valueTech.idSubprocess + ')" id="idSedimentsRetained' + valueTech.idSubprocess + '" placeholder="Enter Ssediments retained" ><div class="help-block with-errors"></div></div></div></div><div><div class="input-var"><div class="form-group"><label>% Nitrogen Retained</label><input ' + readOnlyTextTree + ' value="' + valueCostFunction.nitrogenRetained + '"  step="0.0001" type="number" class="form-control" onblur="changeRetained(' + valueTech.idSubprocess + ')" id="idNitrogenRetained' + valueTech.idSubprocess + '" placeholder="Enter nitrogen retained"><div class="help-block with-errors"></div></div></div><div class="input-var"><div class="form-group"><label>% Phosphorus Retained</label><input ' + readOnlyTextTree + ' value="' + valueCostFunction.phosphorusRetained + '"  step="0.0001" type="number" class="form-control" onblur="changeRetained(' + valueTech.idSubprocess + ')" id="idPhosphorusRetained' + valueTech.idSubprocess + '" placeholder="Enter phosphorus retained"><div class="help-block with-errors"></div></div></div></div></div>';
                                        var tableFunct = '<table class="table table-striped table-bordered table-condensed" style="width:100%"><thead><tr class="info"><th scope="col" class="small text-center vat">Function name</th><th scope="col" class="small text-center vat">Function</th><th scope="col" class="small text-center vat">Currency</th><th scope="col" class="small text-center vat">Factor</th><th scope="col" class="small text-center vat">Options</th></tr></thead><tbody><tr><td class="small text-center vat">' + valueCostFunction.costFunction + '</td><td class="small text-center vat"><div class="equation">' + valueCostFunction.function + '</div></td><td class="small text-center vat">' + valueCostFunction.currency + '</td><td class="small text-center vat">' + valueCostFunction.factor + '</td><td aling="center">' + buttonsHtml + '</td></tr></tbody></table>';
                                        $('#technology' + valueTech.idSubprocess).html($('#technology' + valueTech.idSubprocess).html() + tableVar + tableFunct);
                                        if(valueCostFunction.default) {
                                            changeStatus(valueTech.idSubprocess)
                                        }
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
    };
    initialize();
});