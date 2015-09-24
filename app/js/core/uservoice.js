/**
 * Initializes UserVoice and it's autoprompts
 */
define(["storage/syncapi", "browser/api"], function(SyncAPI, Browser) {
	var initUV = function() {
		var uv = document.createElement("script");

		uv.async = true;
		uv.type = "text/javascript";
		uv.src = "https://widget.uservoice.com/YLT6rl3u3uU75IbSodIBw.js";

		var s = document.getElementsByTagName("script")[0];

		s.parentNode.insertBefore(uv, s);

		window.UserVoice.push(["set", {
			accent_color: "#448dd6",
			trigger_color: "white",
			screenshot_enabled: "false",
			trigger_background_color: "rgba(46, 49, 51, 0.6)"
		}]);


		var d = SyncAPI.getInfo();

		window.UserVoice.push(["identify", {
			email: d.user.email,
			name: (d.user.fname + " " + d.user.lname).trim() || undefined,
			type: Browser.app.newTab ? "New Tab" : "Main"
		}]);


		window.UserVoice.push(["autoprompt", {
			position: "toast"
		}]);
	};

	if (Math.random() * 5 < 1) {
		window.UserVoice = window.UserVoice || [];

		initUV();
	}

	return function() {
		if (!window.UserVoice) {
			window.UserVoice = [];

			initUV();
		}

		window.UserVoice.push(Array.prototype.slice.call(arguments));
	};
});