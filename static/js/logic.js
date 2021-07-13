
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(function(data) {
  createFeatures(data.features);
});




function createFeatures(earthquakeData) {
//Pop-up box
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p> Magnitude: " + feature.properties.mag + "</p>" +
      "<p> Depth: " + feature.geometry.coordinates[2] + " km</p>" +
      "<p>" + new Date(feature.properties.time) + "</p>"
      );
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer : function(feature, latlng) {
      return L.circleMarker(latlng);
  },
  style: styleInfo
});

  createMap(earthquakes);
}


function createMap(earthquakes) {

  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  var overlayMaps = {
    Earthquakes: earthquakes
  };

  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
          depths = [-10,10,50,100,150],
          labels = [];

      for (var i = 0; i < depths.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
              depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + " km"+ '<br>' : '+ km');
      }
      return div;
  };
  legend.addTo(myMap);

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

//Styling marker
function styleInfo(feature) {
  return {
  opacity: 1,
  fillOpacity: 1,
  fillColor: getColor(feature.geometry.coordinates[2]),
  stroke: true,
  weight: 0.5,
  radius: getRadius(feature.properties.mag)
}};


//Color gradient
  function getColor(depth) {
    return depth > 150 ? '#ea2c2c' :
          depth > 100  ? '#ea822c' :
          depth > 50  ? '#ee9c00' :
          depth > 10  ? '#eecc00' :
          depth > -10   ? '#98ee00' :
            '#98ee00';
}
    
    
    
    

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 5
  }