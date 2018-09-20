/**
 * Compiles the webstore description in each language from the locale files
 */
var _ = require("lodash");

module.exports = function(grunt) {
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

			_.each(locales, function(locale) {
				var name = locale.lang_code,
					desc = "";

				_.each(locale, function(e, i) {
					// Line 1 and the link are duplicated for new tab as newtab_line_1 and newtab_link
					if (["lang_code", "line_1", "link"].indexOf(i) === -1 && typeof e === "string") {
						desc += e + "\r\n\r\n";
					}
					else if (Array.isArray(e)) {
						desc += "✔ " + e.join("\r\n✔ ") + "\r\n\r\n";
					}
				});

				grunt.file.write(file.dest + "/" + name + ".txt", desc.trim());
			});

			grunt.log.writeln('Descriptions created under "' + file.dest + '".');
		}.bind(this));
	});
};