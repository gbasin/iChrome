module.exports = function(grunt) {
	var _ = require("lodash"),
		path = require("path");

	grunt.initConfig({
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
					"build/js/i18n/locales.js": ["build/js/i18n/*.json"],
				},
				options: {
					outDir: "build"
				}
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

						if (/^widgets\/([a-z\-]*)\/template\.hjs$/.test(name)) {
							name = name.replace(/^widgets\/([a-z\-]*)\/template\.hjs$/, "widgets.$1");
						}
						else if (/^widgets\/([a-z\-]*)\/(.*)\.hjs$/.test(name)) {
							name = name.replace(/^widgets\/([a-z\-]*)\/(.*)\.hjs$/, "widgets.$1.$2");
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
			all: ["tmp", "build/**/Thumbs.db", "build/templates", "build/widgets", "build/js/*/", "build/js/**/*.js", "!build/js/app.js"],
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
				var lang = e.lang_code.split("-");

				if (lang[1] == "widgets" && locales[lang[0]]) {
					delete locales[e.lang_code];
					delete e.lang_code;

					_.assign(locales[lang[0]].widgets, e);
				}
			});


			var outDir = this.options().outDir;

			_.each(locales, function(e, i) {
				var data = {
					lang_code: {
						message: i
					},
					extDescription: {
						message: e.extDescription
					},
					extName: {
						message: e.extName
					}
				};

				grunt.file.write(outDir + "/_locales/" + i + "/messages.json", JSON.stringify(data));
			});

			grunt.file.write(file.dest, "define(" + JSON.stringify(locales) + ");");

			grunt.log.writeln('File "' + file.dest + '" created.');
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

	grunt.registerTask("webstore", ["copy", "i18n:compile", "concat", "hogan:compilebinder", "hogan:compile", "string-replace", "removekey", "requirejs:webstore", "compress", "clean"]);
};