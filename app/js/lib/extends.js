/**
 * These are various prototype and jQuery extends and utilities
 */
define(["jquery"], function($) {
	Number.prototype.abbr = function(min, precision) {
		var value = this,
			newValue = value,
			min = min || 1000,
			precision = precision || 3;

		if (value >= min) {
			var suffixes = ["", "K", "M", "B","T"],
				suffixNum = Math.floor((("" + parseInt(value)).length - 1) / 3),
				shortValue = "";

			for (var length = precision; length >= 1; length--) {
				shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(length));

				var dotLessShortValue = (shortValue + "").replace(/[^A-z0-9 ]+/g, "");

				if (dotLessShortValue.length <= precision) break;
			}

			if (shortValue % 1 != 0) shortNum = shortValue.toFixed(1);

			newValue = shortValue + suffixes[suffixNum];
		}
		else {
			newValue = newValue.toLocaleString();
		}

		return newValue;
	};

	Number.prototype.pad = function() {
		var num = this.toString();

		return (num.length === 1) ? "0" + num : num;
	};

	$.animateNumber = function(from, to, speed, elm, prefix) {
		elm = $(elm)[0];

		precision = (to + "").split(".")[1].length;

		prefix = prefix || "";

		$({
			currNum: from
		}).animate({
			currNum: to
		}, {
			duration: speed,
			step: function() {
				elm.innerHTML = prefix + this.currNum.toFixed(precision);
			},
			complete: function() {
				elm.innerHTML = prefix + to.toFixed(precision);
			}
		});
	};


	// This $.extend alternative is 11.3 times faster than jQuery's native one, but it's buggy, rework it later
	/*(function() {
		function localExtend(target, source) {
			var sourceMeta, tCurr, sCurr, key;

			for (key in source) {
				if (source.hasOwnProperty(key)) {
					tCurr = target[key];
					sCurr = source[key];
					sourceMeta = setMeta(sCurr);

					if (sCurr !== tCurr && sourceMeta && setMeta(tCurr) === sourceMeta) {
						target[key] = extend(tCurr, sCurr);
					}
					else if (0 !== sourceMeta) {
						target[key] = sCurr;
					}
				}
				else {
					break;
				}
			}

			return target;
		}

		var setMeta = function(value) {
			if (void 0 === value) {
				return 0;
			}

			if ("object" !== typeof value) {
				return false;
			}

			return true;
		};

		window.extend = function(target) {
			var args = arguments,
				l = args.length;

			for (var i = 1; i < l; i++){
				localExtend(target, args[i]);
			}

			return target;
		};
	})();*/


	$.unextend = function(obj1, obj2) {
		var newObj = {};

		for (var k in obj2) {
			var e = obj2[k],
				c = obj1[k];

			if (typeof e === "undefined") {
				continue;
			}
			else if (typeof c === "undefined") {
				newObj[k] = e;
			}
			else if (e === null) {
				newObj[k] = e;
			}
			else if (typeof e === "object" && typeof e.length === "number" && JSON.stringify(e) !== JSON.stringify(c)) {
				newObj[k] = e;
			}
			else if (typeof e === "object" && typeof e.length === "undefined" && JSON.stringify(e) !== JSON.stringify(c)) {
				newObj[k] = $.unextend(c, e);
			}
			else if (e.toString() !== c.toString()) {
				newObj[k] = e;
			}
		}

		return newObj;
	};

	String.prototype.parseUrl = function() {
		if (this.indexOf("://") === 0) {
			return "https" + this;
		}
		else if (this.indexOf("data:") === 0 || this.indexOf("filesystem:") === 0 || this.indexOf("blob:") === 0) {
			return this.toString();
		}
		else if (this.indexOf("://") === -1) {
			return "http://" + this;
		}
		else {
			return this.toString();
		}
	};


	/**
	 * Extracted and modified from Lodash V3.0.0-pre: https://github.com/lodash/lodash/blob/master/dist/lodash.js#L7915
	 *
	 * @license
	 * Lo-Dash 3.0.0-pre <http://lodash.com/>
	 * Copyright 2012-2014 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.6.0 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	String.prototype.repeat = function(n) {
		if (n < 1 || !this || !isFinite(n)) {
			return "";
		}

		var str = this.toString(),
			result = "";

		do {
			if (n % 2) {
				result += str;
			}

			n = Math.floor(n / 2);

			str += str;
		} while (n);

		return result;
	};
});