/**
 * Initializes UserVoice and it's autoprompts
 */
define(["core/uid"], function(uid) {
	window.UserVoice = window.UserVoice || [];

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

	window.UserVoice.push(["identify", {
		id: uid
	}]);

	window.UserVoice.push(["autoprompt", {
		position: "toast"
	}]);

	return function() {
		window.UserVoice.push(Array.prototype.slice.call(arguments));
	};
});