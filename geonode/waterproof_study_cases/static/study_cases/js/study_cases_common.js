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
  $.get("/study_cases/intakebycity/" + localStorage.cityId, function (data) {
      if (data.length > 0) {
          $.each(data, function (index, intake) {
              var name = intake.name;
              $("#select_custom").append(new Option(name, intake.id));
          });
          $("#div-customcase").removeClass("panel-hide");
          $('#autoAdjustHeightF').css("height", "auto");
      } else {
          $("#div-emptyintakes").removeClass("panel-hide");
      }
  });
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