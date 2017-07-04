app.controller('HomeCtrl', function($rootScope, $scope, $http, $location){
	$scope.cwl = undefined;
	$scope.dependences = [];

	$scope.loadCWL = function() {
		if (!$scope.cwl) {
			alert("Choose a CWL file!")
			return;
		}

		$scope.dependences = [];
		var reader = new FileReader();
		reader.onload = function() {
			var nativeObject = YAML.parse(reader.result);
			Object.keys(nativeObject['outputs']).forEach(function(key,index) {
				var source = nativeObject['outputs'][key]['outputSource']
				if(source) {
					var stepOut = source.split('/')
					var step = nativeObject['steps'][stepOut[0]]
					if(step['out'].indexOf(stepOut[1]) != -1){
						Object.keys(step['in']).forEach(function(k,i) {
							if(step['in'][k].indexOf('/')) {
								var depend = step['in'][k].split('/')
								if(nativeObject['steps'][depend[0]]){
									$scope.dependences.push({'op1': 'outputs.' + key, 'op2': 'steps.' + depend[0]})
									$scope.$apply()
								}
							}
						})
					}
				}
			});
			
		}
		reader.readAsText($scope.cwl);
	}
})