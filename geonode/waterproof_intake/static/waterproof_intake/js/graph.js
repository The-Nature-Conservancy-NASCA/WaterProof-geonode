/**
 * @file Intake system parameter graph
 * configurations (Step 2 of create wizard)
 * @version 1.0
 */
var graphData = [];
var connetion = [];

// Program starts here. The document.onLoad executes the
// createEditor function with a given configuration.
// In the config file, the mxEditor.onInit method is
// overridden to invoke this global function as the
// last step in the editor constructor.
function onInit(editor) {
    // Enables rotation handle
    mxVertexHandler.prototype.rotationEnabled = false;

    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = false;

    // Alt disables guides
    mxGuide.prototype.isEnabledForEvent = function(evt) {
        return !mxEvent.isAltDown(evt);
    };

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage('/static/mxgraph/images/connector.gif', 16, 16);

    // Enables connections in the graph and disables
    // reset of zoom and translate on root change
    // (ie. switch between XML and graphical mode).
    editor.graph.setConnectable(true);

    // Clones the source if new connection has no target
    //editor.graph.connectionHandler.setCreateTarget(true);

    var style = editor.graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
    style[mxConstants.STYLE_STROKEWIDTH] = 4;
    style[mxConstants.STYLE_STROKECOLOR] = "#ff0000";


    // Installs a popupmenu handler using local function (see below).
    editor.graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
        return createPopupMenu(editor.graph, menu, cell, evt);
    };

    // Removes cells when [DELETE] is pressed
    // elements with id == 2 is River and id==3 is CSINFRA can't remove
    var keyHandler = new mxKeyHandler(editor.graph);
    keyHandler.bindKey(46, function(evt){
        if (editor.graph.isEnabled()){
            let cells = editor.graph.getSelectionCells();
            let cells2Remove = cells.filter(cell => (cell.style != "rio" && 
                                            cell.style != "csinfra" && 
                                            cell.style != connectionsType.EC.style) || 
                                            parseInt(cell.id)  > 4);
            if (cells2Remove.length > 0){
                editor.graph.removeCells(cells2Remove);    
            }
        }
    });

    editor.graph.setAllowDanglingEdges(false);
    editor.graph.setMultigraph(false);

    var listener = function(sender, evt){
        editor.graph.validateGraph();
    };

    editor.graph.getModel().addListener(mxEvent.CHANGE, listener);       

    // Updates the title if the root changes
    var title = document.getElementById('title');

    if (title != null) {
        var f = function(sender) {
            title.innerHTML = sender.getTitle();
        };

        editor.addListener(mxEvent.ROOT, f);
        f(editor);
    }

    // Changes the zoom on mouseWheel events
    /* mxEvent.addMouseWheelListener(function (evt, up) {
       if (!mxEvent.isConsumed(evt)) {
         if (up) {
           editor.execute('zoomIn');
         }
         else {
           editor.execute('zoomOut');
         }
 
         mxEvent.consume(evt);
       }
     });*/

    // Defines a new action to switch between
    // XML and graphical display
    var textNode = document.getElementById('xml');
    var graphNode = editor.graph.container;

    var parent = editor.graph.getDefaultParent();

    var edge = editor.graph.insertEdge(parent, null, '', parent.children[0], parent.children[1]);
    let value = {"connectorType" : connectionsType.EC.id};
    edge.setValue(JSON.stringify(value));
    editor.graph.model.setStyle(edge, connectionsType.EC.style); 

    // Source nodes needs 1..2 connected Targets
    editor.graph.multiplicities.push(new mxMultiplicity(
        true, 'Symbol', 'name', 'Rio', 1, 2, ['Symbol'],
        'Rio Must Have 1 or more Elements',
        'Source Must Connect to Target')); 

    // Target needs exactly one incoming connection from Source
    editor.graph.multiplicities.push(new mxMultiplicity(
        false, 'Symbol', 'name', 'CSINFRA', 1, 1, ['Symbol'],
        'Target Must Have 1 Source',
        'Target Must Connect From Source'));
        
    var getdata = document.getElementById('getdata');
    getdata.checked = false;

    var funct = function(editor) {
        if (getdata.checked) {
            //console.log(getdata.checked)
            graphNode.style.display = 'none';
            textNode.style.display = 'inline';

            var enc = new mxCodec();
            var node = enc.encode(editor.graph.getModel());

            textNode.value = mxUtils.getPrettyXml(node);
            textNode.originalValue = textNode.value;
            textNode.focus();
        } else {
            graphNode.style.display = '';

            if (textNode.value != textNode.originalValue) {
                var doc = mxUtils.parseXml(textNode.value);
                var dec = new mxCodec(doc);
                dec.decode(doc.documentElement, editor.graph.getModel());
            }

            textNode.originalValue = null;

            // Makes sure nothing is selected in IE
            if (mxClient.IS_IE) {
                mxUtils.clearSelection();
            }

            textNode.style.display = 'none';

            // Moves the focus back to the graph
            editor.graph.container.focus();
        }
    };

    /* var getd = function(editor){
         graphNode.style.display = 'none';
             textNode.style.display = 'inline';

             var enc = new mxCodec();
             var node = enc.encode(editor.graph.getModel());

             textNode.value = mxUtils.getPrettyXml(node);
             textNode.originalValue = textNode.value;
             textNode.focus();
     }*/

    editor.addAction('switchView', funct);

    // Defines a new action to switch between
    // XML and graphical display
    mxEvent.addListener(getdata, 'click', function() {
        editor.execute('switchView');
    });

    // Create select actions in page
    //var node = document.getElementById('mainActions');
    var buttons = ['group', 'ungroup', 'cut', 'copy', 'paste', 'delete', 'undo', 'redo', 'print', 'show'];

    // Only adds image and SVG export if backend is available
    // NOTE: The old image export in mxEditor is not used, the urlImage is used for the new export.
    if (editor.urlImage != null) {
        // Client-side code for image export
        var exportImage = function(editor) {
            var graph = editor.graph;
            var scale = graph.view.scale;
            var bounds = graph.getGraphBounds();

            // New image export
            var xmlDoc = mxUtils.createXmlDocument();
            var root = xmlDoc.createElement('output');
            xmlDoc.appendChild(root);

            // Renders graph. Offset will be multiplied with state's scale when painting state.
            var xmlCanvas = new mxXmlCanvas2D(root);
            xmlCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
            xmlCanvas.scale(scale);

            var imgExport = new mxImageExport();
            imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);

            // Puts request data together
            var w = Math.ceil(bounds.width * scale + 2);
            var h = Math.ceil(bounds.height * scale + 2);
            var xml = mxUtils.getXml(root);

            // Requests image if request is valid
            if (w > 0 && h > 0) {
                var name = 'export.png';
                var format = 'png';
                var bg = '&bg=#FFFFFF';

                new mxXmlRequest(editor.urlImage, 'filename=' + name + '&format=' + format +
                    bg + '&w=' + w + '&h=' + h + '&xml=' + encodeURIComponent(xml)).
                simulate(document, '_blank');
            }
        };

        editor.addAction('exportImage', exportImage);

        // Client-side code for SVG export
        var exportSvg = function(editor) {
            var graph = editor.graph;
            var scale = graph.view.scale;
            var bounds = graph.getGraphBounds();

            // Prepares SVG document that holds the output
            var svgDoc = mxUtils.createXmlDocument();
            var root = (svgDoc.createElementNS != null) ?
                svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');

            if (root.style != null) {
                root.style.backgroundColor = '#FFFFFF';
            } else {
                root.setAttribute('style', 'background-color:#FFFFFF');
            }

            if (svgDoc.createElementNS == null) {
                root.setAttribute('xmlns', mxConstants.NS_SVG);
            }

            root.setAttribute('width', Math.ceil(bounds.width * scale + 2) + 'px');
            root.setAttribute('height', Math.ceil(bounds.height * scale + 2) + 'px');
            root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
            root.setAttribute('version', '1.1');

            // Adds group for anti-aliasing via transform
            var group = (svgDoc.createElementNS != null) ?
                svgDoc.createElementNS(mxConstants.NS_SVG, 'g') : svgDoc.createElement('g');
            group.setAttribute('transform', 'translate(0.5,0.5)');
            root.appendChild(group);
            svgDoc.appendChild(root);

            // Renders graph. Offset will be multiplied with state's scale when painting state.
            var svgCanvas = new mxSvgCanvas2D(group);
            svgCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
            svgCanvas.scale(scale);

            var imgExport = new mxImageExport();
            imgExport.drawState(graph.getView().getState(graph.model.root), svgCanvas);

            var name = 'export.svg';
            var xml = encodeURIComponent(mxUtils.getXml(root));

            new mxXmlRequest(editor.urlEcho, 'filename=' + name + '&format=svg' + '&xml=' + xml).simulate(document, "_blank");
        };

        editor.addAction('exportSvg', exportSvg);

        buttons.push('exportImage');
        buttons.push('exportSvg');
    };

    for (var i = 0; i < buttons.length; i++) {
        var button = document.createElement('button');
        mxUtils.write(button, mxResources.get(buttons[i]));

        var factory = function(name) {
            return function() {
                editor.execute(name);
            };
        };

        mxEvent.addListener(button, 'click', factory(buttons[i]));
        //node.appendChild(button);
    }

    $("#validate_btn").on("click", function() {

        return;

        let cells = editor.graph.getModel().cells;
        graphView = editor.graph.getView();
        notConnectedCells.length = 0;
        // create an array of cells and reset the color
        for (let key in cells) {
            if (!cells.hasOwnProperty(key)) continue;

            let mxCell = cells[key];
            if (!mxCell.isVertex() && !mxCell.isEdge()) continue;
            notConnectedCells.push(mxCell);
            let state = graphView.getState(mxCell);

            console.log(state)
            //resetColor(state);
        }

        // starts with the parent cell
        let parentCell = notConnectedCells.find(c => c.id === parentCellId);
        //validate(parentCell);
        //setNotConnectedColor();
    })

    /* Create select actions in page
    var node = document.getElementById('selectActions');
    mxUtils.write(node, 'Select: ');
    mxUtils.linkAction(node, 'All', editor, 'selectAll');
    mxUtils.write(node, ', ');
    mxUtils.linkAction(node, 'None', editor, 'selectNone');
    mxUtils.write(node, ', ');
    mxUtils.linkAction(node, 'Vertices', editor, 'selectVertices');
    mxUtils.write(node, ', ');
    mxUtils.linkAction(node, 'Edges', editor, 'selectEdges');
    */
    // Create select actions in page
    /*var node = document.getElementById('zoomActions');
    mxUtils.write(node, 'Zoom: ');
    mxUtils.linkAction(node, 'In', editor, 'zoomIn');
    mxUtils.write(node, ', ');
    mxUtils.linkAction(node, 'Out', editor, 'zoomOut');
    mxUtils.write(node, ', ');
    mxUtils.linkAction(node, 'Actual', editor, 'actualSize');
    mxUtils.write(node, ', ');
    mxUtils.linkAction(node, 'Fit', editor, 'fit');*/

    
    //use jquery
    $(document).ready(function() {

        /**
         * Button to save 
         * data on graphData
         * xml on textxml
         */

        $('#inputMathAscii').keyup(function() {
            $('#RenderingMathAscii').text(`'math' ${$(this).val()} 'math'`);
            MathJax.typeset();
        });

        $('#saveAndValideCost').click(function() {
            console.log($('#RenderingMathAscii > mjx-container > mjx-assistive-mml')[0].innerHTML)
        });

        $('#ModalAddCostBtn').click(function() {
            $('#VarCostListGroup div').remove();
            for (const index of graphData) {
                tmp = JSON.parse(index.varcost);
                $('#VarCostListGroup').append(`
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <h4 class="panel-title">
                            <a data-toggle="collapse" data-parent="#VarCostListGroup" href="#VarCostListGroup_${index.id}">${index.id} - ${index.name}</a>
                        </h4>
                    </div>
                    <div id="VarCostListGroup_${index.id}" class="panel-collapse collapse">
                        <div class="panel-body">
                        <a href="#" class="list-group-item list-group-item-action">${tmp[0]}</a>
                        <a href="#" class="list-group-item list-group-item-action">${tmp[1]}</a>
                        <a href="#" class="list-group-item list-group-item-action">${tmp[2]}</a>
                        <a href="#" class="list-group-item list-group-item-action">${tmp[3]}</a>
                        <a href="#" class="list-group-item list-group-item-action">${tmp[4]}</a>
                        <a href="#" class="list-group-item list-group-item-action">${tmp[5]}</a>
                        <a href="#" class="list-group-item list-group-item-action">${tmp[6]}</a>
                        <a href="#" class="list-group-item list-group-item-action">${tmp[7]}</a>
                        <a href="#" class="list-group-item list-group-item-action">${tmp[8]}</a>
                        <a href="#" class="list-group-item list-group-item-action">${tmp[9]}</a>
                        </div>
                    </div>
                </div>
                `);
            }
        });

        function funcost(ecuation_db) {
            $('#funcostgenerate div').remove();
            $('#funcostgenerate').append(
                ` <div class="form-group">
                <label>Annual Operation and Maintenance Cost</label>
                <input type="text" value="${ ecuation_db }" class="form-control" disabled>
            </div>`);
        }

        $('#saveGraph').click(function() {
            var enc = new mxCodec();
            var node = enc.encode(editor.graph.getModel());
            var textxml = mxUtils.getPrettyXml(node)
            graphData = [];
            connetion = [];
            node.querySelectorAll('Symbol').forEach(function(node) {
                graphData.push({
                    'id': node.id,
                    "name": node.getAttribute('name'),
                    'external': node.getAttribute('externalData'),
                    'resultdb': node.getAttribute('resultdb'),
                    'varcost': node.getAttribute('varcost'),
                    'funcost': node.getAttribute('funcost'),
                })
            });

            node.querySelectorAll('mxCell').forEach(function(node) {
                if (node.id != "") {
                    let varcost = Object.values(JSON.parse(node.getAttribute('value')))[1];
                    connetion.push({
                        'id': node.id,
                        'source': node.getAttribute('source'),
                        'target': node.getAttribute('target'),
                        'varcost': JSON.stringify(varcost)
                    })
                }
            });
            //console.log(graphData);
            $('#xmlGraph').val(textxml);
            $('#graphElements').val(JSON.stringify(graphData));
            //console.log(textxml);
            //console.log(connetion);
        });

        //load data when add an object in a diagram
        editor.graph.addListener(mxEvent.ADD_CELLS, function(sender, evt) {

            var selectedCell = evt.getProperty("cells");
            var idvar = selectedCell[0].id;
            if (selectedCell != undefined) {
                var varcost = [];
                varcost.push(
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
                );
                selectedCell[0].setAttribute('varcost', JSON.stringify(varcost));

                $.ajax({
                    url: `/intake/loadProcess/${selectedCell[0].dbreference}`,
                    success: function(result) {
                        selectedCell[0].setAttribute("resultdb", result);
                    }
                });
            }

            if (selectedCell[0].dbreference == 'EXTERNALINPUT') {
                //Si se añade un elemento externo
            }

        });

        /**  
         * Global variables for save data 
         * @param {Array} resultdb   all data from DB
         * @param {Object} selectedCell  cell selected from Diagram 
         */

        var resultdb = [];
        var selectedCell;

        //Load data from figure to html
        editor.graph.addListener(mxEvent.CLICK, function(sender, evt) {
            selectedCell = evt.getProperty("cell");
            if (selectedCell != undefined) {
                if (selectedCell.getAttribute('resultdb') == undefined) return;
                resultdb = JSON.parse(selectedCell.getAttribute('resultdb'));
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


        });

        //Add value entered in sediments in the field resultdb
        $('#sedimentosDiagram').keyup(function() {
            resultdb[0].fields.predefined_sediment_perc = $('#sedimentosDiagram').val();
            selectedCell.setAttribute('resultdb', JSON.stringify(resultdb));
        });

        //Add value entered in nitrogen in the field resultdb
        $('#nitrogenoDiagram').keyup(function() {
            resultdb[0].fields.predefined_nitrogen_perc = $('#nitrogenoDiagram').val();
            selectedCell.setAttribute('resultdb', JSON.stringify(resultdb));
        });

        //Add value entered in phosphorus in the field resultdb
        $('#fosforoDiagram').keyup(function() {
            resultdb[0].fields.predefined_phosphorus_perc = $('#fosforoDiagram').val();
            selectedCell.setAttribute('resultdb', JSON.stringify(resultdb));
        });   

    });

}