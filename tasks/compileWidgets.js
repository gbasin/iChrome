/**
 * Prepares widgets to be built into the main JS file with the requirejs optimizer
 */
var _ = require("lodash"),
	path = require("path"),
	rework = require("rework"),
	reworkAssets = require("rework-assets");

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

				var themeRegex = /^\.(?:dark|transparent|darker)(?:\.(?:dark|transparent|darker))?\s/;

				var variationsRegex = /^(?:\.(?:maximized|minimized|tiny|small|medium|large|variable|settings|auth-required|error|permissions-request))+/;

				var css = rework(grunt.file.read(basePath + manifest.css))
					.use(reworkAssets({
						src: path.parse(basePath + manifest.css).dir,
						dest: path.resolve("build/assets"),
						prefix: "../assets/"
					}))
					.use(function(sheet) {
						sheet.rules = _.map(sheet.rules, function prefixRule(e) {
							if (e.selectors) {
								e.selectors = _.map(e.selectors, function(e) {
									e = e.trim();

									var themeSel = e.match(themeRegex),
										variationSel = e.match(variationsRegex);

									if (e.indexOf(":root") !== -1) {
										// We do a simple replace to allow things like ":root.tiny"
										return e.replace(":root", prefix);
									}
									// Theme styles are prefixed by their global selectors
									else if (themeSel && themeSel.length) {
										return themeSel[0] + prefix + " " + e.replace(themeRegex, "");
									}
									else if (variationSel && variationSel.length) {
										return variationSel[0] + prefix + " " + e.replace(variationsRegex, "");
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
					});

				widgetCSS +=
					"\n\n\n\n\n\n/*\n * / Widgets / " +
					(manifest.strings && manifest.strings.en && manifest.strings.en.name) +
					"\n */\n" +
					css.toString({
						indent: "\t"
					});


				// Remove the entry from the manifest so it doesn't get dynamically loaded
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
				"legacy: [].slice.call(arguments, " + widgets.length + ", -1)," +
				"widgets: [].slice.call(arguments, 0, " + widgets.length + ")" +
			"};" +
		"});");
	});
};