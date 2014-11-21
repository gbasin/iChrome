/**
 * The I18N locale loader.  This file will be replaced with a compiled
 * JSON module at build time so no processing has to be done on load.
 */
define(
	[
		"lodash",

		"json!i18n/locales/bn/main.json", "json!i18n/locales/bn/widgets.json",
		"json!i18n/locales/ca/main.json", "json!i18n/locales/ca/widgets.json",
		"json!i18n/locales/cs/main.json", "json!i18n/locales/cs/widgets.json",
		"json!i18n/locales/da/main.json", "json!i18n/locales/da/widgets.json",
		"json!i18n/locales/de/main.json", "json!i18n/locales/de/widgets.json",
		"json!i18n/locales/en/main.json", "json!i18n/locales/en/widgets.json",
		"json!i18n/locales/es-ES/main.json", "json!i18n/locales/es-ES/widgets.json",
		"json!i18n/locales/fr/main.json", "json!i18n/locales/fr/widgets.json",
		"json!i18n/locales/hi/main.json", "json!i18n/locales/hi/widgets.json",
		"json!i18n/locales/hr/main.json", "json!i18n/locales/hr/widgets.json",
		"json!i18n/locales/id/main.json", "json!i18n/locales/id/widgets.json",
		"json!i18n/locales/it/main.json", "json!i18n/locales/it/widgets.json",
		"json!i18n/locales/ja/main.json", "json!i18n/locales/ja/widgets.json",
		"json!i18n/locales/nl/main.json", "json!i18n/locales/nl/widgets.json",
		"json!i18n/locales/pt-PT/main.json", "json!i18n/locales/pt-PT/widgets.json",
		"json!i18n/locales/ru/main.json", "json!i18n/locales/ru/widgets.json",
		"json!i18n/locales/sr/main.json", "json!i18n/locales/sr/widgets.json",
		"json!i18n/locales/tr/main.json", "json!i18n/locales/tr/widgets.json",
		"json!i18n/locales/uk/main.json", "json!i18n/locales/uk/widgets.json",
		"json!i18n/locales/zh-CN/main.json", "json!i18n/locales/zh-CN/widgets.json",
		"json!i18n/locales/zh-TW/main.json", "json!i18n/locales/zh-TW/widgets.json"
	],
	function(_) {
		var locales = _.rest(arguments);

		locales = _.zipObject(_.pluck(locales, "lang_code"), locales);

		_.mapValues(locales, function(e, i) {
			var lang = e.lang_code.replace("-widgets", "");

			if (e.lang_code.indexOf("-widgets") !== -1 && locales[lang]) {
				delete locales[e.lang_code];
				delete e.lang_code;

				_.assign(locales[lang].widgets, e);
			}
		});

		return locales;
	}
);