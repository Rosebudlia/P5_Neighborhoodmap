//Google maps API code

//basic map init functions

var map;	

var places = [];

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
	
	var vm = new ViewModel();

	for(var i = 0; i < places.length; i++){
		vm.srchResults().push(places[i]);
		console.log('hello');
	}
	//vm.srchResults() = places.slice(0);
	ko.applyBindings(vm);
	
	console.log(vm.srchResults());
};

function ViewModel() {
	
	var self = this;
	
	self.search = ko.observable();
	self.srchResults = ko.observableArray();
	self.markers= ko.observableArray();
	
};


//set markers for the beer gardens

function callback(results, status) {
	
	

  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
	  places.push(results[i]);

	

    }
  }


  
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  //vm.markers().push(marker);
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
  
}

//make the list items rendering function a part of the viewModel

