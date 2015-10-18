/**
 * This module controls dynamic additions to the widget stylesheet,
 * scoping rules as they're added.
 */
define(["lodash"], function(_) {
	var sElm;

	var rootRegex = /[\ ]+:root/gi;

	var prefixRule = function(prefix, rule) {
		if (rule.selectorText) {
			rule.selectorText = (prefix + " " + rule.selectorText.split(",").join(", " + prefix)).replace(rootRegex, "");
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