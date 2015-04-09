document.head.innerHTML =
	"<style>" + 
		"* { margin: 0; border: 0; padding: 0; }" +

		"iframe {" + 
			"top: 0; left: 0; right: 0; bottom: 0;" +
			"overflow: hidden; position: absolute;" +
			"width: 100%!important; height: 100%!important;" +
		"}" +
	"</style>"
;

document.body.innerHTML = "";


var s = document.createElement("script");

s.textContent = (function gapiOnLoad() {
	var config = (location.hash || "").substr(1);

	if (config) {
		try {
			config = JSON.parse(decodeURIComponent(config));
		}
		catch (e) {
			config = {};
		}
	}
	else {
		config = {};
	}

	/* global gapi, iframes */
	gapi.load("iframes", function() {
		iframes.setHandler("notifications", {
			onOpen: function(container) {
				container.openInto(document.body);
			},
			onReady: function() {
				frame.onShowNotificationsOnly({
					maxWidgetHeight: config.maxHeight || 370
				});
			}
		});

		var frame = iframes.open(
			"https://plus.google.com/_/notifications/frame?hl=" + navigator.language + "&authuser=" + (config.user || 0),
			{ style: "notifications" },
			{ origin: "https://www.google.com/" },
			{
				setNotificationText: function() {},
				setNotificationAnimation: function() {},
				setNotificationWidgetHeight: function(height) {
					window.parent.postMessage({
						height: parseInt(height)
					}, "*");
				},
				reauth: function() {
					window.parent.postMessage({
						height: 415
					}, "*");

					location.href = "https://accounts.google.com/ServiceLogin?service=oz&authuser=" + (config.user || 0) + "&continue=" + encodeURIComponent(location.href);
				}
			}
		);
	});
}).toString();

document.head.appendChild(s);

s = document.createElement("script");

s.src = "https://apis.google.com/js/api.js?onload=gapiOnLoad";

document.head.appendChild(s);