var snapMarker;
var map;
var catchmentPoly;
var mapDelimit

$(document).ready(function() {  
  console.log("waterproof-fastflood.js loaded");

  setIntakeCity();
  $('#cityLabel').text(localStorage.city+", "+localStorage.country);
  $("#countryLabel").html(localStorage.getItem('country'));

  $('#smartwizard').smartWizard("next").click(function() {
    $('#autoAdjustHeightF').css("height", "auto");   
    map.invalidateSize();
  });

  $('#smartwizard').smartWizard({
    selected: 0,
    theme: 'dots',
    enableURLhash: false,
    autoAdjustHeight: true,
    transition: {
        animation: 'fade', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
    },
    keyboardSettings: {
        keyNavigation: false
    },
    toolbarSettings: {
        showNextButton: false,
        showPreviousButton: false,
    },
    anchorSettings: {
        removeDoneStepOnNavigateBack: false,
        markAllPreviousStepsAsDone: false,
        anchorClickable: false,
        enableAllAnchors: false,
        markDoneStep: false,
    }
  });

  let initialCoords = [4.5, -74.4];
  var cityCoords = localStorage.getItem('cityCoords');
  if (cityCoords == undefined) {
      cityCoords = initialCoords;
  } else {
      initialCoords = JSON.parse(cityCoords);
  }
  waterproof["cityCoords"] = cityCoords;
  map = L.map('map', {}).setView(initialCoords, 8);
  const attr = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
  var osm = L.tileLayer(OSM_BASEMAP_URL, {
    attribution: attr,
  });
  map.addLayer(osm);
  var c = new L.Control.Coordinates({
    actionAfterDragEnd: prevalidateAdjustCoordinates
  }).addTo(map);
  var defExt = new L.Control.DefaultExtent({ title: gettext('Default extent'), position: 'topright'}).addTo(map);
  var images = L.tileLayer(IMG_BASEMAP_URL);
  
  var hydroLyr = L.tileLayer(HYDRO_BASEMAP_URL);
  var wmsHydroNetworkLyr = L.tileLayer.wms(GEOSERVER_WMS, {
      layers: HYDRO_NETWORK_LYR,
      format: 'image/png',
      transparent: 'true',
      opacity: 0.35,
      minZoom: 6,
  });

  var baseLayers = {
      OpenStreetMap: osm,
      Images: images,      
  };

  var overlays = {
      "Hydro Network": wmsHydroNetworkLyr,
      "Hydro (esri)": hydroLyr,        
  };
  L.control.layers(baseLayers, overlays, { position: 'topleft' }).addTo(map);

  $("#validateBtn").on("click", prevalidateAdjustCoordinates);

});

function prevalidateAdjustCoordinates() {
  Swal.fire({
      title: gettext('Basin point delimitation'),
      text: gettext('The point coordinates will be adjusted to the nearest water source'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: gettext('Yes, adjust!'),
      cancelButtonText: gettext('Cancel'),
  }).then((result) => {
      if (result.isConfirmed) {
          mapLoader = L.control.loader().addTo(map);
          validateCoordinateWithApi();
      }
  })
}

function setIntakeCity() {
  console.log("setIntakeCity, localStorage.cityId: ", localStorage.cityId);
  /** 
   * Get a city by name
   * @param {String} url   activities URL 
   * @param {Object} data  lang,city parameters 
   *
   * @return {Object} City
   */
  if (localStorage.cityId){
      $('#intakeCity').val(localStorage.cityId);
  }else{
      $.ajax({
          url: '/parameters/load-cityByName/',
          data: {
              'lang': lang,
              'city': localStorage.city
          },
          success: function(result) {
              let resultCity = JSON.parse(result);
              $('#intakeCity').val(resultCity[0].pk);
          },
          error: function(error) {
              console.log(error);
          }
      });
  }  
}

$('#step1NextBtn').click(function() {
  if ($('#id_name').val() != '' && $('#id_description').val() != '' && $('#id_water_source_name').val() != '' && catchmentPoly != undefined) {
      var intakePolygonJson = catchmentPoly.toGeoJSON();
      var pointIntakeJson = snapMarker.toGeoJSON();
      $('#intakeAreaPolygon').val(JSON.stringify(intakePolygonJson));
      $('#pointIntake').val(JSON.stringify(pointIntakeJson));
      $('#basinId').val(basinId);
      intakeStepOne();

  } else {
      Swal.fire({
          icon: 'warning',
          title: gettext('Field empty'),
          text: gettext('Please complete all required information')
      });
      return;
  }
});

$('#step2PrevBtn').click(function() {
  $('#smartwizard').smartWizard("prev");
});

$('#step2NextBtn').click(function() {
  if (!bandera) {
      $('#smartwizard').smartWizard("stepState", [3], "hide");
      for (const item of graphData) {
          if (item.external != null && item.external != 'false') {
              $('#smartwizard').smartWizard("stepState", [3], "show");
          }
      }
      clearDataHtml();
      intakeStepTwo();
  } else {
      Swal.fire({
          icon: 'warning',
          title: gettext('Validate graph'),
          text: gettext('Please validate graph')
      });
      return;
  }
});

