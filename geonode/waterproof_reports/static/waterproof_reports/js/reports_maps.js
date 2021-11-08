/*********
 *  Maps in  Leaflet for WaterProof Reports
 * 
 * *******/

$(document).ready(function () {
  var urlDetail = "../../reports/getSelectorStudyCasesId/?studyCase=" + studyCaseId;
  var selectIntake = document.getElementById("idSelectStudyCase");
  $.getJSON(urlDetail, function (data) {
    var option = document.createElement("option");
    option.text = gettext("Select an Intake");
    option.value = -1;
    selectIntake.add(option);
    console.log(selectIntake)
      $.each( data, function( key, value ) {
          var option = document.createElement("option");
          option.text = value.selector;
          option.value = value.intakeId;
          option.setAttribute("data-intake-geom", value.center);
          selectIntake.add(option);
      });
  });
  
  document.getElementById("idSelectStudyCase").onchange = function() {
    console.log(this.value);
    if (this.value != -1) {
      let g = JSON.parse(this.selectedOptions[0].getAttribute("data-intake-geom")).coordinates;
      let centroid =g[1] + "," + g[0];
      location.href = `/reports/geographic/?folder=${baseData}&intake=${this.value}&region=${region}&year=${year}&study_case_id=${studyCaseId}&center=${centroid}`;
    }
  }

  rasterStatisticsApi();
    
  let zoom = 9;
  var mapLeft = L.map('map-left').setView(center, zoom);
  var mapRight = L.map('map-right').setView(center, zoom);
  var map = L.map('map-down').setView(center, zoom);
  var mapResults = L.map('map-results').setView(center, zoom);
  mapAreasRios = L.map('map-areas-rios').setView(center, zoom);

  let urlOmsLyr = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png';
  let omsAttributions = 'Map tiles by <a href="https://osm.org">OSM<\/a>, ' +
                        '<a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0<\/a> &mdash; ' +
                        'Map data {attribution.OpenStreetMap}'
  L.tileLayer(urlOmsLyr, {
    attribution: omsAttributions,
  }).addTo(mapLeft);

  L.tileLayer(urlOmsLyr, {
    attribution: omsAttributions,
    minZoom: 1,
    maxZoom: 16
  }).addTo(mapRight);

  L.tileLayer(urlOmsLyr, {
    attribution:  omsAttributions,
    minZoom: 1,
    maxZoom: 16
  }).addTo(map);

  L.tileLayer(urlOmsLyr, {
    attribution:  omsAttributions,
    minZoom: 1,
    maxZoom: 16
  }).addTo(mapResults);

  L.tileLayer(urlOmsLyr, {
    attribution:  omsAttributions,
    minZoom: 1,
    maxZoom: 16
  }).addTo(mapAreasRios);

  let lyrNameYear0 = 'LULC_YEAR_0';
  let lyrNameLastYear = 'LULC_LAST_YEAR';
  let lyrNameYearFuture = 'LULC_FUTURE';

  let lyrNameAWY = 'Annual_Water_Yield';
  let lyrNameSWY = 'Seasonal_Water_Yield';
  let lyrNameSDR = 'Sediment_Delivery_Ratio';
  let lyrNameNDRN = 'NDR_Nitrogen';
  let lyrNameNDRP = 'NDR_Phosphorus';
  let lyrNameCarbon = 'Carbon_storage_and_sequestration';
  let lyrNameAreasRios = 'NbS_portfolio';
  let lyrNameCatchment = 'Catchment';
  let lyrsModelsResult = [lyrNameAWY, lyrNameSWY, lyrNameSDR, lyrNameNDRN, lyrNameNDRP, lyrNameCarbon];

  let lyrsLabels = {
    LULC_YEAR_0 : 'LULC Current Scenario',
    LULC_LAST_YEAR : 'LULC NbS Scenario',
    LULC_FUTURE : 'LULC BaU Scenario',
    Catchment : 'Catchment',
    NbS_portfolio : 'NbS Portfolio',
  }

  let attribution = "Waterproof data © 2021 TNC";

  let lyrsNames = [lyrNameLastYear];
  var overlaysLeft = {};
  lyrsNames.forEach(function (lyrName) {
    overlaysLeft[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrsWMS, lyrName).addTo(mapLeft);
  });

  var overlaysRight = {};
  lyrsNames = [lyrNameYearFuture];
  lyrsNames.forEach(function (lyrName) {
    overlaysRight[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrsWMS, lyrName).addTo(mapRight);
    createLegend(urlWaterProofLyrsWMS, lyrName, "#img-legend-left");
  });

  var overlays = {};
  lyrsNames = [lyrNameYear0];
  lyrsNames.forEach(function (lyrName) {
    overlays[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrsWMS, lyrName).addTo(map);    
  });

  var overlaysResults = {};
  lyrsModelsResult.forEach(function (lyrName) {
    overlaysResults[lyrName] = createWMSLyr(urlWaterProofLyrsWMS, lyrName).addTo(mapResults);
  });

  lyrsNames = [lyrNameCatchment];
  lyrsNames.forEach(function (lyrName) {
    overlaysResults[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrsWMS, lyrName).addTo(mapResults);
  });

  var overlaysAreasRios = {};
  lyrsNames = [lyrNameAreasRios];
  lyrsNames.forEach(function (lyrName) {
    overlaysAreasRios[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrAreasRiosMS, lyrName).addTo(mapAreasRios);
  });
  createLegend(urlWaterProofLyrAreasRiosMS, lyrNameAreasRios, "#img-legend-areas-rios");
  
  lyrsNames = [lyrNameCatchment];
  lyrsNames.forEach(function (lyrName) {
    overlaysAreasRios[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrsWMS, lyrName).addTo(mapAreasRios);
  });
  
  L.control.layers({}, overlaysLeft,{collapsed:false}).addTo(mapLeft,);
  L.control.layers({}, overlaysRight,{collapsed:false}).addTo(mapRight);
  L.control.layers({}, overlays,{collapsed:false}).addTo(map);
  let ctrlLyrsMapResult = L.control.layers({}, overlaysResults,{collapsed:false}).addTo(mapResults);
  L.control.layers({}, overlaysAreasRios,{collapsed:false}).addTo(mapAreasRios);

  var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapLeft);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapRight);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(map);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapResults);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapAreasRios);

  mapLeft.sync(mapRight);
  mapRight.sync(mapLeft);
  mapLeft.sync(map);
  mapRight.sync(map);
  map.sync(mapRight);
  map.sync(mapLeft);
  
  $("#menu2")[0].append($("#map-analysis-result")[0]);
  $("#menu3")[0].append($("#map-areas-rios-container")[0]);
  $('#first_tab').trigger('click');

  // Show all layers hidden by default, only Catchment are visible
  let htmlControl = ctrlLyrsMapResult.getContainer();  
  let lyrs = htmlControl.getElementsByClassName("leaflet-control-layers-selector");
  lyrs.forEach(function (lyr) {
    let lbl = lyr.labels[0]
    if (lbl != null) {
      let txt = lbl.getElementsByTagName("span")[0].innerText.trim();
      if (txt  != lyrNameCatchment) {
        lyr.click();
      }
    }
  });
    
  function createWMSLyr(urlWMS, lyrName) {
    let params = {
      layers: lyrName,
      format: 'image/png',
      transparent: true,
      attribution: attribution,
      opacity: 0.7
    }
    return L.tileLayer.wms(urlWMS, params);
  }
   
  function createLegend(urlWMS ,lyrName, elId) {
    let legendParams = `&request=getlegendgraphic&layer=${lyrName}&format=image%2Fpng&SLD_VERSION=1.1.0&VERSION=1.3.0`;
    const fetchAsBlob = url => fetch(url)
    .then(response => response.blob());

    const convertBlobToBase64 = blob => new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
          resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

    fetchAsBlob(urlWMS + legendParams)
      .then(convertBlobToBase64)
      .then(base64Data => {
        $(elId).attr('src', base64Data);
      })    
  }

  async function rasterStatisticsApi () {
    // TODO - change serverApi URL to use the new API
    let serverApi =  location.protocol + '//' + location.hostname + '/wf-models/';
    //let serverApi = '/proxy/?url=https://dev.skaphe.com/wf-models/';
    let amp = "&";
    if (serverApi.indexOf("proxy") >=0){
      amp = "%26";
    }
    let url = serverApi + `raster_statistics?usr_folder=${baseData}${amp}intake_id=${intake}${amp}region=${region}${amp}year=${year}`;
    
    $.ajax({
      url: url,
      success: function(result) {
          rasterResultStatistics = result;
      }
    });
  }

  $(".leaflet-control-layers-selector").on('click', function(e){    
    var t = e.currentTarget; 
    var p = t.parentElement;
    let lyrName = p.children[1].innerText.trim();
    let min = '0,0';
    let max = '1,0';
    if (lyrsModelsResult.includes(lyrName)) {
      if (t.checked) {
        let lyrs = [lyrNameAWY, lyrNameCarbon, lyrNameSWY, lyrNameNDRN, lyrNameNDRP, lyrNameSDR];
        let keys = ['awy','carbon', 'swy','ndr_n', 'ndr_p', 'sdr']
        let k = keys[lyrs.indexOf(lyrName)];
        min = Math.round(rasterResultStatistics[k][0].min).toFixed(1).replace(".",",");
        max = Math.round(rasterResultStatistics[k][0].max).toFixed(1).replace(".",",");
        
        if (p.childElementCount == 2) {
          let lgndHtml =  `<div>
                            <div><img src="/static/lib/img/legend-gray-h.png" style="margin-left: 15px;"></div> 
                            <div> <span style="margin-left: 15px;">${min}</span> 
                                <span style="margin-left: 100px;">${max}</span></div>  
                          </div>
                          `;
          var node = document.createElement("div");
          node.innerHTML = lgndHtml;
          p.append(node);
        }
      }  
    }    
  });
});