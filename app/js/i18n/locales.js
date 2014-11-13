/**
 * The I18N locale loader.  This file will be replaced with a compiled
 * JSON module at build time so no processing has to be done on load.
 */
define(["lodash", "json!i18n/en.json", "json!i18n/widgets-en.json"], function(_) {
	var locales = _.rest(arguments);

	locales = _.zipObject(_.pluck(locales, "lang_code"), locales);

	_.mapValues(locales, function(e, i) {
		var lang = e.lang_code.split("-");

		if (lang[1] == "widgets" && locales[lang[0]]) {
			delete locales[e.lang_code];
			delete e.lang_code;

			_.assign(locales[lang[0]].widgets, e);
		}
	});

	return locales;
});