/**
 * Removes the Chrome extension key so it can be uploaded to the webstore
 */
module.exports = function(grunt) {
	grunt.registerTask("removekey", function() {
		var manifest = grunt.file.readJSON("build/manifest.json");

		delete manifest.key;

		grunt.file.write("build/manifest.json", JSON.stringify(manifest, true, "\t"));
	});
};