// Store the API endpoints for the data
var earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonic_plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Define chooseColor function
function chooseColor(mag) {
	switch (true) {
	case (mag <= 1):
		return "palegoldenrod";
	case (mag <= 2):
		return "gold";
	case (mag <= 3):
		return "goldenrod";
	case (mag <= 4):
		return "orange";
	case (mag <= 5):
		return "darkorange";
	case (mag > 5):
		return "red";
	default:
		return "black";
  }
};

// Perform a GET request to the earthquake_url
d3.json(earthquake_url, function(data) {
  // Once we get a response, send the data.features object to the create_earthquakes_layer function
  create_earthquakes_layer(data.features);
});

// Define earthquakes layer
function create_earthquakes_layer(earthquakeData) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakes = L.geoJSON(earthquakeData, {
	 
	// Define the marker style 
    pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {
        	color: chooseColor(feature.properties.mag),
			fillColor: chooseColor(feature.properties.mag),
			radius: feature.properties.mag * 2,
        	fillOpacity: 1
        });
    },
	
	// Define the popups
	onEachFeature: function(feature, layer) {
		layer.bindPopup(`<center>${feature.properties.title}</center>`);
	}
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Perform a GET request to the tectonic_plates_url
d3.json(tectonic_plates_url, function(data) {
  // Once we get a response, send the data.features object to the create_earthquakes_layer function
  create_tectonic_plates_layer(data.features);
});

// Create a tectonic plates global variable;
var tectonic_plates;

// Define the tectonic plates layer
function create_tectonic_plates_layer(tectonicPlatesData){
			
	// Creating a geoJSON layer with the retrieved data
	tectonic_plates = L.geoJson(tectonicPlatesData, {
	  
		// Style each feature 
		style: function(feature) {
			return {
				color: "darkorange",
				fillOpacity: 0,
				weight: 1.5
			}
		}
	})
	
};
  
// Create map
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });
  
   var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });
    
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
	"Light Map": lightmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
	"Tectonic Plates": tectonic_plates
  };

  // Create our map, giving it the streetmap, earthquakes, and tectonic plates layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [streetmap, earthquakes, tectonic_plates]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
    // Define the legend
  var legend = L.control({ position: "bottomright" });

  // Set up the legend  
  legend.onAdd = function(myMap) {

	// Define div and grades
	var div = L.DomUtil.create("div", "legend"),
		grades = [0,1,2,3,4,5],
		labels = [];

	// Loop through and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}

	return div;
  };
  
  // Add the legend to the map
  legend.addTo(myMap);
  
};