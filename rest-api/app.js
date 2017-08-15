var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.listen(5000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/inputs', function(req, res) {
	var workflow = req.body;
	var inputs = [];
	Object.keys(workflow['inputs']).forEach(function(k, i) {
		inputs.push({'input': k, 'isSensitive': false})
	});
	res.json(inputs);
});

app.post('/dependencies', function(req, res) {
	var workflow = req.body;
	var dependencies = [];
	Object.keys(workflow['outputs']).forEach(function(key,index) {
		var source = workflow['outputs'][key]['outputSource']
		if(source) {
			var stepOut = source.split('/');
			var step = workflow['steps'][stepOut[0]];

			Object.keys(workflow['inputs']).forEach(function(k, i) {
				var stepIn = step['in'];
				if(stepIn[k]) {
					dependencies.push({'output': 'this.outputs.' + key, 'input': 'this.inputs.' + k})
				}
			});
		}
	});
	res.json(dependencies);
});

app.post('/sensitive-outputs', function(req, res) {
	var workflow = req.body;
	var dependencies = [];
	Object.keys(workflow['outputs']).forEach(function(key,index) {
		var source = workflow['outputs'][key]['outputSource']
		if(source) {
			var stepOut = source.split('/');
			var step = workflow['steps'][stepOut[0]];

			Object.keys(workflow['inputs']).forEach(function(k, i) {
				var stepIn = step['in'];
				if(stepIn[k]) {
					dependencies.push({'output': 'this.outputs.' + key, 'input': 'this.inputs.' + k})
				}
			});
		}
	});
	res.json(dependencies);
});