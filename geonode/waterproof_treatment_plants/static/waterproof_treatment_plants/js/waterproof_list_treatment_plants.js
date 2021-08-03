/**
 * @file Create form validations
 * @author Yeismer Espejo
 * @version 1.0

 text: gettext('The intake has not been deleted, try again!')

 
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
    var arrayFunction = [];
    var arrayPtap = [];
    var arrayLoadingFunction = [];
    var highlighPolygon = {
        fillColor: "#337ab7",
        color: "#333333",
        weight: 0.2,
        fillOpacity: 0.7
    };
    var ptapArray = [{
            idElement: 1,
            nameElelent: null,
            element: ['Q1','Csed1','CN1','CP1','WSed1','WN1','WP1']
        },{
            idElement: 2,
            nameElelent: null,
            element: ['Q2','Csed2','CN2','CP2','WSed2','WN2','WP2','WsedRet2','WNRet2','WPRet2']
        },{
            idElement: 3,
            nameElelent: null,
            element: ['Q3','Csed3','CN3','CP3','WSed3','WN3','WP3','WsedRet3','WNRet3','WPRet3']
        },{
            idElement: 4,
            nameElelent: null,
            element: ['Q4','Csed4','CN4','CP4','WSed4','WN4','WP4','WsedRet4','WNRet4','WPRet4']
        },{
            idElement: 5,
            nameElelent: null,
            element: ['Q5','Csed5','CN5','CP5','WSed5','WN5','WP5','WsedRet5','WNRet5','WPRet5']
        },{
            idElement: 6,
            nameElelent: null,
            element: ['Q6','Csed6','CN6','CP6','WSed6','WN6','WP6','WsedRet6','WNRet6','WPRet6']
        },{
            idElement: 7,
            nameElelent: null,
            element: ['Q7','Csed7','CN7','CP7','WSed7','WN7','WP7','WsedRet7','WNRet7','WPRet7']
        },{
            idElement: 8,
            nameElelent: null,
            element: ['Q8','Csed8','CN8','CP8','WSed8','WN8','WP8','WsedRet8','WNRet8','WPRet8']
        },{
            idElement: 9,
            nameElelent: null,
            element: ['Q9','Csed9','CN9','CP9','WSed9','WN9','WP9','WsedRet9','WNRet9','WPRet9']
        },{
            idElement: 10,
            nameElelent: null,
            element: ['Q10','Csed10','CN10','CP10','WSed10','WN10','WP10','WsedRet10','WNRet10','WPRet10']
        },{
            idElement: 11,
            nameElelent: null,
            element: ['Q11','Csed11','CN11','CP11','WSed11','WN11','WP11','WsedRet11','WNRet11','WPRet11']
        }]
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
        normalizeCategory: 'FILTRACION',
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

    /**
    * Load ptat when update register
    * @param 
    * @returns 
    */
    loadUpdatePtap = function () {        
        setTimeout(function(){
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
                        if(result.status === true) {
                            localStorage.setItem('csInfra', result);
                            arrayPtap.push({
                                ptapType: result.result.ptap_type,
                                ptapAwy: result.result.awy,
                                ptapCn: result.result.cn,
                                ptapCp: result.result.cp,
                                ptapCs: result.result.cs,
                                ptapWn: result.result.wn,
                                ptapWp: result.result.wp,
                                ptapWs: result.result.ws
                            })
                        } else {
                            Swal.fire({
                                title: 'Error',
                                text: result.error[0],
                                icon: 'error',
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                            })
                        }
                    },error: function (err) {
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
        },2000);
    }
    /**
    * Initialize the methods from the context of treatment plants
    * @param 
    * @returns 
    */
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
                if(arrayPtap.length > 0) {
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
                                "ptap" : arrayPtap,
                                "csinfra" : arrayCsinfra
                            }
                        }),success: function(result) {
                            window.location.href ="../../treatment_plants/?limit=5&city=" + localStorage.getItem('cityId');
                            localStorage.plantId = null;
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
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: "No tiene registro en el tipo de PTAP",
                        icon: 'error',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                    })
                }
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
            deactivePlantGraph();
            setTimeout(function(){
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
                            if(result.status === true) {
                                localStorage.setItem('csInfra', result);
                                arrayPtap.push({
                                    ptapType: result.result.ptap_type,
                                    ptapAwy: result.result.awy,
                                    ptapCn: result.result.cn,
                                    ptapCp: result.result.cp,
                                    ptapCs: result.result.cs,
                                    ptapWn: result.result.wn,
                                    ptapWp: result.result.wp,
                                    ptapWs: result.result.ws
                                })
                                letterPlant = result.result.ptap_type;
                                activePlantGraph(letterPlant)
                                setTimeout(function(){
                                    document.getElementById("idBackgroundGraph").style.display = "none";
                                },3000);
                            } else {
                                Swal.fire({
                                    title: 'Error',
                                    text: result.error[0],
                                    icon: 'error',
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                })
                            }
                        },error: function (err) {
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
            },1000);
        });
        initMap();

        $('#createUrl').attr('href','create/' + userCountryId)
        console.log("aqui crea ptap");
        if (localStorage.clonePlant === "false" && localStorage.updatePlant === "false" && localStorage.loadInf === "false"){
            document.getElementById("titleFormTreatmentPlant").innerHTML = "    "+"Create Treatment Plant";
        }
        if(localStorage.clonePlant === "true") {
            localStorage.clonePlant = "false";
            document.getElementById("titleFormTreatmentPlant").innerHTML = "  "+"Clone Treatment Plant";
            var urlDetail = "../../treatment_plants/getTreatmentPlant/?plantId=" + localStorage.plantId;
            $.getJSON(urlDetail, function (data) {
                localStorage.plantId = null;
                $.each( data.plant, function( key, value ) {
                    document.getElementById("idNamePlant").value = value.plantName + " (Cloned)";                  
                    document.getElementById("idDescriptionPlant").value = value.plantDescription;
                    letterPlant = value.plantSuggest;
                });

                $.each( data.csinfra, function( key, value ) {
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '"><td class="small text-center vat" name="nameListAdd" idIntake="' + value.csinfraElementsystemId + '" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + '"  csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + value.csinfraId + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
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

                loadUpdatePtap()

                arrayLoadingFunction = data.function;
                document.getElementById("idBackgroundGraph").style.display = "none";
                loadInfoTree = true;
            });
        }

        if(localStorage.updatePlant === "true") {
            document.getElementById("titleFormTreatmentPlant").innerHTML = "  "+"Update Treatment Plant";
            localStorage.updatePlant = "false";
            var urlDetail = "../../treatment_plants/getTreatmentPlant/?plantId=" + localStorage.plantId;
            $.getJSON(urlDetail, function (data) {
                $.each( data.plant, function( key, value ) {
                    document.getElementById("idNamePlant").value = value.plantName;                    
                    document.getElementById("idDescriptionPlant").value = value.plantDescription;
                    letterPlant = value.plantSuggest;
                });

                $.each( data.csinfra, function( key, value ) {
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '"><td class="small text-center vat" name="nameListAdd" idIntake="' + value.csinfraElementsystemId + '" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + '"  csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + value.csinfraId + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
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
            document.getElementById("titleFormTreatmentPlant").innerHTML = "  "+"View Treatment Plant";
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
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '"><td class="small text-center vat" name="nameListAdd" idIntake="' + value.csinfraElementsystemId + '" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + '"  csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td><td class="small text-center vat">' + value.csinfraName + ' - ' + value.csinfraCode + ' - ' + value.csinfraGraphId + '</td><td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"></td></tr>');
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
    /**
    * Deactivates the elements of the treatment plant model
    * @param {String} Letter of the Ptap type calculated with the selected intakes
    * @returns 
    */
    deactivePlantGraph = function() {
        $("[name=disableElement]").each(function( index ) {
            $("[name=disableElement]").get(index).style.display = "block";
            var idr =  $("[name=disableElement]").get(index).getAttribute("idr");
            $('#' + idr ).css("background-color", "#ffffff");
            $('#' + idr ).css("border-color", "#ffffff");
        });
    };

    /**
    * Activates the elements of the treatment plant model
    * @param {String} Letter of the Ptap type calculated with the selected intakes
    * @returns 
    */
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

                loadArrayTree($("[name=disableElement]").get(index).getAttribute("plantElement"), $("[name=disableElement]").get(index).getAttribute("nameElement"), $("[name=disableElement]").get(index).getAttribute("graphId"));
            }
        });
    };
    /**
    * Deletes the intakes selected for the calculation of the Ptap
    * @param {String} object to delete for the sectioned intake
    * @returns 
    */
    deleteOption = function(e) {
        $("#child" + e).remove();
    };
    /**
    * Enable the formula tree after selecting the graph element
    * @param {String} object of the tree that contains the formulas
    * @param {String} icon to expand and collapse the tree branch
    * @returns 
    */
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
    /**
    * Draw the polygons on the map when selecting the city 
    * @param {String} city that is registered in the search space    
    * @returns 
    */
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
    /**
    * Change the values of the formulas for each of the elements
    * @param {String} id of the element to change state
    * @param {String} value to limit the possible values that can be assigned to the formula    
    * @returns 
    */
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
    /**
    * Load the tree with the formulas when selecting an element
    * @param {String} selected element
    * @returns 
    */
    viewTree = function(e) {
        document.getElementById("mainTree").style.visibility = "hidden";
        loadArrayTree(e.getAttribute("plantElement"), e.getAttribute("nameElement"), e.getAttribute("graphid"));
        let MQ = window.MathQuill.getInterface(2);
        setTimeout(function(){
            document.querySelectorAll('.equation').forEach(container => {
                MQ.StaticMath(container);
            });
            document.getElementById("mainTree").style.visibility = "visible";
        }, 2000);
    };
    /**
    * Load new technology in the tree
    * @param {String} div the parent object for inject the HTML form
    * @returns 
    */
    loadNewTechnology = function(divParent) {
        var node = document.createElement("div");
        var textNewForm = ''+
        '<div class="title-tree" id="contentTechnology26"><div class="point-tree" onclick="viewBranch(\'technology26\', this)">-</div><div class="text-tree"><input type="text" class="form-control" placeholder="Enter name technology"></div></div>'+
        '<div class="margin-main overflow-form" id="technology26">'+
        '    <div class="container-var" id="idContainerVar">'+
        '        <div>'+
        '            <div class="input-var">'+
        '                <div class="form-group">'+
        '                    <label>% Transported Water</label>'+
        '                    <input class="form-control" id="idTransportedWater" value="100" readonly="">'+
        '                    <div class="help-block with-errors"></div>'+
        '                </div>'+
        '            </div>'+
        '            <div class="input-var">'+
        '                <div class="form-group">'+
        '                    <label>% Sediments Retained</label>'+
        '                    <input type="number" class="form-control" placeholder="Enter Sediments retained">'+
        '                    <div class="help-block with-errors"></div>'+
        '                </div>'+
        '            </div>'+
        '        </div>'+
        '        <div>'+
        '            <div class="input-var">'+
        '                <div class="form-group">'+
        '                    <label>% Nitrogen Retained</label>'+
        '                    <input type="number" class="form-control" placeholder="Enter nitrogen retained">'+
        '                    <div class="help-block with-errors"></div>'+
        '                </div>'+
        '            </div>'+
        '            <div class="input-var">'+
        '                <div class="form-group">'+
        '                    <label>% Phosphorus Retained</label>'+
        '                    <input type="number" class="form-control" placeholder="Enter phosphorus retained">'+
        '                    <div class="help-block with-errors"></div>'+
        '                </div>'+
        '            </div>'+
        '        </div>'+
        '    </div>'+
        '    <table class="table table-striped table-bordered table-condensed" style="width:100%">'+
        '        <thead>'+
        '            <tr class="info">'+
        '                <th scope="col" class="small text-center vat">Activate</th>'+
        '                <th scope="col" class="small text-center vat">Function name</th>'+
        '                <th scope="col" class="small text-center vat">Function</th>'+
        '                <th scope="col" class="small text-center vat">Currency</th>'+
        '                <th scope="col" class="small text-center vat">Factor</th>'+
        '                <th scope="col" class="small text-center vat">Options</th>'+
        '            </tr>'+
        '        </thead>'+
        '        <tbody>'+
        '        </tbody>'+
        '    </table>'+
        '   <div class="link-form" onclick="callFormFormula()">Add function</div>'+
        '</div>';
        node.innerHTML = textNewForm;
        document.getElementById(divParent).insertBefore(node, document.getElementById(divParent).childNodes[0]);
    };
    /**
    * Receive the call back with the formula attribute
    * @param
    * @returns 
    */
    callBackFormula = function() {
        ptapArray
    };
    /**
    * Call form with the formula inforation
    * @param
    * @returns 
    */
    callFormFormula = function() {
        ptapArray
    };
    /**
    * Load the tree variables
    * @param {String} graph element
    * @param {String} element name
    * @param {String} element id
    * @returns 
    */
    loadArrayTree = function(plantElement, nameElement, graphid) {
        var lastTreeBranch = [];

        var readOnlyTextTree = "";
        if(onlyReadPlant) {
            readOnlyTextTree = "readonly";
        }
        var urlDetail = "../../treatment_plants/getInfoTree/?plantElement=" + plantElement + "&country=" + localStorage.getItem('country');
;
        $.getJSON(urlDetail, function (data) {
            var lastSubprocess = "";
            if(nameElement === null) {
                nameElement = "N/A";
            }
            $('#mainTree').html('<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'id' + plantElement + '\', this)" >-</div><div class="text-tree">' + nameElement +'</div><div class="detail-tree"></div></div><div class="margin-main" id="id' + plantElement + '"></div>')
            $.each( data, function( key, value ) {
                if(value.subprocessAddId !== lastSubprocess) {
                    if(value.subprocess === null) {
                        value.subprocess = "N/A";
                    }
                    if(localStorage.loadFormButton === "true") {
                        $('#id' + plantElement).html($('#id' + plantElement).html() + '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'subprocess' + value.idSubprocess + '\', this)" >-</div><div class="text-tree">' + value.subprocess + '</div><div class="link-form" onclick="loadNewTechnology(\'subprocess' + value.idSubprocess + '\')">Add new Technology</div></div><div class="margin-main" id="subprocess' + value.idSubprocess + '"></div>');
                    } else {
                        $('#id' + plantElement).html($('#id' + plantElement).html() + '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'subprocess' + value.idSubprocess + '\', this)" >-</div><div class="text-tree">' + value.subprocess + '</div><div class="link-form"></div></div><div class="margin-main" id="subprocess' + value.idSubprocess + '"></div>');
                    }
                    lastSubprocess = value.subprocessAddId;
                    $.each( data, function( keyTech, valueTech ) {
                        if(value.subprocessAddId === valueTech.subprocessAddId) {
                            if(lastTreeBranch.indexOf(valueTech.idSubprocess) === -1){
                                if(valueTech.technology === null) {
                                    valueTech.technology = "N/A";
                                }
                                $('#subprocess' + value.idSubprocess).html($('#subprocess' + value.idSubprocess).html() + '<div class="title-tree" id="contentTechnology' + valueTech.idSubprocess + '"><div class="point-tree" onclick="viewBranch(\'technology' + valueTech.idSubprocess + '\', this)">-</div><div class="text-tree">' + valueTech.technology + '</div></div><div class="margin-main overflow-form" id="technology' + valueTech.idSubprocess + '"></div>');
                                $.each( data, function( keyCostFunction, valueCostFunction ) {
                                    if(valueTech.technologyAddId === valueCostFunction.technologyAddId) {
                                        if(lastTreeBranch.indexOf(valueCostFunction.idSubprocess) === -1){
                                            lastTreeBranch.push(valueCostFunction.idSubprocess);
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
                                                    activateHtml = '<div class="point-check" onclick="changeStatus(' + valueCostFunction.idSubprocess + ')"><div name="listFunction" graphid="' + graphid + '" technology="' + valueCostFunction.technology + '" idSubprocess="' + valueCostFunction.idSubprocess + '" nameFunction="' + valueCostFunction.costFunction + '"  function="' + valueCostFunction.function + '" currency="' + valueCostFunction.currency + '" factor="' + valueCostFunction.factor + '" class="change-state-tree" id="id' + valueCostFunction.idSubprocess + '"></div></div>';
                                                });                                                
                                            } else {
                                                loadHtml = true;
                                                buttonsHtml = '<a class="btn btn-info""><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>';
                                                activateHtml = '<div class="point-check" onclick="changeStatus(' + valueCostFunction.idSubprocess + ')"><div name="listFunction"  graphid="' + graphid + '" subProcessMaster="' + valueTech.idSubprocess + '" technology="' + valueCostFunction.technology + '" idSubprocess="' + valueCostFunction.idSubprocess + '" nameFunction="' + valueCostFunction.costFunction + '"  function="' + valueCostFunction.function + '" currency="' + valueCostFunction.currency + '" factor="' + valueCostFunction.factor + '" class="change-state-tree" id="id' + valueCostFunction.idSubprocess + '"></div></div>';
                                            }

                                            if(loadHtml) {
                                                var tableVar = '<div class="container-var" id="idContainerVar"><div><div class="input-var"><div class="form-group"><label>% Transported Water</label><input class="form-control" id="idTransportedWater" value="100" readonly><div class="help-block with-errors"></div></div></div><div class="input-var"><div class="form-group"><label>% Sediments Retained</label><input min="' + valueCostFunction.minimalSedimentsRetained + '" max="' + valueCostFunction.maximalSedimentsRetained + '" ' + readOnlyTextTree + ' value="' + valueCostFunction.sedimentsRetained + '" step="0.0001" type="number" class="form-control" onblur="changeRetained(' + valueCostFunction.idSubprocess + ', this)" id="idSedimentsRetained' + valueCostFunction.idSubprocess + '" placeholder="Enter Sediments retained" ><div class="help-block with-errors"></div></div></div></div><div><div class="input-var"><div class="form-group"><label>% Nitrogen Retained</label><input min="' + valueCostFunction.minimalNitrogenRetained + '" max="' + valueCostFunction.maximalNitrogenRetained + '"  ' + readOnlyTextTree + ' value="' + valueCostFunction.nitrogenRetained + '"  step="0.0001" type="number" class="form-control" onblur="changeRetained(' + valueCostFunction.idSubprocess + ', this)" id="idNitrogenRetained' + valueCostFunction.idSubprocess + '" placeholder="Enter nitrogen retained"><div class="help-block with-errors"></div></div></div><div class="input-var"><div class="form-group"><label>% Phosphorus Retained</label><input min="' + valueCostFunction.minimalPhosphorusRetained + '" max="' + valueCostFunction.maximalPhosphorusRetained + '"  ' + readOnlyTextTree + ' value="' + valueCostFunction.phosphorusRetained + '"  step="0.0001" type="number" class="form-control" onblur="changeRetained(' + valueCostFunction.idSubprocess + ', this)" id="idPhosphorusRetained' + valueCostFunction.idSubprocess + '" placeholder="Enter phosphorus retained"><div class="help-block with-errors"></div></div></div></div></div>';
                                                if(localStorage.loadFormButton === "true") {
                                                    var tableFunct = '<table class="table table-striped table-bordered table-condensed" style="width:100%"><thead><tr class="info"><th scope="col" class="small text-center vat">Activate</th><th scope="col" class="small text-center vat">Function name</th><th scope="col" class="small text-center vat">Function</th><th scope="col" class="small text-center vat">Currency</th><th scope="col" class="small text-center vat">Factor</th><th scope="col" class="small text-center vat">Options</th></tr></thead><tbody><tr><td aling="center">' + activateHtml + '</td><td class="small text-center vat">' + valueCostFunction.costFunction + '</td><td class="small text-center vat"><div class="open-popup-form" onclick="document.getElementById(\'popupForm' + valueCostFunction.idSubprocess + '\').style.display=\'block\'">fx</div><div id="popupForm' + valueCostFunction.idSubprocess + '" class="form-popup"><div class="close-form-popup" onclick="document.getElementById(\'popupForm' + valueCostFunction.idSubprocess + '\').style.display=\'none\'">X</div><div class="equation">' + valueCostFunction.function + '</div></div></td><td class="small text-center vat">' + valueCostFunction.currency + '</td><td class="small text-center vat">' + valueCostFunction.factor + '</td><td aling="center">' + buttonsHtml + '</td></tr></tbody></table><div class="link-form" onclick="callFormFormula()">Add function</div>';
                                                } else {
                                                    var tableFunct = '<table class="table table-striped table-bordered table-condensed" style="width:100%"><thead><tr class="info"><th scope="col" class="small text-center vat">Activate</th><th scope="col" class="small text-center vat">Function name</th><th scope="col" class="small text-center vat">Function</th><th scope="col" class="small text-center vat">Currency</th><th scope="col" class="small text-center vat">Factor</th><th scope="col" class="small text-center vat">Options</th></tr></thead><tbody><tr><td aling="center">' + activateHtml + '</td><td class="small text-center vat">' + valueCostFunction.costFunction + '</td><td class="small text-center vat"><div class="open-popup-form" onclick="document.getElementById(\'popupForm' + valueCostFunction.idSubprocess + '\').style.display=\'block\'">fx</div><div id="popupForm' + valueCostFunction.idSubprocess + '" class="form-popup"><div class="close-form-popup" onclick="document.getElementById(\'popupForm' + valueCostFunction.idSubprocess + '\').style.display=\'none\'">X</div><div class="equation">' + valueCostFunction.function + '</div></div></td><td class="small text-center vat">' + valueCostFunction.currency + '</td><td class="small text-center vat">' + valueCostFunction.factor + '</td><td aling="center">' + buttonsHtml + '</td></tr></tbody></table>';
                                                }
                                                
                                                $('#technology' + valueTech.idSubprocess).html($('#technology' + valueTech.idSubprocess).html() + tableVar + tableFunct);
                                                if(valueCostFunction.default) {
                                                    changeStatus(valueTech.idSubprocess)
                                                }
                                            } else {
                                                document.getElementById('contentTechnology' + valueTech.idSubprocess).style.display = "none";
                                                document.getElementById('technology' + valueTech.idSubprocess).style.display = "none";
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        });

        setTimeout(function(){
            for (var funVar = 0; funVar < arrayFunction.length; funVar++) {
                if (document.getElementById("id" + arrayFunction[funVar].idSubprocess) !== null) {
                    document.getElementById("id" + arrayFunction[funVar].idSubprocess).style.borderColor = "#039edc";
                }
            }
        },3000);
    };
    /**
    * Change the state of the element in the graph
    * @param {String} element object
    * @returns 
    */
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
                            graphid: $("[name=listFunction]").get(index).getAttribute("graphid"),
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
    /**
    * Load the results of the city on the map 
    * @param {String} map limit
    * @returns 
    */
    selectedResultHandler = function (feat) {

        localStorage.setItem('cityCoords', JSON.stringify([feat.geometry.coordinates[1], feat.geometry.coordinates[0]]));

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

        let urlAPI = SEARCH_COUNTRY_API_URL + countryCode;

        $.get(urlAPI, function(data) {
            $("#regionLabel").html(data.region);
            $("#currencyLabel").html(data.currencies[0].name + " - " + data.currencies[0].symbol);
            
            localStorage.setItem('country', country);
            localStorage.setItem('region', data.region);
            localStorage.setItem('currency', data.currencies[0].name + " - " + data.currencies[0].symbol);
        });

        urlAPI = location.protocol + "//" + location.host + "/parameters/getClosetsCities/?x=" + feat.geometry.coordinates[0] + "&y=" + feat.geometry.coordinates[1];
        $.get(urlAPI, function(data) {

            if (data.length > 0) {
                let cityId = data[0][0];
                localStorage.setItem('cityId', cityId);
                localStorage.setItem('factor', data[0][2]);
                setTimeout(function() {
                    location.href = "/treatment_plants/?city=" + cityId;
                }, 300);
            }
        });
    }
    /**
    * Search the points of a city and load them in the polygon of the map
    * @param {String} Object with the identity of the city    
    * @returns 
    */
    showSearchPoints = function(geojson) {
        searchPoints.clearLayers();
        let geojsonFilter = geojson.features.filter(feature => feature.properties.type == "city");
        searchPoints.addData(geojsonFilter);
        let cityName = geojsonFilter[0].properties.name;
        drawPolygons(cityName);
        table.search(cityName.substr(0, 5)).draw();
    }
    /**
    * In-place loading of the map in the application
    * @param 
    * @returns 
    */
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
            map.setView(initialCoords, initialZoom);
            searchPoints.addTo(map);

            var tilelayer = L.tileLayer(TILELAYER, { maxZoom: MAXZOOM, attribution: 'Data \u00a9 <a href="http://www.openstreetmap.org/copyright"> OpenStreetMap Contributors </a> Tiles \u00a9 Komoot' }).addTo(map);
            var images = L.tileLayer(IMAGE_LYR_URL);
            var hydroLyr = L.tileLayer(HYDRO_LYR_URL);

            var baseLayers = {
                OpenStreetMap: tilelayer,
                Images: images,
            };

            var overlays = {
                "Hydro (esri)": hydroLyr,
            };

            var zoomControl = new L.Control.Zoom({ position: 'topright' }).addTo(map);
            L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);

            function onMapClick(e) {
            }
            map.on('click', onMapClick);
        } else {
            document.getElementById("nameCity").innerHTML = localStorage.getItem('city')+", "+localStorage.getItem('country');
            var urlDetail = "../../treatment_plants/getIntakeList/?cityId=" + localStorage.getItem('cityId');
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
    /**
    * Update the country layer in map
    * @param {String} country code
    * @returns 
    */
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
    /**
    * Load the page to see a treatment plant
    * @param {String} plant code    
    * @returns 
    */
    viewInformationPlant = function(plantId) {
        localStorage.loadFormButton = "false";
        localStorage.loadInf = "true";
        localStorage.plantId = plantId;
        window.location.href ="../../treatment_plants/create/" + userCountryId;
    };
    /**
    * Load the page to update a treatment plant
    * @param {String} plant code    
    * @returns 
    */
    updatePlant = function(plantId) {
        localStorage.loadFormButton = "true";
        localStorage.updatePlant = "true";
        localStorage.plantId = plantId;
        window.location.href ="../../treatment_plants/create/" + userCountryId;
    };
    /**
    * Load the page to clone a treatment plant
    * @param {String} plant code    
    * @returns 
    */
    clonePlant = function(plantId) {
        localStorage.loadFormButton = "true";
        localStorage.clonePlant = "true";
        localStorage.plantId = plantId;
        window.location.href ="../../treatment_plants/create/" + userCountryId;
    };
    /**
    * Load the page to delete a treatment plant
    * @param {String} plant code    
    * @returns 
    */
    deletePlant = function(plantId) {
        var intakeId='{{idx}}';
        Swal.fire({
            title: "<div style='font-size: 25px;'>Are you sure?</div>",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                var urlDetail = "../../treatment_plants/setHeaderPlant/";
                $.ajax({
                    url: urlDetail,
                    method: 'DELETE',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify({
                        "plantId" : plantId
                    }),success: function(result) {
                        window.location.href ="../../treatment_plants/?limit=5&city=" + localStorage.getItem('cityId');
                        localStorage.plantId = null;
                    },error: function (err) {
                        Swal.fire({
                            title: 'Error',
                            text: "Problemas eliminando la planta de tratamiento, ya se debe estar usando en un caso de estudio",
                            icon: 'error',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                        })
                    }
                });
            }
        })
    };
    initialize();
});