/**
 * This module controls dynamic additions to the widget stylesheet,
 * scoping rules as they're added.
 */
define(["lodash"], function(_) {
	var sElm;

	var themeRegex = /^\.(?:dark|transparent|darker)(?:\.(?:dark|transparent|darker))?\s/;

	var variationsRegex = /^(?:\.(?:maximized|minimized|tiny|small|medium|large|variable|settings|auth-required|error|permissions-request))+/;

	var prefixRule = function(prefix, rule) {
		if (rule.selectorText) {
			rule.selectorText = _.map(rule.selectorText.split(","), function(e) {
				e = e.trim();

				var themeSel = e.match(themeRegex),
					variationSel = e.match(variationsRegex);

				if (e.indexOf(":root") !== -1) {
					// We do a simple replace to allow things like ":root.tiny"
					return e.replace(":root", prefix);
				}
				// Theme styles are prefixed by their global selectors
				else if (themeSel && themeSel.length) {
					return themeSel[0] + prefix + " " + e.replace(themeRegex, "");
				}
				else if (variationSel && variationSel.length) {
					return variationSel[0] + prefix + " " + e.replace(variationsRegex, "");
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

		cssText: "",

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

			sElm.innerText = this.cssText + css.replace(/url\(\s*?['"]?(.*?)['"]?\s*\)/g, function($0, $1) {
				return 'url("' + new URL($1, location.origin + "/widgets/" + widget + "/").pathname + '")';
			});

			this.registeredWidgets[widget] = true;

			if (!isPrefixed) {
				var i = sheetLength - 1,
					prefix = ".widget." + widget,
					length = sElm.sheet.cssRules.length;

				while (++i < length) {
					this.cssText += "\n" + prefixRule(prefix, sElm.sheet.cssRules[i]);
				}
			}
		}
	};

	return CSSManager;
});