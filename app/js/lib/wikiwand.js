/**
 * This is the Wikiwand search setup script
 */
define(function() {
	var WikiwandSearch = function(params) {
		if (typeof params == "undefined") {
			return console.log("wikiwand search widget, no params specified");
		}

		if (!params.key) {
			return console.log("wikiwand search widget - no key specified");
		}
		
		if (!params.container) {
			return console.log("wikiwand search widget - no container specified");
		}

		params.target = params.target || "_blank";
		params.placeholder = params.placeholder || "";
		
		params.cse = !!params.cse; // !! forces a boolean
		params.autoFocus = !!params.autoFocus;

		var container = typeof params.container === "string" ? document.getElementById(params.container) : params.container;

		var frame = document.createElement("IFRAME");

		var noConnection = params.noConnection || document.getElementById("noConnection");

		frame.setAttribute("id", "wikiwand_searchframe");
		frame.setAttribute("frameborder", "0");
		frame.style.opacity = 0;
		frame.style.width = "100%";
		frame.style.height = "100%";
		frame.setAttribute("src", "http://www.wikiwand.com/searchWidget?key=" + params.key + "&autoFocus=" + params.autoFocus +
			"&cse=" + params.cse + "&placeholder=" + encodeURIComponent(params.placeholder) + "&target=" + params.target);

		container.style.overflow = "hidden";
		container.style.backgroundColor = "white";
		container.style.display = "block";

		container.appendChild(frame);

		if (params.autoFocus) {
			frame.focus();
		}

		window.addEventListener("message", function(e) {
			if (e && e.data && e.data.height) {
				noConnection.style.display = "none";

				frame.style.opacity = 1;

				container.style.width = (e.data.width) + "px";
				container.style.height = (e.data.height) + "px";
			}
		}, false);
	};

	return WikiwandSearch;
});