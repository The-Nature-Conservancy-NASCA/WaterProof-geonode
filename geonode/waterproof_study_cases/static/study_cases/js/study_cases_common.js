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

const defaultStepBioparams = "0.000001";
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
  $('#autoAdjustHeightF').css("height", "auto");
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