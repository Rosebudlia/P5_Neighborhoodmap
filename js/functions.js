//Google maps API code

//basic map init functions

var map;	

var places = [];

//var testarray = ["steve", "hank", "jim", "gary"]

function initMap() {

    var mappington = new google.maps.LatLng(52.52, 13.41);

    var marker = new google.maps.Marker({
        position: mappington,
        animation: google.maps.Animation.BOUNCE,
        draggable: true,
		title: 'You are here!'
    });

	map = new google.maps.Map((document.getElementById("map")), {
        center: mappington,
        zoom: 15
    });
	
	  infowindow = new google.maps.InfoWindow();

	  //perform a search for local beer gardens
	

	
	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
    location: mappington,
    radius: 2000,
    keyword: ['beer garden']
	}, callback);

    marker.setMap(map);
	
	
	
};

//initiate knockout viewmodel - see callback for applyBindings

var vm = new ViewModel();

	
function ViewModel() {
	
	var self = this;
	
	self.search = ko.observable();
	self.srchResults = ko.observableArray();
	self.markers= ko.observableArray();
	
};


//set markers for the beer gardens and apply knockout bindings

function callback(results, status) {
	

  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
	//places.push(results[i]);
vm.srchResults().push(results[i]);
    }
  }

  ko.applyBindings(vm);

}

function createMarker(place) {
	
	//basic marker creation function
 
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  
  
  google.maps.event.addListener(marker, 'click', function() {
	  
	  
	var content = loadFS(place);
    infowindow.setContent(content);
    infowindow.open(map, this);
  });
  
}

//pulls foursquare check-in data via the API when a marker is clicked on

function loadFS(name){
	var content;
	

	var fsUrl = 'https://api.foursquare.com/v2/venues/search?client_id=MVIMITTX1BD0JRLTXC4HBDUC1S1BWMZH2BES15CNNPHSL2CP&client_secret=HPOJUZR2UZWWNKBRPKLSXF5Z2QSOOZXS3QVOOEUCK3ICHX3V&v=20140806&near=berlin, DE&query=' + name.name + '&limit=1&intent=browse'
	
	$.getJSON(fsUrl, function(data){
	console.log(data.response.venues[0].stats.checkinsCount);
        var content = data.response.venues[0].stats.checkinsCount;
		
		return content;

    }).error(function(e){
        var content = 'No foursquare data available for this venue';
		return content;
    });
	
}

//make the list items rendering function a part of the viewModel

