/**
 * @file Create form validations
 * @author Yeismer Espejo
 * @version 1.0

 text: gettext('The intake has not been deleted, try again!')
 
 */

 $(function () {
        
    const HYPHEN = "-";    
    var onlyReadPlant = false;
    var loadInfoTree = false;
    var arrayFunction = [];
    var arrayPtap = [];
    var arrayLoadingFunction = [];
    var functionsByCustomTech = {};    
    let lblTechnology = "Technology";
    var categories = JSON.parse('[{"categorys":"Ferric chloride","normalized_category":"DOSIFICACION"},{"categorys":"Polymer","normalized_category":"DOSIFICACION"},{"categorys":"Single bed slow filtration","normalized_category":"FILTRACION"},{"categorys":"Rapid single bed filtration","normalized_category":"FILTRACION"},{"categorys":"Rapid mixed bed filtration","normalized_category":"FILTRACION"},{"categorys":"Rapid single bed filtration","normalized_category":"FILTRACION"},{"categorys":"Hydraulic mixing","normalized_category":"MEZCLARAPIDA"},{"categorys":"Hydraulic flocculation","normalized_category":"MEZCLALENTA"},{"categorys":"Mechanical flocculation","normalized_category":"MEZCLALENTA"},{"categorys":"Inverse osmosis","normalized_category":"FILTRACIONPORMEMBRANANIVEL4"},{"categorys":"Nanofiltration","normalized_category":"FILTRACIONPORMEMBRANANIVEL3"},{"categorys":"Granulated Aluminum Sulfate","normalized_category":"DOSIFICACION"},{"categorys":"Quick mix","normalized_category":"MEZCLARAPIDA"},{"categorys":"Mantenimiento edificaciones","normalized_category":"MANTENIMIENTOEDIFICACIONES"},{"categorys":"Intercambio iónico","normalized_category":"INTERCAMBIOIONICO"},{"categorys":"Sludge pumping","normalized_category":"TRATAMIENTODELODOS"},{"categorys":"Sludge thickener","normalized_category":"TRATAMIENTODELODOS"},{"categorys":"Drying beds","normalized_category":"TRATAMIENTODELODOS"},{"categorys":"Filter press","normalized_category":"TRATAMIENTODELODOS"},{"categorys":"Liquid Aluminum Sulfate","normalized_category":"DOSIFICACION"},{"categorys":"Rapid mixed bed filtration","normalized_category":"FILTRACION"},{"categorys":"Single bed slow filtration","normalized_category":"FILTRACION"},{"categorys":"Conventional settler","normalized_category":"SEDIMENTACION"},{"categorys":"High Rate Settler","normalized_category":"SEDIMENTACION"},{"categorys":"Sludge blanket decanter","normalized_category":"SEDIMENTACION"},{"categorys":"Chlorine gas","normalized_category":"DESINFECCION"},{"categorys":"Chlorine in situ","normalized_category":"DESINFECCION"},{"categorys":"Ultrafiltration","normalized_category":"FILTRACIONPORMEMBRANANIVEL2"},{"categorys":"Microfiltration","normalized_category":"FILTRACIONPORMEMBRANANIVEL1"}]');
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
        normalizeCategory: _('FILTRACION'),
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
        normalizeCategory: _('DOSIFICACION'),
        onOff: false
    }, {
        graphId: 13,
        normalizeCategory: 'TRATAMIENTODELODOS',
        onOff: false
    }]
    var letterPlant = null;
    var searchPoints;
    var selectedPlantElement = null;
    var selectedTechnologyId = -1;
    var selectedFunction4Edit = null;
    var selectedSubprocess = null;
    var button = document.getElementById('btnValidatePyExp');
    var output = document.getElementById('MathPreview');
    var addFunction = false;
    var flagNewFunction = false;
    var addNewCost = 'Add new cost';
    var editCost = 'Edit cost';
    var checkHexColor = "#039edc";
    var basePathURL = "../../treatment_plants/";
    var whiteColor = "#ffffff";
    var actionType = "";    
    var tableFunctionTpl = "";
    
    var lbl = {};

    if (location.pathname.indexOf("update") > -1) {
        localStorage.plantId = location.pathname.split("/")[3];
        localStorage.updatePlant = "true";
        actionType = "update";
    }
        
    var plant = {'elements' : {}, 'functions' : {}};
    /**
    * Load ptat when update register
    * @param 
    * @returns 
    */
    loadUpdatePtap = function (activePlant) {
        setTimeout(function(){
            if($('#idTbodyIntake').html().trim() === "") {
                $('#idIntakePlant').focusin();
                $('#idIntakePlant').focusout();
                $("[name=disableElement]").each(function( index, element ) {
                    element.style.display = "block";
                    var idr =  element.getAttribute("idr");
                    $('#' + idr ).css("background-color", whiteColor);
                    $('#' + idr ).css("border-color", whiteColor);
                });
                document.getElementById("idBackgroundGraph").style.display = "block";
            } else  {
                toggleProcessingModal('show');
                var arrayCsinfra = [];
                $("[name=nameListAdd]").each(function( index, element ) {
                    arrayCsinfra.push(element.getAttribute("idIntake"))
                });

                $.ajax({
                    url: basePathURL + "getTypePtap/",
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
                                awy: result.result.awy,
                                cn: result.result.cn,
                                cp: result.result.cp,
                                cs: result.result.cs,
                                wn: result.result.wn,
                                wp: result.result.wp,
                                ws: result.result.ws
                            })
                            letterPlant = result.result.ptap_type;
                            if (activePlant){
                                activePlantGraph(letterPlant);
                            }                            
                            setTimeout(function(){
                                $("#idBackgroundGraph").hide();
                            },1000);
                        } else {
                            showMessageModal('Error',result.error[0],'error');                            
                        }
                        toggleProcessingModal('hide');
                    },error: function (err) {
                        showMessageModal('Error',_("Error calculating the suggested plant"),'error');
                    }
                });
            }
        },1000);
    }
    /**
    * Initialize the methods from the context of treatment plants
    * @param 
    * @returns 
    */
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
        
        $('#createUrl').attr('href','create/' + userCountryId);
        initMap();

        if ((localStorage.clonePlant === undefined || 
            localStorage.clonePlant === "false") && 
            localStorage.updatePlant === "false" && 
            (localStorage.loadInf == undefined || 
            localStorage.loadInf === "false")){
            var el = document.getElementById("titleFormTreatmentPlant");
            if (el != undefined)    
                el.innerHTML = "    "+ _("Create") + " " +  _("Treatment Plant");
        }
        
        if(localStorage.clonePlant === "true") {
            actionType = "clone";
            plantId = localStorage.clonePlantId;
        }else if(localStorage.updatePlant === "true") {
            actionType = "update";
            plantId = localStorage.plantId;
        }else if(localStorage.loadInf === "true") {
            actionType = "view";
        }
        if(actionType.length > 0) {
            loadPlant(plantId, actionType);
        }
        
        if ($("#currencyCost")[0] != undefined && localStorage.currency != undefined){
            $("#currencyCost").val(localStorage.currency);
            $("#factorCost").val('1.0'); //localStorage.factor
        }

        $('#submit').click(function (e) {
            if (localStorage.loadInf === "true") {
                location.href = "/treatment_plants/?city=" + localStorage.getItem('cityId');

            } else {
                validateAndSavePlant();
            }
            
        });

        $('#idIntakePlant').change(function (e) {
            var validCsinfra = true;
            var textNameCsinfra = $('option:selected', this).attr("namelist");
            if (textNameCsinfra === undefined) {
                return;
            }
            $("[name=nameListAdd]").each(function( index, element ) {
                if(element.getAttribute("nameList") === textNameCsinfra) {
                    validCsinfra = false;
                }
            });
            if(validCsinfra) {
                $('#idTbodyIntake').append('<tr id="child' + this.value + '"><td class="small text-center vat" name="nameListAdd" idIntake="' + 
                $('option:selected', this).attr("value") + '" nameList="' + textNameCsinfra + '"  graphIdlist="' + $('option:selected', this).attr("graphIdlist") + 
                '"  csinfraList="' + $('option:selected', this).attr("csinfra") + '">' + textNameCsinfra + '</td><td class="small text-center vat">' + 
                $('option:selected', this).attr("intake") + '</td><td class="small text-center vat">' + $('option:selected', this).attr("csinfra") +
                 '</td><td aling="center"><a class="btn btn-danger" onclick="deleteOption(' + this.value + 
                 ')"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>');
                 
                $('#idIntakePlant').removeAttr('required');
            } else {
                showMessageModal(_('Information'),_("'You cannot add the water source"),'warning');
            }
        });

        $('#idSendIntake').click(function (e) {
            toggleProcessingModal('show');
            deactivePlantGraph();
            setTimeout(function(){
                arrayFunction = [];
                if($('#idTbodyIntake').html().trim() === "") {
                    $('#idIntakePlant').focusin();
                    $('#idIntakePlant').focusout();
                    $("[name=disableElement]").each(function( index, element ) {
                        element.style.display = "block";
                        var idr =  element.getAttribute("idr");
                        $('#' + idr ).css("background-color", whiteColor);
                        $('#' + idr ).css("border-color", whiteColor);
                    });
                    document.getElementById("idBackgroundGraph").style.display = "block";
                } else  {
                    var arrayCsinfra = [];
                    $("[name=nameListAdd]").each(function( index, element ) {
                        arrayCsinfra.push(element.getAttribute("idIntake"))
                    });
                    $.ajax({
                        url: basePathURL + "getTypePtap/",
                        method: 'POST',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        data: JSON.stringify({"csinfras": arrayCsinfra}),success: function(result) {
                            if(result.status === true) {
                                localStorage.setItem('csInfra', result);
                                arrayPtap.push({
                                    ptapType: result.result.ptap_type,
                                    awy: result.result.awy,
                                    cn: result.result.cn,
                                    cp: result.result.cp,
                                    cs: result.result.cs, 
                                    wn: result.result.wn,
                                    wp: result.result.wp,
                                    ws: result.result.ws
                                })
                                letterPlant = result.result.ptap_type;
                                activePlantGraph(letterPlant);
                                setTimeout(function(){
                                    $("#idBackgroundGraph").hide();
                                },1000);
                                $("#black2").click();
                                $(".main-point").click();
                            } else {
                                showMessageModal('Error',result.detail,'error');                                
                            }
                        },error: function (err) {
                            showMessageModal('Error',_("Error calculating the suggested plant"),'error');                            
                        }
                    });
                }
            },1000);
        });

        $(document).on ("click", ".change-state-tree", function (e) {
            console.log("click :: .change-state-tree", e);
            // disable all input elements in tree
            $(".main-tree-content input").prop( "disabled", true );
            let id = e.currentTarget.id.replace("id","");
            
            let divContainerVar = $(e.currentTarget).parents().get(6).children[0];
            let techId = divContainerVar.id;
            $("#" + techId +  " input").prop( "disabled", false );

            $(".link-form").hide();
            $("#" + divContainerVar.parentElement.id + " .link-form").show();
            changeStatus(id,e.currentTarget);
        });

        lbl = {
            transportedWater : _('Transported Water'),
            sediments : _('Sediments Retained'),
            nitrogen : _('Nitrogen Retained'),
            phosphorus : _('Phosphorus Retained'),
            placeholderSediments : _('Enter sediments retainer'),
            placeholderNitrogen : _('Enter nitrogen retainer'),
            placeholderPhosphorus : _('Enter phosphorus retainer'),
        }

        addNewCost = _('Add new cost');
        editCost = _('Edit cost');
        lblTechnology = _("Technology");
        tableFunctionTpl = `<div class="table-responsive col-md-12" style="overflow:visible;">
                        <table class="table table-striped table-bordered table-condensed" style="width:100%">
                        ${addTitleFnRow([_('Activate'), _('Function name'), _('Function'), _('Currency'), _('Factor'), _('Options')])}  
                        <tbody></tbody></table></div>`;
        $('#CalculatorModalLabel').text(addNewCost);
    };

    loadPlant = function(plantId, typeAction) {
        console.log("loadPlant", plantId, typeAction);
        let tileAction = "";
        let plantNameSuffix = "";
        localStorage.plantId = plantId;
        switch (typeAction) {
            case "update":
                tileAction = _("Update");
                localStorage.updatePlant = "false";
                break;
            case "clone":
                plantNameSuffix = HYPHEN+_("Clone");
                tileAction = _("Clone");                
                localStorage.clonePlant = "false";
                break;
            case "view":
                tileAction = _("View");
                localStorage.loadInf = "false";
                break;
            default:
                break;
        }
        
        document.getElementById("titleFormTreatmentPlant").innerHTML = tileAction + " " + _("Treatment Plant");        
        var urlDetail = basePathURL + "getTreatmentPlant/?plantId=" + plantId;
        $.getJSON(urlDetail, function (data) {
            if (typeAction === "clone" || typeAction === "view") {
                localStorage.plantId = null;                
            }            
            $.each( data.plant, function( key, value ) {
                document.getElementById("idNamePlant").value = `${value.plantName}${plantNameSuffix}`;
                document.getElementById("idDescriptionPlant").value = value.plantDescription;
                letterPlant = value.plantSuggest;
            });
            $.each( data.csinfra, function( key, value ) {
                let htmlTbl = `<td class="small text-center vat">${value.csinfraCode}</td> 
                        <td aling="center"><a class="btn btn-danger" onclick="deleteOption('${value.csinfraId}')">
                        <span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a></td></tr>`;
                if (typeAction === "view"){
                    htmlTbl = `<td class="small text-center vat">${value.csinfraName} - ${value.csinfraCode} - ${value.csinfraGraphId}</td>
                            <td class="small text-center vat">${value.csinfraCode }</td></tr>`;
                }
                $('#idTbodyIntake').append(`<tr id="child${value.csinfraId}"> 
                        <td class="small text-center vat" name="nameListAdd" idIntake="${value.csinfraElementsystemId}"  nameList="${value.csinfraName}" graphIdlist="${value.csinfraGraphId}" csinfraList="${value.csinfraCode }">${value.csinfraName}</td><td class="small text-center vat">${value.csinfraSourceName}</td>${htmlTbl}`);
            });
            if (data.csinfra.length > 0) {
                $('#idIntakePlant').removeAttr('required');
            }
            $.each( data.element, function( key, value ) {
                if(value.elementOnOff) {
                    $("[name=disableElement]").each(function( index, element ) {
                        if(parseInt(element.getAttribute("graphid")) === value.elementGraphId) {
                            var idr =  element.getAttribute("idr");
                            for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                                if(arrayPlant[indexArray].graphId === parseInt(element.getAttribute("graphId"))) {
                                    arrayPlant[indexArray].onOff = true;
                                    plant.elements[element.getAttribute("plantelement")] = {}; //just add element
                                }
                            }
                            element.style.display = "none";
                            var idr =  element.getAttribute("idr");
                            $('#' + idr ).css("background-color", whiteColor);
                            $('#' + idr ).css("border-color", checkHexColor);
                        }
                    });
                }
            });

            $.each( data.function, function( key, value ) {
                let costFunction = {
                    graphid: value.functionGraphId,
                    technology: value.functionTechnology,
                    nameFunction: value.functionName,
                    functionValue: value.functionValue,
                    currency: value.functionCurrency,
                    factor: value.functionFactor,
                    description: "",
                    idSubprocess:  value.functionIdSubProcess,
                    sedimentsRetained: value.functionSedimentsRetained,
                    nitrogenRetained: value.functionNitrogenRetained,
                    phosphorusRetained: value.functionPhosphorusRetained,
                    id: value.functionId,
                    greaterCaudal: value.greaterCaudal,
                    caudal: value.caudal,
                }
                addFunction2Array(costFunction);
                plant.functions[costFunction.technology + HYPHEN + costFunction.nameFunction] = costFunction;
            });
            loadUpdatePtap(true);
            arrayLoadingFunction = data.function;

            loadInfoTree = true;
            document.getElementById("idBackgroundGraph").style.display = "none";
            if (typeAction === "view"){                
                document.getElementById("idNamePlant").readOnly = true;
                document.getElementById("idDescriptionPlant").readOnly = true;
                document.getElementById("idIntakePlant").style.display = "none";                
                document.getElementById("submit").style.display = "none";
                onlyReadPlant = true;
            }
        });
    }

    /**
    * validate And Save Treatment Plant
    * @param {
    * @returns 
    */
    validateAndSavePlant = function () {
        console.log("validateAndSavePlant");
        toggleProcessingModal('show', _("Saving") + "...",_('Please wait'));
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

        let ptapFunctions = [];
        for( k in plant.functions) {
            ptapFunctions.push(plant.functions[k]);
        }

        let Option1 = document.getElementById('id11d');
        let Option2 = document.getElementById('id21d');
        let Option3 = document.getElementById('id31d');
        let Option4 = document.getElementById('id41d');
        let Option5 = document.getElementById('id51d');
        let Option6 = document.getElementById('id61d');
        let Option7 = document.getElementById('id71d');
        let Option8 = document.getElementById('id81d');
        let Option9 = document.getElementById('id91d');
        let Option10 = document.getElementById('id101d');
        let Option11 = document.getElementById('id111d');
        let Option12 = document.getElementById('id121d');

        let styleOption1 = Option1.style.display;
        let styleOption2 = Option2.style.display;
        let styleOption3 = Option3.style.display;
        let styleOption4 = Option4.style.display;
        let styleOption5 = Option5.style.display;
        let styleOption6 = Option6.style.display;
        let styleOption7 = Option7.style.display;
        let styleOption8 = Option8.style.display;
        let styleOption9 = Option9.style.display;
        let styleOption10 = Option10.style.display;
        let styleOption11 = Option11.style.display;
        let styleOption12 = Option12.style.display;
        // validación gráfico y funciones de costo
        let flagChecked =0;
        for (const iterator of document.getElementsByName('listFunction')) {
            if(iterator.getAttribute("checked") == 'false') flagChecked++;
        }
        if(styleOption1 == "block" && styleOption2 == "block" && styleOption3 == "block" && 
           styleOption4 == "block" && styleOption5 == "block" && styleOption6 == "block" && 
           styleOption7 == "block" && styleOption8 == "block" && styleOption9 == "block" && 
           styleOption10 == "block" && styleOption11 == "block" && styleOption12 == "block"){
            showMessageModal(_('Information'),_("Please, complete the form"),'warning');
        }else if(flagChecked==document.getElementsByName('listFunction').length){
            showMessageModal(_('Information'),_("Please, complete the form"),'warning');
            }else{
                if(saveForm) {
                    var arrayCsinfra = [];
                    $("[name=nameListAdd]").each(function( index, element ) {
                        arrayCsinfra.push({
                            name: element.getAttribute("nameList"),
                            graphId: element.getAttribute("graphIdlist"),
                            csinfra: element.getAttribute("csinfraList"),
                            intake: element.getAttribute("idIntake")
                        })
                    });
                    
                    if(arrayPtap.length > 0) {
                        var urlDetail = basePathURL + "setHeaderPlant/";
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
                                    "function" : ptapFunctions, /* arrayFunction, */
                                    "ptap" : arrayPtap,
                                    "csinfra" : arrayCsinfra
                                }
                            }),success: function(result) {
                                window.location.href = basePathURL + "?limit=5&city=" + localStorage.getItem('cityId');
                                localStorage.plantId = null;
                            },error: function (err) {
                                showMessageModal('Error',_("Error calculating the treatment plant"),'error');                        
                            }
                        });
                    } else {
                        showMessageModal('Error',_("It does not have a record in the type of treatment plant"),'error');                
                    }
                }else{
                    showMessageModal(_('Information'),_("Please, complete the form"),'warning');
                }
        }
        // let styleOption1 = $('#id11d').css("display");

        // if(styleOption1 == block){
        //     showMessageModal(_('Information'),_("'Please, complete the form"),'warning');
        // }
    }

    /**
    * Deactivates the elements of the treatment plant model
    * @param {String} Letter of the Ptap type calculated with the selected intakes
    * @returns 
    */
    deactivePlantGraph = function() {
        $("[name=disableElement]").each(function( index, element ) {
            element.style.display = "block";
            var idr =  element.getAttribute("idr");
            $('#' + idr ).css("background-color", whiteColor);
            $('#' + idr ).css("border-color", whiteColor);
        });
    };

    /**
    * Activates the elements of the treatment plant model
    * @param {String} Letter of the Ptap type calculated with the selected intakes
    * @returns 
    */
    activePlantGraph = function(ptapType) {
        console.log("activePlantGraph");
        toggleProcessingModal('show');
        var listElements = {};
        $("[name=disableElement]").each(function( index, element ) {
            var idr =  element.getAttribute("idr");
            var idrElem = $('#' + idr );
            var attrModel = element.getAttribute("model");
            var modelInTypePtap = attrModel.indexOf(ptapType) >= 0;

            if (actionType != "update" && actionType != "clone" && actionType != "view") {
                element.style.display = "block";
                idrElem.css("background-color", whiteColor);
                idrElem.css("border-color", whiteColor);
                
                if(modelInTypePtap) {
                    for (var indexArray = 0; indexArray < arrayPlant.length; indexArray++) {
                        if(arrayPlant[indexArray].graphId === parseInt(element.getAttribute("graphId"))) {
                            arrayPlant[indexArray].onOff = true;
                        }
                    }
                    element.style.display = "none";                
                    idrElem.css("border-color", checkHexColor);                    
                }
            }
            if(modelInTypePtap) {
                listElements[element.getAttribute("plantElement")] = {'name': element.getAttribute("name"), 
                                                                    'graphId': element.getAttribute("graphId")};
            }            
        });
        
        var elements = Object.keys(listElements).join(',');
        if (elements.length > 0) {
            var country = localStorage.getItem('country');
            var urlDetail = basePathURL + "getInfoTreeMany/?elements=" + elements + "&country=" + country;
            $.getJSON(urlDetail, function(data) {
                let awy = parseFloat(arrayPtap[0].awy) / (24*365*3600);
                Object.keys(listElements).forEach(function(element) {
                    let functionsByElement = data.filter(f => (f.normalizedCategory === element));
                    plant.elements[element] = {default: functionsByElement, custom: {}};
                    // Validate if plan.functions have previous data
                    if (Object.keys(plant.functions).length == 0) {                        
                        let defaultFunctions = data.filter(f => f.default);
                        defaultFunctions.forEach(f =>{
                            var graphid = listElements[f.normalizedCategory].graphId;  
                            addFnToPlantObj(f, graphid);
                        });
                        // filter by caudal
                        defaultFunctions = data.filter(f => (f.greaterCaudal != undefined && f.caudal != undefined));
                        defaultFunctions.forEach(f =>{
                            var graphid = listElements[f.normalizedCategory].graphId;                            
                            if (f.greaterCaudal){ // if value is true operator is >= else 
                                f.default = f.caudal >= awy;
                            }else{
                                f.default = f.caudal < awy;
                            }
                            if (f.default){
                                addFnToPlantObj(f, graphid);
                            }
                        });                        
                    }              
                });
                toggleProcessingModal('hide');
            });
        }
    };
    /**
    * Deletes the intakes selected for the calculation of the Ptap
    * @param {String} object to delete for the sectioned intake
    * @returns 
    */
    deleteOption = function(e) {
        $("#child" + e).remove();
        if ($("#idTbodyIntake tr").length == 0) {
            $('#idIntakePlant').prop('required',true);
            $('#idIntakePlant').val("");
            $('#idIntakePlant').focusin();
            $('#idIntakePlant').focusout();
        }        
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
                object.innerHTML = HYPHEN;
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
    drawPolygons = function(map) {
        let lf = [];
        treatmentPlants.forEach(tp => {
            if (tp.geom) {
                let g = JSON.parse(tp.geom);
                f = {'type' : 'Feature', 
                    'properties' : { 'id' : tp.plantId, 
                                    'plantName' : tp.plantName,
                                    'intake' : tp.plantIntakeName[0],
                                    'description' : tp.plantDescription}, 
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
                                            <b>Id</b>: ${feature.properties.id}
                                        </div>
                                        <div class="popup-body">
                                            <div class="popup-body-content">
                                                <div class="popup-body-content-text">
                                                    <p><b>Plant Name</b> :${feature.properties.plantName}</p>
                                                    <p><b>Intake </b>: ${feature.properties.intake}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`);
                }
            }).addTo(map);
            map.fitBounds(lyrIntakes.getBounds());
        }
    };
    /**
    * Change the values of the formulas for each of the elements
    * @param {String} id of the element to change state
    * @param {String} value to limit the possible values that can be assigned to the formula    
    * @returns 
    */
    changeRetained =  function(i, inputElement) {
        let val = Number.parseFloat(inputElement.value);
        let min = inputElement.getAttribute("min");
        let max = inputElement.getAttribute("max");
        let showMsg = false;

        let msgRange = gettext("The value must be between %s and %s");
        let msg = "";
        msgRange = interpolate(msgRange, [min, max]);
        if(val < Number.parseFloat(min)) {            
            msg = gettext(`The minimum value is %s please use the arrows`);
            msg = interpolate(msg, [min]);        
            inputElement.value = min;
            val = inputElement.value;
            showMsg = true;
        }
        if(val > Number.parseFloat(max)) {
            msg = gettext(`The maximum value is %s please use the arrows`);
            msg = interpolate(msg, [max]);
            inputElement.value = max;
            val = inputElement.value;
            showMsg = true;
        }
        if (showMsg) {
            Swal.fire({
                icon: 'warning',
                title: msgRange,
                text: msg
            });
        }

        let parent = $(inputElement).parents().get(4);
        $(parent).find('[name=listFunction]').each(function (i,e){
            let fnName = e.attributes.technology.value + "-" + e.attributes.namefunction.value;
            let retentions = {'Sediments': 'sedimentsRetained',
                            'Nitrogen': 'nitrogenRetained',
                            'Phosphorus': 'phosphorusRetained'}
            for (k in retentions){
                if (inputElement.id.indexOf(k) > -1 && plant.functions[fnName] != undefined){                    
                    plant.functions[fnName][retentions[k]] = val;
                }
            }            
        });

    };
    /**
    * Load the tree with the formulas when selecting an element
    * @param {String} selected element
    * @returns 
    */
    viewTree = function(e) {
        console.log("viewTree", e);
        $("#mainTree").hide();
        selectedPlantElement = e.getAttribute("plantElement");
        $(".container-element").removeClass('container-element-selected');
        $(e.parentElement).addClass('container-element-selected');
        $("#mainTree").show();
        loadArrayTree(selectedPlantElement,  e.getAttribute("nameElement"), e.getAttribute("graphid"));        
        $('html, body').animate({
            scrollTop: $("#black2").offset().top
        }, 600);        
    };

    /**
    * Add new technology in the tree
    * @param {String} div the parent object for inject the HTML form
    * @returns 
    */
    addNewTechnology = function(parentId) {
        var node = document.createElement("div");
        node.classList.add("mark");
        var idNewTech = "new-tech-" + Date.now();
        var textNewForm = `<div class="title-tree col-md-12" id="contentTechnology${idNewTech}">
            <div class="point-tree" onclick="viewBranch('technology${idNewTech}', this)">-</div> 
            <div class="text-tree"><div style="display:flex;"><label technology='${idNewTech}'>${lblTechnology}:</label>
            <input type="text" id="${idNewTech}" class="form-control new-tech-input" 
            style="position:relative;top:-6px; value=${idNewTech}" onkeydown="keyupNewTech(this)" 
            placeholder="${_('Enter name technology')}"></div></div></div>
            <div class="margin-main overflow-form col-md-12" id="technology${idNewTech}">
            <div class="container-var" id="idContainerVar${idNewTech}"><div>
        ${createInput('% '+ lbl.transportedWater, 100, "", null, null, null, null, false, null, null, 'number')}
        ${createInput('% '+ lbl.sediments, null, null, null, null, null, lbl.placeholderSediments, true, null, null, 'number')}  
        </div><div>
        ${createInput('% '+ lbl.nitrogen, null, null, null, null, null, lbl.placeholderNitrogen, true, null, null, 'number')}
        ${createInput('% '+ lbl.phosphorus, null, null, null, null, null, lbl.placeholderPhosphorus, true, null, null, 'number')}
        </div></div>${tableFunctionTpl}<div class="link-form">${_('Add function')}</div></div>`;
        
        node.innerHTML = textNewForm;
        let elParent = document.getElementById(parentId);
        elParent.appendChild(node);
        $('html, body').animate({
            scrollTop: $("#" + idNewTech).offset().top
        }, 900);
    };

    keyupNewTech = function (e) {
        let link = $($(e).parents().get(3)).find(".link-form")[0];
        if (e.value.trim().length > 2) {
            link.style.display = "block";         
        }else{
            link.style.display = "none";
        }
    };       

    /**
    * Load the tree variables
    * @param {String} graph element
    * @param {String} element name
    * @param {String} element id
    * @returns 
    */
    loadArrayTree = function(plantElement, nameElement, graphid) {
        console.log("loadArrayTree", plantElement, nameElement, graphid);
        functionsByCustomTech = {};
        if (plant.elements.hasOwnProperty(plantElement)) {
            console.log("fill from dictionary");
            let plantFn = plant.elements[plantElement]['default'];
            if (plantFn == undefined) {
                plantFn = [];
                let catFilter = categories.filter(c => (c.normalized_category == plantElement));
                catFilter.forEach(c => {
                    let k = Object.keys(plant.functions);
                    k.forEach(l => {
                        let f = plant.functions[l];
                        let categoryFn = l.split(HYPHEN)[0];
                        if (categoryFn == c.categorys) {
                            let fId = f.technology + HYPHEN + f.nameFunction;
                            plantFn.push(plant.functions[fId]);
                        }else{
                            if (plant.functions[l].graphid == graphid) {
                                functionsByCustomTech[l] = plant.functions[l];
                            }
                        }                        
                    });
                });
            }else{
                let listCategories = [];
                categories.filter(c => (c.normalized_category == plantElement)).forEach(c => {
                    listCategories.push(c.categorys);
                });
                for (k in plant.functions){
                    let categoryFn = k.split(HYPHEN)[0];
                    if (listCategories.indexOf(categoryFn) == -1) {
                        if (plant.functions[k].graphid == graphid) {
                            functionsByCustomTech[k] = plant.functions[k];
                        }
                    }
                }
            }
            fillTree(plantFn, plantElement, nameElement, graphid);            
        }else{
            console.log("fill from url");
            var urlDetail = basePathURL + "getInfoTree/?plantElement=" + plantElement + 
                            "&country=" + localStorage.getItem('country');
            $.getJSON(urlDetail, function(data) {
                let awy = parseFloat(arrayPtap[0].awy) / (24*365*3600);
                plant.elements[plantElement] = {default: data, custom: {}};
                let defaultFunctions = data.filter(f => f.default);
                defaultFunctions.forEach(f =>{
                    if (f.greaterCaudal != undefined && f.caudal != undefined && !f.default){
                        if (f.greaterCaudal){ // if value is true operator is >= else 
                            f.default = f.greaterCaudal >= awy;
                        }else{
                            f.default = f.greaterCaudal < awy;
                        }
                    }
                    addFnToPlantObj(f, graphid);                    
                });                
                fillTree(data, plantElement, nameElement, graphid);
                toggleProcessingModal('hide');
            });
        }        
    };

    /**
     *  Fill Tree with data from plantElement
     * 
     */
    fillTree = function(data, plantElement, nameElement, graphid) {
        console.log("fillTree", data);
        var lastTreeBranch = [];
        var readOnlyTextTree = onlyReadPlant ? "readonly" : "";        
        var lastSubprocess = "";        
        let lblSubprocess = _("Subprocess");
        nameElement = nameElement === null ? "N/A" : nameElement;
        
        $('#mainTree').html(`<div class="title-tree col-md-12" graphId='${graphid}'>
                            <div class="point-tree" onclick="viewBranch('id${plantElement}', this)" >-</div>
                            <div class="text-tree">${_(nameElement)} </div><div class="detail-tree"></div></div> 
                            <div class="margin-main" id="id${plantElement}"></div>`);
        let fnTechParent;;
        $.each( data, function( key, value) {
            if(value.subprocessAddId !== lastSubprocess) {
                fnTechParent = value;
                if(value.subprocess == undefined) {
                    value.subprocess = "N/A";
                }
                var listTrFunctionCustom = [];
                var linkaddNewTechnology = ">";
                if(localStorage.loadFormButton === "true") {                    
                    linkaddNewTechnology = `onclick="addNewTechnology('subprocess${value.idSubprocess}')">${_('Add new technology')}`;
                }
                var h = `<div class="title-tree col-md-12"><div class="point-tree" onclick="viewBranch('subprocess${value.idSubprocess}', this)" >-</div>
                <div class="text-tree">${lblSubprocess}: ${_(value.subprocess)}</div>
                <div class="link-form-2" style="display:block;"${linkaddNewTechnology}</div></div>
                <div class="margin-main" id="subprocess${value.idSubprocess}"></div>`;                
                $('#id' + plantElement).html($('#id' + plantElement).html() + h);
                                
                lastSubprocess = value.subprocessAddId;
                $.each( data, function( keyTech, valueTech) {
                    if(value.subprocessAddId === valueTech.subprocessAddId) {
                        if(lastTreeBranch.indexOf(valueTech.technology) === -1){
                            let techId = valueTech.idSubprocess;
                            if(valueTech.technology === null) {
                                valueTech.technology = "N/A";
                            }
                            var ht = `<div class="title-tree col-md-12" id="contentTechnology${techId}"> 
                                    <div class="point-tree" onclick="viewBranch('technology${techId}', this)">-</div>
                                    <div class="text-tree"><label technology='${valueTech.technology}'>${lblTechnology}:</label> 
                                    ${_(valueTech.technology)}</div></div><div class="margin-main overflow-form col-md-12" id="technology${techId}"></div>`;
                            let htmlSubprocess = $('#subprocess' + value.idSubprocess).html() + ht;
                            $('#subprocess' + value.idSubprocess).html(htmlSubprocess);
                            var loadHtml = true;
                            var tableVar = "";
                            var buttonsHtml = true;
                            var activateHtml = "";
                            var listTrFunction = [];
                            var listCustomFunctionsId = {};
                            let checked=false;
                            let enableAddFn = false;
                            let filterCostFunction;
                            let sediments = nitrogen = phosphorus = 0;
                            
                            $.each( data, function( keyCostFunction, valueCostFunction) {
                                var fnId = valueCostFunction.technology + HYPHEN + (valueCostFunction.costFunction==undefined?valueCostFunction.nameFunction:valueCostFunction.costFunction);
                                if(valueTech.technologyAddId === valueCostFunction.technologyAddId) {
                                    if(lastTreeBranch.indexOf(valueCostFunction.technology) === -1){
                                        lastTreeBranch.push(valueTech.technology);
                                        listTrFunctionCustom = [];
                                    }
                                    if (loadInfoTree) {                                        
                                        buttonsHtml = true;
                                        let fnFilterByTech = arrayLoadingFunction.filter(f => (f.functionTechnology === valueCostFunction.technology));
                                        if(fnFilterByTech.length == 0) {                                            
                                            activateHtml = htmlCheckBox(valueCostFunction, graphid, null,(listTrFunction.length==0 ? "" : listTrFunction.length),plant.functions.hasOwnProperty(fnId),value.subprocess);
                                            listTrFunction.push(addFunctionCostRow(activateHtml, valueCostFunction, buttonsHtml, graphid,(listTrFunction.length==0 ? "" : listTrFunction.length)));
                                        }else {                                            
                                            // add all default fn even including unchecked
                                            activateHtml = htmlCheckBox(valueCostFunction, graphid, valueCostFunction.idSubProcess,"",false);
                                            let strHtmlCustomfn = addFunctionCostRow(activateHtml, valueCostFunction, buttonsHtml, graphid,(listTrFunction.length==0 ? "" : listTrFunction.length),value.subprocess);
                                            listTrFunctionCustom[fnId] = strHtmlCustomfn;          
                                            /******************************************/
                                            fnFilterByTech.forEach(f => {
                                                filterFn = {...valueCostFunction,
                                                    sedimentsRetained: f.functionSedimentsRetained,
                                                    nitrogenRetained: f.functionNitrogenRetained,
                                                    phosphorusRetained: f.functionPhosphorusRetained,
                                                    costFunction: f.functionName,
                                                    function: f.functionValue,
                                                    currency: f.functionCurrency,
                                                    factor: f.functionFactor,
                                                    idSubprocess : f.functionIdSubProcess,
                                                    technology : f.functionTechnology,
                                                };
                                                nitrogen = f.functionNitrogenRetained;
                                                phosphorus = f.functionPhosphorusRetained;
                                                sediments = f.functionSedimentsRetained;
                                                let customFnName = f.functionTechnology + HYPHEN + f.functionName;
                                                checked = plant.functions.hasOwnProperty(customFnName);
                                                enableAddFn = enableAddFn || checked;
                                                activateHtml = htmlCheckBox(filterFn, graphid, f.functionIdSubProcess,(listTrFunction.length==0 ? "" : listTrFunction.length),checked,value.subprocess);                                             
                                                let strHtmlCustomfn = addFunctionCostRow(activateHtml, filterFn, buttonsHtml, graphid,(listTrFunction.length==0 ? "" : listTrFunction.length));
                                                if (!listCustomFunctionsId.hasOwnProperty(customFnName)) {
                                                    listTrFunctionCustom[customFnName] = strHtmlCustomfn;
                                                }else{
                                                    htmlCustomFn = $(strHtmlCustomfn);
                                                    if (htmlCustomFn.find('[name=listFunction]')[0].attributes.checked.value == "true") {
                                                        listTrFunctionCustom[customFnName] = strHtmlCustomfn;
                                                    }
                                                }
                                            });
                                        }                                        
                                    } else {
                                        loadHtml = true;
                                        checked = !checked ? plant.functions.hasOwnProperty(fnId) : checked;
                                        enableAddFn = enableAddFn || checked;
                                        activateHtml = htmlCheckBox(valueCostFunction,graphid, techId, "", plant.functions.hasOwnProperty(fnId) ,value.subprocess);
                                        listTrFunction.push(addFunctionCostRow(activateHtml, valueCostFunction, buttonsHtml, graphid,''));
                                    }
                                    if(loadHtml) {
                                        let v = (filterCostFunction != undefined ? filterCostFunction : valueCostFunction);                                        
                                        let onBlurFn = `onblur="changeRetained('${techId}', this)"`;
                                        tableVar = `<div class="container-var" id="idContainerVar${techId}"><div>
                                        ${createInput('% ' + lbl.transportedWater , 100, "", null, null, null, null, !checked, null, null)}
                                        ${createInput('% ' + lbl.sediments, sediments, (onlyReadPlant?'':null), v.minimalSedimentsRetained, v.maximalSedimentsRetained, '0.1', lbl.placeholderSediments, checked,'idSedimentsRetained'+techId,onBlurFn,'number', v.sedimentsRetained)}  
                                        </div><div>
                                        ${createInput('% ' + lbl.nitrogen, nitrogen, (onlyReadPlant?'':null), v.minimalNitrogenRetained, v.maximalNitrogenRetained, '0.1', lbl.placeholderNitrogen, checked,'idNitrogenRetained'+techId,onBlurFn,'number', v.nitrogenRetained)}
                                        ${createInput('% ' + lbl.phosphorus, phosphorus, (onlyReadPlant?'':null), v.minimalPhosphorusRetained, v.maximalPhosphorusRetained, '0.1', lbl.placeholderPhosphorus, checked,'idPhosphorusRetained'+techId,onBlurFn,'number', v.phosphorusRetained)}
                                            </div></div>`;                                        
                                    }                                     
                                }
                            });
                            if (Object.keys(listTrFunctionCustom).length > 0) {
                                listTrFunction = listTrFunctionCustom;
                                for (k in listTrFunctionCustom){
                                    listTrFunction.push(listTrFunctionCustom[k]);
                                }
                            }
                            var tableFunct = tableFunctionTpl.replace("<tbody>", "<tbody>" + listTrFunction.join(""));
                            if(localStorage.loadFormButton === "true") {
                                let style = `style='display:${(enableAddFn ? 'block' : 'none')}' `;
                                tableFunct += `<div class="link-form" ${style} subprocess="${value.subprocess}"> ${_('Add function')} </div>`;
                            }
                            $('#technology' + techId).html($('#technology' + techId).html() + tableVar + tableFunct);
                        }
                    }
                });
            }
        });

        let keysCustomFns = Object.keys(functionsByCustomTech);
        if (keysCustomFns.length > 0) {
            listTrFunction = [];
            let customFn = functionsByCustomTech[keysCustomFns[0]];
            let techName = customFn.technology;
            let sediments = customFn.sedimentsRetained;
            let nitrogen = customFn.nitrogenRetained;
            let phosphorus = customFn.phosphorusRetained;
            keysCustomFns.forEach(key => {
                customFn = functionsByCustomTech[key];
                let graphid = customFn.graphid;                
                let activateHtml = htmlCheckBox(customFn, graphid, customFn.idSubProcess, "", true,null);
                let strHtmlCustomfn = addFunctionCostRow(activateHtml, customFn, true, graphid,"");
                listTrFunction.push(strHtmlCustomfn);
            });
            var idNewTech = "new-tech-" + Date.now();
            let onBlurFn = `onblur="changeRetained('${idNewTech}', this)"`;
            var tableFunct = tableFunctionTpl.replace("<tbody>", "<tbody>" + listTrFunction.join(""));
            var htmlTech = `<div class="title-tree col-md-12" id="contentTechnology${idNewTech}">
                <div class="point-tree" onclick="viewBranch('technology${idNewTech}', this)">-</div> 
                <div class="text-tree"><div style="display:flex;"><label technology='${techName}'>${lblTechnology}:</label> ${techName}
                </div></div></div><div class="margin-main overflow-form col-md-12" id="technology${idNewTech}">
                <div class="container-var" id="idContainerVar${idNewTech}"><div>
                ${createInput('% '+ lbl.transportedWater, 100, "", null, null, null, null, false, null)}
                ${createInput('% '+ lbl.sediments, sediments, null, null, null, null, lbl.placeholderSediments, true,'idSedimentsRetained'+idNewTech,onBlurFn,'number', null)}
                </div><div>
                ${createInput('% '+ lbl.nitrogen, nitrogen, null, null, null, null, lbl.placeholderNitrogen, true,'idNitrogenRetained'+idNewTech,onBlurFn,'number', null)}
                ${createInput('% '+ lbl.phosphorus, phosphorus, null, null, null, null, lbl.placeholderPhosphorus, true,'idPhosphorusRetained'+idNewTech,onBlurFn,'number', null)}
                </div></div>${tableFunct}<div class="link-form">${_('Add function')}</div></div>`;           
            $('#subprocess' + fnTechParent.idSubprocess).html($('#subprocess' + fnTechParent.idSubprocess).html() + htmlTech);
        }
        validateAndAddFunction2Array();
        $('[data-toggle="tooltip"]').tooltip({trigger:'hover',placement:'auto'});
        if (onlyReadPlant){
            $('.btn-function-cost').prop('disabled', true);
        }
    }

    /**
    * Change the state of the element in the graph
    * @param {Object} element object
    * @returns 
    */
    changeStatus = function(i, element) {
        console.log("changeStatus", i);
        let attrs = element.attributes;   
        let isElement = attrs.technology == undefined;  //  true if the element is a function
        let technology;
        let fnName;
        let idFnPlant;
        if (!isElement) {
            technology = attrs.technology.value;
            fnName = attrs.namefunction.value;
            idFnPlant = technology + HYPHEN + fnName;
        }
        var e = document.getElementById("id" + i);
        let isChecked = e.style.borderColor === checkHexColor || e.style.borderColor === "rgb(3, 158, 220)";
        let styleDisplay = "block";
        let styleBorderColor = whiteColor;
        
        if(!onlyReadPlant) {            
            if(!isChecked) {
                styleDisplay = "none";
                styleBorderColor = checkHexColor;
                if (!isElement) {
                    $("[name=listFunction]").each(function( index, elem ) {                    
                        let isCustomFunction = e.id.indexOf(elem.id) !== -1 || elem.id.indexOf(e.id) !== -1;
                        if(elem.id !== e.id && elem.attributes.technology.value !== e.attributes.technology.value) {  
                            if (selectedPlantElement == "TRATAMIENTODELODOS"){
                                console.log(selectedPlantElement);
                                if (elem.attributes.subprocess.value != e.attributes.subprocess.value){
                                    console.log(elem.attributes.subprocess.value, e.attributes.subprocess.value);
                                }
                            }else{
                                elem.style.borderColor = whiteColor;
                                let attr = elem.attributes;
                                delete plant.functions[attr.technology.value + HYPHEN + attr.namefunction.value];
                                console.log("delete plant.functions[idFnPlant]", attr.technology.value + HYPHEN + attr.namefunction.value);
                                if (document.getElementById(elem.id + "1d") !== null) {
                                    document.getElementById(elem.id + "1d").style.display = "block";
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
            }
            e.style.borderColor = styleBorderColor;
            if (isElement){                
                if (document.getElementById(e.id + "1d") !== null) {
                    document.getElementById(e.id + "1d").style.display = styleDisplay;
                    let ptapElement = document.getElementById("black" + i);
                    let graphId = ptapElement.getAttribute("graphId");
                    let plantElement = ptapElement.getAttribute("plantElement");
                    
                    let filterPlant = arrayPlant.filter ( p => p.graphId == graphId);
                    if (filterPlant.length > 0) {
                        filterPlant[0].onOff = !isChecked;
                        if (isChecked){ //remove
                            if (plant.elements.hasOwnProperty(plantElement)) {
                                let pe = plant.elements[plantElement];
                                if (pe.default != undefined && pe.default.length > 0) {
                                    pe.default.forEach(e => {
                                        let fnId = e.technology + HYPHEN + (e.nameFunction==undefined?e.costFunction:e.nameFunction);
                                        delete plant.functions[fnId];
                                    });
                                }else{
                                    let catFilter = categories.filter(c => (c.normalized_category == plantElement));
                                    catFilter.forEach(c => {
                                        let k = Object.keys(plant.functions);
                                        k.forEach(l => {
                                            let f = plant.functions[l];
                                            let categoryFn = l.split("-")[0];
                                            if (categoryFn == c.categorys) {
                                                let fId = f.technology + HYPHEN + (e.nameFunction==undefined?e.costFunction:e.nameFunction);
                                                delete plant.functions[fId];
                                            }
                                        });
                                    });
                                }
                                delete plant.elements[plantElement];
                            }
                        }else{
                            let el = $("#black"+i)
                            viewTree(el[0]);
                        }
                    }
                }
            }            
            validateAndAddFunction2Array();
        }
        
        if (!isElement){
            if (element.attributes.checked.value === "true") {
                element.attributes.checked.value = "false";            
                delete plant.functions[idFnPlant];
                console.log("delete plant.functions[idFnPlant]", idFnPlant);
            }else{
                let divContainerVar = $(element).parents().get(6).children[0];
                let inputs = divContainerVar.getElementsByTagName("input");
                let sediments = inputs[1].value;
                let nitrogen = inputs[2].value;
                let phosphorus = inputs[3].value;
                attrs.checked.value = "true";
                plant.functions[idFnPlant] = {
                    graphid: attrs.graphid.value,
                    technology: attrs.technology.value,
                    nameFunction: attrs.namefunction.value,
                    functionValue: attrs.function.value,
                    currency: attrs.currency.value,
                    factor: attrs.factor.value,
                    idSubprocess: attrs.idsubprocess.value,
                    sedimentsRetained: sediments,
                    nitrogenRetained: nitrogen,
                    phosphorusRetained: phosphorus,
                    id: attrs.id.value
                };
                console.log("adding plant.functions: ", idFnPlant);
            }
        }

        // if(element.attributes.checked.value = "false"){
        //     showMessageModal(_('Information'),_("'Please, complete the form"),'warning');
        // };
    };

    /**
    *  Validate and add funtion in arrayFunction    
    * 
    */
    validateAndAddFunction2Array = function() {
        console.log("validateAndAddFunction2Array");
        $("[name=listFunction]").each(function( index, element ) {
            // if(element.style.borderColor != "rgb(3, 158, 220)") {
            //     showMessageModal(_('Information'),_("'Please, complete the form"),'warning');
            // }
            if(element.style.borderColor === "rgb(3, 158, 220)") {
                var addFunctionToArray = true;
                for (var funVar = 0; funVar < arrayFunction.length; funVar++) {
                    if(arrayFunction[funVar].nameFunction === element.getAttribute("nameFunction") &&
                        arrayFunction[funVar].technology === element.getAttribute("technology")) {
                        addFunctionToArray = false;
                    }
                }

                if(addFunctionToArray) {
                    let elId = element.getAttribute("idSubprocess");
                    let elIdMaster = element.getAttribute("subprocessmaster");
                    let divContainerVar = $(element).parents().get(6).children[0];
                    let inputs = divContainerVar.getElementsByTagName("input");
                    let sediments = inputs[1].value;
                    let nitrogen = inputs[2].value;
                    let phosphorus = inputs[3].value;

                    let costFunction = {
                        graphId: element.getAttribute("graphid"),
                        technology: element.getAttribute("technology"),
                        nameFunction: element.getAttribute("nameFunction"),
                        functionValue: element.getAttribute("function"),
                        currency: element.getAttribute("currency"),
                        factor: element.getAttribute("factor"),
                        description: "",
                        idSubprocess:  elId,
                        sedimentsRetained: sediments,
                        nitrogenRetained: nitrogen,
                        phosphorusRetained: phosphorus,
                        id: -1
                    }
                    addFunction2Array(costFunction);
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
        table.search(cityName.substr(0, 5)).draw();
        let urlAPI = SEARCH_COUNTRY_API_URL + countryCode;

        $.get(urlAPI, function(data) {
            $("#regionLabel").html(data.region);
            $("#currencyLabel").html(data.currencies[0].name + " - " + data.currencies[0].symbol);
            
            localStorage.setItem('country', country);
            localStorage.setItem('region', data.region);
            localStorage.setItem('currencyCode', data.currencies[0].name);
            localStorage.setItem('currency', data.countryId);
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
        //drawPolygons(cityName);
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
                    placeholder: _('Search City...'),
                    position: 'topleft',
                    url: SEARCH_CITY_API_URL
                },
                /* defaultExtentControl: true */
            });

            let initialCoords = CENTER;
            var cityCoords = localStorage.getItem('cityCoords');
            var city = localStorage.getItem('city');
            var initialZoom = 5;            

            if (cityCoords == undefined) {
                cityCoords = initialCoords;
            } else {
                initialCoords = JSON.parse(cityCoords);
                initialZoom = 9;
                try {
                    $("#countryLabel").html(localStorage.getItem('country'));
                    $("#cityLabel").html(localStorage.getItem('city'));
                    $("#regionLabel").html(localStorage.getItem('region'));
                    $("#currencyLabel").html(localStorage.getItem('currencyCode'));
                    $("#listIntakes").show();
                } catch (e) {

                }
            }

            map.setView(initialCoords, initialZoom);            
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
            L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);
            var zoomControl = new L.Control.Zoom({ position: 'topright' }).addTo(map);
            //var defaultExtent = L.Control.DefaultExtent({ title: _('Default extent'), position: 'topright'}).addTo(map);
            

            searchPoints = L.geoJson(null, {
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(feature.properties.name);
                }
            });
            searchPoints.addTo(map);
        } else {
            document.getElementById("nameCity").innerHTML = localStorage.getItem('city')+", "+localStorage.getItem('country');
            var urlDetail = basePathURL + "getIntakeList/?cityId=" + localStorage.getItem('cityId');
            $.getJSON(urlDetail, function (data) {
                var selectElIntake = document.getElementById("idIntakePlant");
                //selectElIntake.length = 1;
                if (data.length > 0) {
                    localStorage.setItem('idCityTreatmentPlant', data[0].cityId);
                    var listIntakeName = [];
                    $.each( data, function( key, value ) {                        
                        // TODO: Review duplicate intakes name
                        //if (listIntakeName.indexOf(value.nameIntake) == -1) {
                        //    listIntakeName.push(value.nameIntake);
                            var option = document.createElement("option");
                            option.text = value.nameIntake;
                            option.setAttribute("value", value.id);
                            option.setAttribute("namelist", value.name);
                            option.setAttribute("graphIdlist", value.graphId);
                            option.setAttribute("intake", value.nameIntake);
                            option.setAttribute("csinfra", value.csinfra);
                            selectElIntake.add(option);
                        //}                        
                    });
                }                
            });
        }
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
        window.location.href = basePathURL + "view/" + plantId;
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
        window.location.href = basePathURL + "update/" + plantId;
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
        localStorage.clonePlantId = plantId;
        window.location.href = basePathURL + "clone/" + plantId;
    };
    /**
    * Load the page to delete a treatment plant
    * @param {String} plant code    
    * @returns 
    */
    deletePlant = function(plantId,element) {
        
        var urlCountPlants = "getCountStudyCasesByPlant/" + plantId;
        var promise = $.ajax({
            url: urlCountPlants,
            type: 'GET',
            dataType: 'json'
        });
        promise.done(function (data) {
            console.log(this);
            if (data.count > 0) {
                element.classList.add("disabled");
                Swal.fire({
                    text: _("This treatment plant is in use by some study cases and can't be deleted."),
                });
            } else {
                Swal.fire({
                    title: "<div style='font-size: 25px;'>" + _("Are you sure?") + "</div>",
                    text: _("You won't be able to revert this!"),
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: _('Yes, delete it!')
                }).then((result) => {
                    if (result.isConfirmed) {
                        var urlDetail = basePathURL + "setHeaderPlant/";
                        $.ajax({
                            url: urlDetail,
                            method: 'DELETE',
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            data: JSON.stringify({
                                "plantId" : plantId
                            }),success: function(result) {
                                window.location.href =basePathURL + "?limit=5&city=" + localStorage.getItem('cityId');
                                localStorage.plantId = null;
                            },error: function (err) {
                                showMessageModal('Error',_('Error deleting the treatment plant, it must already be used in a case study'),'error');
                            }
                        });
                    }
                })
            }
        });
    };

    // add function cost
    $(document).on('click', '.link-form', function() {
        console.log("click");
        var graphId = $('#mainTree .title-tree')[0].getAttribute('graphId');
        addFunction = true;
        selectedTechnologyId = this.parentElement.id.replace("technology","");
        selectedSubprocess = this.getAttribute('subprocess');
        showModalCalculator(addFunction, graphId, {'expression': '', 'name':''});
    });

    //Edit funcion cost 
    $(document).on('click', '.btn-function-cost', function() {
        let graphId = this.getAttribute('graphId');
        addFunction = false;
        //let elCheck = this.parentElement.parentElement.children[0].children[0].children[0];
        let elCheck = $($(this).parents()[1]).find("[name=listFunction]")[0];
        let costFunction = {
            "expression": elCheck.getAttribute("function"),
            "name": elCheck.getAttribute("namefunction"),
            "currency": elCheck.getAttribute("currency"),
            "factor": elCheck.getAttribute("factor"),
            "technology" : elCheck.getAttribute("technology"),
        };
        selectedFunction4Edit = elCheck;
        showModalCalculator(addFunction,graphId,costFunction); 
    });

    //add function cost row
    addFunctionCostRow = function(activateHtml,costFn,buttonsHtml,graphid, subid) {
        let htmlBtn = '';
        if (buttonsHtml){
            htmlBtn = '<a class="btn btn-info btn-function-cost" graphid=' + graphid + 
                        ' data-toggle="modal" data-target="#CalculatorModal">' + 
                        '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>';                                                
        }
        let tdClass = 'class="small text-center vat"';
        let fnName = _(costFn.costFunction==undefined?costFn.nameFunction:costFn.costFunction);
        let exp = (costFn.function==undefined?costFn.functionValue:costFn.function).replaceAll('else', 'else <br>');
        if (exp != 0 || exp != null){
            let tooltipAttr = ` data-toggle='tooltip' title='${exp}' `;
            let rowFn = `<tr><td>${activateHtml}</td>
            <td ${tdClass}>${fnName}</td>
            <td ${tdClass}><div class="text-center"><div class="open-popup-form" ${tooltipAttr}>fx</div></div></td><td ${tdClass}>${costFn.currency}</td>
            <td ${tdClass}>${costFn.factor}</td><td aling="center">${htmlBtn}</td></tr>`;
            return rowFn;
        }else{
            showMessageModal('Error',result.detail,'error');                                
        }
    }

    // add titles to the table function
    function addTitleFnRow(titles){
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
            if (costFunction.currency == "USD") {
                $('#currencyCost option').filter((i,l) => {return l.hasAttribute("data-country")} ).prop("selected",true);
            }
            $('#factorCost').val(costFunction.factor);
        }        
        if (costFunction.expression != "") {
            validatePyExpression();
        }else{
            typesetInput("");
        }
        
        let lblNewOrEdit = flagNewFunction ? addNewCost + " " + _('Function') : editCost;
        $("#saveAndValideCost").text(lblNewOrEdit);
        $('#CalculatorModalLabel').text(lblNewOrEdit);
        if (flagNewFunction && localStorage.getItem('factor') != undefined) {
            $('#factorCost').val(localStorage.getItem('factor'));
        }
        $('#factorCost').attr('graphId',graphId);
    }

    function setVarCost(element, graphid) {
        $('#CalculatorModalLabel').text(_('Edit cost'));
        $('#VarCostListGroup div').remove();        
        var costVars = ['Q', 'CSed', 'CN', 'CP', 'WSed', 'WN', 'WP', 'WSedRet', 'WNRet', 'WPRet'];        
        arrayPlant.forEach(function(plantElement, index) {
            if (plantElement.onOff || plantElement.graphId == 1){
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
                    </div>`);
            }              
        });        
    }

    function createInput(label, value, readonly, min, max, step, placeholder, enabled, id, events, type, defaultVal) {
        let idEl = id ? `id="${id}"` : "";
        let typeEl = type ? `type="${type}"` : "";
        let eventsEl = events ? `${events}` : "";
        value = (defaultVal != undefined && defaultVal != "") ? defaultVal : value;
        let val = (value == null ? "" : `value="${value}"`);
        let readonlyVal = (readonly == null ? "" : `readonly="${readonly}"`);
        let minVal = (min == null ? "" : `min="${min}"`);
        let maxVal = (max == null ? "" : `max="${max}"`);
        let defVal = (defaultVal == null ? "" : `default="${defaultVal}"`);
        let stepVal = (step == null ? "" : `step="${step}"`);
        let placeholderVal = (placeholder == null ? "" : `placeholder='${placeholder}'`);
        console.log(enabled+"this enabled")
        return `<div class="input-var"><div class="form-group"><label>${label}</label>
        <input class="form-control" ${typeEl} ${idEl} ${val} ${readonlyVal} ${minVal} ${maxVal} ${defVal} ${stepVal} ${placeholderVal} ${eventsEl} ${enabled?'':'disabled'}></input>
        <div class="help-block with-errors"></div></div></div>`;
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
        let symbols = [32,40,41,42,43,44,45,46,47,60,61,62,91,92,93,101,123,125];
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
            //console.error(err);
        }).then(function () {
            button.disabled = false;
        });
    }

    $('#saveAndValideCost').click(function(e) {
        toggleProcessingModal('show');
        let graphId = $('#mainTree .title-tree')[0].getAttribute('graphId');
        let fnName = $("#costFunctionName").val();
        let expression = $("#python-expression").val();
        let currency = $("#currencyCost").val();
        let factor = $("#factorCost").val();

        if (fnName == "" || expression == "") {
            showMessageModal(_("field_empty"),_("Please, complete the form"),'warning');            
            return;
        }

        if($('#costFunctionName').val() === ''){
            showMessageModal(_("field_empty"),_("Please, complete the form"),'warning'); 
            return false;
        }else if ($('#costFuntionDescription').val() === ''){
            showMessageModal(_("field_empty"),_("Please, complete the form"),'warning'); 
            return false;
        }else if ($('#factorCost').val() === ''){
            showMessageModal(_("field_empty"),_("Please, complete the form"),'warning'); 
            return false;
        }else if ($('#python-expression').val() === ''){
            showMessageModal(_("field_empty"),_("Please, complete the form"),'warning'); 
            return false;
        }else if (flagNewFunction){            
            let trNewFunction = addNewFunction(selectedTechnologyId, graphId, selectedSubprocess);
            var triggerClick = ($(`#technology${selectedTechnologyId} table tbody`)[0].children.length == 0);
            $(`#technology${selectedTechnologyId} table tbody`).append (trNewFunction);
            if (triggerClick) {
                a = "id" + selectedTechnologyId.substr(selectedTechnologyId.length-8);
                $(`#${a}`).trigger('click');
                $(`#${a}`).trigger('click');
            }
        }else{
            let fnId = selectedFunction4Edit.getAttribute('technology') + HYPHEN + selectedFunction4Edit.getAttribute('namefunction');
            selectedFunction4Edit.setAttribute('namefunction', fnName);
            selectedFunction4Edit.setAttribute('function', expression);
            selectedFunction4Edit.setAttribute('currency', currency);
            selectedFunction4Edit.setAttribute('factor', $("#factorCost").val());
            let trElem = $(selectedFunction4Edit).parents().get(2);
            $(trElem).find('.open-popup-form')[0].setAttribute('data-original-title', expression);
            plant.functions[fnId].functionValue = expression;
            plant.functions[fnId].nameFunction = fnName;
            plant.functions[fnId].currency = currency;
            plant.functions[fnId].factor = factor;
            trElem.children[1].innerText = fnName;
            trElem.children[3].innerText = currency
            trElem.children[4].innerText = factor;
        }
        $('#CalculatorModal').modal('hide');
        toggleProcessingModal('hide');
        e.stopPropagation();
    });

    addNewFunction = function(techId, graphId, subprocess){
        let fnName = $('#costFunctionName').val();
        let description = $('#costFuntionDescription').val();
        let factor = $('#factorCost').val();
        let currency = $('#currencyCost option:selected').val();        
        let pyExp = $('#python-expression').val();
        let technology="";
        if (techId.indexOf("new-tech") == -1) {
            technology = $("#contentTechnology" + techId + " .text-tree label")[0].getAttribute('technology');
        } else {
            technology = $("#" + techId).val();
        }        
        let inputs = $("#technology" + techId)[0].getElementsByTagName("input");
        let sediments = inputs[1].value;
        let nitrogen = inputs[2].value;
        let phosphorus = inputs[3].value;

        let fnNameId = technology + HYPHEN + fnName;
        let fns = Object.keys(plant.functions).filter(f => f.toUpperCase() == fnNameId.toUpperCase());
        if (fns.length > 0) {
            showMessageModal(_('Information'),_("Please, change the function name"),'warning');
            return;
        }

        let idSubprocess = (techId.length >= 8 ? techId.substring(techId.length-8) : techId);

        let costFunction = {
            "graphId": graphId,
            "technology": technology,
            "name": fnName,
            "expression": pyExp,
            "currency": currency,
            "factor": factor,
            "description": description,
            "idSubprocess": idSubprocess, /*tecnologyId,*/
            "sediments": sediments,
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            id: -1
        }
        let newFn = addFunction2Array(costFunction);
        plant.functions[fnNameId] = newFn; // add new function to the plant
        console.log("Add new Fn to plant");
        let costFn4Html = {
            costFunction: fnName,
            description: description,
            factor: factor,
            currency: currency,            
            function: pyExp,
            idSubprocess: idSubprocess,
            technology: technology
        }
        let subid = $("#technology" + techId + " table tbody tr").length; //num of rows in table
        let activateHtml = htmlCheckBox(costFn4Html, graphId, null, subid, true, subprocess);        
        let tdRowFn = addFunctionCostRow(activateHtml,costFn4Html,true,graphId,subid);
        return tdRowFn;
    }

    addFunction2Array = function(f) {        
        var nf = {graphid: (f.graphId ? f.graphId : f.graphid),
            technology: f.technology,
            nameFunction: (f.name ? f.name : f.nameFunction),
            functionValue: (f.expression ? f.expression : f.functionValue),
            currency: f.currency,
            factor: f.factor,
            idSubprocess: f.idSubprocess,
            sedimentsRetained: (f.sediments ? f.sediments : f.sedimentsRetained),
            nitrogenRetained: f.nitrogen,
            phosphorusRetained: f.phosphorus,
            id: f.id,
            greaterCaudal: f.greaterCaudal,
            caudal: f.caudal,};
        arrayFunction.push(nf);
        return nf;;
    }

    htmlCheckBox = function(valueCostFunction, graphid, subProcessMaster, subid, checked, subprocess) {
        // console.log("htmlCheckBox", subid, checked);
        let attrSubprocessMaster = "";
        if (subProcessMaster !== null) {
            attrSubprocessMaster ='subProcessMaster="' + subProcessMaster + '" ';
        }
        let activateHtml = '<div class="point-check"' + '>' +
                        '<div name="listFunction"  graphid="' + graphid + '" ' + attrSubprocessMaster + 
                        'technology="' + valueCostFunction.technology + '" ' + 
                        'idSubprocess="' + valueCostFunction.idSubprocess + '" ' + 
                        'nameFunction="' + (valueCostFunction.costFunction?valueCostFunction.costFunction:valueCostFunction.nameFunction) + '" ' + 
                        'function="' + (valueCostFunction.function?valueCostFunction.function:valueCostFunction.functionValue) + '" ' + 
                        'currency="' + valueCostFunction.currency + '" ' + 
                        'factor="' + valueCostFunction.factor + '" ' +
                        'subprocess="' + subprocess + '" ' +                        
                        'checked="' + checked.toString() + '" ' + (checked ? 'style="border-color:' + checkHexColor + ';" ' : '') +
                        'class="change-state-tree" id="id' + valueCostFunction.idSubprocess + 
                                (subid != "" ? HYPHEN + subid : "") + '"></div></div>';
        return activateHtml;
    }
    
    addFnToPlantObj = function(f, graphid) {        
        plant.functions[f.technology + HYPHEN + f.costFunction] = {
            graphid: graphid,
            technology: f.technology,
            nameFunction: f.costFunction,
            functionValue: f.function,
            currency: f.currency,
            factor: f.factor,
            idSubprocess: f.idSubprocess,
            sedimentsRetained: f.sedimentsRetained,
            nitrogenRetained: f.nitrogenRetained,
            phosphorusRetained: f.phosphorusRetained,
            id: f.id,
            greaterCaudal: f.greaterCaudal,
            caudal: f.caudal,
        };
    }

    toggleProcessingModal = function(showOrHide, title, message) {
        $('#_thumbnail_processing').modal(showOrHide);
        if (showOrHide == 'show') {
            if (title){
                $('#_thumbnail_processing .modal-header h1')[0].innerText=title;
            }
            if (message){
                $('#_thumbnail_processing .progress div')[0].innerText=message;
            }
        }        
    }

    showMessageModal = function(title, message, icon ) {
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        })
        toggleProcessingModal('hide');
    };

    _ = function(text) {
        return gettext(text);
    };        
});