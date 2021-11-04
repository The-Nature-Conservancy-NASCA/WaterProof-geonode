const connectionsType = {
    EC: { name: 'Extraction connection', id: 'EC', style: 'EXTRACTIONCONNECTION', funcionreference: 'EC' },
    CH: { name: 'Channel', id: 'CH', style: 'CHANNEL', funcionreference: 'C' },
    PL: { name: 'Pipeline', id: 'PL', style: 'PIPELINE', funcionreference: 'T' },
    CN: { name: 'Connection', id: 'CN', style: 'CONNECTION', funcionreference: 'CON' },
}

// Function to create the entries in the popupmenu
function createPopupMenu(graph, menu, cell, evt) {
    if (cell != null) {
        if (cell.geometry.width == 0 && cell.geometry.height == 0) {
            if (cell.hasOwnProperty("value") && cell.value != undefined) {
                if (typeof(cell.value) == 'string' && cell.value.indexOf("connectorType") != -1) {
                    let obj = JSON.parse(cell.value);
                    if (obj.connectorType == connectionsType.EC.id) {
                        // selected edge is Extraction Connection, can't change type
                        return;
                    }
                }
            }
            let existEC = false; // validate just one Extraction connection type
            for (k in graph.model.cells) {
                let cell = graph.model.cells[k];
                if (cell.hasOwnProperty("value") && cell.value != undefined) {

                    if (typeof(cell.value) == 'string' && cell.value.indexOf("connectorType") != -1) {
                        let obj = JSON.parse(cell.value);
                        if (obj.connectorType == connectionsType.EC.id) {
                            existEC = true;
                            break;
                        }
                    }
                }
            }
            for (k in connectionsType) {
                let type = connectionsType[k];
                if (k != connectionsType.EC.id) {
                    menu.addItem(connectionsType[k].name, '', function() {
                        updateStyleLine(graph, cell, type);
                    });
                } else {
                    if (!existEC) {
                        menu.addItem(connectionsType[k].name, '', function() {
                            updateStyleLine(graph, cell, type);
                        });
                    }
                }
            }
        }
    } else {
        menu.addItem('No-Cell Item', '', function() {
            mxUtils.alert('MenuItem2');
        });
    }
};

function updateStyleLine(graph, cell, type) {    
    $.ajax({
        url: `/intake/loadProcess/${type.style}`,

        success: function(result) {
            let idvar = cell.id;
            let varcost = [
                `Q${idvar}`,
                `CSed${idvar}`,
                `CN${idvar}`,
                `CP${idvar}`,
                `WSed${idvar}`,
                `WN${idvar}`,
                `WP${idvar}`,
                `WSedRet${idvar}`,
                `WNRet${idvar}`,
                `WPRet${idvar}`
            ];

            $.ajax({
                url: `/intake/loadFunctionBySymbol/${type.funcionreference}`,
                success: function(result2) {
                    let external = (type.id == 'EI');
                    var jsonResult = JSON.parse(result2);
                    jsonResult.forEach(r =>{
                        var function_value = r.fields.function_value;
                        costVars.forEach(v =>{
                            let regex = new RegExp(v + '\\b', 'g');
                            function_value = function_value.replaceAll(regex, v + cell.id);                            
                        })
                        r.fields.function_value = function_value;
                        r.fields['global_multiplier_factorCalculator'] = localStorage.getItem('factor') == null ? '0.38' : localStorage.getItem('factor');
                        r.fields['currencyCost'] = defaultCurrencyId;
                        r.fields['currencyCostName'] = defaultCurrentyName;
                    })

                    let resultDbObj = JSON.parse(result);
                    if (type.style == 'PIPELINE' || type.style == 'CHANNEL' || type.style == 'CONNECTION' ){
                        resultDbObj[0].fields.predefined_transp_water_perc = '';
                        //enableBtnValidateCount++;
                        if (!transportedWaterConnectors.hasOwnProperty(cell.id)) {
                            transportedWaterConnectors[cell.id] = {"style" : type.style, "id" : cell.id, "transportedWater" : null};                        
                            validateTransportedWater('');
                        }                        
                    }
                    
                    let valueObj = {
                        "connectorType": type.id,
                        "varcost": varcost,
                        "external": external,
                        'resultdb': resultDbObj,
                        'name': type.name,
                        "funcost": jsonResult
                    };

                    value = JSON.stringify(valueObj);
                    cell.setValue(value);
                    graph.model.setStyle(cell, type.style);
                    //add data in HTML for connectors
                    if (typeof(cell.value) == "string" && cell.value.length > 0) {
                        try {
                            let obj = JSON.parse(cell.value);
                            let dbfields = obj.resultdb;
                            label = connectionsType[obj.connectorType].name;
                            $('#titleDiagram').text(connectionsType[obj.connectorType].name);
                            $('#titleCostFunSmall').attr("valueid", label);
                            $('#titleCostFunSmall').text(`ID: ${cell.id} - ${connectionsType[obj.connectorType].name}`);
                            
                            addData2HTML(dbfields, cell)
                        } catch (e) {
                            label = "";
                        }
                    }
                }
            });
        }
    });
}

function clearDataHtml() {
    $('#aguaDiagram').prop('disabled', true);
    $('#sedimentosDiagram').prop('disabled', true);
    $('#nitrogenoDiagram').prop('disabled', true);
    $('#fosforoDiagram').prop('disabled', true);
    $('#idDiagram').val('');
    $('#titleDiagram').empty();
    $('#aguaDiagram').val('');
    $('#titleCostFunSmall').empty();
    $('#sedimentosDiagram').val('');
    $('#nitrogenoDiagram').val('');
    $('#fosforoDiagram').val('');
    $('#funcostgenerate tr').remove();
    $('#funcostgenerate div').remove();
    $('#funcostgenerate').empty();
}

function funcost(index) {
    var currencyCostName = funcostdb[index].fields.currencyCostName;
    if (currencyCostName == undefined || currencyCostName == '') {
        currencyCostName = funcostdb[index].fields.currency;
    }

    var factor = funcostdb[index].fields.global_multiplier_factorCalculator;    
    if (factor == undefined){
        factor =  parseFloat(localStorage.getItem("factor")).toFixed(2);
    }
    let tdClass = "small text-center vat";    
    let aProps = `class="btn btn-info"html=true trigger="click" data-toggle="tooltip" data-placement="top"`;
    
    $('#funcostgenerate').append(`
        <tr idvalue="fun_${index}">
            <td aling="center">${funcostdb[index].fields.function_name}</td>
            <td class="${tdClass}" style="width: 160px">
                <a id="fn${index}" ${aProps} title="${funcostdb[index].fields.function_value}">fx</a>                
            </td>
            <td class="${tdClass}">${currencyCostName}</td>
            <td class="${tdClass}">${factor}</td>
            <td class="${tdClass}" style="width: 85px">
                <div class="btn-group btn-group-table" role="group">
                    <a class="btn btn-info" name="glyphicon-edit" idvalue="${index}"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>
                    <a class="btn btn-danger" name="glyphicon-trash" idvalue="${index}"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a>
                </div>
            </td>
        </tr>
        `
        );
}

function addData(element) {
    
    //add data in HTML for connectors
    if (typeof(element.value) == "string" && element.value.length > 0) {
        let obj = JSON.parse(element.value);
        let dbfields = obj.resultdb;
        label = connectionsType[obj.connectorType].name;
        $('#titleDiagram').text(connectionsType[obj.connectorType].name);
        $('#titleCostFunSmall').attr("valueid", element.id);
        $('#titleCostFunSmall').text(`ID: ${element.id} - ${connectionsType[obj.connectorType].name}`);
        $('#idDiagram').val(element.id);

        if (element.style == 'PIPELINE' || element.style == 'CHANNEL' || element.style == 'CONNECTION'){
             validateTransportedWater(dbfields[0].fields.predefined_transp_water_perc);            
        }
        addData2HTML(dbfields, element);        
        funcostdb = obj.funcost;
        for (let index = 0; index < funcostdb.length; index++) {
            funcost(index);
        }        
    } else {
        $('#titleDiagram').text(element.getAttribute('name'));
        $('#titleCostFunSmall').attr("valueid", element.id);
        $('#titleCostFunSmall').text(`ID: ${element.id} - ${element.getAttribute('name')}`);
        $('#idDiagram').val(element.id);
        if (element.getAttribute('resultdb') == undefined && element.getAttribute('funcost') == undefined) return;
        resultdb = JSON.parse(element.getAttribute('resultdb'));
        if (element.getAttribute('name') == 'River') {
            return addData2HTML(resultdb, element);
        }
        if (element.getAttribute('funcost') == undefined) return addData2HTML(resultdb, element);
        funcostdb = JSON.parse(element.getAttribute('funcost'));
        if (resultdb.length == 0 && funcostdb.length == 0) return;
        $('#titleDiagram').text(resultdb[0].fields.categorys);
        addData2HTML(resultdb, element);
        for (let index = 0; index < funcostdb.length; index++) {
            funcost(index);
        }
    }
}

function addData2HTML(resultdb, cell) {
    var show = false;
    if (cell != undefined && cell.getAttribute('name') == 'River') show = true;
    if (cell != undefined && cell.getAttribute('name') == 'External Input') show = true;
    if (cell != undefined && cell.style == "EXTRACTIONCONNECTION") show = true;
    $('#aguaDiagram').prop('disabled', show);
    if (cell != undefined && cell.style == "CONNECTION") show = true;
    $('#sedimentosDiagram').prop('disabled', show);
    $('#nitrogenoDiagram').prop('disabled', show);
    $('#fosforoDiagram').prop('disabled', show);
    $('#funcostgenerate tr').remove();
    $('#funcostgenerate div').remove();
    $('#funcostgenerate').empty();
    // Add Value to Panel Information Right on HTML
    $('#aguaDiagram').val(resultdb[0].fields.predefined_transp_water_perc); 
    $('#sedimentosDiagram').val(resultdb[0].fields.predefined_sediment_perc);
    $('#nitrogenoDiagram').val(resultdb[0].fields.predefined_nitrogen_perc);
    $('#fosforoDiagram').val(resultdb[0].fields.predefined_phosphorus_perc);
    // Add Validator 
    $('#aguaDiagram').attr('min', resultdb[0].fields.minimal_transp_water_perc);
    $('#aguaDiagram').attr('max', resultdb[0].fields.maximal_transp_water_perc);
    $('#sedimentosDiagram').attr('min', resultdb[0].fields.minimal_sediment_perc);
    $('#sedimentosDiagram').attr('max', resultdb[0].fields.maximal_sediment_perc);
    $('#nitrogenoDiagram').attr('min', resultdb[0].fields.minimal_nitrogen_perc);
    $('#nitrogenoDiagram').attr('max', resultdb[0].fields.maximal_nitrogen_perc);
    $('#fosforoDiagram').attr('min', resultdb[0].fields.minimal_phosphorus_perc);
    $('#fosforoDiagram').attr('max', resultdb[0].fields.maximal_phosphorus_perc);
}

function deleteWithValidations(editor) {
    let msg = gettext("Selected element is connected with Extraction connection element. Can't be deleted!");
    if (editor.graph.isEnabled()) {
        let cells = editor.graph.getSelectionCells();
        let cells2Remove = cells.filter(cell => (cell.style != "rio") || parseInt(cell.id) > 4);
        if (cells2Remove.length > 0) {
            let vertexIsEC = false;
            cells2Remove.filter(cell => {
                if (cell.edges != null && cell.edges.length > 0) {
                    for (let c in cell.edges) {
                        if (cell.edges[c].style == connectionsType.EC.style) {
                            vertexIsEC = true;
                            break;
                        }
                    }
                }
            });
            if (vertexIsEC) {
                mxUtils.alert(msg);
            } else {
                cells2Remove.forEach((c) => {
                    if (transportedWaterConnectors.hasOwnProperty(c.id)){
                        delete transportedWaterConnectors[c.id];
                    }
                })
                editor.graph.removeCells(cells2Remove);                
            }
        } else {
            mxUtils.alert(gettext(`The River can't be Removed`));
        }
    }
}

function validationTransportedWaterSum(editor, cell) {
    
    var enc = new mxCodec();
    var node = enc.encode(editor.graph.getModel());
    var connectors = [];
    var total = 0;
    //Select all dom called mxCell
    node.querySelectorAll('mxCell').forEach(function(node) {
        //Validates if a cell is a connector
        if (typeof(cell.value) == 'string' && cell.value.length > 0) {
            //validates which connector y connected with a image
            if (node.getAttribute('source') == cell.source.id) {
                let celda = JSON.parse(node.getAttribute('value'));
                let dbfields = celda.resultdb;
                connectors.push({
                    'id': node.id,
                    'source': node.getAttribute('source'),
                    'target': node.getAttribute('target'),
                    'water': dbfields[0].fields.predefined_transp_water_perc
                });
            }
        }
    });
    //Get sumatory % Transported water of all connectors
    connectors.forEach(function(dot) {
        total += parseInt(dot.water);
    });
    //Select all dom of the elements called Simboll
    node.querySelectorAll('Symbol').forEach(function(cellfilter) {
        if (node.id == "" && connectors.length > 0) {
            //Validates connectors that are connected with the symbol
            if (cellfilter.id == connectors[0].source) {
                let cells = JSON.parse(cellfilter.getAttribute('resultdb'));
                //Validates sumatory of connectors it's less than %Transported water of the Symbol
                if (total > cells[0].fields.predefined_transp_water_perc) {
                    let texttitle = gettext("The sum of % of transported water from the Outgoing connectors of %s cannot be greater than %s %");
                    let transtitle = interpolate(texttitle, [cellfilter.getAttribute('label'), cells[0].fields.predefined_transp_water_perc]);
                    let texttext = gettext("The sum of % of water transported from the connectors is %s %");
                    let transtext = interpolate(texttext, [total]);
                    $('#aguaDiagram').val('');
                    Swal.fire({
                        icon: 'warning',
                        title: transtitle,
                        text: transtext
                    })
                }
            }
        }
    });
}

$(document).on('click', '#helpgraph', function() {
    $('#HelpModal').modal('show');
});

var validateinput = function(e) {
    
    let minRange = e.getAttribute('min');
    let maxRange = e.getAttribute('max');

    if (minRange == 0 && maxRange == 0) {
        e.value = 0;
        return false;
    }

    var t = e.value;
    if (e.id == "aguaDiagram"){
        if (typeof(selectedCell.value) == "string" && selectedCell.value.length > 0) {
            var obj = JSON.parse(selectedCell.value);
            let dbfields = obj.resultdb;
            dbfields[0].fields.predefined_transp_water_perc = $('#aguaDiagram').val();
            obj.resultdb = dbfields;
            selectedCell.setValue(JSON.stringify(obj));
            if (transportedWaterConnectors.hasOwnProperty(selectedCell.id)){
                transportedWaterConnectors[selectedCell.id].transportedWater = $('#aguaDiagram').val();
            }
        } else {
            resultdb[0].fields.predefined_transp_water_perc = $('#aguaDiagram').val();
            selectedCell.setAttribute('resultdb', JSON.stringify(resultdb));
        }        
        validateTransportedWater(t);
        //validationTransportedWaterSum(editor, selectedCell);
    }
    e.value = (t.indexOf(".") >= 0) ? (t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)) : t;
    let texttitle = gettext("The value must be between %s and %s");
    let transtitle = interpolate(texttitle, [minRange, maxRange]);
    if (parseFloat(e.value) < parseFloat(minRange) || (e.value.length == 0)) {        
        let text = gettext(`The minimum value is %s please use the arrows`)
        let transtext = interpolate(text, [minRange]);
        e.value = minRange;
        Swal.fire({
            icon: 'warning',
            title: transtitle,
            text: transtext
        });
        if (transportedWaterConnectors.hasOwnProperty(selectedCell.id)){
            transportedWaterConnectors[selectedCell.id].transportedWater = minRange;
            validateTransportedWater(minRange);
        }        
    }
    if (parseFloat(e.value) > parseFloat(maxRange)) {        
        let text = gettext(`The maximum value is %s please use the arrows`)
        let transtext = interpolate(text, [maxRange]);
        e.value = maxRange;
        Swal.fire({
            icon: 'warning',
            title: transtitle,
            text: transtext
        });
        if (transportedWaterConnectors.hasOwnProperty(selectedCell.id)){
            transportedWaterConnectors[selectedCell.id].transportedWater = maxRange;
            validateTransportedWater(maxRange);
        }
    }
}

function validationsCsinfraExternal(valida) {
    message = [];
    let symbols = [];
    let mxcell = [];
    valida.querySelectorAll('Symbol').forEach((node) => symbols.push(node.getAttribute('name')));
    if (symbols.includes("CSINFRA") == false) message.push('(Case Study Infrastructure)');
    valida.querySelectorAll('mxCell').forEach((node) => mxcell.push(node.getAttribute('style')));
    if (mxcell.includes("EXTRACTIONCONNECTION") == false) message.push('(Extraction Connection)');
    if (message[1] == undefined) message[1] = "";
    if (message[0] == undefined) return;

    const texttitle = gettext("No exist %s %s in a diagram");
    const transtext = interpolate(texttitle, [message[0], message[1]]);
    $('#hideCostFuntion').hide();
    Swal.fire({
        icon: 'warning',
        title: gettext(`Missing elements`),
        text: transtext
    });
    return true;
}

function validationsNodeAlone(data) {
    let data2 = [];
    data2 = Object.values(data.cells);
    data2.splice(0, 2);
    for (const fin of data2) {
        if (typeof(fin.value) != "string" && fin.edges == null && fin.style != 'rio') {
            mensajeAlert(fin);
            return true;
        } else {
            if (typeof(fin.value) != "string" && fin.edges.length == 0 && fin.style != 'rio' && fin.style != 'externalinput') {
                mensajeAlert(fin);
                return true;
            }
            if (typeof(fin.value) != "string" && fin.edges.length == 1 && fin.style != 'rio' && fin.style != 'externalinput') {
                if (fin.id == fin.edges[0].source.id) {
                    mensajeAlert(fin);
                    return true;
                }
            }
        }
    }
}

function validationInputTransportedWater(graphic) {
    let data2 = [];
    data2 = Object.values(graphic.cells);
    for (const it of data2) {
        if (typeof(it.value) == "string") {
            if (it.value === "") {
                Swal.fire({
                    icon: 'warning',
                    title: gettext(`Exist a connector whitout defined type`)
                })
                return true;
            } else {
                const valiu = JSON.parse(it.value)
                parseInt(valiu.resultdb[0].fields.predefined_transp_water_perc)
                if (parseInt(valiu.resultdb[0].fields.predefined_transp_water_perc) < 0) {
                    const texttitle = gettext("Element %s - %s has a % transported water invalid");
                    const transtext = interpolate(texttitle, [it.id, valiu.resultdb[0].fields.categorys]);
                    Swal.fire({
                        icon: 'warning',
                        title: gettext(`Percentage transported water invalid`),
                        text: transtext
                    })
                    return true;
                }
            }
        }
    }
}

function mensajeAlert(fin) {
    const texttitle = gettext("Element %s - %s is disconnect");
    const transtext = interpolate(texttitle, [fin.id, fin.getAttribute('name')]);
    Swal.fire({
        icon: 'warning',
        title: gettext(`Disconnected elements`),
        text: transtext
    })
}

function validations(validate, editor) {
    if (validationsCsinfraExternal(validate) || 
        validationsNodeAlone(editor) || 
        validationInputTransportedWater(editor)) {
        return true;
    } else {
        if (banderaValideGraph != 0) {
            Swal.fire({
                icon: 'success',
                title: gettext(`Graph validated`),
            });
            return false;
        }
    }
}

// View Intake

function addDataView(element, MQ) {
    //add data in HTML for connectors
    if (typeof(element.value) == "string" && element.value.length > 0) {
        let obj = JSON.parse(element.value);
        let dbfields = obj.resultdb;
        label = connectionsType[obj.connectorType].name;
        $('#titleDiagram').text(connectionsType[obj.connectorType].name);
        $('#titleCostFunSmall').attr("valueid", element.id);
        $('#titleCostFunSmall').text(`ID: ${element.id} - ${connectionsType[obj.connectorType].name}`);
        $('#idDiagram').val(element.id);
        addData2HTMLView(dbfields)
        funcostdb = obj.funcost;
        for (let index = 0; index < funcostdb.length; index++) {
            funcostView(funcostdb[index].fields.function_value, funcostdb[index].fields.function_name, index, MQ);
        }
    } else {
        $('#titleDiagram').text(element.getAttribute('name'));
        $('#titleCostFunSmall').attr("valueid", element.id);
        $('#titleCostFunSmall').text(`ID: ${element.id} - ${element.getAttribute('name')}`);
        $('#idDiagram').val(element.id);
        if (element.getAttribute('resultdb') == undefined && element.getAttribute('funcost') == undefined) return;
        resultdb = JSON.parse(element.getAttribute('resultdb'));
        if (element.getAttribute('name') == 'River') {
            return addData2HTMLView(resultdb);
        }
        if (element.getAttribute('funcost') == undefined) return addData2HTMLView(resultdb);
        funcostdb = JSON.parse(element.getAttribute('funcost'));
        if (resultdb.length == 0 && funcostdb.length == 0) return;
        $('#titleDiagram').text(resultdb[0].fields.categorys);
        addData2HTMLView(resultdb);
        for (let index = 0; index < funcostdb.length; index++) {
            funcostView(funcostdb[index].fields.function_value, funcostdb[index].fields.function_name, index, MQ);
        }
    }
}

function funcostView(ecuation_db, ecuation_name, index, MQ) {
    $('#funcostgenerate').append(
        `<div class="alert alert-info" role="alert" idvalue="fun_${index}" style="margin-bottom: 12px">
        <h4>${ecuation_name}</h4>
        <p name="render_ecuation">${ ecuation_db }</p>
    </div>
    `);
    $('p[name=render_ecuation]').each(function() {
        MQ.StaticMath(this);
    });
}

function clearDataHtmlView() {
    $('#aguaDiagram').prop('disabled', true);
    $('#sedimentosDiagram').prop('disabled', true);
    $('#nitrogenoDiagram').prop('disabled', true);
    $('#fosforoDiagram').prop('disabled', true);
    $('#idDiagram').val('');
    $('#titleDiagram').empty();
    $('#aguaDiagram').val('');
    $('#titleCostFunSmall').empty();
    $('#sedimentosDiagram').val('');
    $('#nitrogenoDiagram').val('');
    $('#fosforoDiagram').val('');
    $('#funcostgenerate tr').remove();
    $('#funcostgenerate div').remove();
    $('#funcostgenerate').empty();
}

function addData2HTMLView(resultdb) {
    var show = true;
    $('#aguaDiagram').prop('disabled', show);
    $('#sedimentosDiagram').prop('disabled', show);
    $('#nitrogenoDiagram').prop('disabled', show);
    $('#fosforoDiagram').prop('disabled', show);
    $('#funcostgenerate tr').remove();
    $('#funcostgenerate div').remove();
    $('#funcostgenerate').empty();
    // Add Value to Panel Information Right on HTML
    $('#aguaDiagram').val(resultdb[0].fields.predefined_transp_water_perc);
    $('#sedimentosDiagram').val(resultdb[0].fields.predefined_sediment_perc);
    $('#nitrogenoDiagram').val(resultdb[0].fields.predefined_nitrogen_perc);
    $('#fosforoDiagram').val(resultdb[0].fields.predefined_phosphorus_perc);
    // Add Validator 
    $('#aguaDiagram').attr('min', resultdb[0].fields.minimal_transp_water_perc);
    $('#aguaDiagram').attr('max', resultdb[0].fields.maximal_transp_water_perc);
    $('#sedimentosDiagram').attr('min', resultdb[0].fields.minimal_sediment_perc);
    $('#sedimentosDiagram').attr('max', resultdb[0].fields.maximal_sediment_perc);
    $('#nitrogenoDiagram').attr('min', resultdb[0].fields.minimal_nitrogen_perc);
    $('#nitrogenoDiagram').attr('max', resultdb[0].fields.maximal_nitrogen_perc);
    $('#fosforoDiagram').attr('min', resultdb[0].fields.minimal_phosphorus_perc);
    $('#fosforoDiagram').attr('max', resultdb[0].fields.maximal_phosphorus_perc);
}

function deleteWithValidationsView(editor) {
    if (editor.graph.isEnabled()) {
        let cells = editor.graph.getSelectionCells();
        let cells2Remove = cells.filter(cell => (cell.style != "rio") || parseInt(cell.id) > 400);
        if (cells2Remove.length >= 0) {
            mxUtils.alert(`Isn't Editable`);
        }
    }
}

function validateTransportedWater(value){
    
    let keys = Object.keys(transportedWaterConnectors);
    $('#saveGraph').prop('disabled', true);
    if (keys.length == 0) return;
    let validation = true;
    keys.forEach(key => {
        let element = transportedWaterConnectors[key];
        if (element.transportedWater == null || element.transportedWater == "" ) {
            validation = false;       
        }
    });
    if (validation) {
        $('#saveGraph').prop('disabled', false);
    }
    
    if (value.length == 0){
        $('#aguaDiagram').addClass('alert-danger');        
        return false;
    }else{
        $('#aguaDiagram').removeClass('alert-danger');             
        return true;
    }
}