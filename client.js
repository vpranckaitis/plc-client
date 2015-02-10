var plcApp = angular.module('plcApp', ['ngAnimate']);

plcApp.controller('Controller', function($scope, $http) {
	'use strict';
	
	$scope.path_prefix = '/plc';
	
	$scope.placesList = null;
	
	$scope.availableTypes = [
	                         {name : 'Mokykla', value : 'school'}, 
	                         {name : 'Naktinis klubas', value : 'night_club'},
	                         {name : 'Atrakcijonų parkas', value : 'amusement_park'},
	                         {name : 'Baras', value : 'bar'},
	                         {name : 'Kavinė', value : 'cafe'},
	                         {name : 'Kazino', value : 'casino'},
	                         {name : 'Parkas', value : 'park'},
	                         {name : 'Restoranas', value : 'restaurant'},
	                         {name : 'Stadionas', value : 'stadium'},
	                         {name : 'Universitetas', value : 'university'},
	                         ];
	
	$scope.userMarker = null;
	$scope.focusMarker = null;
	
	$scope.accessKey = null;
	$scope.lat = null;
	$scope.lon = null;
	$scope.lastUpdate = 0;
	
	$scope.loading = false;
	
	var cookie = document.cookie;
	var pattern = /key=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g;
	var matches = pattern.exec(cookie);
	if (matches != null) {
		$scope.accessKey = matches[1];
		console.log("key restored: " + matches[1]);
	}
	
	if (typeof(Number.prototype.toRad) === "undefined") {
		Number.prototype.toRad = function() {
			return this * Math.PI / 180;
		}
	}
	
	$scope.distance = function(lat1, lon1, lat2, lon2) {
			var R = 6371; // Radius of the earth in km
			var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
			var dLon = (lon2-lon1).toRad(); 
			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
					Math.sin(dLon/2) * Math.sin(dLon/2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c; // Distance in km
			return d;
		}
	
	$scope.getPlaces = function() {
		$scope.loading = true;
		var types = '';
		var typeCheckboxes = document.getElementById('type-selector').getElementsByTagName('input');
		for (var i = 0; i < typeCheckboxes.length; i++) {
			if (typeCheckboxes[i].checked) {
				types += (types.length == 0 ? '' : '|') + typeCheckboxes[i].name;
			}
		}
		if (types == '') {
			types = 'establishment';
		}
		$http.get($scope.path_prefix + '/places/' + $scope.accessKey + '?lat=' + $scope.lat + '&lon=' + $scope.lon + '&types=' + types).success(function(data, status) {
			$scope.loading = false;
			$scope.placesList = data.results;
		}).error(function(data){
			alert(data);
		});
	};

	$scope.updatePosition = function(key, lat, lon) {
		var location = {lat: lat, lon: lon};
		$http.put($scope.path_prefix + '/positions/' + key, {'location':location}).success(function(data, status) {
			if (status == 200) {
				$scope.data = data;
				$scope.lastUpdate = new Date().getTime();
			}
		}).catch(function(error) {
			if (error.status == 404) {
				console.error('key is invalid');
				$scope.getAccessKey();
			}
		});
	};
	
	$scope.getAccessKey = function() {
		$http.post($scope.path_prefix + '/positions/').success(function(data, status) {
			$scope.data = data;
			if (status == 201) {
				$scope.accessKey = data.key;
				$scope.updatePosition($scope.accessKey, $scope.lat, $scope.lon);
			}
		}).catch(function(error){
			console.error('Nepavyko gauti „access key“');
		});
	};
	
	$scope.onLocationUpdate = function(position) {
		$scope.$apply(function() {
			var lat = position.coords.latitude;
			var lon = position.coords.longitude;
			if ($scope.map == null) {
				$scope.initMap(lat, lon);
			}
			
			console.log(position.coords.latitude + " " + position.coords.longitude);
			
			if ($scope.lat == null || $scope.lon == null) {
				$scope.lat = lat;
				$scope.lon = lon;
			} else if ($scope.distance(lat, lon, $scope.lat, $scope.lon) > 0.010 
					|| (new Date().getTime() - $scope.lastUpdate) > 10000) {
				$scope.lat = lat;
				$scope.lon = lon;
				$scope.userMarker.setPosition(new google.maps.LatLng(lat, lon));
				$scope.updatePosition($scope.accessKey, $scope.lat, $scope.lon);
			}
			
			if ($scope.accessKey == null) {
				$scope.getAccessKey();
			}
			
		});
		
	};
	
	$scope.onLocationFail = function(positionError) {
		console.error(positionError);
	};
	
	$scope.initMap = function(lat, lon) {
		var mapOptions = {
				center: { lat: lat, lng: lon},
				zoom: 16
		};
		$scope.map = new google.maps.Map(document.getElementById('map-canvas'),
		            mapOptions);
		$scope.userMarker = new google.maps.Marker(
				{
					position: new google.maps.LatLng(lat, lon), 
					map: $scope.map, 
					title: "Tu"
				});
	}
	
	$scope.putFocusOnMap = function(lat, lon, title) {
		if ($scope.focusMarker == null) {
			$scope.focusMarker = new google.maps.Marker(
					{
						position: new google.maps.LatLng(lat, lon), 
						map: $scope.map, 
						title: title,
						animation: google.maps.Animation.DROP,
						icon: "marker.png"
					});
		}
		$scope.focusMarker.setPosition(new google.maps.LatLng(lat, lon));
		$scope.map.panTo(new google.maps.LatLng(lat, lon));
		$scope.map.setZoom(18);
	}
	
	window.addEventListener('unload', function(e) {
		var time = new Date();
		time.setTime(time.getTime() + 30 * 60 * 1000);
		document.cookie = 'key=' + $scope.accessKey + '; expires=' + time.toUTCString();
	});
	navigator.geolocation.watchPosition($scope.onLocationUpdate, $scope.onLocationFail);
});