app.controller('HomeCtrl', function($rootScope, $scope, $http, $location, workflowAPI){
	$scope.cwl = undefined;
	$scope.dependencies = [];
	$scope.inputs = [];
	$scope.sensitiveOutputsTemp = [];
	$scope.sensitiveOutputs = [];

	$scope.loadAnalysis = function() {
		if (!$scope.cwl) {
			alert("Choose a CWL file!")
			return;
		}

		$scope.dependencies = [];
		$scope.sensitiveOutputs = [];
		$scope.sensitiveOutputsTemp = [];
		var reader = new FileReader();
		reader.onload = function() {
			var nativeObject = YAML.parse(reader.result);

			workflowAPI.dependencies(nativeObject).then(
				function successCallback(response){
					$scope.dependencies = response.data;
					$scope.loadSensitiveOutputs();
					$scope.anonymityDegree();
				},
				function errorCallback(response) {
					console.log(response);
				}
			);

		}
		reader.readAsText($scope.cwl);
	}

	$scope.loadInputs = function() {
		if (!$scope.cwl) {
			alert("Choose a CWL file!")
			return;
		}

		$scope.inputs = [];
		$scope.dependencies = [];
		$scope.sensitiveOutputs = [];
		var reader = new FileReader();
		reader.onload = function() {
			var workflow = YAML.parse(reader.result);
			workflowAPI.inputs(workflow).then(
				function successCallback(response){
					$scope.inputs = response.data;
				},
				function errorCallback(response) {
					console.log(response);
				}
			);


		}
		reader.readAsText($scope.cwl);
	}

	$scope.loadSensitiveOutputs = function() {
		var sensitiveInputs = $scope.inputs.filter(function(obj) {
			if(obj['isSensitive']) 
				return obj;
		});

		for(var i = 0; i < sensitiveInputs.length; i++) {
			for(var j = 0; j < $scope.dependencies.length; j++) {
				if(sensitiveInputs[i]['input'] == $scope.dependencies[j]['input'].replace('this.inputs.', '')) {
					$scope.sensitiveOutputsTemp.push($scope.dependencies[j]);
				}
			}
		}
	}

	$scope.anonymityDegree = function() {

		var sensitiveInputs = $scope.inputs.filter(function(input) {
			if(input['isSensitive']) {
				var a = input['input'];
				return a;
			}
		})

		var distinctSensitiveOutputs = $scope.sensitiveOutputsTemp.map(function(out) { return out['output']});
		distinctSensitiveOutputs = distinctSensitiveOutputs.filter(function(v,i) { return distinctSensitiveOutputs.indexOf(v) == i; });

		for (var i = distinctSensitiveOutputs.length - 1; i >= 0; i--) {
			var count = $scope.sensitiveOutputsTemp.filter(function(output) {
				if(output['output'] === distinctSensitiveOutputs[i]) {
					return output;
				}
			}).length

			$scope.sensitiveOutputs.push({'output':distinctSensitiveOutputs[i], 'anonymityDegree':count});
		}
	}
})