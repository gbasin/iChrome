/**
 * This module controls dynamic additions to the widget stylesheet,
 * scoping rules as they're added.
 */
define(["lodash"], function(_) {
	var sElm;

	var prefixRule = function(prefix, rule) {
		if (rule.selectorText) {
			rule.selectorText = _.map(rule.selectorText.split(","), function(e) {
				e = e.trim();

				// Dark styles are prefixed by the global dark selector
				if (e.slice(0, 5) === ".dark") {
					return ".dark " + prefix + e.substr(5);
				}
				else if (e.indexOf(":root") !== -1) {
					// We do a simple replace to allow things like ":root.tiny"
					return e.replace(":root", prefix);
				}
				else {
					return prefix + " " + e;
				}
			}).join(", ");
		}
		else if (rule.cssRules) {
			_.each(rule.cssRules.length, _.bind(prefixRule, this, prefix));
		}

		return rule.cssText;
	};

	var CSSManager = {
		registeredWidgets: [],

		register: function(widget, css, isPrefixed) {
			// No stylesheet exists yet, create one. We use this method so we can
			// avoid all DOM lookups in built versions
			if (!sElm) {
				sElm = document.createElement("style");

				document.head.appendChild(sElm);
			}

			// Get the current sheet length so we know where to start prefixing
			// from
			var sheetLength = sElm.sheet.cssRules.length;

			sElm.appendChild(document.createTextNode(css));

			this.registeredWidgets[widget] = true;

			if (!isPrefixed) {
				var i = sheetLength - 1,
					prefix = ".widget." + widget,
					length = sElm.sheet.cssRules.length;

				while (++i < length) {
					prefixRule(prefix, sElm.sheet.cssRules[i]);
				}
			}
		}
	};

	return CSSManager;
});