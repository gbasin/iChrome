/**
 * I18N
 * 
 * This system uses custom JSON files for simplicity and loads them using
 * the JSON plugin. They're then pre-processed and inlined at build time
 * using a system similar to the templates.
 */
define(["lodash", "i18n/locales"], function(_, locales) {
	// This gets the language code from the Chrome-selected file, it effectively uses
	// Chrome's language code parsing while using its own internal locale files
	var language = chrome.i18n.getMessage("lang_code");


	/**
	 * Gets a string in the chosen language and returns it, optionally with interpolated variables
	 *
	 * @api    private
	 * @param  {String}   id     The key of the string to get
	 * @param  {...*}     [data] The data to interpolate
	 * @return {String}          The returned string, interpolated if variables were provided
	 */
	var translate = function(id) {
		id = id || "";

		var data = _.rest(arguments);

		try {
			// Adapted from http://stackoverflow.com/a/6394168/900747
			var string = _.reduce(
				id.split("."),
				function(obj, i) { return obj[i]; },
				locales[language]
			) || "";


			if (!string) {
				string = _.reduce(
					id.split("."),
					function(obj, i) { return obj[i]; },
					locales.en
				) || "";
			}


			// This replaces every instance of %s in the string one-by-one with
			// it's match from the arguments until none are left
			// 
			// It's simple and a bit blunt but it'll only rarely, if ever, get used.
			while (data.length) {
				string = string.replace("%s", data.shift());
			}


			return string;
		}
		catch (e) {
			// TODO: Remove before commit
			if (id.indexOf("widgets.common") == 0 || id.indexOf("widgets") == -1) console.error("Tried to find string " + id + " and failed");

			return "";
		}
	};


	/**
	 * Gets the entire object for a particular language.  Used by the render function to expose i18n strings to templates
	 *
	 * @api    private
	 * @param  {String} [lang] The language code to retrieve for, defaults to the current language
	 * @return {Object}        The language object
	 */
	translate.getAll = function(lang) {
		return locales[lang || language];
	};

	return translate;
});