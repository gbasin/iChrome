var s = document.createElement("script");

s.textContent = "(" + (function() {
	// Ignore eval
	/* jshint -W060 */
	/* jshint -W061 */

	var oEval = window.eval,
		oOpen = window.open;

	window.eval = function(js) {
		if (js === "win.frameElement.src") {
			document.write(
				"<style>" +
					".vCxOb," +
					".Mtd4hb," +
					".pQCS0d," +
					".ubVkr .pxQCIb," +
					".mkkSdf.bFjUmb-Wvd9Cc { display: none!important; }" +

					".rwnykc { line-height: 4rem!important; }" +

					".T97Lje { margin: 1rem .8rem!important; }" +

					".jjooHc { padding: 1.3rem!important; }" +

					".F0D56 { min-height: 7rem!important; }" +

					".T6C1sc .FXKA9c { height: 5.5rem; padding-top: 0; }" +

					".CWxdVe.bpmy9c { min-width: 5rem; }" +
				"</style>" +
				"<xmp style=\"display:none\">"
			);

			throw "Framebusting busted";
		}
		else {
			return oEval.apply(window, arguments);
		}
	};

	/*jshint +W060 */
	/*jshint +W061 */

	window.open = function(url, target) {
		if (url === window.location && (target === "_top" || target === "_parent")) {
			throw "Framebusting busted";
		}
		else {
			return oOpen.apply(window, arguments);
		}
	};
}).toString() + ")()";

document.documentElement.appendChild(s);