var plcApp = angular.module("plcApp", ["ngAnimate"]);

plcApp.controller("Controller", function($scope, $http) {
	//$scope.all = "placeholder";
	
	//$scope.doGet();
	
	$scope.doGet = function() {
		$http.get("http://localhost:8080/places/").success(function(data) {
			$scope.data = data;
		}).error(function(data){
			alert(data);
		});
	};
	
	$scope.doPost = function() {
		$http.post("http://localhost:8080/positions/").success(function(data) {
			$scope.data = data;
		}).error(function(data){
			alert(data);
		});
	};
	
	$scope.doPut = function() {
		$http.put("http://localhost:8080/positions/").success(function(data) {
			$scope.data = data;
		}).error(function(data){
			alert(data);
		});
	};
	
	$scope.doDelete = function() {
		$http.delete("http://localhost:8080/positions/").success(function(data) {
			$scope.data = data;
		}).error(function(data){
			alert(data);
		});
	};
	
	$scope.doDatabase = function() {
		$http.get("http://localhost:9200/positions/_search?size=1000").success(function(data) {
			$scope.data = data.hits.hits;
		}).error(function(data){
			alert(data);
		});
	};
});