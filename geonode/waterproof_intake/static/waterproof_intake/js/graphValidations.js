const connectionsType = {
    EC: { name: 'Extraction connection', id: 'EC', style: 'Extraction_connection' },
    EI: { name: 'External input', id: 'EI', style: 'External_input' },
    PL: { name: 'Pipeline', id: 'PL', style: 'Pipeline' },
    CN: { name: 'Connection', id: 'CN', style: 'Connection' },
}

function customMenuForConnectors() {

}

// Function to create the entries in the popupmenu
function createPopupMenu(graph, menu, cell, evt) {


    if (cell != null) {
        if (cell.geometry.width == 0 && cell.geometry.height == 0) {
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
    let idvar = cell.id;
    let varcost = [
        `Q_${idvar} (m³)`,
        `CSed_${idvar} (mg/l)`,
        `CN_${idvar} (mg/l)`,
        `CP_${idvar} (mg/l)`,
        `WSed_${idvar} (Ton)`,
        `WN_${idvar} (Kg)`,
        `WP_${idvar} (Kg)`,
        `WSed_ret_${idvar} (Ton)`,
        `WN_ret_${idvar} (Kg)`,
        `WP_ret_${idvar} (Kg)`
    ];
    let value = {
        "connectorType": type.id,
        "varcost": varcost
    };
    value = JSON.stringify(value);
    cell.setValue(value);
    graph.model.setStyle(cell, type.style);

}

function clearDataHtml(cell, evt) {
    $('#idDiagram').empty();
    $('#titleDiagram').empty();
    $('#aguaDiagram').val('');
    $('#sedimentosDiagram').val('');
    $('#nitrogenoDiagram').val('');
    $('#fosforoDiagram').val('');
    cell = evt.getProperty("cell");
    var show = false;
    if (cell.getAttribute('name') == 'River') show = true;
    $('#aguaDiagram').prop('disabled', show);
    $('#sedimentosDiagram').prop('disabled', show);
    $('#nitrogenoDiagram').prop('disabled', show);
    $('#fosforoDiagram').prop('disabled', show);

}

function addData(element) {

    $('#titleDiagram').text(element.getAttribute('name'));
    $('#idDiagram').val(element.id);
    if (element.getAttribute('resultdb') == undefined) return;
    resultdb = JSON.parse(element.getAttribute('resultdb'));
    if (resultdb.length == 0) return;
    $('#titleDiagram').text(resultdb[0].fields.categorys);

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
    funcost('((11126.6*text(Q)) + 30939.7)*1 + (0.24*((text(Csed) - 56)/56)) + (0.06*((text(CN) - 20)/20))');
}