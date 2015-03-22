/**
 * Configure requireJS.
 */
require.config({
	baseUrl: "js",
	paths: {
		"w": "../widgets",
		"text": "lib/text",
		"json": "lib/json",
		"hogan": "lib/hogan",
		"oauth": "lib/oauth",
		"lodash": "lib/lodash",
		"moment": "lib/moment",
		"jquery": "lib/jquery",
		"wikiwand": "lib/wikiwand",
		"jquery.serializejson": "lib/jquery.serializejson",
		"backbone.documentmodel": "lib/backbone.documentmodel",
		"backbone.viewcollection": "lib/backbone.viewcollection"
	},
	map: {
		"*": {
			"underscore": "lodash", // a Lodash Underscore build is not required for Backbone
			"backbone": "backbone.documentmodel" // DocumentModel returns Backbone, therefore it's a variation of backbone and "not" an extension
		},
		"backbone.documentmodel": {
			"backbone": "lib/backbone" // But it itself requires Backbone
		}
	},
	shim: {
		"lib/jquery.sortable": ["jquery"],
		"lib/jquery.spectrum": ["jquery"],
		"lib/jquery.numberformatter": ["jquery", "lib/jshashtable"]
	}
});

/**
 * Init.  This requires storage to start loading as early as possible.
 */
require(["core/render", "storage/storage", "modals/getting-started", "core/init"], function(render, storage, guide, app) {
	window.App = app;
});