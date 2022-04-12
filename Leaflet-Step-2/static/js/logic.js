// Load the GeoJSON data
//  All earthquakes in the past 7 days, 2.5M+
var geoData =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

var plateJson = "static/plates.json"
// Perform a GET request to the URL
d3.json(geoData).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

d3.json(plateJson).then(function (platos) {
    plateData = platos
    })

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "Magnitude: " +
        feature.properties.mag +
        "<br>Depth: " +
        feature.geometry.coordinates[2] +
        "'<br>" +
        feature.properties.place
    );
  }

  function pointToLayer(featureData, Latlng) {
    // Conditionals for earthquake depth
    var color = "";
    if (featureData.geometry.coordinates[2] > 100) {
      color = "#000000";
    }
    else if (featureData.geometry.coordinates[2] > 70) {
      color = "#005b64";
    }
    else if (featureData.geometry.coordinates[2] > 40) {
      color = "#027e8a";
    }
    else if (featureData.geometry.coordinates[2] > 20) {
      color = "#01a2b2";
    }
    else {
      color = "#00d6eb";
    }
    return new L.CircleMarker(Latlng, {
      radius: featureData.properties.mag*5, 
      fillOpacity: 0.65,
      fillColor: color,
      color: color
    });
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  });

  var plates = L.geoJSON(plateData, {
    // Styling the plates layer
    style: function(feature) {
        return {
          color: "yellow",
          fillColor: "yellow",
          fillOpacity: 0.1,
          weight: 1.5
        };
      },
    onEachFeature: function(feature, layer) {
        // Set the mouse events to change the map styling.
        layer.on({
          // When a user's mouse cursor touches a map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
          mouseover: function(event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.4
            });
          },
          // When the cursor no longer hovers over a map feature (that is, when the mouseout event occurs), the feature's opacity reverts back to 50%.
          mouseout: function(event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.1
            });
          },
        });
        layer.bindPopup(feature.properties.PlateName);
      }
  });

  // Send our earthquakes layer to the createMap function
  createMap(plates, earthquakes);
}



  // Create the legend
  function createLegend(div) {
    div.innerHTML = [
      "<p>Earthquake Depths: " + "</p>",
      "<span class='depth1'>&#9677;</span><span> Less than 20'</span><br />",
      "<span class='depth2'>&#9677;</span><span> 20' to 40'</span><br />",
      "<span class='depth3'>&#9677;</span><span> 40' to 70'</span><br />",
      "<span class='depth4'>&#9677;</span><span> 70' to 100'</span><br />",
      "<span class='depth5'>&#9677;</span><span> Deeper than 100'</span><br />"
    ].join("");
  }

function createMap(plates, earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var dark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	attribution: 'Map data: &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Dark Map": dark,
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Plates: plates,
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [dark, plates, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// Create a legend to display information about our map.
var info = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend".
info.onAdd = function() {
  var div = L.DomUtil.create("div", "legend");
  createLegend(div);
  return div;
  
};
// Add the info legend to the map.
info.addTo(myMap);
}

