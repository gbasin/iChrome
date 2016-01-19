/**
 * Extracts strings from widgets so they can be uploaded to Crowdin in a single file
 */
module.exports = function(grunt) {
	grunt.registerTask("widgetLocales", "Processes widget strings", function() {
		var manifests = grunt.file.expand("app/widgets/*/manifest.json");

		var localeFile = grunt.file.readJSON("app/js/i18n/locales/en/widgets.json");


		manifests.forEach(function(filepath) {
			var manifest = grunt.file.readJSON(filepath);

			// Copy translated strings to consolidated locale files.
			if (manifest.strings && !localeFile[manifest.name]) {
				localeFile[manifest.name] = manifest.strings.en;
			}
		});

		grunt.file.write("widgets.json", JSON.stringify(localeFile, true, "\t"));
	});
};