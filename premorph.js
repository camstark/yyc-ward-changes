var oldDistricts = require("./old-raw.geo.json"),
    newDistricts = require("./new-raw.geo.json"),
    _ = require("underscore"),
    turf = require("@turf/turf"),
    fs = require("fs");

// Clean up GeoJSON, sort districts in order
prep(oldDistricts);
prep(newDistricts);

oldDistricts.features.forEach(function(feature,i){

  // Harmonize the old poly + new poly
  harmonize(feature,newDistricts.features[i]);

});

fs.writeFileSync("./old.geojson",JSON.stringify(oldDistricts));
fs.writeFileSync("./new.geojson",JSON.stringify(newDistricts));

function harmonize(a,b) {

  var aLength = a.geometry.coordinates[0].length,
      bLength = b.geometry.coordinates[0].length;

  // Add points to the shorter of the two
  if (aLength < bLength) {
    a.geometry.coordinates[0] = addPoints(a.geometry.coordinates[0],bLength - aLength);
  } else if (bLength < aLength) {
    b.geometry.coordinates[0] = addPoints(b.geometry.coordinates[0],aLength - bLength);
  }

  // Wind one of the two polygons for best alignment
  windPolygons(a.geometry.coordinates[0],b.geometry.coordinates[0]);

}

function addPoints(ring,numPoints) {

  var line = turf.lineString(ring),
      lineLength = turf.lineDistance(line,"miles");

  // Generate evenly spaced points to add
  var toAdd = _.range(numPoints).map(function(i) {

    var milesAlong = lineLength * (i + 1) / (numPoints + 2);

    return turf.along(line,milesAlong,"miles");

  });

  // Lazy way of inserting each point on the correct segment
  // Should probably traverse the line once and insert one at a time
  // ¯\_(ツ)_/¯
  toAdd.forEach(function(point){
    insertPoint(ring,point);
  });

  return ring;

}

function insertPoint(ring,point){

  var minDistance = Infinity,
      insertBefore;

  for (var i = 1; i < ring.length; i++) {

    var dist = distanceToSegment([ring[i-1],ring[i]],point);

    if (dist < minDistance) {
      minDistance = dist;
      insertBefore = i;
    }

  }

  // Insert into the closest segment
  ring.splice(insertBefore,0,point.geometry.coordinates);

}

function distanceToSegment(segment,point) {

  var snapped = turf.pointOnLine(turf.lineString(segment),point);

  return turf.distance(point,snapped,"miles");

}

function windPolygons(a,b){

  a.pop(); // Remove closing point
  b.pop(); // Remove closing point

  var windIndex,
      minDistance = Infinity;

  // Check each possible winding
  // TODO: map all to turf.point once instead of every time
  for (var i = 0, l = a.length; i < l; i++) {

    var distance = sumOfSquares(a,b);

    if (distance < minDistance) {
        windIndex = i;
        minDistance = distance;
    }

    // Wind one more point around
    a.push(a.shift());

  }

  // Lazy, slice()
  _.range(windIndex).forEach(function(d){
    a.push(a.shift());
  });

  a.push(a[0]); // Add closing point back
  b.push(b[0]); // Add closing point back

}

function sumOfSquares(a,b) {

  var total = 0;

  a.forEach(function(p,i){
    total += Math.pow(turf.distance(turf.point(p),turf.point(b[i]),"miles"),2);
  });

  return total;

}

function prep(districts) {

  // Numeric district
  districts.features.forEach(function(d){
    d.properties = {
      // district: +d.properties.District
      district: +d.properties.ward_num //Use the ward identifier instead
    };
  });

  // Less precision
  districts.features.forEach(truncate);

  // Sorted
  districts.features.sort(function(a,b){
    return a.properties.district - b.properties.district;
  });

}

function truncate(feature) {
  feature.geometry.coordinates[0] = feature.geometry.coordinates[0].map(function(point){
    return point.map(function(num){
      return parseFloat(num.toFixed(6));
    });
  });
}
