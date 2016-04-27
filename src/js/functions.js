//Google maps API code basic map init functions

'use strict';

var map;

var infowindow;

function initMap() {

	//set the center point statically - one could also build in a second input box that allows people to set their own 'you are here' point


	var youAreHere = new google.maps.LatLng(52.52, 13.41);

	map = new google.maps.Map((document.getElementById('map')), {
		center: youAreHere,
		zoom: 15
	});

	infowindow = new google.maps.InfoWindow();

	//retrieve places dynamically with an API search for beer gardens

	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
		location: youAreHere,
		radius: 3500,
		keyword: ['beer garden']
	}, callback);

	//marker.setMap(map);




}

//initiate knockout viewmodel - applyBindings built into the maps API callback function

var vm = new ViewModel();


vm.searchTerm.subscribe(vm.searchMe);

// establish knockout view model constructor	



function ViewModel() {

	var self = this;

	//two observable arrays to store the raw API data and map markers

	self.srchResults = ko.observableArray();
	self.markers = ko.observableArray();

	//these observables store the required info for the filter
	self.filteredMarkers = ko.observableArray();
	self.searchTerm = ko.observable();

	//noPlaces gives us an error message if the search term doesn't apply to any of the entries
	self.noPlaces = ko.observable(false);


	//filter function
	self.searchMe = function() {


		self.filteredMarkers([]);
		self.noPlaces(false);

		for (var i = 0; i < self.markers().length; i++) {
			self.markers()[i].setMap(null);
			if (self.markers()[i].name.toLowerCase().indexOf(self.searchTerm().toLowerCase()) >= 0) {
				self.filteredMarkers.push(self.markers()[i]);
				self.markers()[i].setMap(map);


			}
		}
		if (self.filteredMarkers().length === 0 && self.markers().length !== 0) {
			self.noPlaces(true);

		}

	};

	//add animation and retrive Foursquare check-ins data if the list item is clicked
	self.selectMe = function(place) {

		var marker = place;

		for (var i = 0; i < self.markers().length; i++) {

			self.markers()[i].setAnimation(null);
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}

		//retrieve FS data and display in infoWindow
		getFS(place);

	};

}


//set markers for the beer gardens and apply knockout bindings

function callback(results, status) {


	if (status === google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
			createMarker(results[i]);
			vm.srchResults().push(results[i]);
		}
	}

	var bounds = new google.maps.LatLngBounds();

	for (var i = 0; i < vm.srchResults().length; i++) {
		bounds.extend(vm.srchResults()[i].geometry.location);
	}
	map.fitBounds(bounds);

	ko.applyBindings(vm);

}


function createMarker(place) {

	//basic marker creation function

	var marker = new google.maps.Marker({
		name: place.name,
		map: map,
		position: place.geometry.location
	});

	//filteredMarkers needs to initially contain all the marker information

	vm.markers().push(marker);
	vm.filteredMarkers().push(marker);

	//set click functionality on each marker - add animation and display infowindow with foursquare data

	google.maps.event.addListener(marker, 'click', function() {

		for (var i = 0; i < vm.markers().length; i++) {

			vm.markers()[i].setAnimation(null);
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}


		var that = this;

		getFS(that);



	});

}

//function for retrieving FS data via API and sending to Infowindow

var getFS = function(place) {

	var fsUrl = 'https://api.foursquare.com/v2/venues/search?client_id=MVIMITTX1BD0JRLTXC4HBDUC1S1BWMZH2BES15CNNPHSL2CP&client_secret=HPOJUZR2UZWWNKBRPKLSXF5Z2QSOOZXS3QVOOEUCK3ICHX3V&v=20140806&near=berlin, DE&query=' + place.name + '&limit=1&intent=browse'

	$.getJSON(fsUrl).done(function(data) {

		if (data.response.venues[0] !== undefined) {
			var content = data.response.venues[0].stats.checkinsCount;
			infowindow.close();
			infowindow = new google.maps.InfoWindow({
				content: '<h3>' + place.name + '</h3><h5>Check-ins on FourSquare: ' + content + '</h5>'
			});
		} else {
			infowindow.close();
			infowindow = new google.maps.InfoWindow({
				content: '<h3>' + place.name + '</h3><h5>No Foursquare data!</h5>'
			});
		}

		infowindow.open(map, place);

		//API fail message
	}).fail(function(e) {

		var content = 'No foursquare data available for this venue';
		infowindow.close();
		infowindow = new google.maps.InfoWindow({
			content: '<h3>' + content + '</h3>'
		});
		infowindow.close();
		infowindow.open(map, place);

	});
};