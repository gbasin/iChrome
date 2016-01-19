var _ = require('lodash');

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
	grunt.task.registerTask("widgets", "Displays a summary of widgets.", function() {
		// read all the manifests
		var widgets = _.map(grunt.file.expand("./app/widgets/**/manifest.json"), function(path) {
			var json = grunt.file.readJSON(path);
			return {
				id: json.id,
				name: json.name,
				legacy: false,
				path: path
			};
		});

		// read all the legacy widgets
		var legacy = _.map(grunt.file.expand("./app/widgets/*.js"), function(path) {
			var js = grunt.file.read(path);
			var id = js.match(/\sid:\s(\d+),/);
			var name = js.match(/\snicename:\s["'](\w+)["'],/);
			return {
				id: id ? parseInt(id[1]) : 0,
				name: name ? name[1] : "n/a",
				legacy: true,
				path: path
			};
		});

		// print a report
		_.each(_.sortBy(_.flatten([widgets, legacy]), "id"), function(manifest) {
			grunt.log.writeln(" id:" + manifest.id + " name:" + manifest.name + " legacy:" + manifest.legacy);
			grunt.log.verbose.writeln(manifest.path);
		});
	});
};