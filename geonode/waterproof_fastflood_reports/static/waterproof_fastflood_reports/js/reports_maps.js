/*********
 *  Maps in  Leaflet for WaterProof Reports
 * 
 * *******/

$(document).ready(function () { 

  let zoom = 11;
  bounds = L.latLngBounds(L.latLng(bbox[1],bbox[2]), L.latLng(bbox[3], bbox[0]))
  maxFitBounds = bounds.pad(1.75);
  const mapParameters = {maxBounds: maxFitBounds, maxBoundsViscosity: 1.0};
  var mapLulcNbs = L.map('map-lulc-nbs', mapParameters).fitBounds(bounds);
  var mapLulcBau = L.map('map-lulc-bau', mapParameters).fitBounds(bounds);
  var mapLulcCurrent = L.map('map-lulc-current', mapParameters).fitBounds(bounds);
  var mapFloodMitigationNbs = L.map('map-flood-mitigation-nbs', mapParameters).fitBounds(bounds);
  var mapFloodMitigationBau = L.map('map-flood-mitigation-bau', mapParameters).fitBounds(bounds);
  var mapFloodMitigationCurrent = L.map('map-flood-mitigation-current', mapParameters).fitBounds(bounds);
  //var mapResults = L.map('map-results').fitBounds(bounds);
  mapNbsPorfolio = L.map('map-nbs-portfolio', mapParameters).fitBounds(bounds);

  let urlOmsLyr = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  let omsAttributions = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  L.tileLayer(urlOmsLyr, {
    attribution: omsAttributions,
  }).addTo(mapLulcNbs);

  L.tileLayer(urlOmsLyr, {
    attribution: omsAttributions,
    minZoom: 1,
    maxZoom: 16
  }).addTo(mapLulcBau);

  L.tileLayer(urlOmsLyr, {
    attribution:  omsAttributions,
    minZoom: 1,
    maxZoom: 16
  }).addTo(mapLulcCurrent);

  L.tileLayer(urlOmsLyr, {
    attribution: omsAttributions,
  }).addTo(mapFloodMitigationNbs);

  L.tileLayer(urlOmsLyr, {
    attribution: omsAttributions,
    minZoom: 1,
    maxZoom: 16
  }).addTo(mapFloodMitigationBau);

  L.tileLayer(urlOmsLyr, {
    attribution:  omsAttributions,
    minZoom: 1,
    maxZoom: 16
  }).addTo(mapFloodMitigationCurrent);

  L.tileLayer(urlOmsLyr, {
    attribution:  omsAttributions,
    minZoom: 1,
    maxZoom: 16
  }).addTo(mapNbsPorfolio);

  $('#first_tab').click(function(e){
    console.log('click first tab');
    $(this).parent().addClass('active');
    $('#third_tab').closest('li').removeClass('active');
    $('#second_tab').closest('li').removeClass('active');
    $('#menu1').addClass('active');
    $('#menu2').removeClass('active');
    $('#menu3').removeClass('active');
    mapLulcNbs.invalidateSize();
    mapLulcBau.invalidateSize();
    mapLulcCurrent.invalidateSize();
  });
  $('#second_tab').click(function(e){
    console.log('click second tab');
    $(this).parent().addClass('active');
    $('#third_tab').closest('li').removeClass('active');
    $('#first_tab').closest('li').removeClass('active');
    $('#menu1').removeClass('active');
    $('#menu2').addClass('active');
    $('#menu3').removeClass('active');
    mapFloodMitigationNbs.invalidateSize();
    mapFloodMitigationBau.invalidateSize();
    mapFloodMitigationCurrent.invalidateSize();
    mapFloodMitigationNbs.fitBounds(bounds);
    mapFloodMitigationBau.fitBounds(bounds);
    mapFloodMitigationCurrent.fitBounds(bounds);
    updateMap();
  });
  $('#third_tab').click(function(e){
    console.log('click third tab');
    $(this).parent().addClass('active');
    $('#first_tab').closest('li').removeClass('active');
    $('#second_tab').closest('li').removeClass('active');
    $('#menu1').removeClass('active');
    $('#menu2').removeClass('active');
    $('#menu3').addClass('active');
    mapNbsPorfolio.invalidateSize();
    mapNbsPorfolio.fitBounds(bounds);
  });

  let lyrNameYear0 = 'LULC_YEAR_0';
  let lyrNameLastYear = 'LULC_LAST_YEAR';
  let lyrNameYearFuture = 'LULC_FUTURE';

  let lyrNameCarbon = 'Carbon_storage_and_sequestration'; // (t)
  let lyrNameAreasRios = 'NbS_portfolio';
  let lyrNameCatchment = 'Watershed';
  let lyrsModelsResult = [lyrNameCarbon];
              
  let lyrsLabels = {
    LULC_YEAR_0 : 'LULC Current Scenario',
    LULC_LAST_YEAR : 'LULC NbS Scenario',
    LULC_FUTURE : 'LULC BaU Scenario',
    Watershed : 'Watershed',
    NbS_portfolio : 'NbS Portfolio',    
    Carbon_storage_and_sequestration : 'Carbon storage and sequestration (t)',    
  }

  let attribution = "Waterproof data © 2025 TNC";
  let keys = ['carbon'];
  let lyrsNames = [lyrNameLastYear];
  var overlaysLeft = {};

  const floodSelect = document.getElementById("floodOption");
  const periodSelect = document.getElementById("floodPeriod");
  
  let urlWaterProofLyrsWMSFlood;
  let currentLayerNbS = null;
  let currentLayerBaU = null;
  let currentLayerC = null;
  let objLayersNbs = {};
  let objLayersBau = {};
  let objLayersCurrent = {};

  let controlLyrsNbs;
  let controlLyrsBau;
  let controlLyrsCurrent;

  // Objeto para almacenar min/max de las capas
  let layersMinMax = {};

  /**
   * Lee las capacidades del servicio WMS y extrae min/max del Abstract
   */
  async function fetchWMSCapabilities() {
    try {
      const capabilitiesUrl = `${srvMapServer}?map=/etc/mapserver/fastflood/${baseData}/WI_${intake}/mapserver.map&SERVICE=WMS&REQUEST=GetCapabilities`;
      const response = await fetch(capabilitiesUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");

      // Buscar todas las capas
      const layers = xmlDoc.getElementsByTagName("Layer");

      for (let layer of layers) {
        const nameElement = layer.getElementsByTagName("Name")[0];
        const abstractElement = layer.getElementsByTagName("Abstract")[0];

        if (nameElement && abstractElement) {
          const layerName = nameElement.textContent;
          const abstract = abstractElement.textContent;

          // Filtrar capas que empiezan con Qpeak, Flood o Velocity
          if (layerName.startsWith("Qpeak") || layerName.startsWith("Flood") || layerName.startsWith("Velocity")) {
            // Extraer min y max del abstract
            // Formato esperado: "min=0.0 max=21.2" o similar
            const minMatch = parseFloat(abstract.split(" ")[0]);
            const maxMatch = parseFloat(abstract.split(" ")[1]);
            // console.log(layerName);
            //if (minMatch && maxMatch) {
              layersMinMax[layerName] = {
                min: parseFloat(minMatch),
                max: parseFloat(maxMatch)
              };
            //}
          }
        }
      }

      console.log("Layers min/max loaded:", layersMinMax);
    } catch (error) {
      console.error("Error fetching WMS capabilities:", error);
    }
  }

  /**
   * Actualiza los valores min/max en la leyenda según las capas activas
   */
  function updateFloodLegendMinMax() {
    console.log("updateFloodLegendMinMax");
    const layers = [layerNameNbS, layerNameBaU, layerNameCurrent];
    let globalMin = Infinity;
    let globalMax = -Infinity;

    layers.forEach(layerName => {
      if (layersMinMax[layerName]) {
        const { min, max } = layersMinMax[layerName];
        if (min < globalMin) globalMin = min;
        if (max > globalMax) globalMax = max;
      }
    });

    // Determinar unidades según el tipo de capa
    let units = '';
    globalMin = globalMin.toFixed(1);
    if (layerNameNbS) {
      if (layerNameNbS.startsWith('Flood')) {
        units = ' (m)';        
        globalMax = globalMax.toFixed(1);
      } else if (layerNameNbS.startsWith('Qpeak')) {
        units = ' (m³/s)';
        globalMax = globalMax.toFixed(1);
      } else if (layerNameNbS.startsWith('Velocity')) {
        units = ' (m/s)';
        globalMax = '>10';
      }
    }

    // Actualizar elementos HTML
    if (globalMin !== Infinity && globalMax !== -Infinity) {
      document.getElementById("min-val-legend-flood").textContent = globalMin + units;
      document.getElementById("max-val-legend-flood").textContent = globalMax + units;
    }
  }

  async function updateMap(){
    const flood = floodSelect.value;
    const period = periodSelect.value;

    floodOptText = floodSelect.options[floodSelect.selectedIndex].textContent;
    $("#desc_flood_option_nbs").text(floodOptText + " -" + $("#desc_flood_option_nbs")[0].innerHTML.split("-")[1]);
    $("#desc_flood_option_bau").text(floodOptText + " -" + $("#desc_flood_option_bau")[0].innerHTML.split("-")[1]);
    $("#desc_flood_option_current").text(floodOptText + " -" + $("#desc_flood_option_current")[0].innerHTML.split("-")[1]);
    $("#flood__legend").text(gettext(floodOptText));

    let nameTif = '';
    if(flood === 'Discharge'){
      nameTif = 'Qpeak';
    }else{
      nameTif = flood;
    }

    $("#img-legend-flood").attr("src", `/static/lib/img/legend-${nameTif.toLocaleLowerCase()}.jpg`);
    urlWaterProofLyrsWMSFlood = srvMapServer + `?map=/etc/mapserver/fastflood/${baseData}/WI_${intake}/mapserver.map`;
    layerNameNbS =`${nameTif}_NbS_TR-${period}`;
    layerNameBaU = `${nameTif}_BaU_TR-${period}`;
    layerNameCurrent = `${nameTif}_Current_TR-${period}`;

    try {
      if (currentLayerNbS || currentLayerBaU || currentLayerC) {
        mapFloodMitigationNbs.removeLayer(currentLayerNbS);
        mapFloodMitigationBau.removeLayer(currentLayerBaU);
        mapFloodMitigationCurrent.removeLayer(currentLayerC);
        if (controlLyrsNbs){
          controlLyrsNbs.removeLayer(currentLayerNbS);
          controlLyrsBau.removeLayer(currentLayerBaU);
          controlLyrsCurrent.removeLayer(currentLayerC);
        }
      }
      
      currentLayerNbS = createWMSLayer(urlWaterProofLyrsWMSFlood, layerNameNbS).addTo(mapFloodMitigationNbs);
      if(currentLayerNbS){
        if (controlLyrsNbs)
          controlLyrsNbs.addOverlay(currentLayerNbS, layerNameNbS);
      }
      
      currentLayerBaU = createWMSLayer(urlWaterProofLyrsWMSFlood, layerNameBaU).addTo(mapFloodMitigationBau);
      if(currentLayerBaU){
        if (controlLyrsBau)
          controlLyrsBau.addOverlay(currentLayerBaU, layerNameBaU);
      }
      
      currentLayerC = createWMSLayer(urlWaterProofLyrsWMSFlood, layerNameCurrent).addTo(mapFloodMitigationCurrent);
      if(currentLayerC){
        if (controlLyrsCurrent)
          controlLyrsCurrent.addOverlay(currentLayerC, layerNameCurrent);
      }

      // Actualizar leyenda con min/max
      updateFloodLegendMinMax();
    } catch (err) {
      console.error("Error cargando el GeoTIFF:", err);
    }
  }

  // Cargar capabilities al inicio
  fetchWMSCapabilities().then(() => {
    // Una vez cargadas las capabilities, inicializar el mapa
    updateMap();
  });

  floodSelect.addEventListener("change", updateMap);
  periodSelect.addEventListener("change", updateMap);

  function createWMSLayer(wmsUrl, layerName) {
      const params = {
          layers: layerName,
          format: 'image/png',
          transparent: true,
          attribution: 'FastFlood data © 2025',
          opacity: 0.7
      };
      
      try {
          return L.tileLayer.wms(wmsUrl, params);
      } catch (error) {
          console.error('Error creating WMS layer:', error);
          return null;
      }
  }

  lyrsNames.forEach(function (lyrName) {
    overlaysLeft[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrsWMS, lyrName).addTo(mapLulcNbs);
  });

  var overlaysRight = {};
  lyrsNames = [lyrNameYearFuture];
  lyrsNames.forEach(function (lyrName) {
    overlaysRight[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrsWMS, lyrName).addTo(mapLulcBau);
    createLegend(urlWaterProofLyrsWMS, lyrName, "#img-legend-lulc");
  });

  var overlays = {};
  lyrsNames = [lyrNameYear0];
  lyrsNames.forEach(function (lyrName) {
    overlays[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrsWMS, lyrName).addTo(mapLulcCurrent);    
  });

  var overlaysAreasRios = {};
  lyrsNames = [lyrNameAreasRios];
  lyrsNames.forEach(function (lyrName) {
    overlaysAreasRios[lyrsLabels[lyrName]] = createWMSLyr(urlWaterProofLyrAreasRiosMS, lyrName).addTo(mapNbsPorfolio);
  });
  
  createLegend(urlWaterProofLyrAreasRiosMS, lyrNameAreasRios, "#img-legend-areas-rios");
  
  if (watershedGeojson && watershedGeojson.features && watershedGeojson.features.length > 0) {
    style = {
      color: '#3388ff',
      weight: 2,
      opacity: 0.65,
      fillOpacity: 0.2
    }    
    overlaysAreasRios[lyrNameCatchment] = L.geoJSON(watershedGeojson, {style: style}).addTo(mapNbsPorfolio);
    overlaysLeft[lyrNameCatchment] = L.geoJSON(watershedGeojson, {style: style}).addTo(mapLulcNbs);
    overlaysRight[lyrNameCatchment] = L.geoJSON(watershedGeojson, {style: style}).addTo(mapLulcBau);
    overlays[lyrNameCatchment] = L.geoJSON(watershedGeojson, {style: style}).addTo(mapLulcCurrent);
    objLayersNbs[lyrNameCatchment] = L.geoJSON(watershedGeojson, {style: style}).addTo(mapFloodMitigationNbs);
    objLayersBau[lyrNameCatchment] = L.geoJSON(watershedGeojson, {style: style}).addTo(mapFloodMitigationBau);
    objLayersCurrent[lyrNameCatchment] = L.geoJSON(watershedGeojson, {style: style}).addTo(mapFloodMitigationCurrent);
  }else{
    let poly = watershedPolygon;
    if (poly.indexOf("SRID") >= 0) {
        poly = poly.split(";")[1];
    }
    var lyrPolyWatershed = omnivore.wkt.parse(poly).addTo(mapNbsPorfolio);
    overlaysAreasRios[lyrNameCatchment] = lyrPolyWatershed;    
    overlaysLeft[lyrNameCatchment] = omnivore.wkt.parse(poly).addTo(mapLulcNbs);
    overlaysRight[lyrNameCatchment] = omnivore.wkt.parse(poly).addTo(mapLulcBau);
    overlays[lyrNameCatchment] = omnivore.wkt.parse(poly).addTo(mapLulcCurrent);
    objLayersNbs[lyrNameCatchment] = omnivore.wkt.parse(poly).addTo(mapFloodMitigationNbs);
    objLayersBau[lyrNameCatchment] = omnivore.wkt.parse(poly).addTo(mapFloodMitigationBau);
    objLayersCurrent[lyrNameCatchment] = omnivore.wkt.parse(poly).addTo(mapFloodMitigationCurrent);
  }
  
  
  
  L.control.layers({}, overlaysLeft,{collapsed:false}).addTo(mapLulcNbs);
  L.control.layers({}, overlaysRight,{collapsed:false}).addTo(mapLulcBau);
  L.control.layers({}, overlays,{collapsed:false}).addTo(mapLulcCurrent);
  controlLyrsNbs = L.control.layers({}, objLayersNbs,{collapsed:false}).addTo(mapFloodMitigationNbs);
  controlLyrsBau = L.control.layers({}, objLayersBau,{collapsed:false}).addTo(mapFloodMitigationBau);
  controlLyrsCurrent = L.control.layers({}, objLayersCurrent,{collapsed:false}).addTo(mapFloodMitigationCurrent);
  //let ctrlLyrsMapResult = L.control.layers({}, overlaysResults,{collapsed:false}).addTo(mapResults);
  L.control.layers({}, overlaysAreasRios,{collapsed:false}).addTo(mapNbsPorfolio);

  var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapLulcNbs);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapFloodMitigationNbs);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapLulcBau);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapFloodMitigationBau);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapLulcCurrent);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapFloodMitigationCurrent);
  //defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapResults);
  defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topleft'}).addTo(mapNbsPorfolio);

  mapLulcNbs.sync(mapLulcBau);
  mapLulcBau.sync(mapLulcNbs);
  mapLulcNbs.sync(mapLulcCurrent);
  mapLulcBau.sync(mapLulcCurrent);
  mapLulcCurrent.sync(mapLulcBau);
  mapLulcCurrent.sync(mapLulcNbs);
  mapFloodMitigationNbs.sync(mapFloodMitigationBau);
  mapFloodMitigationBau.sync(mapFloodMitigationNbs);
  mapFloodMitigationNbs.sync(mapFloodMitigationCurrent);
  mapFloodMitigationBau.sync(mapFloodMitigationCurrent);
  mapFloodMitigationCurrent.sync(mapFloodMitigationBau);
  mapFloodMitigationCurrent.sync(mapFloodMitigationNbs);
  
  $("#menu2")[0].append($("#map-analysis-result")[0]);
  $("#menu3")[0].append($("#map-nbs-portfolio-container")[0]);
  if($("#pdf-report-in-geo")[0]!= undefined || $("#pdf-report-in-geo")[0]!= null ){
    $("#menu3")[0].append($("#pdf-report-in-geo")[0]);
  }
  $('#first_tab').trigger('click');
    
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
    let separator = urlWMS.includes("?") ? "&" : "?";
    let legendParams = `request=getlegendgraphic&layer=${lyrName}&format=image%2Fpng&SLD_VERSION=1.1.0&VERSION=1.3.0`;
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

    fetchAsBlob(urlWMS + separator + legendParams)
      .then(convertBlobToBase64)
      .then(base64Data => {
        $(elId).attr('src', base64Data);
      })    
  }
});