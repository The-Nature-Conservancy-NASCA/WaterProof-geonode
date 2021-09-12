async function validateCoordinateWithApi(e) {
  const snapPoint = "snapPoint";
  const delineateCatchment = "delineateCatchment";
  let center =  waterproof.cityCoords == undefined ? map.getCenter(): waterproof.cityCoords;
  let amp = "&";
  if (serverApi.indexOf("proxy") >=0){
    amp = "%26";
  }
  let url = serverApi + snapPoint + "?x=" + center[1] + amp + "y=" + center[0];
  let response = await fetch(url);
 
  let result = await response.json();
  if (result.status) {

    if (L.Location.Marker){
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
    url = serverApi + delineateCatchment + "?x=" + x + amp + "y=" + y;

    let responseCatchment = await fetch(url);
    let resultCatchment = await responseCatchment.json();
    if (resultCatchment.status) {
      if (!catchmentPoly) {
        catchmentPoly = L.geoJSON().addTo(map);
        catchmentPolyDelimit = L.geoJSON().addTo(mapDelimit);
      } else {
        map.removeLayer(catchmentPoly);
        mapDelimit.removeLayer(catchmentPolyDelimit);
        if (editablepolygon != undefined){
          mapDelimit.removeLayer(editablepolygon);
        }
        
        catchmentPoly = L.geoJSON().addTo(map);
        catchmentPolyDelimit = L.geoJSON().addTo(mapDelimit);
      }

      if (resultCatchment.result.geometry.features[0].geometry.coordinates[0].length > MAX_NUM_POINTS) {
        console.log("too many points : " + resultCatchment.result.geometry.features[0].geometry.coordinates[0].length + " ... simplifying");
        var polygonSimplified = simplifyPolygon(resultCatchment.result.geometry.features[0].geometry.coordinates[0]);
        if (polygonSimplified.geometry.coordinates[0].length > 0) {
          catchmentPoly.addData([polygonSimplified]);
          console.log("new num points in polygon : " + polygonSimplified.geometry.coordinates[0].length);
        }else{
          catchmentPoly.addData(resultCatchment.result.geometry.features);
        }
      } else {
        catchmentPoly.addData(resultCatchment.result.geometry.features);
      }
      
      catchmentPolyDelimit.addData(resultCatchment.result.geometry.features);
      basinId=resultCatchment.result.basin;
      map.fitBounds(catchmentPoly.getBounds());
      mapDelimit.fitBounds(catchmentPoly.getBounds());
      mapLoader.hide();
    } else {
      mapLoader.hide();
    }
  }
}
