/**
 * @file Intake system parameter graph
 * configurations (Step 2 of create wizard)
 * @version 1.0
 */
/**  
 * Global variables for save data 
 * @param {Array} resultdb   all data from DB
 * @param {Object} selectedCell  cell selected from Diagram 
 */

 var resultdb = [];
 var selectedCell;
 var graphData = [];
 var connection = [];
 var funcostdb = [];
 var bandera = true;
 var banderaValideGraph = 1;
 var banderaFunctionCost = false;
 var costVars = ['WSedRet','WPRet','WNRet','WSed','WP','WN','CSed','CP','CN','Q'];

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
     style[mxConstants.STYLE_FONTSIZE] = '11';
     style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
     style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_BOTTOM;
 
 
     // Installs a popupmenu handler using local function (see below).
     editor.graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
         return createPopupMenu(editor.graph, menu, cell, evt);
     };
 
     // Removes cells when [DELETE] is pressed
     // elements with id == 2 is River and id==3 is CSINFRA can't remove
     var keyHandler = new mxKeyHandler(editor.graph);
     keyHandler.bindKey(46, function(evt) {
         deleteWithValidations(editor);
     });
 
     editor.graph.setAllowDanglingEdges(false);
     editor.graph.setMultigraph(false);
 
     var listener = function(sender, evt) {
         editor.graph.validateGraph();
     };
 
     editor.graph.getLabel = function(cell) {
         var label = (this.labelsVisible) ? this.convertValueToString(cell) : '';
         var geometry = this.model.getGeometry(cell);
 
         if (geometry != null && geometry.width == 0) {
             var style = this.getCellStyle(cell);
             var fontSize = style[mxConstants.STYLE_FONTSIZE] || mxConstants.DEFAULT_FONTSIZE;
         }
         if (label == undefined) {
             label = gettext("This connection doesn't have a defined type, \n please define a type");
             if (typeof(cell.value) == "string" && cell.value.length > 0) {
                 try {
                     let obj = JSON.parse(cell.value);
                     label = connectionsType[obj.connectorType].name + " (" + cell.id + ")";
                 } catch (e) {
                     label = "";
                 }
             }
         }
         return label;
     };
 
     editor.graph.addListener(mxEvent.CELLS_ADDED, function(sender, evt) {
         //return;
 
         let cell = evt.properties.cells[0];
         if (cell.value != undefined && typeof(cell.value) == "object") {
             let lbl = cell.getAttribute("label");
             cell.setAttribute("label", lbl + " (" + cell.id + ")");
             editor.graph.model.setValue(cell, cell.value);
         }
     });
 
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
 
     // Defines a new action to switch between
     // XML and graphical display
     var textNode = document.getElementById('xml');
     var graphNode = editor.graph.container;
     var parent = editor.graph.getDefaultParent();
     var xmlDocument = mxUtils.createXmlDocument();
     var sourceNode = xmlDocument.createElement('Symbol');
 
     //Create River at the beginning of the diagram
     var river = editor.graph.insertVertex(parent, null, sourceNode, 40, 30, 60, 92);
     river.setAttribute('name', 'River');
     river.setAttribute('label', 'River (2)');
     river.setAttribute('externalData', 'false');
     editor.graph.model.setStyle(river, 'rio');
     var temp = [];
     temp.push(
         `Q${river.id}`,
         `CSed${river.id}`,
         `CN${river.id}`,
         `CP${river.id}`,
         `WSed${river.id}`,
         `WN${river.id}`,
         `WP${river.id}`,
         `WSedRet${river.id}`,
         `WNRet${river.id}`,
         `WPRet${river.id}`
     );
 
     $.ajax({
         url: `/intake/loadProcess/RIVER`,
         success: function(result) {
             river.setAttribute('varcost', JSON.stringify(temp));
             river.setAttribute('resultdb', result);
         }
     });
 
     //Validate connections between elements
     editor.graph.getEdgeValidationError = function(edge, source, target) {
         if (source != null && target != null &&
             this.model.getValue(source) != null &&
             this.model.getValue(target) != null) {
             //water intake 
             if (source.style != 'rio' && target.style == 'bocatoma') return gettext('The water intake element can only receive connection from the river element');
             //floating intake
             if (source.style != 'rio' && source.style != 'reservorioagua' && source.style != 'embalse' && target.style == 'bocatomaflotante')
                 return gettext('The floating intake element can only receive connection from the river, reservoir and water reservoir');
             //side intake
             if (source.style != 'rio' && source.style != 'reservorioagua' && source.style != 'embalse' && target.style == 'bocatomalateral')
                 return gettext('The side intake element can only receive connection from the river, reservoir and water reservoir');
             //connection with itself
             if (source.style == target.style) return gettext('No element could connect to itself');
         }
         // "Supercall"
         return mxGraph.prototype.getEdgeValidationError.apply(this, arguments);
     }
 
     // River not have a entrance connection
     editor.graph.multiplicities.push(new mxMultiplicity(
         false, 'Symbol', 'name', 'River', 0, 0, ['Symbol'],
         gettext(`No element can be connected to the River`)));
 
     // External input not have a entrance connection
     editor.graph.multiplicities.push(new mxMultiplicity(
         false, 'Symbol', 'name', 'External Input', 0, 0, ['Symbol'],
         gettext(`No element can be connected to the External input`)));
 
     // External input needs 1 connected Targets
     editor.graph.multiplicities.push(new mxMultiplicity(
         true, 'Symbol', 'name', 'External Input', 0, 1, ['Symbol'],
         gettext('External Input only have 1 target'),
         gettext('Source Must Connect to Target')));
 
     // Source nodes needs 1 connected Targets
     editor.graph.multiplicities.push(new mxMultiplicity(
         true, 'Symbol', 'name', 'River', 0, 1, ['Symbol'],
         gettext('River only have 1 target'),
         gettext('Source Must Connect to Target')));
 
     // Target needs exactly one incoming connection from Source
     editor.graph.multiplicities.push(new mxMultiplicity(
         true, 'Symbol', 'name', 'CSINFRA', 0, 0, ['Symbol'],
         gettext("From element CSINFRA can't connect to other element"),
         gettext('Target Must Connect From Source')));
 
     var getdata = document.getElementById('getdata');
     getdata.checked = false;
 
     var funct = function(editor) {
        if (getdata.checked) {
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
 
     //use jquery
     $(document).ready(function() {
 
        var output = document.getElementById('MathPreview');
        var button = document.getElementById('btnValidatePyExp');

        function typesetInput(expression) {
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
        
        //logical input expresion
        
        var selectedCostId = null;     

        //KeyBoard calculator funcion cost
        $('button[name=mathKeyBoard]').click(function() {
            var el = document.getElementById("python-expression");
            typeInTextarea($(this).attr('value'),el);
        });

        $('button[name=mathKeyBoard]').each(function() {
            //MQ.StaticMath(this);
        });

        $('span[id^=math-fieldlogic').click(function() {
            mathQuillSelected = $(this).attr('valinfo');
        });

        $('span[id^=math-fieldex').click(function() {
            mathQuillSelected = $(this).attr('valinfo');
        });

        $('#math-field').click(function() {
            mathQuillSelected = $(this).attr('valinfo');
        });

        $('#math-fieldPython').click(function() {
            mathQuillSelected = false;
        });

        function clearInputsMath() {
            console.log("clearInputsMath");         
        }
 
        /* $("#currencyCost").on("change", function() {
            $.ajax({
                url: `/parameters/load-currency/?currency=${$('#currencyCost').val()}`,
                success: function(result) {
                    $('#global_multiplier_factorCalculator').val(JSON.parse(result)[0].fields.global_multiplier_factor);
                }
            });
         });
         */
         //load data when add an object in a diagram
         editor.graph.addListener(mxEvent.ADD_CELLS, function(sender, evt) {
             var selectedCell = evt.getProperty("cells");
             var idvar = selectedCell[0].id;
 
             bandera = true;
             try {
                 if (selectedCell != undefined) {
                     var varcost = [];
                     varcost.push(
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
                     );
                     selectedCell[0].setAttribute('varcost', JSON.stringify(varcost));
 
                    if (selectedCell[0].dbreference != undefined){
                        $.ajax({
                            url: `/intake/loadProcess/${selectedCell[0].dbreference}`,
                            success: function(result) {
                                selectedCell[0].setAttribute("resultdb", result);
                            }
                        });
                    }
 
                     $.ajax({
                        url: `/intake/loadFunctionBySymbol/${selectedCell[0].funcionreference}`,
                        success: function(result) {
                            var id = selectedCell[0].id;                            
                            var jsonResult = JSON.parse(result);
                            jsonResult.forEach(r =>{
                                var function_value = r.fields.function_value;
                                costVars.forEach(v =>{
                                    let regex = new RegExp(v + '\\b', 'g');
                                    function_value = function_value.replaceAll(regex, v + id);
                                })
                                r.fields.function_value = function_value;
                            })
                            
                            selectedCell[0].setAttribute("funcost", JSON.stringify(jsonResult));
                        }
                     });
                 }
             } catch (error) {
                 console.log(error);
             } 
         });
 
         //Load data from figure to html
         editor.graph.addListener(mxEvent.CLICK, function(sender, evt) {
            selectedCell = evt.getProperty('cell');
            // Clear Inputs
            if (selectedCell != undefined) { addData(selectedCell); } else { clearDataHtml(); }
         });
 
         //Button for valide graph
         $('#saveGraph').click(function() {
             validateGraphIntake();
         });
 
 
         function validateGraphIntake() {
            console.log("validateGraphIntake");
            graphData = [];
            connection = [];
            var enc = new mxCodec();
            var node = enc.encode(editor.graph.getModel());
            var textxml = mxUtils.getPrettyXml(node);
            bandera = validations(node, editor.graph.getModel());
            clearDataHtml();
            if (!bandera) {
                $('#hideCostFuntion').show();
                node.querySelectorAll('Symbol').forEach(function(node) {
                    graphData.push({
                        'id': node.id,
                        "name": node.getAttribute('name'),
                        'resultdb': node.getAttribute('resultdb'),
                        'varcost': node.getAttribute('varcost'),
                        'funcost': node.getAttribute('funcost'),
                        'external': node.getAttribute('externalData'),
                        'externaldata': '[]'
                    })
                });

                let temp = [];
                node.querySelectorAll('mxCell').forEach(function(node) {
                    if (node.id != "") {
                        let value = Object.values(JSON.parse(node.getAttribute('value')));
                        graphData.push({
                            'id': node.id,
                            'source': node.getAttribute('source'),
                            'target': node.getAttribute('target'),
                            'resultdb': JSON.stringify(value[3]),
                            'funcost': JSON.stringify(value[5]),
                            'name': JSON.stringify(value[4]),
                            'varcost': JSON.stringify(value[1])
                        });
                        temp.push({
                            'id': node.id,
                            'source': node.getAttribute('source'),
                            'target': node.getAttribute('target'),
                        })
                    }
                });

                for (let index = 0; index < temp.length; index++) {
                    connection.push({
                        "source": temp[index].source,
                        "target": temp[index].id
                    })
                    connection.push({
                        "source": temp[index].id,
                        "target": temp[index].target
                    })
                }
                $('#graphConnections').val(JSON.stringify(connection));
                $('#xmlGraph').val(textxml);
                $('#graphElements').val(JSON.stringify(graphData));
            }
        }
 
         $('#step4NextBtn').click(function() {
             var datop = false;
             saveExternalData(datop);
         });
 
        //Set var into calculator
        $(document).on('click', '.list-group-item', function() {
            var el = document.getElementById("python-expression");
            typeInTextarea($(this).attr('value'),el);
        });

         function typeInTextarea(newText, el) {
            const [start, end] = [el.selectionStart, el.selectionEnd];
            el.setRangeText(newText, start, end, 'select');
        }

        $('#python-expression').on('keypress',function(evt) {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            let symbols = [40,41,42,43,45,60,61,62,106,107,109,111];
            if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
                return (symbols.indexOf(charCode) >= 0);

            return true;
        })
 
         $('#saveAndValideCost').click(function() {
             if (banderaFunctionCost) {
                 //true = nueva
                 var pyExp = $('#python-expression').val();
                 funcostdb.push({
                     'fields': {
                         'function_value': pyExp,
                         'function_py_value': pyExp,
                         'function_name': $('#costFunctionName').val() == '' ? 'Undefined name' : $('#costFunctionName').val(),
                         'function_description': $('#costFuntionDescription').val(),
                         'global_multiplier_factorCalculator': $('#global_multiplier_factorCalculator').val(),
                         'currencyCost': $('#currencyCost option:selected').val(),
                         'currencyCostName': $('#currencyCost option:selected').text(),
                         'logical': [{
                             'condition_1': "",
                             'ecuation_1': "",
                             'condition_2': "",
                             'ecuation_2': "",
                             'condition_3': "",
                             'ecuation_3': "",
                         }],
                     }
                 });
 
                 funcostdb[funcostdb.length - 1].fields.logical = JSON.stringify(funcostdb[funcostdb.length - 1].fields.logical);
             } else {
                 //false = editar
                 var temp = {
                    'function_value': $('#python-expression').val(), 
                    'function_name': $('#costFunctionName').val() == '' ? 'Undefined name' : $('#costFunctionName').val(),
                     'function_description': $('#costFuntionDescription').val(),
                     'global_multiplier_factorCalculator': $('#global_multiplier_factorCalculator').val(),
                     'currencyCost': $('#currencyCost option:selected').val(),
                     'currencyCostName': $('#currencyCost option:selected').text(),
                     'logical': [{
                         'condition_1': "",
                         'ecuation_1': "",
                         'condition_2': "",
                         'ecuation_2': "",
                         'condition_3': "",
                         'ecuation_3': ""
                     }],
                 }
 
                 temp.logical = JSON.stringify(temp.logical);
                 if (selectedCostId == 0){
                    $.extend(funcostdb[selectedCostId].fields, temp);
                }else{
                    let clonedFunCost = JSON.parse(JSON.stringify(funcostdb[0]));
                    $.extend(clonedFunCost.fields, temp);
                    funcostdb[selectedCostId] = clonedFunCost;
                }
                
                var pyExp = $('#python-expression').val();
                funcostdb[selectedCostId].fields.function_value = pyExp;
             }

             if (typeof(selectedCell.value) == "object"){
                selectedCell.setAttribute('funcost', JSON.stringify(funcostdb));                
            }else{
                var valueSelectedCell = JSON.parse(selectedCell.value);
                valueSelectedCell.funcost = funcostdb;
                selectedCell.value = JSON.stringify(valueSelectedCell);
            }
             
            $('#funcostgenerate tr').remove();
            $('#funcostgenerate').empty();
            for (let index = 0; index < funcostdb.length; index++) {
                funcost(index);
            }
            $('#CalculatorModal').modal('hide');
            validateGraphIntake();
         });
 
         //Edit funcion cost 
         $(document).on('click', 'a[name=glyphicon-edit]', function() {
            //mathField.clearSelection();
            clearInputsMath();
            $('#CalculatorModal').modal('show');
            selectedCostId = parseInt($(this).attr('idvalue'));
            $('#costFunctionName').val(funcostdb[selectedCostId].fields.function_name);
            $('#costFuntionDescription').val(funcostdb[selectedCostId].fields.function_description);
            $('#CalculatorModalLabel').text('Modify Cost - ' + $('#titleCostFunSmall').text());
            $('#currencyCost').val(funcostdb[selectedCostId].fields.currencyCost);
            $('#global_multiplier_factorCalculator').val(funcostdb[selectedCostId].fields.global_multiplier_factorCalculator);
            setVarCost();
            let value = funcostdb[selectedCostId].fields.function_value;
            console.log("valor de value es: "+value)
            if (value == ""){
                $('#python-expression').val();
            }
            else{
                $('#python-expression').val(value);
            }
            validatePyExpression();
         });
 
         //Delete funcion cost 
         $(document).on('click', 'a[name=glyphicon-trash]', function() {
             Swal.fire({
                 title: gettext('Are you sure?'),
                 text: gettext("You won't be able to revert this!"),
                 icon: 'warning',
                 showCancelButton: true,
                 confirmButtonColor: '#d33',
                 cancelButtonColor: '#3085d6',
                 confirmButtonText: gettext('Yes, delete it!')
             }).then((result) => {
                 if (result.isConfirmed) {
                    var id = $(this).attr('idvalue');
                    $(`#funcostgenerate tr[idvalue = 'fun_${id}']`).remove();
                    if (typeof(selectedCell.value) == "string" && selectedCell.value.length > 0) {
                        var obj = JSON.parse(selectedCell.value);
                        let dbfields = JSON.parse(obj.funcost);
                        dbfields.splice(id, 1);
                        obj.funcost = JSON.stringify(dbfields);
                        selectedCell.setValue(JSON.stringify(obj));
                        $('#funcostgenerate tr').remove();
                        $('#funcostgenerate').empty();
                        for (let index = 0; index < funcostdb.length; index++) {
                            funcost(funcostdb[index].fields.function_value, funcostdb[index].fields.function_name, index);
                        }

                    } else {
                        funcostdb.splice(id, 1);
                        selectedCell.setAttribute('funcost', JSON.stringify(funcostdb));
                        $('#funcostgenerate tr').remove();
                        $('#funcostgenerate').empty();
                        for (let index = 0; index < funcostdb.length; index++) {
                            funcost(funcostdb[index].fields.function_value, funcostdb[index].fields.function_name, index);
                        }
                    } 
                    Swal.fire(
                        gettext('Deleted!'),
                        gettext('Your function has been deleted'),
                        'success'
                    )
                 }
             })
         });
 
         $(document).on('click', 'a[name=fun_display_btn]', function() {
             var idx = $(this).attr('idvalue');
             $(`#fun_display_${idx}`).toggle();
         });
 
         function setVarCost() {
             banderaFunctionCost = false;
             $('#VarCostListGroup div').remove();
             $('#VarCostListGroup').empty();
             for (const index of graphData) {
                 var costlabel = "";
                 for (const iterator of JSON.parse(index.varcost)) {
                     costlabel += `<a value="${iterator}" class="list-group-item list-group-item-action" style="padding-top: 4px;padding-bottom: 4px;">${iterator}</a>`
                 }
                 $('#VarCostListGroup').append(`
                     <div class="panel panel-info">
                         <div class="panel-heading">
                             <h4 class="panel-title">
                                 <a data-toggle="collapse" data-parent="#VarCostListGroup" href="#VarCostListGroup_${index.id}">${index.id} - ${index.name.replace(/['"]+/g, '')}</a>
                             </h4>
                         </div>
                         <div id="VarCostListGroup_${index.id}" class="panel-collapse collapse">
                             ${costlabel}
                         </div>
                     </div>
                 `);
             }
         }
 
         $('#ModalAddCostBtn').click(function() {
             banderaFunctionCost = true;
             $('#VarCostListGroup div').remove();
             $('#VarCostListGroup').empty();
             clearInputsMath();
             typesetInput('');
             $('#costFunctionName').val('');
             $('#costFuntionDescription').val('');
             $('#CalculatorModalLabel').text('New Function Cost - ' + $('#titleCostFunSmall').text())
             for (const index of graphData) {
                 var costlabel = "";
                 for (const iterator of JSON.parse(index.varcost)) {
                     costlabel += `<a value="${iterator}" class="list-group-item list-group-item-action" style="padding-top: 4px;padding-bottom: 4px;">${iterator}</a>`
                 }
                 $('#VarCostListGroup').append(`
                 <div class="panel panel-info">
                     <div class="panel-heading">
                        <a data-toggle="collapse" data-parent="#VarCostListGroup" href="#VarCostListGroup_${index.id}">${index.id} - ${index.name.replace(/['"]+/g, '')}</a>                         
                     </div>
                     <div id="VarCostListGroup_${index.id}" class="panel-collapse collapse">
                         ${costlabel}
                     </div>
                 </div>
                 `);
             }
            $('#python-expression').val('');
            //$('#MathPreview').val('');
            validatePyExpression();
         });
 
         //Add value entered in sediments in the field resultdb
         $('#sedimentosDiagram').change(function() {
             if (typeof(selectedCell.value) == "string" && selectedCell.value.length > 0) {
                 var obj = JSON.parse(selectedCell.value);
                 let dbfields = obj.resultdb;
                 dbfields[0].fields.predefined_sediment_perc = $('#sedimentosDiagram').val();
                 obj.resultdb = dbfields;
                 selectedCell.setValue(JSON.stringify(obj));
             } else {
                 resultdb[0].fields.predefined_sediment_perc = $('#sedimentosDiagram').val();
                 selectedCell.setAttribute('resultdb', JSON.stringify(resultdb));
             }
         });
 
         //Add value entered in nitrogen in the field resultdb
         $('#nitrogenoDiagram').change(function() {
             if (typeof(selectedCell.value) == "string" && selectedCell.value.length > 0) {
                 var obj = JSON.parse(selectedCell.value);
                 let dbfields = obj.resultdb;
                 dbfields[0].fields.predefined_nitrogen_perc = $('#nitrogenoDiagram').val();
                 obj.resultdb = dbfields;
                 selectedCell.setValue(JSON.stringify(obj));
             } else {
                 resultdb[0].fields.predefined_nitrogen_perc = $('#nitrogenoDiagram').val();
                 selectedCell.setAttribute('resultdb', JSON.stringify(resultdb));
             }
         });
 
         //Add value entered in phosphorus in the field resultdb
         $('#fosforoDiagram').change(function() {
             if (typeof(selectedCell.value) == "string" && selectedCell.value.length > 0) {
                 var obj = JSON.parse(selectedCell.value);
                 let dbfields = obj.resultdb;
                 dbfields[0].fields.predefined_phosphorus_perc = $('#fosforoDiagram').val();
                 obj.resultdb = dbfields;
                 selectedCell.setValue(JSON.stringify(obj));
             } else {
                 resultdb[0].fields.predefined_phosphorus_perc = $('#fosforoDiagram').val();
                 selectedCell.setAttribute('resultdb', JSON.stringify(resultdb));
             }
         });
 
         //Add value entered in aguaDiagram in the field resultdb
         $('#aguaDiagram').change(function() {
             if (typeof(selectedCell.value) == "string" && selectedCell.value.length > 0) {
                 var obj = JSON.parse(selectedCell.value);
                 let dbfields = obj.resultdb;
                 dbfields[0].fields.predefined_transp_water_perc = $('#aguaDiagram').val();
                 obj.resultdb = dbfields;
 
                 selectedCell.setValue(JSON.stringify(obj));
             } else {
                 resultdb[0].fields.predefined_transp_water_perc = $('#aguaDiagram').val();
                 selectedCell.setAttribute('resultdb', JSON.stringify(resultdb));
             }
             validationTransportedWater(editor, selectedCell);
         });
 
         // Save External Input Data
         function saveExternalData(date) {
             for (let id = 0; id < graphData.length; id++) {
                 if (graphData[id].external) {
                     graphData[id].externaldata = [];
                     $(`th[name=year_${graphData[id].id}]`).each(function() {
                         let watersita = $(`input[name="waterVolume_${$(this).attr('year_value')}_${graphData[id].id}"]`).val();
                         let sedimentsito = $(`input[name="sediment_${$(this).attr('year_value')}_${graphData[id].id}"]`).val();
                         let nitrogenito = $(`input[name="nitrogen_${$(this).attr('year_value')}_${graphData[id].id}"]`).val();
                         let phospharusito = $(`input[name="phosphorus_${$(this).attr('year_value')}_${graphData[id].id}"]`).val();
                         if (watersita == '' || sedimentsito == '' || nitrogenito == '' || phospharusito == '') {
                             date = true;
                             Swal.fire({
                                 icon: 'warning',
                                 title: gettext('Field empty'),
                                 text: gettext('Please fill every fields')
                             });
                             return;
                         } else {
                             graphData[id].externaldata.push({
                                 "year": $(this).attr('year_value'),
                                 "waterVol": watersita,
                                 "sediment": sedimentsito,
                                 "nitrogen": nitrogenito,
                                 "phosphorus": phospharusito
                             });
                         }
                     });
                     var enc = new mxCodec();
                     var node = enc.encode(editor.graph.getModel());
                     node.querySelectorAll('Symbol').forEach((params) => {
                         if (params.getAttribute('externalData') === 'true') {
                             if (params.id === graphData[id].id) {
                                 params.setAttribute('external', JSON.stringify(graphData[id].externaldata))
                                 textxml = mxUtils.getPrettyXml(node);
                                 xmlDoc = mxUtils.parseXml(textxml)
                                 var dec = new mxCodec(xmlDoc);
                                 dec.decode(xmlDoc.documentElement, editor.graph.getModel());
                                 textxml = mxUtils.getPrettyXml(node);
                             }
                         }
                     });
 
                     graphData[id].externaldata = JSON.stringify(graphData[id].externaldata);
                 }
 
             }
             $('#xmlGraph').val(textxml);
             $('#graphElements').val(JSON.stringify(graphData));
             if (!date) {
                 intakeStepFour();
             }
         };
 
         $('#btnValidatePyExp').click(function(){
             validatePyExpression();
         });
 
         async function validatePyExpression(){
            let pyExp = $('#python-expression').val().trim();
            if (pyExp.length > 0){
                pyExpEncode = encodeURIComponent(pyExp);
                localApi = location.protocol + "//" + location.host;
                let url = localApi + "/intake/validatePyExpression?expression=" + pyExpEncode;
                let response = await fetch(url); 
                let result = await response.json();
                if (result){
                    is_valid = result.valid;
                    latex = result.latex
                    console.log(result.latex);
                    typesetInput(result.latex);
                    if (is_valid){
                        $("#python-expression").removeClass("invalid_expression");
                        $("#python-expression").addClass("valid_expression");
                    }else{
                        $("#python-expression").addClass("invalid_expression");
                        $("#python-expression").removeClass("valid_expression");
                    }
                }
            }
        }
  
        jQuery.fn.ForceNumericOnly = function() {
            return this.each(function() {
                $(this).keydown(function(e) {
                    var key = e.charCode || e.keyCode || 0;
                    return (
                        key == 8 ||
                        key == 9 ||
                        key == 13 ||
                        key == 46 ||
                        key == 110 ||
                        key == 190 ||
                        (key >= 35 && key <= 40) ||
                        (key >= 48 && key <= 57) ||
                        (key >= 96 && key <= 105));
                });
            });
        };      
     }); 
 }