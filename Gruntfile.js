/**
 * @param {IGrunt} grunt
 */
/* globals module,process */
module.exports = function (grunt) {
	var path = require("path");

	if (!grunt.file.exists("keys.json")) {
		grunt.fail.fatal("Must create keys.json file before running grunt.");
	}

	grunt.initConfig({
		keys: grunt.file.readJSON("keys.json"),
		pkg: grunt.file.readJSON("package.json"),

		jshint: {
			options: {
				globals: {
					module: true, // module.exports is used by the imported Grunt tasks
					define: true,
					require: true,
					performance: true,
					devicePixelRatio: true
				},
				moz: true,
				devel: true,
				browser: true,
				nonstandard: true,

				noarg: true,
				undef: true,
				curly: true,
				eqeqeq: true,
				unused: true,
				bitwise: true,
				latedef: true,
				loopfunc: true,
				futurehostile: true,
				reporter: require("jshint-stylish")
			},
			all: ["**/*.js", "!node_modules/**/*.js", "!app/js/lib/*.js"]
		},

		// compile SASS files
		sass: {
			dev: {
				options: {
					indentWidth: 1,
					indentType: "tab",
					sourceComments: true,
					outputStyle: "expanded",
					sourceMap: "app/css/style.css.map"
				},
				src: ["app/**/*.scss"],
				expand: true,
				ext: ".css"
			},
			build: {
				options: {
					sourcemap: "none",
					outputStyle: "compressed"
				},
				src: ["build/**/*.scss"],
				expand: true,
				ext: ".css"
			}
		},

		// compile files for changes
		watch: {
			sass: {
				options: {
					atBegin: true,
					spawn: false,
					interrupt: true
				},
				files: [
					"app/**/*.scss",
					"app/**/*.sass"
				],
				tasks: [
					"sass:dev"
				]
			}
		},

		// Copy the extension to a new directory for building
		copy: {
			build: {
				cwd: "app",
				src: [
					"**",
					"!**/*.css.map"
				],
				dest: "build",
				expand: true
			},
			testrun: {
				files: [{
					src: "app/js/app.js",
					dest: "app/js/app.unbuilt.js"
				}, {
					src: "app/css/style.css",
					dest: "app/css/style.unbuilt.css"
				}, {
					src: "build/js/app.js",
					dest: "app/js/app.js"
				}, {
					src: "build/js/app.js.map",
					dest: "app/js/app.js.map"
				}, {
					src: "build/css/style.css",
					dest: "app/css/style.css"
				}, {
					expand: true,
					cwd: "build/assets",
					src: "**/*",
					dest: "app/assets"
				}]
			},
			resetTestrun: {
				files: [{
					src: "app/js/app.unbuilt.js",
					dest: "app/js/app.js"
				}, {
					src: "app/css/style.unbuilt.css",
					dest: "app/css/style.css"
				}]
			}
		},

		cssmin: {
			options: {
				roundingPrecision: -1,
				shorthandCompacting: false
			},
			all: {
				files: {
					"build/css/style.css": ["build/css/style.css"]
				}
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

		// Precompile templates
		hogan: {
			compilebinder: {
				src: "binder.hjs",
				dest: path.resolve("tmp/binder.js"),
				options: {binderName: "bootstrap"}
			},

			compile: {
				src: "build/templates/**/*.hjs",
				dest: "build/js/core/templates.js",
				options: {
					binderPath: path.resolve("tmp/binder.js"),

					nameFunc: function (e) {
						e = path.relative(path.resolve("build/templates"), e).replace(/\\/g, "/");

						if (/^widgets\/([a-z\-_]*)\/template\.hjs$/.test(e)) {
							return e.replace(/^widgets\/([a-z\-_]*)\/template\.hjs$/, "widgets.$1");
						}
						else if (/^widgets\/([a-z\-_]*)\/(.*)\.hjs$/.test(e)) {
							return e.replace(/^widgets\/([a-z\-_]*)\/(.*)\.hjs$/, "widgets.$1.$2");
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
			apiCalls: {
				src: "build/js/browser/chrome.js",
				dest: "build/js/browser/chrome.js",
				options: {
					replacements: [{
						pattern: "chrome.runtime.getManifest().version",
						replacement: JSON.stringify(grunt.file.readJSON("app/manifest.json").version)
					}]
				}
			},
			removeRequire: {
				src: "build/index.html",
				dest: "build/index.html",
				options: {
					replacements: [{
						pattern: '<script type="text/javascript" src="js/lib/require.js"></script>',
						replacement: ""
					}]
				}
			},
			apikeys: {
				src: "build/js/app.js",
				dest: "build/js/app.js",
				options: {
					replacements: [{
						pattern: /__API_KEY_([A-z0-9\-\.]+)__/ig,
						replacement: function (match, p1) {
							return grunt.config.get("keys." + p1);
						}
					}]
				}
			},
			cachebust: {
				src: "build/index.html",
				dest: "build/index.html",
				options: {
					replacements: [{
						pattern: /__NO_CACHE__/ig,
						replacement: "nocache=" + new Date().getTime()
					}]
				}
			},
			htmlmin: {
				src: "build/**/*.hjs",
				dest: "./",
				expand: true,
				options: {
					replacements: [{
						pattern: /\s*?\n\s*/g,
						replacement: " "
					}]
				}
			}
		},

		// Zips up the extension so it can be uploaded to the webstore
		compress: {
			webstore: {
				dest: "/",
				cwd: "build",
				src: [
					"**/*",
					"!**/*.scss",
					"!**/*.sass"
				],
				expand: true,
				options: {
					mode: "zip",
					archive: "webstore.zip"
				}
			}
		},

		// Clean up excess JS files
		clean: {
			all: ["tmp", "build/**/Thumbs.db", "build/templates", "build/widgets", "build/js/*", "!build/js/lib", "build/js/lib/*", "!build/js/lib/require.js", "!build/js/app.js", "!build/js/background.js", "build/**/*.scss"],
			webstore: ["build"],
			travis: ["build", "webstore.zip", "descriptions"],
			testrun: ["app/js/app.unbuilt.js", "app/js/app.js.map", "app/css/style.unbuilt.css", "app/assets"]
		}
	});

	grunt.loadNpmTasks("grunt-hogan");
	grunt.loadNpmTasks("grunt-sass");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-string-replace");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.loadTasks("tasks");

	grunt.registerTask("default", [
		"jshint:all",
		"copy:build",
		"sass:build",
		"string-replace:htmlmin",
		"compileWidgets",
		"cssmin",
		"i18n:compile",
		"hogan:compilebinder",
		"hogan:compile",
		"string-replace:analytics",
		"string-replace:apiCalls",
		"requirejs:build",
		"string-replace:apikeys",
		"string-replace:removeRequire",
		"string-replace:cachebust",
		"clean:all"
	]);

	grunt.registerTask("webstore", [
		"jshint:all",
		"copy:build",
		"sass:build",
		"string-replace:htmlmin",
		"compileWidgets",
		"cssmin",
		"descriptions",
		"i18n:compile",
		"hogan:compilebinder",
		"hogan:compile",
		"removekey",
		"string-replace:analytics",
		"string-replace:apiCalls",
		"requirejs:webstore",
		"string-replace:apikeys",
		"string-replace:removeRequire",
		"string-replace:cachebust",
		"clean:all",
		"compress",
		"clean:webstore"
	]);

	grunt.registerTask("travis", [
		"jshint:all",
		"copy:build",
		"sass:build",
		"string-replace:htmlmin",
		"compileWidgets",
		"cssmin",
		"descriptions",
		"i18n:compile",
		"hogan:compilebinder",
		"hogan:compile",
		"removekey",
		"string-replace:analytics",
		"string-replace:apiCalls",
		"requirejs:build",
		"string-replace:removeRequire",
		"string-replace:cachebust",
		"clean:all",
		"compress",
		"clean:travis"
	]);


	grunt.registerTask("waitReset", function () {
		var done = this.async();

		var rl = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question("Press Enter to reset the app: ", function() {
			rl.close();

			done();
		});
	});

	grunt.registerTask("testrun", [
		"jshint:all",
		"copy:build",
		"sass:build",
		"string-replace:htmlmin",
		"compileWidgets",
		"cssmin",
		"i18n:compile",
		"hogan:compilebinder",
		"hogan:compile",
		"string-replace:analytics",
		"string-replace:apiCalls",
		"requirejs:testrun",
		"string-replace:apikeys",
		"string-replace:cachebust",
		"copy:testrun",
		"clean:all",
		"clean:webstore",
		"waitReset",
		"copy:resetTestrun",
		"clean:testrun"
	]);
};
