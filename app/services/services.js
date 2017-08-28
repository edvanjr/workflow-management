//var url = 'https://frozen-escarpment-48755.herokuapp.com/';
var url = 'http://localhost:5000/';

app.factory('workflowAPI', function($http){

	var _inputs = function(workflow) {
		return $http.post(url + 'inputs', workflow);
	}

	var _dependencies = function(workflow) {
		return $http.post(url + 'dependencies', workflow);
	}

	return {
		inputs: function(workflow) {
			return _inputs(workflow);
		},
		dependencies: function(workflow) {
			return _dependencies(workflow);
		}
	};
})