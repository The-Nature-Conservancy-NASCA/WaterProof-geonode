
/**
 * Validate Coordinates with API
 *  
 * 
 */
async function validateCoordinateWithApi(e) {
  let center = waterproof.cityCoords == undefined ? map.getCenter() : waterproof.cityCoords;
  let url = "/intake/snapPoint/?x=" + center[1] + "&y=" + center[0];
  let status = false;
  try {
    let response = await fetch(url);
    if (response.ok) {
      let result = await response.json();
      if (result.status) {

        if (L.Location.Marker) {
          map.removeLayer(L.Location.Marker);
          L.Location.Marker._latlng = null;
        }

        let x = result.result.x_snap;
        let y = result.result.y_snap;

        if (!snapMarker) {
          snapMarker = L.marker(null, {});
          snapMarkerMapDelimit = L.marker(null, {});          
        }
        var ll = new L.LatLng(y, x);
        snapMarker.setLatLng(ll);
        snapMarkerMapDelimit.setLatLng(ll);        
        snapMarker.addTo(map);
        snapMarkerMapDelimit.addTo(mapDelimit);        
        url = "/intake/delineateCatchment/?x=" + x + "&y=" + y;

        let responseCatchment = await fetch(url);
        let resultCatchment = await responseCatchment.json();
        if (resultCatchment.status) {
          if (!catchmentPoly) {
            catchmentPoly = L.geoJSON().addTo(map);
            catchmentPolyDelimit = L.geoJSON().addTo(mapDelimit);            
          } else {
            map.removeLayer(catchmentPoly);
            mapDelimit.removeLayer(catchmentPolyDelimit);            
            if (editablepolygon != undefined) {
              mapDelimit.removeLayer(editablepolygon);
            }
            
            catchmentPoly = L.geoJSON().addTo(map);
            catchmentPolyDelimit = L.geoJSON().addTo(mapDelimit);            
          }

          let polygonFeature = resultCatchment.result.geometry.features;
          if (polygonFeature[0].geometry.coordinates[0].length > MAX_NUM_POINTS) {
            console.log("too many points : " + polygonFeature[0].geometry.coordinates[0].length + " ... simplifying");
            var polygonSimplified = simplifyPolygon(polygonFeature[0].geometry.coordinates[0]);
            if (polygonSimplified.geometry.coordinates[0].length > 0) {
              catchmentPoly.addData([polygonSimplified]);
              polygonFeature = [polygonSimplified]
              console.log("new num points in polygon : " + polygonSimplified.geometry.coordinates[0].length);
            } else {
              catchmentPoly.addData(polygonFeature);
            }
          } else {
            catchmentPoly.addData(polygonFeature);
          }

          catchmentPolyDelimit.addData(polygonFeature);          
          basinId = resultCatchment.result.basin;
          map.fitBounds(catchmentPoly.getBounds());
          mapDelimit.fitBounds(catchmentPoly.getBounds());          
          mapLoader.hide();
        } else {
          mapLoader.hide();
        }
        status = true
      } 
    }
  } catch (error) {
    console.log(error);
  }

  if (!status){
    Swal.fire({
      icon: 'warning',
      title: 'Error snapping point',
      text: 'Something is wrong with server: \n' + url
    });
    mapLoader.hide();
  }

}
/**
 * Simplify a polygon using turf.js
 * default tolerance is 0.01
 * 
 * @param {*} coords 
 * @returns 
 */
function simplifyPolygon(coords) {
  var geojson = turf.polygon([coords]);
  var options = { tolerance: simplifyTolerance, highQuality: false };
  var simplified = turf.simplify(geojson, options);
  return simplified;
}

