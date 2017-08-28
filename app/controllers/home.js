app.controller('HomeCtrl', function($rootScope, $scope, $http, $location, workflowAPI){
	$scope.cwl = undefined;
	$scope.dependencies = [];
	$scope.inputs = [];
	$scope.sensitiveOutputsTemp = [];
	$scope.sensitiveOutputs = [];
	$scope.workflow = "";

	function isNumeric(n) {
  		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	$scope.loadAnalysis = function() {
		if (!$scope.cwl) {
			alert("Choose a CWL file!")
			return;
		}

		for (var i = $scope.inputs.length - 1; i >= 0; i--) {
			if($scope.inputs[i]['isSensitive'] && !isNumeric($scope.inputs[i]['anonymityDegree'])) {
				alert("Set anonymity degree for '" + $scope.inputs[i]['input'] + "' input");
				return;
			}
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

	$scope.loadWorkflow = function() {
		if (!$scope.cwl) {
			alert("Choose a CWL file!")
			return;
		}

		$scope.inputs = [];
		$scope.dependencies = [];
		$scope.sensitiveOutputs = [];
		var reader = new FileReader();
		reader.onload = function() {
			$scope.workflow = reader.result;
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
				for(var k = 0; k < $scope.dependencies[j]['inputs'].length; k++) {
					if(sensitiveInputs[i]['input'] == $scope.dependencies[j]['inputs'][k].replace('this.inputs.', '')) {
						$scope.sensitiveOutputsTemp.push($scope.dependencies[j]);
					}
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
			var output = $scope.dependencies.find(function(obj) {
				return obj['output'] === distinctSensitiveOutputs[i];
			});

			var aD = 0;
			for (var j = 0; j < output['inputs'].length; j++) {
				var input = sensitiveInputs.find(function(obj) {
					return obj['input'] === output['inputs'][j].replace('this.inputs.', '');
				});

				if(input) {
					if(parseInt(input['anonymityDegree']) > aD) {
						aD = parseInt(input['anonymityDegree']);
					}
				}
			}

			$scope.sensitiveOutputs.push({'output':distinctSensitiveOutputs[i], 'anonymityDegree':aD});
		}
	}
})