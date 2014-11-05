/**
 * Template renderer and cacher
 */
define(["hogan", "core/status", "core/templates.load"], function(Hogan, Status, templates) {
	var cache = templates.compiled || {},
		raw = templates.raw || {};

	var render = function(template, data, partials) {
		var compiled = cache[template];

		// Partials don't work with precompiled templates
		if (!compiled || partials) {
			if (raw[template]) {
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
		
		return compiled.render(data || {}, partials);
	};

	render.getRaw = function(template) {
		return raw[template];
	};

	return render;
});