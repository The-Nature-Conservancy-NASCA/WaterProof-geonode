$(document).ready(function () {
  let center = [4.6, -75.5];
  var mapLeft = L.map('map-left').setView(center, 11);
  var mapRight = L.map('map-right').setView(center, 11);

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

  //let urlWaterProofLyrsWMS = 'http://localhost:81/?map=/etc/mapserver/1000_142_2021-6-25.map&SERVICE=WMS';
  let lyrNameYear0 = `WI_${intake}_LULC_SA_1_YEAR_0`;
  let lyrNameLastYear = `WI_${intake}_LULC_LAST_YEAR`;
  let lyrNameYearFuture = `WI_${intake}_LULC_SA_1_FUTURE`;
  let attribution = "Waterproof data © 2021 TNC"

  let lyrsNames = [lyrNameYear0, lyrNameLastYear, lyrNameYearFuture];
  var overlaysLeft = {};
  lyrsNames.forEach(function (lyrName) {
    overlaysLeft[lyrName] = createWMSLyr(lyrName).addTo(mapLeft);
  });

  var overlaysRight = {};
  lyrsNames.forEach(function (lyrName) {
    overlaysRight[lyrName] = createWMSLyr(lyrName).addTo(mapRight);
  });

  L.control.layers({}, overlaysLeft).addTo(mapLeft);
  L.control.layers({}, overlaysRight).addTo(mapRight);

  mapLeft.sync(mapRight);
  mapRight.sync(mapLeft);

  function createWMSLyr(lyrName) {
    let params = {
      layers: lyrName,
      format: 'image/png',
      transparent: true,
      attribution: attribution
    }
    return L.tileLayer.wms(urlWaterProofLyrsWMS, params);
  }
});

