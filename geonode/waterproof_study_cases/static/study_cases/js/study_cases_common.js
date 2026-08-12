const delimitationFileEnum = {
  GEOJSON: 'geojson',
  SHP: 'shapefile'
}

const interpolationType = {
  LINEAR: 'LINEAR',
  POTENTIAL: 'POTENTIAL',
  EXPONENTIAL: 'EXPONENTIAL',
  LOGISTICS: 'LOGISTICS'
}

const defaultStepBioparams = "0.1";
const defaultMinValBioparams = parseFloat(defaultStepBioparams);
const bioparamValidations = {
  "lucode": {"min": 0, "step": 1},
  "root_depth": {"min": 0},
  "load_n": {"min": 0},
  "load_p": {"min": 0},
  "crit_len_n": {"min": 0},
  "crit_len_p": {"min": 0},
  "c_above": {"min": 0},
  "c_below": {"min": 0},
  "c_soil": {"min": 0},
  "c_dead": {"min": 0},
  "rough_rank": {"min": 0},
  "usle_c": {"max": 1, "min": defaultMinValBioparams},
  "usle_p": {"max": 1, "min": defaultMinValBioparams},
  "eff_n": {"max": 1, "min": defaultMinValBioparams},
  "eff_p": {"max": 1, "min": defaultMinValBioparams},
  "proportion_subsurface_n": {"max": 1, "min": defaultMinValBioparams},
  "cn_a": {"max": 100, "min": defaultMinValBioparams},
  "cn_b": {"max": 100, "min": defaultMinValBioparams},
  "cn_c": {"max": 100, "min": defaultMinValBioparams},
  "cn_d": {"max": 100, "min": defaultMinValBioparams},
  "kc_1": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_2": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_3": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_4": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_5": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_6": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_7": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_8": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_9": {"max": 1.5, "min": defaultMinValBioparams}, 
  "kc_10": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_11": {"max": 1.5, "min": defaultMinValBioparams},
  "kc_12": {"max": 1.5, "min": defaultMinValBioparams},
  "sed_exp": {"max": 1, "min": defaultMinValBioparams},
  "sed_ret": {"max": 1, "min": defaultMinValBioparams},
  "cover_rank": {"max": 1, "min": defaultMinValBioparams},
  "p_ret": {"max": 1, "min": defaultMinValBioparams}, 
  "n_ret": {"max": 1, "min": defaultMinValBioparams},
  "native_veg": {"max": 1, "min": 0, "step": 1},
  "lulc_veg": {"max": 1, "min": 0, "step": 1},
};

const costVars = ['Q', 'CSed', 'CN', 'CP', 'WSed', 'WN', 'WP', 'WSedRet', 'WNRet', 'WPRet'];

/**
 * Get CSRF token from cookies
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value
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
 * Array iteration helper ($.each replacement)
 * @param {Array} array - Array to iterate
 * @param {Function} callback - Callback function
 */
function each(array, callback) {
    if (!array || !Array.isArray(array)) return;
    for (let i = 0; i < array.length; i++) {
        callback(i, array[i]);
    }
}

/**
 * Fetch API wrapper with CSRF token injection
 * @param {Object} config - Request configuration
 * @returns {Promise} Fetch promise
 */
function ajaxRequest(config) {
    const method = config.type || config.method || 'GET';
    const headers = config.headers || {};

    if (method !== 'GET') {
        headers['X-CSRFToken'] = getCookie('csrftoken');
    }

    const fetchConfig = {
        method: method,
        headers: headers,
        credentials: 'same-origin'
    };

    if (config.data && method !== 'GET') {
        if (typeof config.data === 'string') {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
            fetchConfig.body = config.data;
        } else {
            headers['Content-Type'] = 'application/json';
            fetchConfig.body = JSON.stringify(config.data);
        }
    }

    return fetch(config.url, fetchConfig)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (config.dataType === 'json') {
                return response.json();
            }
            return response.text();
        });
}

/**
 * GET request helper
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @returns {Promise} Request promise
 */
function getData(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return ajaxRequest({ url: fullUrl, type: 'GET', dataType: 'json' });
}

/**
 * Create progress table UI in processing modal
 * Table is initially collapsed with collapsible panel
 */
function createProgressTable() {
    // Remove existing table if any
    $("#progress-table-container").remove();

    const tableHtml = `
        <div id="progress-table-container" style="margin-top: 20px;">
            <div class="panel panel-default">
                <div class="panel-heading" style="cursor: pointer;" id="progress-table-header">
                    <h5 class="panel-title mb-0" style="display: inline-block;">
                        <i class="fa fa-chevron-right" id="progress-collapse-icon"></i>
                        ${gettext('progress_table_title')}
                    </h5>
                    <small class="text-muted">(${gettext('click_to_expand')})</small>
                </div>
                <div id="progress-table-collapse" style="display: none;">
                    <div class="panel-body">
                        <table class="table table-sm table-bordered" id="progress-log-table">
                            <thead>
                                <tr>
                                    <th>${gettext('step_column')}</th>
                                    <th>${gettext('description_column')}</th>
                                    <th>${gettext('status_column')}</th>
                                </tr>
                            </thead>
                            <tbody id="progress-log-tbody">
                                <tr><td colspan="3" class="text-center">${gettext('loading_info')}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    $("#_thumbnail_processing .modal-body").append(tableHtml);

    // Add click handler for collapse/expand
    $('#progress-table-header').on('click', function () {
        const $collapse = $('#progress-table-collapse');
        const $icon = $('#progress-collapse-icon');

        if ($collapse.is(':visible')) {
            $collapse.slideUp(300);
            $icon.removeClass('fa-chevron-down').addClass('fa-chevron-right');
        } else {
            $collapse.slideDown(300);
            $icon.removeClass('fa-chevron-right').addClass('fa-chevron-down');
        }
    });
}

/**
 * Update progress table with latest logs
 * @param {number} studyCaseId - Study case ID
 */
function updateProgressTable(studyCaseId) {
    // Use getData if available, otherwise use $.get as fallback
    const fetchLogs = typeof getData === 'function'
        ? getData(`/study_cases/logsinfobyid/${studyCaseId}/`)
        : $.get(`/study_cases/logsinfobyid/${studyCaseId}/`);

    fetchLogs
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
                    const descriptionText = log.description || 'no_description';
                    const description = gettext(descriptionText);

                    const stepId = log.step_id !== null && log.step_id !== undefined ? log.step_id : '-';

                    const row = `<tr class="${statusClass}">
                        <td class="text-center">${stepId}</td>
                        <td>${description}</td>
                        <td>${statusIcon}</td>
                    </tr>`;

                    tbody.append(row);
                });
            }
        })
        .catch(error => {
            console.error("Error updating progress table:", error);
        });
}

var flagFunctionCost = false;
var btnValidatePyExp = document.getElementById('btnValidatePyExp');
var output = document.getElementById('MathPreview');   
var selectedCostId = 0;

$("#ModalAddCostBtn").click(function () {
  flagFunctionCost = true;
  $('#costFunctionName').val('');
  $('#costFuntionDescription').val('');
  let currencyCode = localStorage.getItem('currencyCode') == null ? 'USD' : localStorage.getItem('currencyCode');
  if (currencyCode == 'USD') {
      $("#currencyCost option").filter((i,l) => ( l.getAttribute('data-country') == 'USA'))[0].selected = true;
  }
  let currency = localStorage.getItem('currency') == null ? '233' : localStorage.getItem('currency');
  $('#currencyCost').val(currency);
  $('#global_multiplier_factorCalculator').val(localStorage.getItem('factor') == null ? '0.38' : localStorage.getItem('factor'));
  $('#python-expression').val('');
  setVarCost();
});

$('#python-expression').on('keypress', function (evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  let symbols = [32,40,41,42,43,44,45,46,47,60,61,62,91,92,93,101,123,125];
  if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return (symbols.indexOf(charCode) >= 0);

  return true;
})

$('#python-expression').on('keydown', function (evt) {
  if (evt.key == 'Backspace' || evt.key == 'Delete'){
      setTimeout(() => {
          let el = document.getElementById("python-expression");
          let text = el.value;
          if (text.trim() == "") {
              $(".title-panel-vars").each((i,pl) => {
                  $("#" + pl.id).show();                
              });
          }
      } , 200);
  }
})

$('#btnValidatePyExp').click(function () {
  validatePyExpression();
});

//Set var into calculator
$(document).on('click', '.list-group-item', function () {
  var el = document.getElementById("python-expression");
  if (el.value.trim() == "") {
      let titlePanelSelected = $(this).parents()[1].id;
      elemSysId = titlePanelSelected.split("-")[3];
      intakeElSysName = $(this).parents()[1].getElementsByTagName("label")[0].innerHTML;
      $(".title-panel-vars").each((i,pl) => {
          if (pl.id != titlePanelSelected) {
              $("#" + pl.id).hide();
          }
      });
  }
  typeInTextarea($(this).attr('value'), el);
});

function typeInTextarea(newText, el) {
  if (newText == undefined) return;
  
  const [start, end] = [el.selectionStart, el.selectionEnd];
  el.setRangeText(newText, start, end, 'select');
  el.focus();
  document.getSelection().removeAllRanges();
  el.selectionStart = start + newText.length;
  el.selectionEnd = el.selectionStart;
}

//KeyBoard calculator funcion cost
$('button[name=mathKeyBoard]').click(function () {
  var el = document.getElementById("python-expression");
  typeInTextarea($(this).attr('value'), el);
});

async function validatePyExpression() {
  let pyExp = $('#python-expression').val().trim();
  if (pyExp.length > 0) {
      pyExpEncode = encodeURIComponent(pyExp);
      localApi = location.protocol + "//" + location.host;
      let url = localApi + "/intake/validatePyExpression?expression=" + pyExpEncode;
      let response = await fetch(url);
      let result = await response.json();
      if (result) {
          is_valid = result.valid;
          latex = result.latex
          console.log(result.latex);
          typesetInput(result.latex);
          $("#python-expression").removeClass("invalid_expression");
          $("#python-expression").addClass("valid_expression");
          if (!is_valid) {
              $("#python-expression").addClass("invalid_expression");
              $("#python-expression").removeClass("valid_expression");
          }
      }
  }
}

function typesetInput(expression) {
  btnValidatePyExp.disabled = true;
  output.innerHTML = expression;
  MathJax.texReset();
  MathJax.typesetClear();
  MathJax.typesetPromise([output]).catch(function (err) {
      output.innerHTML = '';
      output.appendChild(document.createTextNode(err.message));
      console.error(err);
  }).then(function () {
      btnValidatePyExp.disabled = false;
  });
}

function loadIntakes() {
  $("#select_custom").empty();
  const option =$('<option></option>').attr('disabled', 'disabled').attr('selected', 'selected').attr('value', 'valor').text(gettext('select_option'));  
  $("#select_custom").append(option)
  if (localStorage.getItem("intakesByCity") == null) {
    $.get("/study_cases/intakebycity/" + localStorage.cityId, function (data) {
        if (data.length > 0) {
          localStorage.setItem("intakesByCity", JSON.stringify(data));
            $.each(data, function (index, intake) {
                $("#select_custom").append(new Option(intake.name, intake.id));
            });
            $("#div-customcase").removeClass("panel-hide");
            $('#autoAdjustHeightF').css("height", "auto");
        } else {
            $("#div-emptyintakes").removeClass("panel-hide");
        }
    });
  }else{
    var data = JSON.parse(localStorage.getItem("intakesByCity"));
    $.each(data, function (index, intake) {
      $("#select_custom").append(new Option(intake.name, intake.id));
    });
    $("#div-customcase").removeClass("panel-hide");
    $('#autoAdjustHeightF').css("height", "auto");
  }
}

function loadCsInfra() {
  $("#select_custom").empty();
  if (localStorage.getItem("csinfraByCity") == null) {    
    $.get("/study_cases/csinfrabycity/" + localStorage.cityId, function (data) {
        if (data.length > 0) {
            localStorage.setItem("csinfraByCity", JSON.stringify(data));
            $.each(data, function (index, intake) {                
                $("#select_custom").append(new Option(intake.name_intake_csinfra, intake.id + "-" + intake.element_system_id + "-" + intake.graphId));
            });
            $("#div-customcase").removeClass("panel-hide");
            $('#autoAdjustHeightF').css("height", "auto");
        } else {
            $("#div-emptyintakes").removeClass("panel-hide");
        }
    });
  }else{
    var data = JSON.parse(localStorage.getItem("csinfraByCity"));
    $.each(data, function (index, intake) {                
      $("#select_custom").append(new Option(intake.name_intake_csinfra, intake.id + "-" + intake.element_system_id + "-" + intake.graphId));
    });
    $("#div-customcase").removeClass("panel-hide");
    $('#autoAdjustHeightF').css("height", "auto");
  }  
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
  total_personnel.val(total)
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
function autoAdjustHeight() {
    setTimeout(function () {
        $('#autoAdjustHeightF').css("height", "auto");
    }, 500);
}

$(document).on('click', 'a[name=fun_display_btn]', function () {
  var idx = $(this).attr('idvalue');
  $(`#fun_display_${idx}`).toggle();
});

function createUUID(){
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

function locationHref(){
    setTimeout(function() {
        if (localStorage.getItem('returnTo') != null) {
            window.location.href = "/study_cases/" + localStorage.getItem('returnTo');
        }else{
            location.href = `/study_cases/?city=${localStorage.cityId}`;
        }
    }, 1500); // Wait 1 second before redirect
}

// ==================== Name Validation Functions ====================

/**
 * Validate if study case name already exists for current user
 * @param {string} name - Study case name to validate
 * @param {number|null} excludeId - ID to exclude from search (for edit/clone)
 * @returns {Promise<{exists: boolean, message: string}>}
 */
async function validateStudyCaseName(name, excludeId = null) {
    if (!name || name.trim().length < 2) {
        return { exists: false, message: '' };
    }

    try {
        const params = { name: name.trim() };
        if (excludeId) {
            params.exclude_id = excludeId;
        }

        const data = await getData('/study_cases/check-name/', params);
        return data;
    } catch (error) {
        console.error('Error validating study case name:', error);
        return { exists: false, message: '' };
    }
}

/**
 * Show or hide the name exists indicator
 * @param {boolean} exists - Whether the name exists
 */
function showNameExistsIndicator(exists) {
    const indicator = $('#name-exists-indicator');

    if (exists) {
        // Show warning message (text is already localized in template)
        indicator.slideDown(300);
        autoAdjustHeight();
    } else {
        // Hide indicator
        indicator.slideUp(300);
    }
}

/**
 * Enable or disable save/run buttons based on validation
 * @param {boolean} disable - Whether to disable buttons
 */
function toggleSaveButtons(disable) {
    const saveButtons = $('#step7EndBtn, #step7RunBtn');

    if (disable) {
        saveButtons.prop('disabled', true).addClass('disabled');
    } else {
        saveButtons.prop('disabled', false).removeClass('disabled');
    }
}

// Debounce timer
let nameValidationTimeout = null;

/**
 * Setup name validation with debounce
 * Call this function on document ready to initialize validation
 * @param {number|null} excludeId - ID to exclude (for edit/clone scenarios)
 */
function setupNameValidation(excludeId = null) {
    const nameInput = $('#name');

    if (nameInput.length === 0) {
        return; // Name input not found in this page
    }

    nameInput.on('input', function() {
        const name = $(this).val().trim();

        // Clear previous timeout
        if (nameValidationTimeout) {
            clearTimeout(nameValidationTimeout);
        }

        // If name is empty or too short, hide indicator and enable buttons
        if (name.length < 2) {
            showNameExistsIndicator(false);
            toggleSaveButtons(false);
            return;
        }

        // Show checking message (optional)
        // showNameExistsIndicator(true, gettext('checking_name'));

        // Debounce validation (500ms)
        nameValidationTimeout = setTimeout(async function() {
            const result = await validateStudyCaseName(name, excludeId);

            // Update indicator visibility
            showNameExistsIndicator(result.exists);

            // Disable/enable save buttons
            toggleSaveButtons(result.exists);
        }, 500);
    });

    // Also validate on blur for immediate feedback
    nameInput.on('blur', async function() {
        const name = $(this).val().trim();

        if (name.length >= 2) {
            const result = await validateStudyCaseName(name, excludeId);
            showNameExistsIndicator(result.exists);
            toggleSaveButtons(result.exists);
        }
    });
}

function transformArea(area) {    
    return (area / 10000).toFixed(2); 
  }