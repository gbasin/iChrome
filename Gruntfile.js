module.exports = function(grunt) {
	var _ = require("lodash"),
		path = require("path");

	grunt.initConfig({
		keys: grunt.file.readJSON("keys.json"),
		pkg: grunt.file.readJSON("package.json"),

		// Copy the extension to a new directory for building
		copy: {
			build: {
				cwd: "app",
				src: [ "**" ],
				dest: "build",
				expand: true
			}
		},

		i18n: {
			compile: {
				files: {
					"build/js/i18n/locales.js": ["build/js/i18n/locales/*/main.json", "build/js/i18n/locales/*/widgets.json"],
				},
				options: {
					outDir: "build"
				}
			}
		},

		descriptions: {
			compile: {
				src: ["build/js/i18n/locales/*/description.json"],
				dest: "descriptions"
			}
		},

		// Concat raw versions of templates into a temp file and replace the locale loader with a static precompiled version
		concat: {
			templates: {
				files: {
					"tmp/templates.js": ["build/templates/**/*.hjs"],
				},
				options: {
					process: function(src, pathname) {
						var name = path.relative(path.resolve("build/templates"), pathname).replace(/\\/g, "/");

						if (/^widgets\/([a-z\-_]*)\/template\.hjs$/.test(name)) {
							name = name.replace(/^widgets\/([a-z\-_]*)\/template\.hjs$/, "widgets.$1");
						}
						else if (/^widgets\/([a-z\-_]*)\/(.*)\.hjs$/.test(name)) {
							name = name.replace(/^widgets\/([a-z\-_]*)\/(.*)\.hjs$/, "widgets.$1.$2");
						}
						else {
							name = name.replace(".hjs", "");
						}

						return JSON.stringify(name) + ": " + JSON.stringify(src) + ",";
					}
				}
			}
		},

		// Precompile templates
		hogan: {
			compilebinder: {
				src: "binder.hjs",
				dest: "tmp/binder.js",
				options: { binderName: "bootstrap" }
			},

			compile: {
				src: "build/templates/**/*.hjs",
				dest: "build/js/core/templates.js",
				options: {
					binderPath: path.resolve("tmp/binder.js"),

					// This isn't the intended usage, but exposeTemplates is passed
					// straight to the binder template.  Because of that this works
					// as a lambda.
					exposeTemplates: function() {
						// The slice removes the last comma from the file
						return grunt.file.read(path.resolve("tmp/templates.js")).slice(0, -1);
					},

					nameFunc: function(e) {
						e = path.relative(path.resolve("build/templates"), e).replace(/\\/g, "/");

						if (/^widgets\/([a-z\-]*)\/template\.hjs$/.test(e)) {
							return e.replace(/^widgets\/([a-z\-]*)\/template\.hjs$/, "widgets.$1");
						}
						else if (/^widgets\/([a-z\-]*)\/(.*)\.hjs$/.test(e)) {
							return e.replace(/^widgets\/([a-z\-]*)\/(.*)\.hjs$/, "widgets.$1.$2");
						}
						else {
							return e.replace(".hjs", "");
						}
					}
				}
			}
		},

		// Replace the analytics ID with the production one
		"string-replace": {
			analytics: {
				src: "build/js/core/analytics.js",
				dest: "build/js/core/analytics.js",
				options: {
					replacements: [{
						pattern: "UA-41131844-4",
						replacement: "UA-41131844-2"
					}]
				}
			},
			apikeys: {
				files: {
					"build/widgets/": "build/widgets/*.js"
				},
				options: {
					replacements: [
						{
							pattern: /__API_KEY_([A-z0-9\-\.]+)__/ig,
							replacement: function(match, p1) {
								return grunt.config.get("keys." + p1);
							}
						}
					]
				}
			}
		},

		// Compile JS
		requirejs: {
			build: {
				options: {
					name: "app",
					optimize: "none",
					baseUrl: "build/js/",
					out: "build/js/app.js",
					mainConfigFile: "build/js/app.js"
				}
			},
			webstore: {
				options: {
					name: "app",
					baseUrl: "build/js/",
					out: "build/js/app.js",
					mainConfigFile: "build/js/app.js"
				}
			}
		},

		// Zips up the extension so it can be uploaded to the webstore
		compress: {
			webstore: {
				dest: "/",
				cwd: "build",
				src: ["**/*"],
				expand: true,
				options: {
					mode: "zip",
					archive: "webstore.zip"
				}
			}
		},

		// Clean up excess JS files
		clean: {
			all: ["tmp", "build/**/Thumbs.db", "build/templates", "build/widgets", "build/js/*", "!build/js/lib", "build/js/lib/*", "!build/js/lib/require.js", "!build/js/app.js", "!build/js/background.js"],
			webstore: ["build"]
		}
	});

	grunt.loadNpmTasks("grunt-hogan");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-string-replace");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-requirejs");


	/**
	 * Concatenates the locale json files into one requirejs object module.
	 *
	 * This task also copies over the webstore required locale keys to the Chrome locale files
	 *
	 * @api    public
	 */
	grunt.registerMultiTask("i18n", "Compile iChrome i18n files", function() {
		this.files.forEach(function(file) {
			var locales = file.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');

					return false;
				}
				else {
					return true;
				}
			}).map(function(filepath) {
				return grunt.file.readJSON(filepath);
			});


			locales = _.zipObject(_.pluck(locales, "lang_code"), locales);

			_.mapValues(locales, function(e, i) {
				var lang = e.lang_code.replace("-widgets", "");

				if (e.lang_code.indexOf("-widgets") !== -1 && locales[lang]) {
					delete locales[e.lang_code];
					delete e.lang_code;

					_.assign(locales[lang].widgets, e);
				}
			});


			var outDir = this.options().outDir;

			_.each(locales, function(e, i) {
				var data = {
					lang_code: {
						message: i
					},
					extDescription: {
						message: e.newtabDescription
					},
					extName: {
						message: e.newtabName
					},
					themes_upload_image: {
						message: e.themes.upload_image
					}
				};

				grunt.file.write(outDir + "/_locales/" + i.replace("-", "_") + "/messages.json", JSON.stringify(data));
			});

			grunt.file.write(file.dest, "define(" + JSON.stringify(locales) + ");");

			grunt.log.writeln('File "' + file.dest + '" created.');
		}.bind(this));
	});


	/**
	 * Compiles the webstore description in each language from the locale files
	 *
	 * @api    public
	 */
	grunt.registerMultiTask("descriptions", "Compile iChrome description files", function() {
		this.files.forEach(function(file) {
			var locales = file.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');

					return false;
				}
				else {
					return true;
				}
			}).map(function(filepath) {
				return grunt.file.readJSON(filepath);
			});

			_.each(locales, function(locale, i) {
				var name = locale.lang_code,
					desc = "";

				_.each(locale, function(e, i) {
					// Line 1 and the link are duplicated for new tab as newtab_line_1 and newtab_link
					if (["lang_code", "line_1", "link"].indexOf(i) == -1 && typeof e == "string") {
						desc += e + "\n\n";
					}
					else if (Array.isArray(e)) {
						desc += "✔ " + e.join("\n✔ ") + "\n\n";
					}
				});

				grunt.file.write(file.dest + "/" + name + ".txt", desc.trim());
			});

			grunt.log.writeln('Descriptions created under "' + file.dest + '".');
		}.bind(this));
	});


	/**
	 * Removes the Chrome extension key so it can be uploaded to the webstore
	 *
	 * @api    public
	 */
	grunt.registerTask("removekey", function() {
		var manifest = grunt.file.readJSON("build/manifest.json");

		delete manifest.key;

		grunt.file.write("build/manifest.json", JSON.stringify(manifest, true, "\t"));
	});


	grunt.registerTask("default", ["copy", "i18n:compile", "concat", "hogan:compilebinder", "hogan:compile", "string-replace", "requirejs:build", "clean:all"]);

	grunt.registerTask("webstore", ["copy", "descriptions", "i18n:compile", "concat", "hogan:compilebinder", "hogan:compile", "string-replace", "removekey", "requirejs:webstore", "clean:all", "compress", "clean:webstore"]);
};