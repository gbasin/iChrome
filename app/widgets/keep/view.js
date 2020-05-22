define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		isFrame: true,

		onBeforeRender: function(data) {
			data.url = "https://keep.google.com/u/" + (this.model.config.user || 0);

			var randomMessage = 'idkeep' + Math.random();
			data.randomMessage = randomMessage;

			function injectInFrame(tabId, frameId) {
				chrome.tabs.insertCSS(tabId, {
					frameId,
					file: "/inject/css/keep.css", 
					allFrames: true
				});
			}

			function frameMessageListener(msg, sender) {
				if (msg !== randomMessage) return;
				var tabId = sender.tab.id;
				var frameId = sender.frameId;
				var f = document.getElementById(randomMessage);

				chrome.runtime.onMessage.removeListener(frameMessageListener);
				// This will cause the script to be run on the first load.
				// If the frame redirects elsewhere, then the injection can seemingly fail.
				f.addEventListener('load', function onload() {
					f.removeEventListener('load', onload);
					injectInFrame(tabId, frameId);
				});
				f.src = data.url;

				for (var i = 0; i < 20; i++) {
					setTimeout(function() {
						injectInFrame(tabId, frameId);
					}, 100 * i);
				}
			}

			chrome.runtime.onMessage.addListener(frameMessageListener);

			return data;
		},

		onRender: function() {
			this.el.style.height = (this.model.config.height || 400) + "px";
		}
	});
});