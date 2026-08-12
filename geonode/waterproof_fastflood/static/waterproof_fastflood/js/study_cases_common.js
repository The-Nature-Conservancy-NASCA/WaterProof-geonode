/**
 * @file Common Study Case functions shared across waterproof_fastflood components
 * Functions extracted from study_cases_create_ws.js, study_cases_edit.js, study_cases_clone.js, study_cases_view.js
 * @version 1.0
 */

// Common configuration object to handle URL differences between files
urlBaseServer = serverApi.replace("/wf-models/","/");
const StudyCaseConfig = {
    urls: {
        createFolder: urlBaseServer + "wp-fastflood/create_sc_folder/",
        taskStatus: urlBaseServer + "wp-fastflood/tasks/",
        createDamageFile: urlBaseServer + "wp-fastflood/create-damage-files/",
        saveFastflood: "/fastflood/save/",
        saveRelative: "/fastflood/save/",
        carbonMarketParams: "/study_cases/parametersbycountry/",
        carbonMarketParamsRelative: "/study_cases/parametersbycountry/",
        financialParams: "/fastflood/parametersbycountry/",
        financialParamsRelative: "/parametersbycountry/",
        damageInfo: "/fastflood/damageInfo/",
        bioById: "/fastflood/bioById/",
        bioByMacro: "/fastflood/bioByMacro/",
        preproccessRios: urlBaseServer + "wf-rios/preproc_rios_fastflood_task"
    },
    mode: {
        VIEW: 'view',
        EDIT: 'edit'
    }
};

// ==== CORE UTILITY FUNCTIONS ====

/**
 * Helper function to get cookie value by name (for CSRF token)
 * @param {string} name - Cookie name
 * @returns {string} Cookie value or null
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Serializes data as jQuery does, handling arrays correctly with [] notation
 * @param {Object} data - Data object to serialize
 * @returns {string} URLEncoded string
 */
function serializeData(data) {
    const params = new URLSearchParams();

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];

            // Ignore undefined values
            if (value === undefined) {
                continue;
            }

            // If value is an array, add each element with field[]
            if (Array.isArray(value)) {
                value.forEach(item => {
                    params.append(key + '[]', item);
                });
            } else if (value === null) {
                // null is sent as empty string (jQuery behavior)
                params.append(key, '');
            } else if (typeof value === 'boolean') {
                // Convert booleans to 'true' or 'false' string
                params.append(key, value.toString());
            } else {
                // String, Number, etc.
                params.append(key, value);
            }
        }
    }

    return params.toString();
}

/**
 * Replacement for $.each - iterates over arrays and objects
 * @param {Array|Object} collection - Array or object to iterate
 * @param {Function} callback - Callback function(index, item)
 */
function each(collection, callback) {
    if (Array.isArray(collection)) {
        collection.forEach((item, index) => callback(index, item));
    } else if (typeof collection === 'object' && collection !== null) {
        Object.keys(collection).forEach((key) => {
            callback(key, collection[key]);
        });
    }
}

// ==== AJAX WRAPPER FUNCTIONS ====
// Note: More comprehensive versions of ajaxRequest, postData, getData are defined below
// These are lightweight versions for compatibility

/**
 * Replacement for $.get - GET request helper
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @returns {Promise} Promise resolving to response data
 */
function getData(url, params) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(url + queryString, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}

// ==== PROGRESS TABLE FUNCTIONS ====

/**
 * Creates the progress table in the processing modal
 * The table is initially collapsed/hidden
 */
function createProgressTable() {
    // Remove existing table if present
    $("#progress-table-container").remove();

    const tableHtml = `
        <div id="progress-table-container" style="margin-top: 20px;">
            <div class="panel panel-default">
                <div class="panel-heading" style="cursor: pointer; background-color: #f8f9fa; padding: 10px 15px;"
                     id="progress-table-header">
                    <h5 class="panel-title mb-0" style="display: inline-block;">
                        <i class="fa fa-chevron-right" id="progress-collapse-icon" style="margin-right: 8px;"></i>
                        ${gettext('progress_table_title')}
                    </h5>
                    <small class="text-muted" style="margin-left: 10px;" id="progress-collapse-hint">
                        (${gettext('click_to_expand')})
                    </small>
                </div>
                <div id="progress-table-collapse" style="display: none;">
                    <div class="panel-body" style="padding: 15px;">
                        <table class="table table-sm table-bordered" id="progress-log-table">
                            <thead>
                                <tr>
                                    <th style="width: 10%;">${gettext('step_column')}</th>
                                    <th style="width: 60%;">${gettext('description_column')}</th>
                                    <th style="width: 30%;">${gettext('status_column')}</th>
                                </tr>
                            </thead>
                            <tbody id="progress-log-tbody">
                                <tr>
                                    <td colspan="3" class="text-center">${gettext('loading_info')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add table to modal
    $("#_thumbnail_processing .modal-body").append(tableHtml);

    // Handle click to manually collapse/expand
    $('#progress-table-header').on('click', function () {
        const $collapse = $('#progress-table-collapse');
        const $icon = $('#progress-collapse-icon');
        const $hint = $('#progress-collapse-hint');

        if ($collapse.is(':visible')) {
            // Collapse
            $collapse.slideUp(300);
            $icon.removeClass('fa-chevron-down').addClass('fa-chevron-right');
            $hint.text(`(${gettext('click_to_expand')})`);
        } else {
            // Expand
            $collapse.slideDown(300);
            $icon.removeClass('fa-chevron-right').addClass('fa-chevron-down');
            $hint.text(`(${gettext('click_to_collapse')})`);
        }
    });
}

/**
 * Updates the progress table with log data
 * @param {number} studyCaseId - Study case ID
 */
function updateProgressTable(studyCaseId) {
    getData(`/fastflood/logsinfobyid/${studyCaseId}/`)
        .then(data => {
            if (data && Array.isArray(data) && data.length > 0) {
                const tbody = $("#progress-log-tbody");
                tbody.empty();

                each(data, function(index, log) {
                    const statusIcon = log.status
                        ? `<i class="fa fa-check-circle text-success"></i> ${gettext('completed_status')}`
                        : `<i class="fa fa-clock-o text-warning"></i> ${gettext('in_progress_status')}`;

                    const statusClass = log.status ? 'table-success' : 'table-warning';

                    // Handle null or undefined description and translate
                    const descriptionText = log.description || log.step || 'no_description';
                    const description = gettext(descriptionText);
                    
                    const stepId = log.step_id !== null && log.step_id !== undefined ? log.step_id : '-';

                    const row = `
                        <tr class="${statusClass}">
                            <td class="text-center">${stepId}</td>
                            <td>${description}</td>
                            <td>${statusIcon}</td>
                        </tr>
                    `;
                    tbody.append(row);
                });
            }
        })
        .catch(error => {
            console.error("Error updating progress table:", error);
        });
}

/**
 * Creates a folder structure for study cases with task polling
 * @param {string} id_study_case - Study case ID
 * @param {string} watershed - Watershed ID
 * @param {string} urlMode - URL mode ('relative' for edit/clone, 'default' for create)
 * @returns {Promise} Promise that resolves when folder creation is complete
 */
function createFolder(id_study_case, watershed, urlMode = 'default') {
    let currentDate = new Date();
    const year = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1);
    const day = String(currentDate.getUTCDate()); // + (urlMode === 'default' ? 1 : 0));
    const finalDate = `${year}-${month}-${day}`;
    studyCaseFolder = `${id_user}_${id_study_case}_${finalDate}`;

    return ajaxRequest({
        url: StudyCaseConfig.urls.createFolder,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            rename_root: studyCaseFolder,
            new_basin_id: watershed
        }),
        dataType: "json"
    })
    .then(data => {
        //console.log("Folder creation response:", data);

        if (data.status === "pending" && data.task_id) {
            return pollTaskStatus(data.task_id)
                .then(() => {
                    saveFolderName(id_study_case, studyCaseFolder, urlMode);
                    //console.log("Folder created successfully:", studyCaseFolder);
                    return { status: "SUCCESS", result: { status: "completed" } };
                });
        } else {
            console.error("Unexpected response format:", data);
            throw new Error("Unexpected response format");
        }
    })
    .catch(error => {
        console.error("Folder creation failed:", error);
        throw error;
    });
}

/**
 * Polls task status until completion
 * @param {string} taskId - Task ID to poll
 * @returns {Promise} Promise that resolves when task is complete
 */
function pollTaskStatus(taskId) {
    return new Promise((resolve, reject) => {
        const checkStatus = () => {
            ajaxRequest({
                url: `${StudyCaseConfig.urls.taskStatus}${taskId}`,
                type: "GET",
                dataType: "json"
            })
            .then(response => {
                //console.log("Task status response:", response);

                if (response.status === "SUCCESS" && response.result && (response.result.status === "completed" ||
                        response.result.message.indexOf("Errno 17") !== -1)) {
                    //console.log("Task completed successfully:", response.result.message);
                    resolve(response);
                } else if (response.status === "FAILURE") {
                    reject(new Error("Task failed: " + (response.result?.message || "Unknown error")));
                } else {
                    setTimeout(checkStatus, 1000);
                }
            })
            .catch(error => {
                console.error("Task status check failed:", error);
                reject(error);
            });
        };

        checkStatus();
    });
}

/**
 * Saves folder name to backend
 * @param {string} id_study_case - Study case ID
 * @param {string} folder_name - Folder name to save
 * @param {string} urlMode - URL mode ('relative' for edit/clone, 'default' for create)
 */
function saveFolderName(id_study_case, folder_name, urlMode = 'default') {
    const url = urlMode === 'relative' ? StudyCaseConfig.urls.saveRelative : StudyCaseConfig.urls.saveFastflood;

    return postData(url, {
        id_study_case: id_study_case,
        folder_name: folder_name
    })
    .then(data => {
        console.log("Folder name saved successfully:", data);
        return data;
    })
    .catch(error => {
        console.error("Error saving folder name:", error);
        throw error;
    });
}

/**
 * Loads carbon market parameters from backend
 * @param {string} urlMode - URL mode ('relative' for edit/clone/view, 'default' for create)
 */
function loadCarbomMarketParameter(urlMode = 'default') {
    const url = urlMode === 'relative' ? StudyCaseConfig.urls.carbonMarketParamsRelative : StudyCaseConfig.urls.carbonMarketParams;

    return getData(url + localStorage.cityId)
        .then(data => {
            each(data, function (index, financialParameters) {
                if (!$("#id_cm").val())
                    $("#id_cm").val(financialParameters.market_carbon_precing_USD_TonCO2e);
            });
        })
        .catch(error => {
            console.error("Error loading carbon market parameters:", error);
        });
}

/**
 * Loads financial parameters from backend
 * @param {string} urlMode - URL mode ('relative' for some files, 'default' for others)
 */
function loadFinancialParameter(urlMode = 'default') {
    const url = urlMode === 'relative' ? StudyCaseConfig.urls.financialParamsRelative : StudyCaseConfig.urls.financialParams;

    return getData(url + localStorage.cityId)
        .then(data => {
            each(data, function (index, financialParameters) {
                if (!$("#director").val())
                    $("#director").val(financialParameters.Program_Director_USD_YEAR);
                if (!$("#evaluation").val())
                    $("#evaluation").val(financialParameters.Monitoring_and_Evaluation_Manager_USD_YEAR);
                if (!$("#finance").val())
                    $("#finance").val(financialParameters.Finance_Manager_USD_YEAR);
                if (!$("#implementation").val())
                    $("#implementation").val(financialParameters.Implementation_Manager_USD_YEAR);
                if (!$("#office").val())
                    $("#office").val(financialParameters.Office_Costs_USD_YEAR);
                if (!$("#equipment").val())
                    $("#equipment").val(financialParameters.Equipment_Purchased_In_Year_1_USD);
                if (!$("#overhead").val())
                    $("#overhead").val(financialParameters.Overhead_USD_YEAR);
                if (!$("#discount").val())
                    $('#discount').val(financialParameters.drt_discount_rate_medium);
                if (!$("#minimum").val())
                    $('#minimum').val(financialParameters.drt_discount_rate_lower_limit);
                if (!$("#maximum").val())
                    $('#maximum').val(financialParameters.drt_discount_rate_upper_limit);
                if (!$("#transaction").val())
                    $('#transaction').val(financialParameters.Transaction_cost);
                calculate_Personnel();
                calculate_Platform();
                toggleLoadingStep("hide");
            });
        })
        .catch(error => {
            console.error("Error loading financial parameters:", error);
            toggleLoadingStep("hide");
        });
}

/**
 * Validates damage data table entries
 * @returns {boolean} True if all data is valid
 */
function validateDamageData() {
    let isValid = true;

    $('#damage-table-body tr').each(function () {
        const cells = $(this).find('td');

        cells.each(function () {
            const value = parseFloat($(this).text().trim().replace(',', '.'));

            if (value === "" || isNaN(value) || value < 0) {
                isValid = false;
                return false;
            }
        });

        if (!isValid) {
            return false;
        }
    });

    return isValid;
}

/**
 * Normalizes decimal separator from comma to point for parsing
 * Handles localized number formats (e.g., Spanish uses comma as decimal separator)
 * @param {string} value - The string value to normalize
 * @returns {number} - The parsed float value or 0 if invalid
 */
function parseLocalizedFloat(value) {
    if (value === null || value === undefined) return 0;
    // Replace comma with point for decimal separator normalization
    const normalized = String(value).trim().replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Loads damage information by country
 * @param {string} mode - Display mode ('view' or 'edit')
 */
function getDamagesByCountry(mode = StudyCaseConfig.mode.EDIT) {
    const isoCountry = localStorage.countryCode;
    const isEditable = mode === StudyCaseConfig.mode.EDIT;

    return getData(`${StudyCaseConfig.urls.damageInfo}${isoCountry}`)
        .then(data => {
            //console.log(data);
            const grouped = {};
            data.forEach(item => {
                const depth = item.flood_depth;
                if (!grouped[depth]) {
                    grouped[depth] = {
                        Residential: '',
                        Commercial: '',
                        Industrial: '',
                        InfraRoads: '',
                        Agriculture: ''
                    };
                }

                if (item.damage_class === "Residential buildings") {
                    grouped[depth].Residential = item.damage_factor;
                } else if (item.damage_class === "Commercial buildings") {
                    grouped[depth].Commercial = item.damage_factor;
                } else if (item.damage_class === "Industrial buildings") {
                    grouped[depth].Industrial = item.damage_factor;
                } else if (item.damage_class === "Infrastructure - roads") {
                    grouped[depth].InfraRoads = item.damage_factor;
                } else if (item.damage_class === "Agriculture") {
                    grouped[depth].Agriculture = item.damage_factor;
                }
            });

            const sortedDepths = Object.keys(grouped).sort((a, b) => parseFloat(a) - parseFloat(b));
            const tbody = document.getElementById('damage-table-body');

            // Eliminar registros existentes antes de agregar los nuevos
            tbody.innerHTML = '';

            sortedDepths.forEach(depth => {
                const values = grouped[depth];
                const row = document.createElement('tr');
                const editableAttr = isEditable ? 'contenteditable="true"' : '';
                const editableClass = isEditable ? 'editable' : '';

                row.innerHTML = `
                    <td class="small text-right">${depth}</td>
                    <td class="small text-right ${editableClass}" ${editableAttr}>${values.Residential || '-'}</td>
                    <td class="small text-right ${editableClass}" ${editableAttr}>${values.Commercial || '-'}</td>
                    <td class="small text-right ${editableClass}" ${editableAttr}>${values.Industrial || '-'}</td>
                    <td class="small text-right ${editableClass}" ${editableAttr}>${values.InfraRoads || '-'}</td>
                    <td class="small text-right ${editableClass}" ${editableAttr}>${values.Agriculture || '-'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error loading damages by country:", error);
        });
}

/**
 * Loads biophysical parameters into table
 * @param {string} basin_id - Basin ID
 * @param {string} studyCaseId - Study case ID (optional, used in some modes)
 * @param {string} mode - Display mode ('view' or 'edit')
 */
function loadBiophysicalParams(basin_id, studyCaseId = null, mode = StudyCaseConfig.mode.EDIT) {
    const tableBody = document.querySelector("#invest-table-info-body");

    tableBody.innerHTML = "";
    localStorage.setItem("watershedId", basin_id);

    const isEditable = mode === StudyCaseConfig.mode.EDIT;
    const url = studyCaseId ? `${StudyCaseConfig.urls.bioById}${studyCaseId}` : `${StudyCaseConfig.urls.bioByMacro}${basin_id}`;

    return getData(url)
        .then(data => {
            //console.log(data);

            each(data, function (index, row) {
                const format = val => val !== '' ? Number(val).toFixed(6) : '-';
                const tr = document.createElement("tr");
                const editableAttr = isEditable ? 'contenteditable="true"' : '';

                tr.innerHTML = `
                    <td class="text-left">${row.lulc}</td>
                    <td class="text-right">${row.code}</td>
                    <td class="text-right" editable ${editableAttr}>${format(row.c_above)}</td>
                    <td class="text-right" editable ${editableAttr}>${format(row.c_below)}</td>
                    <td class="text-right" editable ${editableAttr}>${format(row.c_soil)}</td>
                    <td class="text-right" editable ${editableAttr}>${format(row.c_dead)}</td>
                `;

                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("Error loading biophysical parameters:", error);
        });
}

/**
 * Transforms area from square meters to Has
 * @param {number} area - Area in square meters
 * @returns {string} Area in Has with 2 decimal places
 */
function transformArea(area) {
    var transformAreaM = area / 10000; 
    return transformAreaM.toFixed(2); 
}

/**
 * Validates that required fields are not null
 * @param {Object} data - Data object to validate
 */
function validateNotNulls(data) {
    const fieldsToValidate = ['q_l_s', 'cn_mg_l', 'cp_mg_l', 'csed_mg_l', 'wn_kg','wn_ret_kg','wp_ret_ton','wsed_ret_ton','wsed_ton','wp_kg'];
    
    fieldsToValidate.forEach(e => {
        if (data[e] === null) {
            showWarning(gettext('Error con la captacion seleccionada'), gettext('Error con la captacion descripcion'));
            if ($("#custom-"+data.intake)[0]) {
                $("#custom-"+data.intake)[0].cells[4].children[0].click() 
            }
            return;
        }
    });
}

/**
 * Redirects to appropriate location based on localStorage
 * Waits 1 second before redirecting
 */
function locationHref() {
    setTimeout(function() {
        if (localStorage.getItem('returnTo') != null) {
            window.location.href = "/fastflood/studyCase/" + localStorage.getItem('returnTo');
        } else {
            window.location.href = "/fastflood/studyCase/?city=" + localStorage.cityId;
        }
    }, 1000); // Wait 1 second before redirect
}

/**
 * Displays error message and handles error state
 */
function msgError() {
    $("#_thumbnail_processing").modal("hide");
    if (localStorage.msgErrorSend === "false") {
        getData("/study_cases/study_case_error/", {
            id_study_case: id_study_case
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error("Error reporting study case error:", error);
        });
        localStorage.setItem("msgErrorSend", true);
    }
    showAlert({
        icon: "error",
        title: gettext("error_api_container"),
        text: gettext("error_model_api_container"),
        confirmButtonText: gettext("Ok"),
        preConfirm: () => {
            locationHref();
        },
    });
}

/**
 * Calculates total area from custom table
 * @returns {number} Total area from intakes
 */
function getArea() {
    var intakes_area = 0;
    $("#custom_table tbody tr").each(function () {
        var area = parseFloat($(this).find("td:eq(3)").text());
        console.log(area)
        if (!isNaN(area)) {
            intakes_area += area;
        }
    });
    return intakes_area;
}

/**
 * Gets priority based on area ranges
 * @param {number} area - Area to evaluate
 * @returns {number} Priority index
 */
function getPriority(area) {
    const range = [1001, 1501, 2001, 3001, 5001, 8001, 13001, 21001, 34001];
    for (let i = 0; i < range.length; i++) {
        if (area <= range[i]) {
            return i;
        }
    }
    return range.length;
}

/**
 * Generates JSON for study case (specific to create_ws.js)
 * @param {string} id_study_case - Study case ID
 */
function generateStudyCaseJSON(id_study_case) {
    console.log("generateStudyCaseJSON...")
    return ajaxRequest({
        url: "/fastflood/getjson/",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            id_study_case: id_study_case
        }),
        dataType: "json"
    })
    .then(data => {
        console.log("JSON generado:", data);
        return data;
    })
    .catch(error => {
        console.error("Error al generar JSON:", error);
        throw new Error(`Error generating JSON: ${error.message}`);
    });
}

/**
 * Process RIOS preprocessing for a study case
 * @param {string} id_study_case - Study case ID
 * @param {string} priority - Priority level for processing
 */
function preprocRiosProcess(id_study_case, priority) {
    console.log("PreprocRios init")

    // Establecer flag de ejecución en progreso inmediatamente para prevenir ejecuciones simultáneas
    localStorage.setItem("preprocInit", "in_progress");

    toggleLoadingStep("show");

    // Esperar la respuesta exitosa de generateStudyCaseJSON antes de continuar
    generateStudyCaseJSON(id_study_case)
        .then(() => {
            console.log("successful JSON generated, continuing with RIOS process");            
            let amp = "&";
            if (serverApi.indexOf("proxy") >= 0) {
                amp = "%26";
            }
            let url = `${StudyCaseConfig.urls.preproccessRios}/?case_id=${id_study_case}${amp}user_id=${id_user}${amp}priority=${priority}${amp}usr_folder=${studyCaseFolder}`;
            ajaxRequest({
                url:  url,
                type : 'GET',
                dataType : 'json'
            })
            .then(json => {
                let taskId = json.task_id;
                if(json.task_status == 'PENDING'){
                    if (localStorage.getItem("preprocInit") != "true"){
                        let description = gettext("run_processing_description");
                        let desc = document.createElement("div");
                        desc.innerHTML = description;
                        $("#_thumbnail_processing .modal-body").prepend(desc);
                    }

                    localStorage.setItem("preprocInit",true)
                    toggleLoadingStep("hide");
                    $("#_thumbnail_processing").modal("toggle");

                    // Add progress table to modal
                    createProgressTable();

                    // Start progress update interval
                    let progressUpdateInterval = setInterval(() => {
                        updateProgressTable(id_study_case);
                    }, 10 * 1000); // Update every 10 seconds

                    let urlQueryTask = serverRiosApi + "tasks/?id="+taskId;
                    let validationInterval = setInterval(queryAnalisysResult, 15 * 1000);
                    let iteration = 1;
                    localStorage.setItem("msgErrorSend",false);
                    function queryAnalisysResult(){
                        console.log("queryAnalisysResult, iteration: " + iteration);
                        serverVerification(id_study_case);
                        if (iteration >= 30){
                            console.log("iteration: " + iteration + ", process exceeded time threshold");
                            // Detener ambos intervalos
                            clearInterval(validationInterval);
                            clearInterval(progressUpdateInterval);
                            // Cerrar el modal de procesamiento
                            $('#_thumbnail_processing').modal('hide');
                            // Mostrar modal informativo bloqueante
                            const messageEs = "El área de estudio seleccionada requiere un mayor tiempo de análisis.<br>" +
                                            "El sistema continuará procesando su caso en segundo plano.<br>" +
                                            "Recibirá una notificación por correo electrónico una vez los resultados estén disponibles.";
                            const messageEn = "The selected study area requires additional processing time.<br>" +
                                            "The system will continue processing your case in the background.<br>" +
                                            "You will receive an email notification once the results are available.";
                            showAlert({
                                icon: "info",
                                title: gettext("Processing in Background"),
                                html: `<div style="text-align: left;">${messageEs}<br><br><em>${messageEn}</em></div>`,
                                confirmButtonText: "OK",
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                allowEnterKey: true,
                                preConfirm: () => {
                                    location.href = "/";
                                }
                            });
                            return;
                        }
                        // Use fetch instead of $.ajax
                        ajaxRequest({
                            url : urlQueryTask,
                            type : 'GET',
                            dataType : 'json'
                        })
                        .then(json => {
                            if (json.task_status == 'SUCCESS') {
                                postData("/fastflood/run/", {id_study_case: id_study_case,run_analysis: 'true'})
                                .then(data => {
                                    $('#_thumbnail_processing').modal('hide');
                                    locationHref();
                                })
                                .catch(error => {
                                    console.error("Error running analysis:", error);
                                    $('#_thumbnail_processing').modal('hide');
                                    locationHref(); // Proceed anyway for user experience
                                });
                                console.log("finish interval execution");
                                clearInterval(validationInterval);
                                clearInterval(progressUpdateInterval);
                                locationHref();
                            }
                            iteration++;
                        })
                        .catch(error => {
                            console.log("not yet redirect... Error:", error);
                            // Continue polling even on error for robustness
                        });
                    }
                }else{
                    $('#_thumbnail_processing').modal('hide');
                    showAlert({
                        icon: "error",
                        title: gettext("error_api_container"),
                        text: gettext("error_model_api_container"),
                        confirmButtonText: gettext("Ok"),
                        preConfirm: () => {
                            locationHref();
                        },
                    });
                }
            })
            .catch(error => {
                console.error("Error in RIOS preprocessing:", error);
                // Resetear flag para permitir reintentos
                localStorage.setItem("preprocInit", "false");
                toggleLoadingStep("hide");
                $('#_thumbnail_processing').modal('hide');
                if (error.message && !error.message.includes('504')) {
                    showAlert({
                        icon: "error",
                        title: gettext("error_api_container"),
                        text: gettext("error_model_api_container"),
                        confirmButtonText: gettext("Ok"),
                        preConfirm: () => {
                            location.href = "/study_cases/?city="+localStorage.cityId;
                        },
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error generando JSON del Study Case:", error);
            // Resetear flag para permitir reintentos
            localStorage.setItem("preprocInit", "false");
            toggleLoadingStep("hide");
            $('#_thumbnail_processing').modal('hide');
            showError("Error", "Error al generar JSON del Study Case: " + error.message);
        });
}

// Ocean value validation function
function validOceanValue(event, value) {
    const literalValue = value.toString().replace(',','.');
    const roundedValue = Math.round(literalValue * 10) / 10;
    if (roundedValue <= 10) {
        event.target.value = roundedValue;
        return true;
    } else {
        event.target.value = 0;
    }
}

// Parameter value validation function  
function validParameterValue(event, value) {
    const literalValue = value.toString().replace(',','.');
    const roundedValue = Math.round(literalValue * 100) / 100;
    if (roundedValue <= 10) {
        event.target.value = roundedValue;
        return true;
    } else {
        event.target.value = 0;
    }
}

// Storm duration validation function
function validStormDuration(event, value) {
    const literalValue = value.toString().replace(',','.');
    const roundedValue = Math.round(literalValue * 100) / 100;
    if (roundedValue > 0) {
        event.target.value = roundedValue;
        return true;
    } else {
        event.target.value = 0;
    }
}

// Non-residential values validation function
function validNonResidentialValues(event) {
    const target = event.target;
    let value = parseFloat(target.innerText) || 0;
    value = parseInt(value);

    const commercialCell = document.getElementById("commercial-value");
    const industrialCell = document.getElementById("industrial-value");

    const commercial = parseFloat(commercialCell.innerText) || 0;
    const industrial = parseFloat(industrialCell.innerText) || 0;

    if (target.id === "commercial-value") {
        if (commercial < 100) {
            commercialCell.innerText = parseInt(value);
            industrialCell.innerText = parseInt(100 - value);
        } else {
            commercialCell.innerText = 50;
            industrialCell.innerText = 50;
        }
    } else if (target.id === "industrial-value") {
        if (industrial < 100) {
            commercialCell.innerText = parseInt(100 - value);
            industrialCell.innerText = parseInt(value);
        } else {
            commercialCell.innerText = 50;
            industrialCell.innerText = 50;
        }
    } 
}

function loadWatersheds(watershedId) {

    $("#select_custom").empty();
    return getData("/fastflood/watershedbycity/" + localStorage.cityId)
        .then(data => {
            console.log('getData("/fastflood/watershedbycity/"');
            let watershedFound = false;
            if (data.length > 0) {
                $('<option>', {
                    text: gettext('Select only one watershed'),
                    value: "",
                    selected: true,
                    disabled: true
                }).appendTo('#select_custom');
                localStorage.setItem("watershedList", JSON.stringify(data));
                each(data, function (index, watershed) {
                    $("#select_custom").append(new Option(watershed.name, watershed.id));
                    if (watershed.id == watershedId) {
                        $("#select_custom").val(watershed.id);
                        $("#add_wi").click();
                        watershedFound = true;
                    }
                });
                if (!watershedFound && watershedId) {
                    loadWatershedById(watershedId);
                }
                $("#div-customcase").removeClass("panel-hide");
                autoAdjustHeightTabContent();
            } else {
                loadWatershedById(watershedId);
                $("#div-emptyintakes").removeClass("panel-hide");
                $("#div-emptywatershed").removeClass("panel-hide");
                autoAdjustHeightTabContent();
            }
            toggleLoadingStep("hide");
        })
        .catch(error => {
            console.error("Error loading watersheds:", error);
            toggleLoadingStep("hide");
        });
}

function loadWatershedById(watershedId) {
    return getData("/fastflood/watershed-by-id/" + watershedId)
        .then(data => {
            if (data.length > 0) {
                each(data, function (index, watershed) {
                    let watershedList = JSON.parse(localStorage.getItem("watershedList"));
                    if (!watershedList) {
                        watershedList = [watershed];
                        localStorage.setItem("watershedList", JSON.stringify(watershedList));
                    }                    
                    $("#select_custom").append(new Option(watershed.name, watershed.id));
                    $("#select_custom").val(watershed.id);
                    $("#add_wi").click();
                });
            }
        }).catch(error => {
            console.error("Error loading watershed by ID:", error);
        }).finally(() => {
            toggleLoadingStep("hide");
        });
}

function calculate_Personnel() {
  var total = 0.0;
  var total_personnel = $("#total_personnel");
  var director = $("#director").val();
  var evaluation = $("#evaluation").val();
  var finance = $("#finance").val();
  var implementation = $("#implementation").val();
  if (director && !isNaN(director)) {
      total += parseFloat(director)
  }
  if (evaluation && !isNaN(evaluation)) {
      total += parseFloat(evaluation)
  }
  if (finance && !isNaN(finance)) {
      total += parseFloat(finance)
  }
  if (implementation && !isNaN(implementation)) {
      total += parseFloat(implementation)
  }
  total_personnel.val(total.toFixed(2));
}

function calculate_Platform() {
  var total = 0.0;
  var total_plaform = $("#total_platform");
  var personnel = $("#total_personnel").val();
  var office = $("#office").val();
  var travel = $("#travel").val();
  var equipment = $("#equipment").val();
  var overhead = $("#overhead").val();
  var contracts = $("#contracts").val();
  var others = $("#others").val();

  if (personnel && !isNaN(personnel)) {
      total += parseFloat(personnel)
  }
  if (director && !isNaN(director)) {
      total += parseFloat(director)
  }
  if (office && !isNaN(office)) {
      total += parseFloat(office)
  }
  if (travel && !isNaN(travel)) {
      total += parseFloat(travel)
  }
  if (equipment && !isNaN(equipment)) {
      total += parseFloat(equipment)
  }
  if (contracts && !isNaN(contracts)) {
      total += parseFloat(contracts)
  }
  if (overhead && !isNaN(overhead)) {
      total += parseFloat(overhead)
  }
  if (others && !isNaN(others)) {
      total += parseFloat(others)
  }
  total_plaform.val(total)
}

//add function set autoAdjustHeight
function autoAdjustHeightTabContent() {
  //console.log("autoAdjustHeightTabContent...");

  // Use requestAnimationFrame to ensure DOM is fully rendered
  requestAnimationFrame(function() {
    // Find the currently active/visible step - try multiple selectors
    let activeStep = $('#autoAdjustHeightF .tab-pane.active');

    // If no active step found, try to find visible step (not hidden)
    if (activeStep.length === 0) {
      activeStep = $('#autoAdjustHeightF .tab-pane').filter(function() {
        return $(this).css('display') !== 'none';
      }).first();
    }

    if (activeStep.length > 0) {
      // Calculate the actual height of the active step content
      const contentHeight = activeStep.outerHeight(true); // includes margins

      // Get the scroll height to ensure we capture all content including overflow
      const scrollHeight = activeStep[0].scrollHeight;

      // Use the maximum of outerHeight and scrollHeight
      const actualHeight = Math.max(contentHeight, scrollHeight);

      // Set a minimum height to ensure content is fully visible
      // Use at least 600px to accommodate the button at the bottom
      const minHeight = Math.max(actualHeight + 50, 600); // Add 50px padding for safety

      // Apply the calculated height
      $('#autoAdjustHeightF').css({
        "height": "auto",
        "min-height": minHeight + "px"
      });

      //console.log(`Active step content height: ${contentHeight}px, scroll height: ${scrollHeight}px, Container min-height set to: ${minHeight}px`);
    } else {
      // Fallback if no active step is found - use a generous minimum
      console.log("No active step found, using fallback height");
      $('#autoAdjustHeightF').css({
        "height": "auto",
        "min-height": "600px"
      });
    }
  });
}

// Debounce helper function to prevent excessive calls during window resize
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add window resize listener with debounce to call autoAdjustHeightTabContent
// This ensures the tab content adjusts properly when user resizes the browser window
window.addEventListener('resize', debounce(function() {
  console.log("Window resized, adjusting tab content height...");
  autoAdjustHeightTabContent();
}, 250)); // Wait 250ms after resize stops before executing

// ==== MODERN FETCH API HELPER FUNCTIONS ====
// These functions replace jQuery AJAX methods with modern fetch API
// Added to support proper FormData and array handling

/**
 * Helper function to fetch currencies using modern fetch API
 * @param {string} studyCaseId - Study case ID
 * @param {string} analysisCurrency - Currency code
 * @returns {Promise} Promise resolving to currency data
 */
async function fetchCurrencies(studyCaseId, analysisCurrency) {
    const params = new URLSearchParams({
        id: studyCaseId,
        currency: analysisCurrency
    });
    
    try {
        const response = await fetch(`/fastflood/currencys/?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching currencies:", error);
        throw error;
    }
}

/**
 * Helper function for POST requests using modern fetch API
 * Properly handles arrays by converting them to FormData with [] notation
 * @param {string} url - Request URL
 * @param {Object} data - Data object to send
 * @returns {Promise} Promise resolving to response data
 */
async function postData(url, data) {
    const formData = new FormData();
    
    // Convert data object to FormData (matching jQuery.post behavior)
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            
            // Handle arrays like jQuery.post does
            if (Array.isArray(value)) {
                // Add each array element with [] notation like jQuery.post
                value.forEach(item => {
                    formData.append(key + '[]', item);
                });
            } else {
                formData.append(key, value);
            }
        }
    }
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest', // Mimic jQuery AJAX behavior
                'X-CSRFToken': getCsrfToken() // Add CSRF token if available
                // Note: Don't set Content-Type for FormData - let browser set it automatically
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error(`Error posting to ${url}:`, error);
        throw error;
    }
}

/**
 * Helper function to get CSRF token from cookies
 * Wrapper for getCookie to maintain backward compatibility
 * @returns {string} CSRF token value or empty string
 */
function getCsrfToken() {
    return getCookie('csrftoken') || '';
}

/**
 * General AJAX request helper using fetch API (replaces $.ajax)
 * @param {Object} options - Request options (url, method, data, contentType, dataType, headers)
 * @returns {Promise} Promise resolving to response data
 */
async function ajaxRequest(options) {
    const {
        url,
        method = 'GET',
        type = method, // jQuery compatibility
        data = null,
        contentType = null,
        dataType = 'json',
        headers = {}
    } = options;
    
    const fetchOptions = {
        method: type.toUpperCase(),
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            ...headers
        }
    };
    
    if (type.toUpperCase() !== 'GET') {
        fetchOptions.headers['X-CSRFToken'] = getCsrfToken();
    }
    
    if (data) {
        if (contentType === 'application/json') {
            fetchOptions.headers['Content-Type'] = 'application/json';
            fetchOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
        } else if (type.toUpperCase() === 'POST' && !contentType) {
            const formData = new FormData();
            if (typeof data === 'object') {
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const value = data[key];
                        if (Array.isArray(value)) {
                            value.forEach(item => {
                                formData.append(key + '[]', item);
                            });
                        } else {
                            formData.append(key, value);
                        }
                    }
                }
            }
            fetchOptions.body = formData;
        } else {
            fetchOptions.body = data;
        }
    }
    
    try {
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (dataType === 'json') {
            return await response.json();
        } else if (dataType === 'text') {
            return await response.text();
        } else {
            return response;
        }
    } catch (error) {
        console.error(`AJAX request failed for ${url}:`, error);
        throw error;
    }
}

/**
 * Utility function to show SweetAlert2 notifications
 * @param {Object} options - Alert options (supports all SweetAlert2 options)
 * @param {string} options.icon - Alert type ('error', 'warning', 'success', 'info', 'question')
 * @param {string} options.title - Alert title
 * @param {string} options.text - Alert message text
 * @param {string} [options.html] - HTML content instead of text
 * @param {boolean} [options.showCancelButton] - Whether to show cancel button
 * @param {string} [options.confirmButtonText] - Custom confirm button text
 * @param {string} [options.cancelButtonText] - Custom cancel button text
 * @param {string} [options.confirmButtonColor] - Confirm button color
 * @param {string} [options.cancelButtonColor] - Cancel button color
 * @param {Function} [options.preConfirm] - Function to execute before confirming
 * @param {...*} [options.otherOptions] - Any other SweetAlert2 options
 * @returns {Promise} SweetAlert2 promise
 */
function showAlert(options) {
    // Set default values for common options
    const defaultOptions = {
        showCancelButton: false,
        confirmButtonText: gettext('Ok'),
        cancelButtonText: gettext('Cancel'),
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    };
    
    // Merge default options with provided options
    const alertOptions = Object.assign({}, defaultOptions, options);
    
    return Swal.fire(alertOptions);
}

/**
 * Show error alert with standard styling
 * @param {string} title - Error title
 * @param {string} text - Error message
 * @returns {Promise} SweetAlert2 promise
 */
function showError(title, text) {
    return showAlert({
        icon: 'error',
        title: title,
        text: text
    });
}

/**
 * Show warning alert with standard styling
 * @param {string} title - Warning title
 * @param {string} text - Warning message
 * @returns {Promise} SweetAlert2 promise
 */
function showWarning(title, text) {
    return showAlert({
        icon: 'warning',
        title: title,
        text: text
    });
}

/**
 * Show success alert with standard styling
 * @param {string} title - Success title
 * @param {string} text - Success message
 * @returns {Promise} SweetAlert2 promise
 */
function showSuccess(title, text) {
    return showAlert({
        icon: 'success',
        title: title,
        text: text
    });
}

/**
 * Show confirmation dialog with yes/no buttons
 * @param {string} title - Confirmation title
 * @param {string} text - Confirmation message
 * @param {string} confirmText - Confirm button text (optional)
 * @param {string} cancelText - Cancel button text (optional)
 * @returns {Promise} SweetAlert2 promise
 */
function showConfirmation(title, text, confirmText = gettext('response_delete'), cancelText = gettext('Cancel')) {
    return showAlert({
        icon: 'warning',
        title: title,
        text: text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText
    });
}

// ==== STUDY CASE NAME VALIDATION ====
// Global variable to track if name exists
var nameExistsGlobal = false;

/**
 * Checks if a study case name already exists for the current user
 * @param {string} name - Study case name to check
 * @returns {Promise<boolean>} Promise resolving to true if name exists, false otherwise
 */
function checkStudyCaseName(name) {
    if (!name || name.trim() === '') {
        hideNameExistsIndicator();
        return Promise.resolve(false);
    }

    return fetch('/fastflood/studycase-exist-by-name/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({
            'name': name.trim()
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data === true) {
            showNameExistsIndicator();
            nameExistsGlobal = true;
            disableNextButton();
            return true;
        } else {
            hideNameExistsIndicator();
            nameExistsGlobal = false;
            enableNextButton();
            return false;
        }
    })
    .catch(error => {
        console.error('Error checking study case name:', error);
        hideNameExistsIndicator();
        nameExistsGlobal = false;
        enableNextButton();
        return false;
    });
}

/**
 * Shows the name exists indicator
 */
function showNameExistsIndicator() {
    const indicator = document.getElementById('name-exists-indicator');
    if (indicator) {
        indicator.style.display = 'block';
    }
}

/**
 * Hides the name exists indicator
 */
function hideNameExistsIndicator() {
    const indicator = document.getElementById('name-exists-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

/**
 * Disables the Next button in step 1
 */
function disableNextButton() {
    const nextBtn = document.getElementById('step1NextBtn');
    if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.6';
    }
}

/**
 * Enables the Next button in step 1
 */
function enableNextButton() {
    const nextBtn = document.getElementById('step1NextBtn');
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
    }
}

/**
 * Initializes name validation for the name input field
 * Should be called on document ready
 */
function initializeNameValidation() {
    const nameInput = document.getElementById('name');

    if (nameInput) {
        // Add blur event listener
        nameInput.addEventListener('blur', function() {
            console.log("checkStudyCaseName on blur");
            checkStudyCaseName(this.value);
        });

        // Add input event listener to enable Next button when user modifies name
        nameInput.addEventListener('input', function() {
            if (nameExistsGlobal) {
                hideNameExistsIndicator();
                nameExistsGlobal = false;
                enableNextButton();
            }
        });
    }
}

$("#director").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});

$("#evaluation").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});

$("#finance").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});

$("#implementation").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});

$("#office").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});
$("#travel").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});
$("#equipment").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});
$("#overhead").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});
$("#contracts").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});
$("#others").keyup(function () {
    calculate_Personnel();
    calculate_Platform();
});

$("#analysis_nbs").change(function () {
    console.log("analysis_nbs, value:", $(this).val());
    validateAnalysisNbs();
});

function validateAnalysisNbs() {
    console.log("validateAnalysisNbs... selected text:", $("#analysis_nbs option:selected").text());
    if ($("#analysis_nbs option:selected").text() == "HISTORIC") {
        $("#quantile").prop("disabled", true);
        $("#climate_year").prop("disabled", true);
        $("#quantile").val("N/A");
    } else {
        $("#quantile").prop("disabled", false);
        $("#quantile").val("85");
        $("#climate_year").prop("disabled", false);
    }
}

$("#storm_duration").change(function () {   
    $("#analysis_storm").val($("#storm_duration :selected").val());
});

function toggleLoadingStep(showHide){
    $('#smartwizard').smartWizard("loader", showHide);    
}

$('#btn-advanced_options').click(function () {
    if ($('#advanced_options').hasClass('panel-hide')) {
        $('#advanced_options').removeClass('panel-hide');
        $('#btn-advanced_options').html(gettext('Hide advanced options') + ' <i class="fa fa-chevron-up" aria-hidden="true"></i>');
    } else {
        $('#advanced_options').addClass('panel-hide');
        $('#btn-advanced_options').html(gettext('Show advanced options') + ' <i class="fa fa-chevron-down" aria-hidden="true"></i>');
        console.log("$('#btn-advanced_options').click");
        autoAdjustHeightTabContent();
    }
});

$('#smartwizard').smartWizard({
    selected: 0,
    theme: 'dots',
    enableURLhash: false,
    autoAdjustHeight: true,
    transition: {
        animation: 'fade', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
    },
    toolbarSettings: {
        toolbarPosition: 'bottom', // both bottom
        toolbarButtonPosition: 'center', // both bottom
    },
    keyboardSettings: {
        keyNavigation: false
    },
    toolbarSettings: {
        showNextButton: false,
        showPreviousButton: false,
    }
});

$("#smartwizard").on("showStep", function(e, anchorObject, stepIndex, stepDirection, stepPosition) {
   //console.log("You are on step "+stepIndex+" now");
   if (stepIndex === 3) {
        setTimeout(function(){
            $('#advanced_options').addClass('panel-hide');
        }, 300);
    }
    //console.log('$("#smartwizard").on("showStep"');
    autoAdjustHeightTabContent();
});

$('#biophysical-panel').on('keyup change', 'table tr input', function () {
        var row = $(this).closest("tr");
        row.addClass("edit");
    });

    
function loadNBSActivities(readOnly = false) {
    //console.log("loadNBSActivities...");
    // Use fetch instead of $.post
    toggleLoadingStep("show");
    disabled = "";
    if (readOnly) {
        disabled = "disabled";
    }

    postData("/fastflood/nbs/", {id_study_case: id_study_case, city_id: localStorage.cityId, process: "Edit"})
    .then(data => {
        content = '';
        invesment = 0.0;
        min = 0.0;
        analysis_currency = $("#analysis_currency option:selected").val();
        toggleLoadingStep("show");
        // Use fetch instead of $.get
        fetchCurrencies(id_study_case, analysis_currency)
            .then(currencies => {
            $.each(data, function (i, nbs) {
                var id = nbs.id_nbssc;
                var val = nbs.value;
                var nbsCurrency = nbs.currency;
                var min = (parseFloat(nbs.unit_implementation_cost) + parseFloat(nbs.unit_maintenance_cost) / 
                            parseFloat(nbs.periodicity_maitenance) + parseFloat(nbs.unit_oportunity_cost)) * 10;
                if (nbs.country__global_multiplier_factor){
                    if (nbs.country == "USA")
                        min *= parseFloat(nbs.country__global_multiplier_factor);                        
                }
                if (nbs.default) {
                    if (!val) {
                        val = 0;
                    }
                    if ($('#nbssc-' + id).length <= 0) {
                        minInAnalysisCurrency = min;
                            if (currencies.length > 0){
                                let f = currencies.filter(c => c.currency == nbsCurrency);
                                if (f.length > 0){
                                    minInAnalysisCurrency = min / parseFloat(f[0].value);                                    
                                }
                            }
                            let lblMinValue = `${gettext("minimum_value")} : ${Math.ceil(minInAnalysisCurrency).toLocaleString(languageCode, { style: 'currency', currency: analysis_currency})}`;
                            content +=  `<tr><td>${nbs.name}</td>
                                        <td><div style="display:flex;width:100%;">
                                                <input class="text-number" style="width:60% !important;" type="number" id="nbssc-${id}" value=${val} ${disabled}>
                                                <div style="padding-top:5px;padding-left:5px;color:#d6cbcb;" id="min-val-nbs-${id}">${lblMinValue}</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <input class="hiddennbs" id="minimun-${id}" type="hidden" value=${min} data-min-val-currency=${minInAnalysisCurrency} data-nbs-currency=${nbsCurrency}>`;
                    }
                }
            });
            $("#full-table").find('tbody').empty().append(content);
            $('#smartwizard').smartWizard("next");
            //console.log("loadNBSActivities");
            autoAdjustHeightTabContent();
            toggleLoadingStep("hide");
            })
            .catch(error => {
                toggleLoadingStep("hide");
                console.error("Error fetching currencies:", error);
                showError('Error', 'Failed to fetch currency data: ' + error.message);
            });
    })
    .catch(error => {
        toggleLoadingStep("hide");
        console.error("Error loading NBS activities:", error);
        showError('Error', 'Failed to load NBS activities: ' + error.message);
    });
}

function serverVerification(id_study_case) {
    //console.log("serverVerification...")
    try{
        fetch(serverRiosApi + 'welcome/')
            .then(response => {                
                if (!response.status===200) {
                    throw new Error('Hubo un problema al hacer la solicitud: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                if (error instanceof TypeError && error.message.includes('NetworkError')) {
                    console.error('NetworkError detectado', error);
                } else {
                    console.error('Error al obtener los datos:', error);
                    msgError()
                }
            }
        );
        fetch(serverApi)
            .then(response => {
                console.log("models")
                //console.log(response)
                if (!response.status===200) {
                    throw new Error('Hubo un problema al hacer la solicitud: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                if (error instanceof TypeError && error.message.includes('NetworkError')) {
                    console.error('NetworkError detectado', error);
                } else {
                    console.error('Error al obtener los datos:', error);
                    msgError();
                }
            }
        );
        fetch('/study_cases/logsinfobyid/'+id_study_case)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hubo un problema al hacer la solicitud: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                data.forEach(e => {
                    if (e.status===false) {
                        msgError()
                    }
                })
            }).catch(error => {
                if (error instanceof TypeError && error.message.includes('NetworkError')) {
                    console.error('NetworkError detectado', error);
                }
            }
        );
    }catch(e){
        console.log(e)
    }        
}

$('#add_wi').click(function () {
    value = $("#select_custom option:selected").val();
    if (value) {
        $('#select_custom option:selected').remove();
        var action = "<td style='text-align:center;'><a class='btn btn-danger'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></a></td>";
        if (value != undefined) {
            var watershedSelected = JSON.parse(localStorage.getItem("watershedList")).filter(e => e.id == value);
            $.each(watershedSelected, function (index, watershed) {
                var name = `<td>${watershed.name}</td>`;
                var description = "<td>" + watershed.description + "</td>";
                var area = "<td class='text-right'>" + watershed.ws_area.toLocaleString(languageCode); + "</td>";
                var dem = "<td class='text-right'>" + watershed.demvalue + "</td>";
                var markup = `<tr id='custom-${watershed.id}'>${name} ${description} ${area} ${dem} ${action}</tr>`;
                $("#custom_table").find('tbody').append(markup);
                $('#add_wi').prop('disabled', true);
            });
        }else{
            var intakes = JSON.parse(localStorage.getItem("intakesByCity")).filter(e => e.id == value);
            $.each(intakes, function (index, intake) {
                var name = "<td>" + intake.name + "</td>";
                var description = "<td>" + intake.water_source_name + "</td>";
                var name = "<td>" + intake.water_source_name + "</td>";
                var area = "<td>" + transformArea(intake.polygon__area) + ' (Has)' + "</td>";
                var markup = "<tr id='custom-" + value + "'>" + name + description + name + area + action + "</tr>";
                $("#custom_table").find('tbody').append(markup);
            });
        }

        setTimeout(function(){
            //console.log("$('#add_wi').click ... timeout");
            autoAdjustHeightTabContent();
        }, 300);
        let intakeOrder = value.split("-");
        localStorage.setItem("watershedId", intakeOrder[0]);
    }
});

// ==== STORM DURATION FUNCTIONS ====

/**
 * Loads storm durations from API and updates the select element
 * Used in CREATE mode where data is fetched from API
 * @param {number} watershed_id - Watershed ID
 */
function loadStormDurations(watershed_id) {
    console.log('Loading storm durations for watershed:', watershed_id);

    // Todos los valores posibles de storm duration
    const allDurations = [3,4,5,6,8,10,12,18,24,48];

    fetch('/fastflood/storm-durations/' + watershed_id + '/')
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Storm durations loaded:', data);

            // Limpiar el select actual
            $('#storm_duration').empty();

            // Obtener los valores disponibles (filtrados)
            let availableDurations = [];
            if (data.storm_durations && Array.isArray(data.storm_durations)) {
                availableDurations = data.storm_durations;
            }

            // Agregar TODAS las opciones, marcando las no disponibles
            allDurations.forEach(function(duration) {
                const isAvailable = availableDurations.includes(duration);
                let label = duration.toString();

                if (!isAvailable) {
                    label = duration + ' (' + gettext('not_available') + ')';
                }

                const option = $('<option></option>')
                    .attr('value', duration)
                    .text(label);

                // Deshabilitar las opciones no disponibles
                if (!isAvailable) {
                    option.attr('disabled', true);
                }

                $('#storm_duration').append(option);
            });

            // Seleccionar el primer valor disponible
            if (availableDurations.length > 0) {
                $('#storm_duration').val(availableDurations[0]);
            }

            // Actualizar también el campo analysis_storm
            $('#analysis_storm').val($('#storm_duration :selected').val());

            // Mostrar/ocultar el ícono de información y construir el mensaje
            updateStormDurationInfoIcon(availableDurations, allDurations);

            console.log('Storm durations updated successfully. Source:', data.source);
            console.log('Available durations:', availableDurations);
        })
        .catch(error => {
            console.error('Error loading storm durations:', error);
            // En caso de error, mostrar todos como disponibles
            $('#storm_duration').empty();
            allDurations.forEach(function(duration) {
                $('#storm_duration').append(
                    $('<option></option>')
                        .attr('value', duration)
                        .text(duration)
                );
            });
            $('#analysis_storm').val($('#storm_duration :selected').val());
            $('#storm_duration_info').hide();
            console.log('Using all durations as available due to error');
        });
}

/**
 * Initializes storm duration info from existing select options
 * Used in EDIT/CLONE mode where data is already in the DOM from server
 */
function initializeStormDurationInfo() {
    // Todos los valores posibles de storm duration
    const allDurations = [3,4,5,6,8,10,12,18,24,48];

    // Obtener los valores disponibles del select (ya filtrados desde el servidor)
    let availableDurations = [];
    $('#storm_duration option').each(function() {
        let val = parseInt($(this).val());
        if (!isNaN(val)) {
            availableDurations.push(val);
        }
    });

    // Limpiar el select y agregar TODAS las opciones
    $('#storm_duration').empty();

    allDurations.forEach(function(duration) {
        const isAvailable = availableDurations.includes(duration);
        let label = duration.toString();

        if (!isAvailable) {
            label = duration + ' (' + gettext('not_available') + ')';
        }

        const option = $('<option></option>')
            .attr('value', duration)
            .text(label);

        // Deshabilitar las opciones no disponibles
        if (!isAvailable) {
            option.attr('disabled', true);
        }

        $('#storm_duration').append(option);
    });

    // Seleccionar el primer valor disponible o el valor actual del study case
    if (availableDurations.length > 0) {
        // Intentar mantener el valor seleccionado actual si está disponible
        let currentVal = parseInt($('#storm_duration').data('current-value'));
        if (!isNaN(currentVal) && availableDurations.includes(currentVal)) {
            $('#storm_duration').val(currentVal);
        } else {
            $('#storm_duration').val(availableDurations[0]);
        }
    }

    // Mostrar/ocultar el ícono de información
    updateStormDurationInfoIcon(availableDurations, allDurations);
}

/**
 * Updates the storm duration info icon visibility and tooltip
 * @param {Array<number>} availableDurations - Array of available duration values
 * @param {Array<number>} allDurations - Array of all possible duration values
 */
function updateStormDurationInfoIcon(availableDurations, allDurations) {
    if (availableDurations.length > 0 && availableDurations.length < allDurations.length) {
        // Hay filtrado, construir el mensaje dinámico
        let message = buildStormDurationMessage(availableDurations);
        $('#storm_duration_info').attr('title', message);
        $('#storm_duration_info').attr('data-original-title', message);
        $('#storm_duration_info').show();

        // Inicializar tooltip con ancho personalizado
        if (!$('#storm_duration_info').data('bs.tooltip')) {
            $('#storm_duration_info').tooltip({
                html: true,
                placement: 'top',
                template: '<div class="tooltip storm-duration-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
            });
        } else {
            // Actualizar tooltip existente
            $('#storm_duration_info').tooltip('dispose');
            $('#storm_duration_info').tooltip({
                html: true,
                placement: 'top',
                template: '<div class="tooltip storm-duration-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
            });
        }
    } else {
        // No hay filtrado, ocultar el ícono
        $('#storm_duration_info').hide();
        if ($('#storm_duration_info').data('bs.tooltip')) {
            $('#storm_duration_info').tooltip('dispose');
        }
    }
}

/**
 * Builds the storm duration filter message with dynamic values
 * @param {Array<number>} availableDurations - Array of available duration values
 * @returns {string} Formatted message with duration list
 */
function buildStormDurationMessage(availableDurations) {
    // Construir la lista de duraciones con formato "X h"
    let durationList = '';

    if (availableDurations.length === 0) {
        return '';
    } else if (availableDurations.length === 1) {
        durationList = availableDurations[0] + ' h';
    } else if (availableDurations.length === 2) {
        durationList = availableDurations[0] + ' h ' + gettext('and') + ' ' + availableDurations[1] + ' h';
    } else {
        // Para 3 o más valores: "VAL1 h, VAL2 h y VALN h"
        for (let i = 0; i < availableDurations.length; i++) {
            if (i === availableDurations.length - 1) {
                durationList += gettext('and') + ' ' + availableDurations[i] + ' h';
            } else {
                durationList += availableDurations[i] + ' h, ';
            }
        }
    }

    // Reemplazar los placeholders en el mensaje traducido
    let message = gettext('storm_duration_filter_message');
    message = message.replace('{durations}', durationList);

    return message;
}

$("#ff_flood_parameters").click(function () {
    if ($(this).is(":checked")) 
        {
            $("#ff_flood_parameters").val("1");
            $('#width_mul').prop('disabled', false);
            $('#width_exp').prop('disabled', false);
            $('#depth_mul').prop('disabled', false);
            $('#depth_exp').prop('disabled', false);
            $('#min_cross').prop('disabled', false);
            $('#channel_mannings').prop('disabled', false);
        } else {
            $("#ff_flood_parameters").val("0");
            $('#width_mul').prop('disabled', true);
            $('#width_mul').val('3.16');
            $('#width_exp').prop('disabled', true);
            $('#width_exp').val('0.32');
            $('#depth_mul').prop('disabled', true);
            $('#depth_mul').val('4.1');
            $('#depth_exp').prop('disabled', true);
            $('#depth_exp').val('0.21');
            $('#min_cross').prop('disabled', true);
            $('#min_cross').val('0.5');
            $('#channel_mannings').prop('disabled', true);
            $('#channel_mannings').val('0.03');
        }
});

$("#ff_flood").click(function () {
    if ($(this).is(":checked")) {
        $('#ocean_elevation').prop('disabled', false);
    } else {
        $('#ocean_elevation').prop('disabled', true);
        $('#ocean_elevation').val('0');
    }
})

$('#step2PreviousBtn').click(function () {
    $('#smartwizard').smartWizard("prev");
});

$('#step3PreviousBtn').click(function () {
    $('#smartwizard').smartWizard("prev");
});

$('#step4PreviousBtn').click(function () {
    $('#smartwizard').smartWizard("prev");
});

$('#step5PreviousBtn').click(function () {
    $('#smartwizard').smartWizard("prev");
});

$('#step6PreviousBtn').click(function () {
    $('#smartwizard').smartWizard("prev");
});

$('#step7PreviousBtn').click(function () {
    $("#full-table").find('tbody').empty();
    $('#smartwizard').smartWizard("prev");
});

$('#custom').click(function () {
    toggleLoadingStep("show");
    loadWatersheds(watershedId);
    $("#panel-custom").removeClass("panel-hide");            
    $("#panel-cost").removeClass("panel-hide");
    autoAdjustHeightTabContent();            
    $('#custom-required').text("*");        
});