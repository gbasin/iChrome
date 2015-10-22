/**
 * Prepares widgets to be built into the main JS file with the requirejs optimizer
 */
var css = require("css"),
	_ = require("lodash"),
	path = require("path");

module.exports = function(grunt) {
	grunt.registerTask("compileWidgets", "Compile widgets", function() {
		var widgets = [],
			legacyWidgets = [];

		var assets = _.map(grunt.file.expand("build/widgets/*.js"), function(e) {
			var parsed = path.parse(e);

			legacyWidgets.push(parsed.name);

			return "w/" + parsed.name;
		});

		var manifests = grunt.file.expand("build/widgets/*/manifest.json");

		var widgetCSS = grunt.file.read("build/css/widgets.css");


		var locales = grunt.file.expand("build/js/i18n/locales/*/widgets.json", "!build/js/i18n/locales/en/widgets.json").map(function(filepath) {
			return grunt.file.readJSON(filepath);
		});

		locales = _.zipObject(_.pluck(locales, "lang_code"), locales);


		manifests.forEach(function(filepath, i) {
			var manifest = grunt.file.readJSON(filepath);

			var basePath = "build/widgets/" + manifest.name + "/";

			widgets.push(manifest.name);


			// Scope CSS
			if (manifest.css) {
				var prefix = ".widget." + manifest.name;

				var ast = css.parse(grunt.file.read(basePath + manifest.css));

				ast.stylesheet.rules = _.map(ast.stylesheet.rules, function prefixRule(e) {
					if (e.selectors) {
						e.selectors = _.map(e.selectors, function(e) {
							e = e.trim();

							// Dark styles are prefixed by the global dark selector
							if (e.slice(0, 5) === ".dark") {
								return ".dark " + prefix + e.substr(5);
							}
							else if (e.indexOf(":root") !== -1) {
								// We do a simple replace to allow things like ":root.tiny"
								return e.replace(":root", prefix);
							}
							else {
								return prefix + " " + e;
							}
						});
					}

					if (e.rules) {
						e.rules = _.map(e.rules, prefixRule);
					}

					return e;
				});

				widgetCSS +=
					"\n\n\n\n\n\n/*\n * / Widgets / " +
					(manifest.strings && manifest.strings.en && manifest.strings.en.name) +
					"\n */\n" +
					css.stringify(ast, {
						indent: "\t"
					});


				// Remove the entry from the manifest so it doesn't get loaded
				delete manifest.css;
			}


			// Copy translated strings from consolidated locale files. The locale files
			// are populated for translation in the widgetLocales tasks
			if (manifest.strings) {
				_.each(locales, function(e) {
					if (e[manifest.name] && !manifest.strings[e.lang_code.replace("-widgets", "")])  {
						manifest.strings[e.lang_code.replace("-widgets", "")] = e[manifest.name];
					}
				});
			}


			// Generate a list of assets to be included in the compiled JS file
			assets = assets.concat(_.map(manifest.views || [], function(e) {
				return "w/" + manifest.name + "/" + e;
			}).concat(_.map(manifest.templates || [], function(e) {
				return "widgetTemplate!w/" + manifest.name + "/" + e;
			})));

			if (manifest.model) {
				assets.push("w/" + manifest.name + "/" + manifest.model);
			}


			// Mark as compiled so the loader knows to register this widget's
			// CSS with the manager
			manifest.isCompiled = true;

			grunt.file.write(basePath + "manifest.json", JSON.stringify(manifest, true, "\t"));
		});

		grunt.option("widgetModules", assets);

		grunt.file.write("build/css/widgets.css", widgetCSS);


		// Create the entry-point module. This requires each of the widgets so
		// the registry can use them
		widgets = widgets.map(function(e) {
			return "json!w/" + e + "/manifest.json";
		});

		legacyWidgets = legacyWidgets.map(function(e) {
			return "w/" + e;
		});

		var deps = widgets.concat(legacyWidgets, [
			// These are used by various legacy widgets
			"lib/jquery.numberformatter", "lib/jquery.sortable"
		]);

		grunt.file.write("build/js/widgets/registry/index.js", "define(" + JSON.stringify(deps) + ", function() {" +
			"return {" +
				"legacy: [].slice.call(arguments, " + widgets.length + ", -2)," +
				"widgets: [].slice.call(arguments, 0, " + widgets.length + ")" +
			"};" +
		"});");
	});
};