// This file is just added for convenience so this repository can be
// directly checked out into a project's deps folder

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./lib/coop'], function (coop) {
	return coop;
});
