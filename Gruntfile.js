var _ = require('lodash');

/* globals module,process */
module.exports = function(grunt) {
	var path = require("path");

    if(!grunt.file.exists('keys.json')) {
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
				bitwise: true,
				latedef: true,
				unused: "vars",
				loopfunc: true,
				futurehostile: true,
				reporter: require("jshint-stylish")
			},
			all: ["**/*.js", "!node_modules/**/*.js", "!app/js/lib/*.js"]
		},

		// Copy the extension to a new directory for building
		copy: {
			build: {
				cwd: "app",
				src: [ "**" ],
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
				options: { binderName: "bootstrap" }
			},

			compile: {
				src: "build/templates/**/*.hjs",
				dest: "build/js/core/templates.js",
				options: {
					binderPath: path.resolve("tmp/binder.js"),

					nameFunc: function(e) {
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
			apikeys: {
				src: "build/js/app.js",
				dest: "build/js/app.js",
				options: {
					replacements: [{
						pattern: /__API_KEY_([A-z0-9\-\.]+)__/ig,
						replacement: function(match, p1) {
							return grunt.config.get("keys." + p1);
						}
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
			webstore: ["build"],
			travis: ["build", "webstore.zip", "descriptions"],
			testrun: ["app/js/app.unbuilt.js", "app/css/style.unbuilt.css", "app/assets"]
		}
	});

	grunt.loadNpmTasks("grunt-hogan");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-string-replace");
	grunt.loadNpmTasks("grunt-contrib-compress");

	grunt.loadTasks("tasks");

    grunt.registerTask("widgets", "Displays a summary of widgets.", function (arg) {
        // read all the manifests
        var widgets = _.map(grunt.file.expand("./app/widgets/**/manifest.json"), function (path) {
            var json = grunt.file.readJSON(path);
            return {
                id: json.id,
                name: json.name,
                legacy: false,
                path: path
            };
        });
        // read all the legacy widgets
        var legacy = _.map(grunt.file.expand("./app/widgets/*.js"), function (path) {
            var js = grunt.file.read(path);
            var id = js.match(/\sid:\s(\d+),/);
            var name = js.match(/\snicename:\s["'](\w+)["'],/);
            return {
                id: id ? ~~id[1] : 0,
                name: name ?  name[1] : "n/a",
                legacy: true,
                path: path
            }
        });
        // print a report
        _.each(_.sortBy(_.flatten([widgets, legacy]), "id"), function (manifest) {
            grunt.log.writeln(" id:" + manifest.id + " name:" + manifest.name + " legacy:" + manifest.legacy);
            grunt.log.verbose.writeln(manifest.path);
        });
    });


	grunt.registerTask("default", [
		"jshint:all",
		"copy:build",
		"string-replace:htmlmin",
		"compileWidgets",
		"cssmin",
		"i18n:compile",
		"hogan:compilebinder",
		"hogan:compile",
		"requirejs:build",
		"string-replace:analytics",
		"string-replace:apikeys",
		"clean:all"
	]);

	grunt.registerTask("webstore", [
		"jshint:all",
		"copy:build",
		"string-replace:htmlmin",
		"compileWidgets",
		"cssmin",
		"descriptions",
		"i18n:compile",
		"hogan:compilebinder",
		"hogan:compile",
		"removekey",
		"requirejs:webstore",
		"string-replace:analytics",
		"string-replace:apikeys",
		"clean:all",
		"compress",
		"clean:webstore"
	]);

	grunt.registerTask("travis", [
		"jshint:all",
		"copy:build",
		"string-replace:htmlmin",
		"compileWidgets",
		"cssmin",
		"descriptions",
		"i18n:compile",
		"hogan:compilebinder",
		"hogan:compile",
		"removekey",
		"requirejs:build",
		"string-replace:analytics",
		"clean:all",
		"compress",
		"clean:travis"
	]);


	grunt.registerTask("waitReset", function() {
		var done = this.async();

		var rl = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question("Press Enter to reset the app: ", function(answer) {
			rl.close();

			done();
		});
	});

	grunt.registerTask("testrun", [
		"jshint:all",
		"copy:build",
		"string-replace:htmlmin",
		"compileWidgets",
		"cssmin",
		"i18n:compile",
		"hogan:compilebinder",
		"hogan:compile",
		"requirejs:webstore",
		"string-replace:analytics",
		"string-replace:apikeys",
		"copy:testrun",
		"clean:all",
		"clean:webstore",
		"waitReset",
		"copy:resetTestrun",
		"clean:testrun"
	]);
};
