
/**
 * Validate Coordinates with API
 *  
 * 
 */
async function validateCoordinateWithApi(e) {
    const snapPoint = "snapPoint";
    const delineateCatchment = "delineateCatchment";
    let center = waterproof.cityCoords == undefined ? map.getCenter() : waterproof.cityCoords;
    let amp = "&";
    if (serverApi.indexOf("proxy") >= 0) {
      amp = "%26";
    }
    let url = serverApi + snapPoint + "?x=" + center[1] + amp + "y=" + center[0];
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
            snapMarkerMapDelimit2 = L.marker(null, {});
          }
          var ll = new L.LatLng(y, x);
          snapMarker.setLatLng(ll);
          snapMarkerMapDelimit.setLatLng(ll);
          snapMarkerMapDelimit2.setLatLng(ll);
          snapMarker.addTo(map);
          snapMarkerMapDelimit.addTo(mapDelimit);
          snapMarkerMapDelimit2.addTo(mapDelimit2);
          url = serverApi + delineateCatchment + "?x=" + x + amp + "y=" + y;
  
          let responseCatchment = await fetch(url);
          let resultCatchment = await responseCatchment.json();
          if (resultCatchment.status) {
            if (!watershedPoly) {
              watershedPoly = L.geoJSON().addTo(map);
              catchmentPolyDelimit = L.geoJSON().addTo(mapDelimit);
              catchmentPolyDelimit2 = L.geoJSON().addTo(mapDelimit2);
            } else {
              map.removeLayer(watershedPoly);
              mapDelimit.removeLayer(catchmentPolyDelimit);
              mapDelimit2.removeLayer(catchmentPolyDelimit2);
              if (editablepolygon != undefined) {
                mapDelimit.removeLayer(editablepolygon);
              }
              if (editablepolygon2 != undefined) {
                mapDelimit2.removeLayer(editablepolygon);
              }
  
              watershedPoly = L.geoJSON().addTo(map);
              catchmentPolyDelimit = L.geoJSON().addTo(mapDelimit);
              catchmentPolyDelimit2 = L.geoJSON().addTo(mapDelimit2);
            }
  
            let polygonFeature = resultCatchment.result.geometry.features;
            if (polygonFeature[0].geometry.coordinates[0].length > MAX_NUM_POINTS) {
              console.log("too many points : " + polygonFeature[0].geometry.coordinates[0].length + " ... simplifying");
              var polygonSimplified = simplifyPolygon(polygonFeature[0].geometry.coordinates[0]);
              if (polygonSimplified.geometry.coordinates[0].length > 0) {
                watershedPoly.addData([polygonSimplified]);
                polygonFeature = [polygonSimplified]
                console.log("new num points in polygon : " + polygonSimplified.geometry.coordinates[0].length);
              } else {
                watershedPoly.addData(polygonFeature);
              }
            } else {
              watershedPoly.addData(polygonFeature);
            }
  
            catchmentPolyDelimit.addData(polygonFeature);
            catchmentPolyDelimit2.addData(polygonFeature);
            let envelope = turf.envelope(polygonFeature[0]);
            console.log("envelope", envelope);
            let areaHaPolygon = turf.area(polygonFeature[0]) / 10000;
            let areaHaEnvelope = turf.area(envelope) / 10000;
            let rangeHas = [360000, 1440000, 23040000, 92160000, 36640000];
            let resolutions = [20, 40, 150, 300, 600];
            let i = -1;
            rangeHas.some((element, j) => {
              if (areaHaEnvelope <= element){
                i = j;
                return true;
              }
            });
            let minResolution = resolutions[i];            
            $('#watershedAreaValue').val((areaHaPolygon).toFixed(2));
            $('#bboxCoors').val(envelope.bbox.toString());            
            localStorage.setItem('minResolution',minResolution)
            basinId = resultCatchment.result.basin;
            map.fitBounds(watershedPoly.getBounds());
            mapDelimit.fitBounds(watershedPoly.getBounds());
            mapDelimit2.fitBounds(watershedPoly.getBounds());
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
  
  function transformGeographicToProjected(coordinates, targetCRS = 'EPSG:3857') {
    // Validate input array has correct format (even number of elements)
    if (coordinates.length < 2 || coordinates.length % 2 !== 0) {
        console.error("Error: Coordinates array must have an even number of elements (lon, lat pairs)");
        return null;
    }
    
    // Array to store the projected coordinates
    const projectedCoordinates = [];
    
    // Process each coordinate pair (longitude, latitude)
    for (let i = 0; i < coordinates.length; i += 2) {
        const longitude = coordinates[i];
        const latitude = coordinates[i + 1];
        
        // Create a GeoJSON point
        const point = turf.point([longitude, latitude]);
        
        // Transform to projected coordinates
        // Note: turf.toMercator() for EPSG:3857 or use turf.transform with proj4 for other CRS
        let projectedPoint;
        
        if (targetCRS === 'EPSG:3857' || targetCRS === 'WebMercator') {
        // Convert to Web Mercator (EPSG:3857)
        projectedPoint = turf.toMercator(point);
        } else {
        // For other projections, you'll need to set up proj4 with the desired CRS
        // This requires including proj4 library
        // Example: projectedPoint = turf.transform(point, 'WGS84', targetCRS);
        console.warn(`Using custom CRS ${targetCRS}. Ensure proj4 is configured with this CRS definition.`);
        projectedPoint = turf.transform(point, 'WGS84', targetCRS);
        }
        
        // Extract the projected coordinates from the transformed point
        const projectedCoords = projectedPoint.geometry.coordinates;
        
        // Add projected coordinates to result array
        projectedCoordinates.push(projectedCoords[0], projectedCoords[1]);
    }
    
    return projectedCoordinates;
}
  