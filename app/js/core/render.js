/**
 * Template renderer and cacher
 */
define(["lodash", "hogan", "core/status", "i18n/i18n", "core/templates"], function(_, Hogan, Status, Translate, templates) {
	var cache = templates.compiled || {},
		raw = templates.raw || {},
		i18n = Translate.getAll();

	var render = function(template, data, partials) {
		var compiled = cache[template];

		// Partials don't work with precompiled templates
		if (!compiled || partials) {
			if (typeof raw[template] !== "undefined") {
				try {
					compiled = cache[template] = Hogan.compile(raw[template]);
				}
				catch (e) {
					Status.error("An error occurred while trying to render the " + template + " template!");
				}
			}

			if (!compiled) {
				return 'Template "' + template + '" not found!';
			}
		}

		data = _.clone(data || {});

		if (!data.i18n) data.i18n = i18n;
		
		return compiled.render(data, partials);
	};

	render.getRaw = function(template) {
		return raw[template];
	};

	return render;
});