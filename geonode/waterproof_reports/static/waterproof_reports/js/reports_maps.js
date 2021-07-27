$(document).ready(function () {
  let center = [4.6, -75.5];
  var mapLeft = L.map('map-left').setView(center, 11);
  var mapRight = L.map('map-right').setView(center, 11);
  var map = L.map('map').setView(center, 11);

  let urlTopoLyr = 'https://opentopomap.org/{z}/{x}/{y}.png';
  let urlOmsLyr = 'https:/{s}.tile.osm.org/{z}/{x}/{y}.png';
  var topomapLyrLeft = L.tileLayer(urlOmsLyr, {
    attribution:
      'Map tiles by <a href="https://osm.org">OSM<\/a>, ' +
      '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0<\/a> &mdash; ' +
      'Map data {attribution.OpenStreetMap}',
  }).addTo(mapLeft);

  var topomapLyrRight = L.tileLayer(urlOmsLyr, {
    attribution:
      'Map tiles by <a href="https://osm.org">OSM<\/a>, ' +
      '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0<\/a> &mdash; ' +
      'Map data {attribution.OpenStreetMap}',
    minZoom: 1,
    maxZoom: 16
  }).addTo(mapRight);

  var tileLyr = L.tileLayer(urlOmsLyr, {
    attribution:
      'Map tiles by <a href="https://osm.org">OSM<\/a>, ' +
      '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0<\/a> &mdash; ' +
      'Map data {attribution.OpenStreetMap}',
    minZoom: 1,
    maxZoom: 16
  }).addTo(map);

  //let urlWaterProofLyrsWMS = 'http://localhost:81/?map=/etc/mapserver/1000_142_2021-6-25.map&SERVICE=WMS';
  let lyrNameYear0 = `WI_${intake}_LULC_SA_1_YEAR_0`;
  let lyrNameLastYear = `WI_${intake}_LULC_LAST_YEAR`;
  let lyrNameYearFuture = `WI_${intake}_LULC_SA_1_FUTURE`;

  let lyrNameAWY = `WI_${intake}_Annual_Water_Yield`;
  let lyrNameSWY = `WI_${intake}_Seasonal_Water_Yield`;
  let lyrNameSDR = `WI_${intake}_Sediment_Delivery_Ratio`;
  let lyrNameNDRN = `WI_${intake}_NDR_Nitrogen`;
  let lyrNameNDRP = `WI_${intake}_NDR_Phosphorus`;
  let lyrNameCarbon = `WI_${intake}_Carbon_storage_and_sequestration`;

  let lyrsModelsResult = [lyrNameAWY, lyrNameSWY, lyrNameSDR, lyrNameNDRN, lyrNameNDRP, lyrNameCarbon];

  let attribution = "Waterproof data © 2021 TNC"

  let lyrsNames = [lyrNameYear0, lyrNameLastYear, lyrNameYearFuture];
  var overlaysLeft = {};
  lyrsNames.forEach(function (lyrName) {
    overlaysLeft[lyrName] = createWMSLyr(lyrName).addTo(mapLeft);
  });

  var overlaysRight = {};
  lyrsNames.forEach(function (lyrName) {
    overlaysRight[lyrName] = createWMSLyr(lyrName).addTo(mapRight);
    createLegend(lyrName);
  });

  var overlays = {};
  lyrsModelsResult.forEach(function (lyrName) {
    overlays[lyrName] = createWMSLyr(lyrName).addTo(map);    
  });

  L.control.layers({}, overlaysLeft,{collapsed:false}).addTo(mapLeft,);
  L.control.layers({}, overlaysRight,{collapsed:false}).addTo(mapRight);
  L.control.layers({}, overlays,{collapsed:false}).addTo(map);

  mapLeft.sync(mapRight);
  mapRight.sync(mapLeft);
  mapLeft.sync(map);
  mapRight.sync(map);
  map.sync(mapRight);
  map.sync(mapLeft);

  function createWMSLyr(lyrName) {
    let params = {
      layers: lyrName,
      format: 'image/png',
      transparent: true,
      attribution: attribution
    }
    return L.tileLayer.wms(urlWaterProofLyrsWMS, params);
  }

  
  
  function createLegend(lyrName) {
    let legendParams = `&request=getlegendgraphic&layer=${lyrName}&format=image%2Fpng&SLD_VERSION=1.1.0&VERSION=1.3.0`  

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
        $('#img-legend-left').attr('src', base64Data);
        $('#img-legend-right').attr('src', base64Data);
        $('#legend-row').show();
      })
    
  }
  
});

