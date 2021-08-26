/**
 * @file Create form validations
 * @author Yeismer Espejo
 * @version 1.0

 text: gettext('The intake has not been deleted, try again!')

 
 */

$(function () {
    var TILELAYER = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png';
    var IMAGE_LYR_URL = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}";
    var HYDRO_LYR_URL = "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer/tile/{z}/{y}/{x}";
    var CENTER = [4.582, -74.4879];
    var MAXZOOM = 11;
    var table = $('#example').DataTable();   
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
            nameElement: null,
            element: ['Q1','Csed1','CN1','CP1','WSed1','WN1','WP1']
        },{
            idElement: 2,
            nameElement: null,
            element: ['Q2','Csed2','CN2','CP2','WSed2','WN2','WP2','WsedRet2','WNRet2','WPRet2']
        },{
            idElement: 3,
            nameElement: null,
            element: ['Q3','Csed3','CN3','CP3','WSed3','WN3','WP3','WsedRet3','WNRet3','WPRet3']
        },{
            idElement: 4,
            nameElement: null,
            element: ['Q4','Csed4','CN4','CP4','WSed4','WN4','WP4','WsedRet4','WNRet4','WPRet4']
        },{
            idElement: 5,
            nameElement: null,
            element: ['Q5','Csed5','CN5','CP5','WSed5','WN5','WP5','WsedRet5','WNRet5','WPRet5']
        },{
            idElement: 6,
            nameElement: null,
            element: ['Q6','Csed6','CN6','CP6','WSed6','WN6','WP6','WsedRet6','WNRet6','WPRet6']
        },{
            idElement: 7,
            nameElement: null,
            element: ['Q7','Csed7','CN7','CP7','WSed7','WN7','WP7','WsedRet7','WNRet7','WPRet7']
        },{
            idElement: 8,
            nameElement: null,
            element: ['Q8','Csed8','CN8','CP8','WSed8','WN8','WP8','WsedRet8','WNRet8','WPRet8']
        },{
            idElement: 9,
            nameElement: null,
            element: ['Q9','Csed9','CN9','CP9','WSed9','WN9','WP9','WsedRet9','WNRet9','WPRet9']
        },{
            idElement: 10,
            nameElement: null,
            element: ['Q10','Csed10','CN10','CP10','WSed10','WN10','WP10','WsedRet10','WNRet10','WPRet10']
        },{
            idElement: 11,
            nameElement: null,
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
        normalizeCategory: gettext('PTAP Input'),
        onOff: false
    }, {
        graphId: 2,
        normalizeCategory: gettext('MEZCLARAPIDA'),
        onOff: false
    }, {
        graphId: 3,
        normalizeCategory: gettext('MEZCLALENTA'),
        onOff: false
    }, {
        graphId: 4,
        normalizeCategory: gettext('SEDIMENTACION'),
        onOff: false
    }, {
        graphId: 5,
        normalizeCategory: gettext('FILTRACION'),
        onOff: false
    }, {
        graphId: 6,
        normalizeCategory: gettext('FILTRACIONPORMEMBRANANIVEL1'),
        onOff: false
    }, {
        graphId: 7,
        normalizeCategory: gettext('FILTRACIONPORMEMBRANANIVEL2'),
        onOff: false
    }, {
        graphId: 8,
        normalizeCategory: gettext('FILTRACIONPORMEMBRANANIVEL3'),
        onOff: false
    }, {
        graphId: 9,
        normalizeCategory: gettext('FILTRACIONPORMEMBRANANIVEL4'),
        onOff: false
    }, {
        graphId: 10,
        normalizeCategory: gettext('INTERCAMBIOIONICO'),
        onOff: false
    }, {
        graphId: 11,
        normalizeCategory: gettext('DESINFECCION'),
        onOff: false
    }, {
        graphId: 12,
        normalizeCategory: gettext('DOSIFICACION'),
        onOff: false
    }, {
        graphId: 13,
        normalizeCategory: gettext('TRATAMIENTODELODOS'),
        onOff: false
    }]
    var letterPlant = null;
    var searchPoints = L.geoJson(null, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(feature.properties.name);
        }
    });
    var selectedPlantElement = null;
    var selectedTechnologyId = -1;
    var button = document.getElementById('btnValidatePyExp');
    var output = document.getElementById('MathPreview');
    var addFunction = false;
    var flagNewFunction = false;
    var addNewCost = gettext('Add new cost');
    var editCost = gettext('Edit cost');
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
                $("[name=disableElement]").each(function( index, element ) {
                    element.style.display = "block";
                    var idr =  element.getAttribute("idr");
                    $('#' + idr ).css("background-color", "#ffffff");
                    $('#' + idr ).css("border-color", "#ffffff");
                });
                document.getElementById("idBackgroundGraph").style.display = "block";
            } else  {
                var arrayCsinfra = [];
                $("[name=nameListAdd]").each(function( index, element ) {
                    arrayCsinfra.push(element.getAttribute("idIntake"))
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
                            text: gettext("Error calculating the suggested plant"),
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
                $('#idNamePlant').focusin();
                $('#idNamePlant').focusout();
                saveForm = false;
            }
            if($('#idDescriptionPlant').val() === "" || $('#idDescriptionPlant').val() === null) {
                $('#idDescriptionPlant').focusin();
                $('#idDescriptionPlant').focusout();
                saveForm = false;
            }
            if(letterPlant === null) {
                $('#idIntakePlant').focusin();
                $('#idIntakePlant').focusout();
                saveForm = false;
            }

            var arrayCsinfra = [];
            $("[name=nameListAdd]").each(function( index, element ) {
                arrayCsinfra.push({
                    name: element.getAttribute("nameList"),
                    graphId: element.getAttribute("graphIdlist"),
                    csinfra: element.getAttribute("csinfraList"),
                    intake: element.getAttribute("idIntake")
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
                                text: gettext('Error calculating the treatment plant'),
                                icon: 'error',
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                            })
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: gettext('It does not have a record in the type of treatment plant'),
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
            $("[name=nameListAdd]").each(function( index, element ) {
                if(element.getAttribute("nameList") === textNameCsinfra) {
                    validCsinfra = false;
                }
            });
            if(validCsinfra) {
                $('#idTbodyIntake').append('<tr id="child' + this.value + '"><td class="small text-center vat" name="nameListAdd" idIntake="' + $('option:selected', this).attr("value") + '" nameList="' + textNameCsinfra + '"  graphIdlist="' + $('option:selected', this).attr("graphIdlist") + '"  csinfraList="' + $('option:selected', this).attr("csinfra") + '">' + textNameCsinfra + '</td><td class="small text-center vat">' + $('option:selected', this).attr("intake") + '</td><td class="small text-center vat">' + $('option:selected', this).attr("csinfra") + '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + this.value + ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
            } else {
                Swal.fire({
                    title: 'Information',
                    text: gettext('You cannot add the water source'),
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
                    $("[name=disableElement]").each(function( index, element ) {
                        element.style.display = "block";
                        var idr =  element.getAttribute("idr");
                        $('#' + idr ).css("background-color", "#ffffff");
                        $('#' + idr ).css("border-color", "#ffffff");
                    });
                    document.getElementById("idBackgroundGraph").style.display = "block";
                } else  {
                    var arrayCsinfra = [];
                    $("[name=nameListAdd]").each(function( index, element ) {
                        arrayCsinfra.push(element.getAttribute("idIntake"))
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
                                    text: result.detail /*.error[0]*/,
                                    icon: 'error',
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                })
                            }
                        },error: function (err) {
                            Swal.fire({
                                title: 'Error',
                                text: gettext("Error calculating the suggested plant"),
                                icon: 'error',
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                            })
                        }
                    });
                }
            },1000);
        });

        $(document).on ("click", ".change-state-tree", function (e) {
            console.log(e);
            let id = e.currentTarget.id.replace("id","");
            changeStatus(id);
        });
        initMap();

        $('#createUrl').attr('href','create/' + userCountryId);
        
        if (localStorage.clonePlant === "false" && localStorage.updatePlant === "false" && localStorage.loadInf === "false"){
            document.getElementById("titleFormTreatmentPlant").innerHTML = "    "+ gettext("Create") + gettext("Treatment Plant");
        }
        if(localStorage.clonePlant === "true") {
            localStorage.clonePlant = "false";
            document.getElementById("titleFormTreatmentPlant").innerHTML = "  "+ gettext("Clone") + gettext("Treatment Plant");
            var urlDetail = "../../treatment_plants/getTreatmentPlant/?plantId=" + localStorage.plantId;
            $.getJSON(urlDetail, function (data) {
                localStorage.plantId = null;
                $.each( data.plant, function( key, value ) {
                    document.getElementById("idNamePlant").value = value.plantName + " " + gettext("Cloned");                  
                    document.getElementById("idDescriptionPlant").value = value.plantDescription;
                    letterPlant = value.plantSuggest;
                });

                $.each( data.csinfra, function( key, value ) {
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '">' + 
                                        '<td class="small text-center vat" name="nameListAdd" idIntake="' + value.csinfraElementsystemId + 
                                        '" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + 
                                        '" csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td>' + 
                                        '<td class="small text-center vat">' + value.csinfraName + '</td>' + 
                                        '<td class="small text-center vat">' + value.csinfraCode + '</td>' + 
                                        '<td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + value.csinfraId + ')">' + 
                                        '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
                });

                $.each( data.element, function( key, value ) {
                    if(value.elementOnOff) {
                        $("[name=disableElement]").each(function( index, element ) {
                            if(parseInt(element.getAttribute("graphid")) === value.elementGraphId) {
                                var idr =  element.getAttribute("idr");
                                for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                                    if(arrayPlant[indexArray].graphId === parseInt(element.getAttribute("graphId"))) {
                                        arrayPlant[indexArray].onOff = true;
                                    }
                                }
                                element.style.display = "none";
                                var idr =  element.getAttribute("idr");
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
                        phosphorusRetained: value.functionPhosphorusRetained,
                        id: value.functionId
                    })
                });

                loadUpdatePtap();
                arrayLoadingFunction = data.function;
                document.getElementById("idBackgroundGraph").style.display = "none";
                loadInfoTree = true;
            });
        }
        if(localStorage.updatePlant === "true") {
            document.getElementById("titleFormTreatmentPlant").innerHTML = "  "+ gettext("Update") + " " + gettext("Treatment Plant");
            localStorage.updatePlant = "false";
            var urlDetail = "../../treatment_plants/getTreatmentPlant/?plantId=" + localStorage.plantId;
            $.getJSON(urlDetail, function (data) {
                $.each( data.plant, function( key, value ) {
                    document.getElementById("idNamePlant").value = value.plantName;                    
                    document.getElementById("idDescriptionPlant").value = value.plantDescription;
                    letterPlant = value.plantSuggest;
                });

                $.each( data.csinfra, function( key, value ) {
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '">' + 
                                    '<td class="small text-center vat" name="nameListAdd" idIntake="' + value.csinfraElementsystemId + 
                                        '" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + 
                                        '" csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td>' + 
                                        '<td class="small text-center vat">' + value.csinfraName + '</td>' + 
                                        '<td class="small text-center vat">' + value.csinfraCode + '</td>' + 
                                        '<td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + value.csinfraId + ')">' + 
                                        '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
                });

                $.each( data.element, function( key, value ) {
                    if(value.elementOnOff) {
                        $("[name=disableElement]").each(function( index, element ) {
                            if(parseInt(element.getAttribute("graphid")) === value.elementGraphId) {
                                var idr =  element.getAttribute("idr");
                                for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                                    if(arrayPlant[indexArray].graphId === parseInt(element.getAttribute("graphId"))) {
                                        arrayPlant[indexArray].onOff = true;
                                    }
                                }
                                element.style.display = "none";
                                var idr =  element.getAttribute("idr");
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
                        phosphorusRetained: value.functionPhosphorusRetained,
                        id: value.functionId
                    })
                });

                loadUpdatePtap();
                arrayLoadingFunction = data.function;
                document.getElementById("idBackgroundGraph").style.display = "none";
                loadInfoTree = true;
            });
        }
        if(localStorage.loadInf === "true") {
            document.getElementById("titleFormTreatmentPlant").innerHTML = "  "+ gettext("View") + gettext("Treatment Plant");
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
                    $('#idTbodyIntake').append('<tr id="child' + value.csinfraId + '">' + 
                        '<td class="small text-center vat" name="nameListAdd" idIntake="' + value.csinfraElementsystemId + 
                        '" nameList="' + value.csinfraName + '"  graphIdlist="' + value.csinfraGraphId + 
                        '" csinfraList="' + value.csinfraCode + '">' + value.csinfraName + '</td>' + 
                        '<td class="small text-center vat">' + value.csinfraName + ' - ' + value.csinfraCode + ' - ' + value.csinfraGraphId + '</td>' + 
                        '<td class="small text-center vat">' + value.csinfraCode + '</td><td aling="center"></td></tr>');
                });

                $.each( data.element, function( key, value ) {
                    if(value.elementOnOff) {
                        $("[name=disableElement]").each(function( index, element ) {
                            if(parseInt(element.getAttribute("graphid")) === value.elementGraphId) {
                                var idr =  element.getAttribute("idr");
                                for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                                    if(arrayPlant[indexArray].graphId === parseInt(element.getAttribute("graphId"))) {
                                        arrayPlant[indexArray].onOff = true;
                                    }
                                }
                                element.style.display = "none";
                                var idr =  element.getAttribute("idr");
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
        $("[name=disableElement]").each(function( index, element ) {
            element.style.display = "block";
            var idr =  element.getAttribute("idr");
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
        $("[name=disableElement]").each(function( index, element ) {
            if(element.getAttribute("model").indexOf(ptapType) < 0) {
                element.style.display = "block";
                var idr =  element.getAttribute("idr");
                $('#' + idr ).css("background-color", "#ffffff");
                $('#' + idr ).css("border-color", "#ffffff");
            } else {
                var idr =  element.getAttribute("idr");
                for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                    if(arrayPlant[indexArray].graphId === parseInt(element.getAttribute("graphId"))) {
                        arrayPlant[indexArray].onOff = true;
                    }
                }
                element.style.display = "none";
                var idr =  element.getAttribute("idr");
                $('#' + idr ).css("background-color", "#ffffff");
                $('#' + idr ).css("border-color", "#039edc");

                loadArrayTree(element.getAttribute("plantElement"), element.getAttribute("nameElement"), element.getAttribute("graphId"));
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

        $("[name=listFunction]").each(function( index, element ) {
            if(element.style.borderColor !== "rgb(3, 158, 220)") {
                for (var funVar = 0; funVar < arrayFunction.length; funVar++) {
                    if(arrayFunction[funVar].nameFunction === element.getAttribute("nameFunction") &&
                        arrayFunction[funVar].technology === element.getAttribute("technology")) {
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
        selectedPlantElement = e.getAttribute("plantElement");
        $(".container-element").removeClass('container-element-selected')
        $(e.parentElement).addClass('container-element-selected');
        loadArrayTree(selectedPlantElement,  e.getAttribute("nameElement"), e.getAttribute("graphid"));
        //let MQ = window.MathQuill.getInterface(2);
        setTimeout(function(){
            // document.querySelectorAll('.equation').forEach(container => {
            //     MQ.StaticMath(container);
            // });
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
        '<div class="title-tree" id="contentTechnology26"><div class="point-tree" onclick="viewBranch(\'technology26\', this)">-</div>' + 
        '<div class="text-tree"><input type="text" class="form-control" placeholder="' + gettext('Enter name technology') + '"></div></div>'+
        '<div class="margin-main overflow-form" id="technology26">'+
        '    <div class="container-var" id="idContainerVar">'+
        '        <div>'+
        '            <div class="input-var">'+
        '                <div class="form-group">'+
        '                    <label>% ' + gettext('Transported Water') + '</label>'+
        '                    <input class="form-control" value="100" readonly="">'+
        '                    <div class="help-block with-errors"></div>'+
        '                </div>'+
        '            </div>'+
        '            <div class="input-var">'+
        '                <div class="form-group">'+
        '                    <label>% ' + gettext('Sediments Retained') + '</label>'+
        '                    <input type="number" class="form-control" placeholder="' + gettext('Enter Sediments retained') + '">'+
        '                    <div class="help-block with-errors"></div>'+
        '                </div>'+
        '            </div>'+
        '        </div>'+
        '        <div>'+
        '            <div class="input-var">'+
        '                <div class="form-group">'+
        '                    <label>% ' + gettext('Nitrogen Retained') + '</label>'+
        '                    <input type="number" class="form-control" placeholder="' + gettext('Enter nitrogen retained') + '">'+
        '                    <div class="help-block with-errors"></div>'+
        '                </div>'+
        '            </div>'+
        '            <div class="input-var">'+
        '                <div class="form-group">'+
        '                    <label>% ' + gettext('Phosphorus Retained') + '</label>'+
        '                    <input type="number" class="form-control" placeholder="' + gettext('Enter phosphorus retained') + '">'+
        '                    <div class="help-block with-errors"></div>'+
        '                </div>'+
        '            </div>'+
        '        </div>'+
        '    </div>'+
        '    <table class="table table-striped table-bordered table-condensed" style="width:100%">'+
        '        <thead>'+
        '            <tr class="info">'+
        '                <th scope="col" class="small text-center vat">' + gettext('Activate') + '</th>'+
        '                <th scope="col" class="small text-center vat">' + gettext('Function name') + '</th>'+
        '                <th scope="col" class="small text-center vat">' + gettext('Function') + '</th>'+
        '                <th scope="col" class="small text-center vat">' + gettext('Currency') + '</th>'+
        '                <th scope="col" class="small text-center vat">' + gettext('Factor') + '</th>'+
        '                <th scope="col" class="small text-center vat">' + gettext('Options') + '</th>'+
        '            </tr>'+
        '        </thead>'+
        '        <tbody>'+
        '        </tbody>'+
        '    </table>'+
        '   <div class="link-form">' + gettext('Add function') + '</div>'+
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
        //ptapArray
        //showModalCalculator(true, graphId, "");
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
        var readOnlyTextTree = onlyReadPlant ? "readonly" : "";        
        var urlDetail = "../../treatment_plants/getInfoTree/?plantElement=" + plantElement + "&country=" + localStorage.getItem('country');

        $.getJSON(urlDetail, function (data) {
            var lastSubprocess = "";
            nameElement = nameElement === null ? "N/A" : nameElement;
            
            $('#mainTree').html('<div class="title-tree" graphId=' + graphid + '>' + 
                                '<div class="point-tree" onclick="viewBranch(\'id' + plantElement + '\', this)" >-</div>' + 
                                '<div class="text-tree">' + nameElement +'</div><div class="detail-tree"></div></div>' + 
                                '<div class="margin-main" id="id' + plantElement + '"></div>');
            $.each( data, function( key, value ) {
                if(value.subprocessAddId !== lastSubprocess) {
                    if(value.subprocess === null) {
                        value.subprocess = "N/A";
                    }
                    var linkLoadNewTechnology = ">";
                    if(localStorage.loadFormButton === "true") {
                        linkLoadNewTechnology = 'onclick="loadNewTechnology(\'subprocess' + value.idSubprocess + '\')">' + gettext('Add new Technology');
                    } 
                    $('#id' + plantElement).html($('#id' + plantElement).html() + 
                                    '<div class="title-tree"><div class="point-tree" onclick="viewBranch(\'subprocess' + value.idSubprocess + '\', this)" >-</div>' + 
                                    '<div class="text-tree">' + value.subprocess + '</div>' + 
                                    '<div class="link-form-2" ' + linkLoadNewTechnology + '</div></div>' + 
                                    '<div class="margin-main" id="subprocess' + value.idSubprocess + '"></div>');
                    lastSubprocess = value.subprocessAddId;
                    $.each( data, function( keyTech, valueTech ) {
                        if(value.subprocessAddId === valueTech.subprocessAddId) {
                            if(lastTreeBranch.indexOf(valueTech.idSubprocess) === -1){
                                if(valueTech.technology === null) {
                                    valueTech.technology = "N/A";
                                }
                                $('#subprocess' + value.idSubprocess).html($('#subprocess' + 
                                value.idSubprocess).html() + '<div class="title-tree" id="contentTechnology' + valueTech.idSubprocess + '">' + 
                                                            '<div class="point-tree" onclick="viewBranch(\'technology' + valueTech.idSubprocess + '\', this)">-</div>' + 
                                                            '<div class="text-tree">' + valueTech.technology + '</div></div>' + 
                                                            '<div class="margin-main overflow-form" id="technology' + valueTech.idSubprocess + '"></div>');
                                $.each( data, function( keyCostFunction, valueCostFunction ) {
                                    if(valueTech.technologyAddId === valueCostFunction.technologyAddId) {
                                        if(lastTreeBranch.indexOf(valueCostFunction.idSubprocess) === -1){
                                            lastTreeBranch.push(valueCostFunction.idSubprocess);
                                            var loadHtml = true;
                                            var buttonsHtml = false;
                                            var activateHtml = "";
                                            var listTrFunction = [];
                                            if(onlyReadPlant) {
                                                loadHtml = false;
                                                $.each( arrayLoadingFunction, function( keyLoading, valueLoading ) {
                                                    if(valueTech.technology === valueLoading.functionTechnology /*&&
                                                        valueCostFunction.costFunction === valueLoading.functionName*/) {                                                        
                                                        valueCostFunction.sedimentsRetained = valueLoading.functionSedimentsRetained;
                                                        valueCostFunction.nitrogenRetained = valueLoading.functionNitrogenRetained;
                                                        valueCostFunction.phosphorusRetained = valueLoading.functionPhosphorusRetained;
                                                        valueCostFunction.costFunction = valueLoading.functionName;
                                                        valueCostFunction.function = valueLoading.functionValue;
                                                        valueCostFunction.currency = valueLoading.functionCurrency;
                                                        valueCostFunction.factor = valueLoading.functionFactor;
                                                        loadHtml = true;
                                                    }
                                                });
                                            } else if (loadInfoTree) {
                                                listTrFunction = [];
                                                buttonsHtml = true;
                                                $.each( arrayLoadingFunction, function( index, valueLoading ) {
                                                    if(valueTech.technology === valueLoading.functionTechnology/* &&
                                                        valueCostFunction.costFunction === valueLoading.functionName*/) {
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
                                                        activateHtml = htmlCheckBox(valueCostFunction, graphid, null,(index==0 ? "" : index));
                                                        listTrFunction.push(addFunctionCostRow(activateHtml, valueCostFunction, buttonsHtml, graphid,(index==0 ? "" : index)));
                                                    }                                                    
                                                });
                                                if (listTrFunction.length == 0) {
                                                    activateHtml = htmlCheckBox(valueCostFunction, graphid, null,'');
                                                    listTrFunction.push(addFunctionCostRow(activateHtml, valueCostFunction, buttonsHtml, graphid,''));
                                                }                             
                                            } else {
                                                loadHtml = true;
                                                // TODO :: Review load mare that one function
                                                activateHtml = htmlCheckBox(valueCostFunction,graphid,valueTech.idSubprocess,"");
                                                listTrFunction.push(addFunctionCostRow(activateHtml, valueCostFunction, buttonsHtml, graphid,''));
                                            }

                                            if(loadHtml) {
                                                var tableVar = '<div class="container-var" id="idContainerVar">' + 
                                                                '<div><div class="input-var"><div class="form-group">' + 
                                                                '<label>% ' + gettext('Transported Water') + '</label><input class="form-control" value="100" ' + 
                                                                ' readonly><div class="help-block with-errors"></div></div></div>' + 
                                                                '<div class="input-var"> <div class="form-group">' + 
                                                                '<label>% ' + gettext('Sediments Retained') + '</label><input min="' + valueCostFunction.minimalSedimentsRetained + 
                                                                '" max="' + valueCostFunction.maximalSedimentsRetained + 
                                                                '" ' + readOnlyTextTree + ' value="' + valueCostFunction.sedimentsRetained + 
                                                                '" step="0.0001" type="number" class="form-control" onblur="changeRetained(' + 
                                                                valueCostFunction.idSubprocess + ', this)" id="idSedimentsRetained' + valueCostFunction.idSubprocess + 
                                                                '" placeholder="' + gettext('Enter Sediments retained') + '" ><div class="help-block with-errors"></div></div></div></div>' + 
                                                                '<div><div class="input-var"><div class="form-group">' + 
                                                                '<label>% ' + gettext('Nitrogen Retained') + '</label><input min="' + valueCostFunction.minimalNitrogenRetained + 
                                                                '" max="' + valueCostFunction.maximalNitrogenRetained + '" ' + readOnlyTextTree + 
                                                                ' value="' + valueCostFunction.nitrogenRetained + 
                                                                '" step="0.0001" type="number" class="form-control" onblur="changeRetained(' + 
                                                                valueCostFunction.idSubprocess + ', this)" id="idNitrogenRetained' + valueCostFunction.idSubprocess + 
                                                                '" placeholder="' + gettext('Enter nitrogen retained') + '"><div class="help-block with-errors"> </div></div></div>' + 
                                                                '<div class="input-var"><div class="form-group">' + 
                                                                '<label>% ' + gettext('Phosphorus Retained') + '</label><input min="' + valueCostFunction.minimalPhosphorusRetained + 
                                                                '" max="' + valueCostFunction.maximalPhosphorusRetained + '"  ' + readOnlyTextTree + 
                                                                ' value="' + valueCostFunction.phosphorusRetained + 
                                                                '" step="0.0001" type="number" class="form-control" onblur="changeRetained(' + 
                                                                valueCostFunction.idSubprocess + ', this)" id="idPhosphorusRetained' + valueCostFunction.idSubprocess + 
                                                                '" placeholder="' + gettext('Enter phosphorus retained') + '"><div class="help-block with-errors"></div></div></div></div></div>';
                                                var tableFunct = '<table class="table table-striped table-bordered table-condensed" style="width:100%">' +
                                                        addTitleFnRow([gettext('Activate'), gettext('Function name'), gettext('Function'), gettext('Currency'), gettext('Factor'), gettext('Options')]) + '<tbody>' +
                                                        listTrFunction.join("") + '</tbody></table>';
                                                        
                                                if(localStorage.loadFormButton === "true") {
                                                    tableFunct = tableFunct + '<div class="link-form">' + gettext('Add function') + '</div>';
                                                } 
                                                
                                                $('#technology' + valueTech.idSubprocess).html($('#technology' + valueTech.idSubprocess).html() + tableVar + tableFunct);
                                                document.getElementById('technology' + valueTech.idSubprocess).style.display = "block !important";
                                                if(valueCostFunction.default) {
                                                    changeStatus(valueTech.idSubprocess);
                                                }
                                            } else {
                                                document.getElementById('contentTechnology' + valueTech.idSubprocess).style.display = "none";
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
                $("[name=listFunction]").each(function( index, element ) {
                    let selectedElement = document.getElementById("id" + i);
                    let isCustomFunction = selectedElement.id.indexOf(element.id) !== -1 || element.id.indexOf(selectedElement.id) !== -1;

                    if(element.id !== selectedElement.id && !isCustomFunction) {
                        if(element.getAttribute("subProcessMaster") === document.getElementById("id" + i).getAttribute("subProcessMaster")){
                            element.style.borderColor = "#ffffff";
                            if (document.getElementById(element.id + "1d") !== null) {
                                document.getElementById(element.id + "1d").style.display = "block";
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
            $("[name=listFunction]").each(function( index, element ) {
                if(element.style.borderColor === "rgb(3, 158, 220)") {
                    var addFunctionToArray = true;
                    for (var funVar = 0; funVar < arrayFunction.length; funVar++) {
                        if(arrayFunction[funVar].nameFunction === element.getAttribute("nameFunction") &&
                            arrayFunction[funVar].technology === element.getAttribute("technology")) {
                            addFunctionToArray = false;
                        }
                    }

                    if(addFunctionToArray) {
                        arrayFunction.push({
                            graphid: element.getAttribute("graphid"),
                            technology: element.getAttribute("technology"),
                            nameFunction: element.getAttribute("nameFunction"),
                            functionValue: element.getAttribute("function"),
                            currency: element.getAttribute("currency"),
                            factor: element.getAttribute("factor"),
                            idSubprocess: element.getAttribute("idSubprocess"),
                            sedimentsRetained: document.getElementById("idSedimentsRetained" + element.getAttribute("idSubprocess")).value,
                            nitrogenRetained: document.getElementById("idNitrogenRetained" + element.getAttribute("idSubprocess")).value,
                            phosphorusRetained: document.getElementById("idPhosphorusRetained" + element.getAttribute("idSubprocess")).value
                        })
                    }
                } else {
                    for (var funVar = 0; funVar < arrayFunction.length; funVar++) {
                        if(arrayFunction[funVar].nameFunction === element.getAttribute("nameFunction") &&
                            arrayFunction[funVar].technology === element.getAttribute("technology")) {
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
                    placeholder: gettext('Search City...'),
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

            var tilelayer = L.tileLayer(TILELAYER, { maxZoom: MAXZOOM, attribution: 'Data \u00a9 <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap Contributors </a> Tiles \u00a9 Komoot' }).addTo(map);
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
            text: gettext("You won't be able to revert this!"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: gettext('Yes, delete it!')
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
                            text: gettext('Error deleting the treatment plant, it must already be used in a case study'),
                            icon: 'error',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                        })
                    }
                });
            }
        })
    };

    // add function cost
    $(document).on('click', '.link-form', function() {
        var graphId = $('#mainTree .title-tree')[0].getAttribute('graphId');
        addFunction = true;
        selectedTechnologyId = this.parentElement.id.replace("technology","");
        showModalCalculator(true, graphId, {'expression': '', 'name':''});
    });

    //Edit funcion cost 
    $(document).on('click', '.btn-function-cost', function() {

        let graphId = this.getAttribute('graphId');
        addFunction = false;
        let elCheck = this.parentElement.parentElement.children[0].children[0].children[0];
        let fn = elCheck.getAttribute("function");
        let fnName = this.parentElement.parentElement.children[1].innerText;
        let currency = elCheck.getAttribute("currency");
        let factor = elCheck.getAttribute("factor");
        let costFunction = {
            "expression": fn,
            "name": fnName,
            "currency": currency,
            "factor": factor
        };
        showModalCalculator(false,graphId,costFunction);
        
        //selectedCostId = parseInt($(this).attr('idvalue'));
        // $('#costFunctionName').val(funcostdb[selectedCostId].function.name);
        // $('#costFuntionDescription').val(funcostdb[selectedCostId].function.description);    
        // $('#currencyCost').val(funcostdb[selectedCostId].function.currencyCost);
        // $('#factorCost').val(funcostdb[selectedCostId].function.factor);
        // $('#CalculatorModalLabel').text('Modify Cost - ' + $('#titleCostFunSmall').text());
                
        //funcostdb[selectedCostId].function.value;        
    });

    //add function cost row
    addFunctionCostRow = function(activateHtml,valueCostFunction,buttonsHtml,graphid, subid) {
        let htmlBtn = '';
        if (buttonsHtml){
            htmlBtn = '<a class="btn btn-info btn-function-cost" graphid=' + graphid + ' data-toggle="modal" data-target="#CalculatorModal">' + 
                        '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>';                                                
        }
        
        let popupId =  valueCostFunction.idSubprocess + (subid != "" ? '-' + subid : ''); 
        let tdClass = 'class="small text-center vat"';
        let exp = valueCostFunction.function.replaceAll('else', 'else <br>');
        let rowFn = '<tr><td aling="center">' + activateHtml + '</td>' + 
                '<td ' + tdClass + '>' + valueCostFunction.costFunction + '</td>' + 
                '<td ' + tdClass + '><div class="open-popup-form" ' + 'onclick="$(\'#popupForm' + popupId + '\').show();">fx</div>' + 
                '<div id="popupForm' + popupId + '" class="form-popup"> ' + 
                '<div class="close-form-popup" onclick="$(\'#popupForm' + popupId + '\').hide()">X</div> ' + 
                '<div>' + exp + '</div></div></td>' + 
                '<td ' + tdClass + '>' + valueCostFunction.currency + '</td>' + 
                '<td ' + tdClass + '>' + valueCostFunction.factor + '</td>' + 
                '<td aling="center">' + htmlBtn + '</td></tr>';
        return rowFn;
    }

    // add titles to the table function
    addTitleFnRow = function(titles){
        let rowTitleFn = '';
        titles.forEach(function(title, index) {
            rowTitleFn += '<th scope="col" class="small text-center vat">' + title + '</th>';
        });
        return '<thead><tr class="info">' + rowTitleFn + '</tr></thead>';
    }

    function showModalCalculator(flag,graphId,costFunction) {
        flagNewFunction = flag;
        $('#CalculatorModal').modal('show');
        setVarCost(selectedPlantElement, graphId);
        $('#python-expression').val(costFunction.expression);
        $('#costFunctionName').val(costFunction.name);
        if (costFunction.name != "") {            
            $('#currencyCost').val(costFunction.currency);
            $('#factorCost').val(costFunction.factor);
        }        
        if (costFunction.expression != "") {
            validatePyExpression();
        }else{
            typesetInput("");
        }
        
        $("#saveAndValideCost").text(flagNewFunction ? addNewCost : editCost);        
    }

    function setVarCost(element, graphid) {

        $('#CalculatorModalLabel').text('Modify Cost ');
        $('#VarCostListGroup div').remove();
        
        var costVars = ['Q', 'CSed', 'CN', 'CP', 'WSed', 'WN', 'WP', 'WSedRet', 'WNRet', 'WPRet'];    
        
        arrayPlant.forEach(function(plantElement, index) {
            if (plantElement.onOff){
                var costlabel = "";
                if (plantElement.graphId == 1) {
                    for (const iterator of costVars.slice(0,7)) {
                        costlabel += `<a value="${iterator}${plantElement.graphId}" class="list-group-item list-vars">${iterator}${plantElement.graphId}</a>`;
                    }
                }else{
                    for (const iterator of costVars) {
                        costlabel += `<a value="${iterator}${plantElement.graphId}" class="list-group-item list-vars">${iterator}${plantElement.graphId}</a>`;
                    }
                }
                
                $('#VarCostListGroup').append(`
                    <div class="panel panel-info">
                        <div class="panel-heading">
                            <a data-toggle="collapse" data-parent="#VarCostListGroup" href="#VarCostListGroup_${plantElement.graphId}">${plantElement.normalizeCategory} </a>                        
                        </div>
                        <div id="VarCostListGroup_${plantElement.graphId}" class="panel-collapse var-cost-panel collapse">${costlabel}</div>
                    </div>
                `);
            }              
        });        
    }

    $('#btnValidatePyExp').click(function () {
        validatePyExpression();
    });

    async function validatePyExpression() {
        let pyExp = $('#python-expression').val().trim();
        if (pyExp.length > 0) {
            pyExpEncode = encodeURIComponent(pyExp);
            localApi = location.protocol + "//" + location.host;
            let url = "/intake/validatePyExpression?expression=" + pyExpEncode;
            let response = await fetch(url);
            let result = await response.json();
            if (result) {
                is_valid = result.valid;
                latex = result.latex
                console.log(result.latex);
                typesetInput(result.latex);
                if (is_valid) {
                    $("#python-expression").removeClass("invalid_expression");
                    $("#python-expression").addClass("valid_expression");
                } else {
                    $("#python-expression").addClass("invalid_expression");
                    $("#python-expression").removeClass("valid_expression");
                }
            }
        }
    }

    //Set var into calculator
    $(document).on('click', '.list-group-item', function() {
        var el = document.getElementById("python-expression");
        typeInTextarea($(this).attr('value'),el);
    });

    typeInTextarea = function(newText, el) {
        const [start, end] = [el.selectionStart, el.selectionEnd];
        el.setRangeText(newText, start, end, 'select');
        el.focus();
        document.getSelection().removeAllRanges();
        el.selectionStart = start + newText.length;
        el.selectionEnd = el.selectionStart;
    }

    $('#python-expression').on('keypress',function(evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        let symbols = [40,41,42,43,45,60,61,62,106,107,109,111];
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return (symbols.indexOf(charCode) >= 0);

        return true;
    })

    //KeyBoard calculator funcion cost
    $('button[name=mathKeyBoard]').click(function () {
        var el = document.getElementById("python-expression");
        typeInTextarea($(this).attr('value'), el);
    });

    typesetInput = function (expression) {
        button.disabled = true;
        output.innerHTML = expression;
        MathJax.texReset();
        MathJax.typesetClear();
        MathJax.typesetPromise([output]).catch(function (err) {
            output.innerHTML = '';
            output.appendChild(document.createTextNode(err.message));
            console.error(err);
        }).then(function () {
            button.disabled = false;
        });
    }

    $('#saveAndValideCost').click(function() {
        
        let graphId = $('#mainTree .title-tree')[0].getAttribute('graphId');
        let fnName = $("#costFunctionName").val();
        let expression = $("#python-expression").val();

        if (fnName == "" || expression == "") {
            alert("Please, complete the form");
            return;
        }

        if (flagNewFunction){
            
            let tbody = $("#technology" + selectedTechnologyId + " table tbody");
            let trNewFunction = addNewFunction(selectedTechnologyId, graphId);
            tbody.append (trNewFunction);

        }else{
            
        }
        $('#CalculatorModal').modal('hide');
    });

    addNewFunction = function(tecnologyId, graphId){
        let costFunctionName = $('#costFunctionName').val();
        let description = $('#costFuntionDescription').val();
        let factor = $('#factorCost').val();
        let currencyCost = $('#currencyCost option:selected').val();
        let currencyCostName = $('#currencyCost option:selected').text();
        let pyExp = $('#python-expression').val();
        let idSubprocess =  $('#mainTree .margin-main .margin-main')[0].id.replace("subprocess","");
        let technology = $("#contentTechnology16 .text-tree").html();

        arrayFunction.push({
            technology: technology,
            nameFunction: costFunctionName,
            functionValue: pyExp,
            currency: currencyCost,
            factor: factor,
            idSubprocess: idSubprocess,
            sedimentsRetained: document.getElementById("idSedimentsRetained" + idSubprocess).value,
            nitrogenRetained: document.getElementById("idNitrogenRetained" + idSubprocess).value,
            phosphorusRetained: document.getElementById("idPhosphorusRetained" + idSubprocess).value,
            id: -1
        })

        let valueCostFunction = {
            costFunction: costFunctionName,
            description: description,
            factor: factor,
            currency: currencyCost,            
            function: pyExp,
            idSubprocess: idSubprocess,
            technology: technology
        }
        let subid = $("#technology16 table tbody tr").length; //num of rows in table
        let activateHtml = htmlCheckBox(valueCostFunction, graphId, null, idSubprocess, subid);        
        let tdRowFn = addFunctionCostRow(activateHtml,valueCostFunction,true,graphId,subid);
        return tdRowFn;
    }

    htmlCheckBox = function(valueCostFunction, graphid, subProcessMaster, subid) {

        let attrSubprocessMaster = "";
        if (subProcessMaster !== null) {
            attrSubprocessMaster ='subProcessMaster="' + subProcessMaster + '" ';
        }
        //onclick="changeStatus(' + valueCostFunction.idSubprocess + ')"
        let activateHtml = '<div class="point-check"' + '>' +
                        '<div name="listFunction"  graphid="' + graphid + '" ' + attrSubprocessMaster + 
                        'technology="' + valueCostFunction.technology + '" ' + 
                        'idSubprocess="' + valueCostFunction.idSubprocess + '" ' + 
                        'nameFunction="' + valueCostFunction.costFunction + '" ' + 
                        'function="' + valueCostFunction.function + '" ' + 
                        'currency="' + valueCostFunction.currency + '" ' + 
                        'factor="' + valueCostFunction.factor + '" ' +  
                        (subid != "" ? 'style="border-color:#039edc;" ' : '') +
                        'class="change-state-tree" id="id' + valueCostFunction.idSubprocess + 
                                (subid != "" ? "-" + subid : "") + '"></div></div>';
        return activateHtml;
    }
   
    $( document ).ready(function() {
        initialize();
    });
    
});