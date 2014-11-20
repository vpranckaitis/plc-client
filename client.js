var plcApp = angular.module('plcApp', ['ngAnimate']);

plcApp.controller('Controller', function($scope, $http) {
	'use strict';
	
	$scope.placesList = null;
	$scope.accessKey = null;
	
	$scope.availableTypes = [{name : 'Mokykla', value : 'school'}, {name : 'Naktinis klubas', value : 'night_club'}];
	
	$scope.doGet = function() {
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
		$http.get('http://localhost:8080/places/' + $scope.accessKey + '?lat=54.905451&lon=23.957689&types=' + types).success(function(data) {
			//$scope.data.status = data.status;
			$scope.placesList = data.results;
			var mapOptions = {
					center: { lat: -34.397, lng: 150.644},
					zoom: 8
			};
			$scope.map = new google.maps.Map(document.getElementById('map-canvas'),
			            mapOptions);

		}).error(function(data){
			alert(data);
		});
	};
	
	$scope.doPost = function() {
		$http.post('http://localhost:8080/positions/').success(function(data) {
			$scope.data = data;
			if (data.status == '201') {
				$scope.accessKey = data.key;
			}
		}).error(function(data){
			alert(data);
		});
	};
	
	$scope.doPut = function() {
		var location = {lat : 54.904193 + (Math.random() - 0.5) / 100, lon : 23.958536 + (Math.random() - 0.5) / 100};
		$http.put('http://localhost:8080/positions/' + $scope.accessKey, {'location':location}).success(function(data) {
			$scope.data = data;
		}).error(function(data){
			alert(data);
		});
	};
	
	$scope.doDelete = function() {
		$http.delete('http://localhost:8080/positions/' + $scope.accessKey).success(function(data) {
			$scope.data = data;
			$scope.accessKey = null;
		}).error(function(data){
			alert(data);
		});
	};
	
	$scope.doDatabase = function() {
		$http.get('http://localhost:9200/positions/_search?size=1000').success(function(data) {
			$scope.data = data.hits.hits;
		}).error(function(data){
			alert(data);
		});
	};
	
	$scope.putFocusOnMap = function(lat, lon) {
		$scope.map.panTo(new google.maps.LatLng(lat, lon));
		$scope.map.setZoom(18);
	}
});