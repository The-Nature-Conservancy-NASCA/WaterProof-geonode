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
      $.each( data, function( key, value ) {
          var option = document.createElement("option");
          option.text = value.selector;
          option.value = value.intakeId;
          option.setAttribute("data-intake-geom", value.center);
          selectIntake.add(option);
      });
  });
  
  document.getElementById("idSelectStudyCase").onchange = function() {
    if (this.value != -1) {
      let g = JSON.parse(this.selectedOptions[0].getAttribute("data-intake-geom")).coordinates;
      let centroid =g[1] + "," + g[0];
      location.href = `/reports/geographic/?folder=${baseData}&intake=${this.value}&region=${region}&year=${year}&study_case_id=${studyCaseId}&center=${centroid}`;
    }
  }
    
  let zoom = 9;
  var mapLeft = L.map('map-left').setView(center, zoom);
  var mapRight = L.map('map-right').setView(center, zoom);
  var map = L.map('map-down').setView(center, zoom);
  var mapResults = L.map('map-results').setView(center, zoom);
  var mapAreasRios = L.map('map-areas-rios').setView(center, zoom);

  let urlTopoLyr = 'https://opentopomap.org/{z}/{x}/{y}.png';
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

  let lyrNameYear0 = `LULC_YEAR_0`;
  let lyrNameLastYear = `LULC_LAST_YEAR`;
  let lyrNameYearFuture = `LULC_FUTURE`;

  let lyrNameAWY = `Annual_Water_Yield`;
  let lyrNameSWY = `Seasonal_Water_Yield`;
  let lyrNameSDR = `Sediment_Delivery_Ratio`;
  let lyrNameNDRN = `NDR_Nitrogen`;
  let lyrNameNDRP = `NDR_Phosphorus`;
  let lyrNameCarbon = `Carbon_storage_and_sequestration`;
  let lyrNameAreasRios = 'Areas_Rios';
  let lyrNameCatchment = 'catchment';

  let lyrsModelsResult = [lyrNameAWY, lyrNameSWY, lyrNameSDR, lyrNameNDRN, lyrNameNDRP, lyrNameCarbon];

  let attribution = "Waterproof data © 2021 TNC"

  let lyrsNames = [lyrNameLastYear];
  var overlaysLeft = {};
  lyrsNames.forEach(function (lyrName) {
    overlaysLeft[lyrName] = createWMSLyr(lyrName).addTo(mapLeft);
  });

  var overlaysRight = {};
  lyrsNames = [lyrNameYearFuture];
  lyrsNames.forEach(function (lyrName) {
    overlaysRight[lyrName] = createWMSLyr(lyrName).addTo(mapRight);
    createLegend(lyrName, "#img-legend-left");
  });

  var overlays = {};
  lyrsNames = [lyrNameYear0];
  lyrsNames.forEach(function (lyrName) {
    overlays[lyrName] = createWMSLyr(lyrName).addTo(map);    
  });

  var overlaysResults = {};
  lyrsModelsResult.forEach(function (lyrName) {
    overlaysResults[lyrName] = createWMSLyr(lyrName).addTo(mapResults);
  });

  var overlaysAreasRios = {};
  lyrsNames = [lyrNameAreasRios,lyrNameCatchment];
  lyrsNames.forEach(function (lyrName) {
    overlaysAreasRios[lyrName] = createWMSLyr(lyrName).addTo(mapAreasRios);
  });
  createLegend(lyrNameAreasRios, "#img-legend-areas-rios");

  L.control.layers({}, overlaysLeft,{collapsed:false}).addTo(mapLeft,);
  L.control.layers({}, overlaysRight,{collapsed:false}).addTo(mapRight);
  L.control.layers({}, overlays,{collapsed:false}).addTo(map);
  L.control.layers({}, overlaysResults,{collapsed:false}).addTo(mapResults);
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


  // $(".leaflet-control-layers-selector").on('click', function(e){
  //   var t = e.currentTarget; 
  //   var p = t.parentElement; 
  //   l = p.children[p.childElementCount-1]; 
  //   l.style.display= (t.checked ? 'block': 'none');    
  // });


  function createWMSLyr(lyrName) {
    let params = {
      layers: lyrName,
      format: 'image/png',
      transparent: true,
      attribution: attribution
    }
    return L.tileLayer.wms(urlWaterProofLyrsWMS, params);
  }
 
  
  function createLegend(lyrName, elId) {
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

    fetchAsBlob(urlWaterProofLyrsWMS + legendParams)
      .then(convertBlobToBase64)
      .then(base64Data => {
        $(elId).attr('src', base64Data);
        //$('#img-legend-right').attr('src', base64Data);
        //$('#img-legend-down').attr('src', base64Data);
        //$('#legend-row').show();
      })
    
  }
});