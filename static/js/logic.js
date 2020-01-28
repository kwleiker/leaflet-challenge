var baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Use d3 to pull data
d3.json(baseURL, function(data) {
/* Push data.features object to the createFeatures function 
and log activity in the console */
  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

/*  Create a popup describing the place and time of the earthquake 
    for each event and bind a pop-up window */
  function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3>" +
        "<h2> Magnitude: " + feature.properties.mag + "</h2>" + 
        "<h3> Significance: " + feature.properties.sig + "</h3>" + 
        "<hr><p>" + Date(feature.properties.time) + "</p>");
  }



// set color based on magnitude 
function circleColor(magnitude) {
      if (magnitude < 1) {return "#FFFFE0"}           //  "light yellow"
      else if (magnitude < 2) {return "#FFFF90"}      //  custom light yellow
      else if (magnitude < 3) {return "#FFFF00"}      //  "yellow"
      else if (magnitude < 4) {return "#FFd500"}      //  custom light orange
      else if (magnitude < 5) {return "#FF9900"}      //  custom orange
      else if (magnitude < 6) {return "#FF2200"}      //  custom maraschino red
      else if (magnitude < 7) {return "#B22222"}      //  "firebrick"
      else if (magnitude < 8) {return "#660000"}      //  custom ruddy brown 
      else if (magnitude < 9) {return "#330000"}      //  custom dark brown
      else {return "#000000"}                         //  "black" 
}


/*  Create a GeoJSON layer containing the features array on the earthquakeData object
    Run the onEachFeature function once for each piece of data in the array */
// Create circle based on the magnitude for each event
function radiusSize(mag) {
  return 250*mag**4;
}
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 0.1
      });
    },
    onEachFeature: onEachFeature
  });
/* OK the less opaque discs makes distinguing multiple quakes in on spot possible.
      but but but but 
          now you know there is data you can't click on. I don't know how to set up a kern     
      to allow that function.  They just layer in, order of arrival. Pooh.
          but dang-o-mango does it go to show: Parameters Matter. 
*/ 
// Use createMap to push earthquakes to map layer
  createMap(earthquakes);
}

function createMap(earthquakes) {



// three map skins. max zoom set to the limits of useful data. 

  var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia3dsZWlrZXIiLCJhIjoiY2s1eGE1bWZ2MDJ3YjNudW12dXRrdTg3MCJ9.rKDEVW8henYC6k0_btcuYw", {
    maxZoom: 20,
    id: "mapbox.outdoors",
    accessToken: osm_key
  });


  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia3dsZWlrZXIiLCJhIjoiY2s1eGE1bWZ2MDJ3YjNudW12dXRrdTg3MCJ9.rKDEVW8henYC6k0_btcuYw", {
    maxZoom: 20,
    id: "mapbox.satellite",
    accessToken: osm_key
  });


  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia3dsZWlrZXIiLCJhIjoiY2s1eGE1bWZ2MDJ3YjNudW12dXRrdTg3MCJ9.rKDEVW8henYC6k0_btcuYw", {
    maxZoom: 16,
    id: "mapbox.light",
    accessToken: osm_key
  });



// Create layerGroup for faultLines
  var faultLines = new L.LayerGroup();



// map skins basically defined by content provider
  var skins = {
    "Greyscale Map": grayscale,
    "Outdoor Map": outdoor,
    "Satellite Map": satellite
  };




// Create overlay object to hold our overlay layer
  var layers = {
    Earthquakes: earthquakes,
    FaultLines: faultLines
  };




// wallyMap.  It's a pun.  Get it?  Like a wall map + me.
  var wallyMap = L.map("map", {
    center: [17.942, -66.872],
    zoom: 10,
    layers: [grayscale, earthquakes]
  });
// I never liked being called Wally. Leave It To Beaver is why.




// control whick skin and which layers. 
  L.control.layers(skins, layers, {
    collapsed: false
  }).addTo(wallyMap);


// actually, which layer.  THe faultline one doesn't work and i gave up.

// Query to retrieve the faultlines data
  var fawlty = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";



// Create the faultlines and add them to the faultline layer
  d3.json(fawlty, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "#C0FF33", weight: 1.5, fillOpacity: 0}
      }
    }).addTo(faultLines)
  })

/* accede
bedded
beefed
cabbed
dabbed
decade
deface
facade
*/ 

// i did a kick ass color scheme.
  function getColor(c) {
        return c > 9  ? '#000000' :
               c > 8  ? '#330000' : 
               c > 7  ? '#660000' : 
               c > 6  ? '#B22222' : 
               c > 5  ? '#FF2200' : 
               c > 4  ? '#FF9900' : 
               c > 3  ? '#FFd500' : 
               c > 2  ? '#FFFF00' : 
               c > 1  ? '#FFFF90' : 
                        '#FFFFE0' ; 
    
      }
 
    // Add legend to the map
      var legend = L.control({position: 'bottomleft'});
    
      legend.onAdd = function (map) {
    
          var div = L.DomUtil.create('div', 'info legend'),
              mags = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              labels = [];
    
    // loops over magnitudes to build the table. should have hand coded it. 
          for (var i = 0; i < mags.length; i++) {
              div.innerHTML +=
                  '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
                  mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
          }
    
          return div;
      };
    // Add legend to map layer
      legend.addTo(wallyMap);
    }

