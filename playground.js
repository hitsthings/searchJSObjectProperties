var sandbox;
function go() {

	sandbox = document.getElementById('sandbox');

	var term = document.getElementById('term');

	var container = document.getElementById('container');

	var evaledObjMsg = document.getElementById('evaluatedObj');

	logHolder = document.createElement('ol');
	sandbox.appendChild(logHolder);

	var containerObj, containerName;

	function run() {
		log.clear();
		var results = findPropsByName(term.value, containerObj, containerName);
		(!results || !results.length) && (results = ["No results."]);
		log.apply(null, results);
	}

	term.onchange = function() {
		run();
	};

	container.onchange = function() {
		if (!container.value) {
			evaledObjMsg.innerText = '';
			containerObj = undefined;
			containerName = undefined;
		} else {
			var x;
			try {
				eval("x = " + container.value + ";");
				evaledObjMsg.innerText = x;
				containerName = '(' + container.value + ')';
			} catch(e) {
				evaledObjMsg.innerText = e;
				containerName = undefined;
			}

			containerObj = x;
		}

		run();
	};
}

var logHolder;
function log () {
	var args = [].slice.call(arguments);

	args.forEach(function(arg) {
		var node = document.createElement('li');
		node.innerText = arg;
		logHolder.appendChild(node);
	});

	while(logHolder.childNodes.length > 500) {
		logHolder.removeChild(logHolder.firstChild);
	}
}
log.clear = function() {
	logHolder.innerHTML = '';
}

function findPropsByName(name, root, rootName) {
	root = root || this;
	var internalPath = [ rootName || 'GLOBAL' ];
	var internalVisited = [];

	return findPropByNameInternal(name, root, internalPath, internalVisited, false, []);
}

function findPropByName(name, root, rootName) {
	root = root || this;
	var internalPath = [ rootName || 'GLOBAL' ];
	var internalVisited = [];

	return findPropByNameInternal(name, root, internalPath, internalVisited, false, null);
}
function findPropByNameInternal(name, root, internalPath, internalVisited, shouldLog, results) {
	internalVisited = internalVisited.slice();
	internalVisited.push(root);

	for(var key in root) if (!~internalVisited.indexOf(root[key])) {
		var pathSoFar = internalPath.slice();
		pathSoFar.push(key);
		shouldLog && log(pathSoFar.join('.'));

		if (pathSoFar.length > 7) {
			shouldLog && log('stopping');
			continue;
		}

		if (~key.indexOf(name)) {
			if (results) {
				results.push(pathSoFar.join('.'));
			} else return pathSoFar;
		}
		if (
			{ 'object' : 1, 'regexp': 1, 'function' : 1}[typeof root[key]] &&
			!(root[key] instanceof HTMLElement) &&
			!/^d+$/.test(key)) {
			var pathIfFound = findPropByNameInternal(name, root[key], pathSoFar, internalVisited, shouldLog, results);
			if (pathIfFound && ! results) {
				return pathIfFound;
			}
		}
	}
	return results || null;
}