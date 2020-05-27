define(["widgets/views/main", "browser/api"], function(WidgetView, Browser) {
	return WidgetView.extend({
		isFrame: true,

		onBeforeRender: function(data) {
			data.url = "https://keep.google.com/u/" + (this.model.config.user || 0);

			var randomMessage = 'idkeep' + Math.random();
			data.randomMessage = randomMessage;

			function injectToFrame(tabId, frameId) {
				try {
					Browser.tabs.insertCSS(tabId, {
						frameId,
						file: "/inject/css/keep.css", 
						allFrames: true
					});
				}
				catch(e) {}
			}

			function frameMessageListener(msg, sender) {
				if (msg !== randomMessage) { return; }
				var tabId = sender.tab.id;
				var frameId = sender.frameId;
				var f = document.getElementById(randomMessage);

				Browser.runtime.onMessage.removeListener(frameMessageListener);
				// This will cause the script to be run on the first load.
				// If the frame redirects elsewhere, then the injection can seemingly fail.
				f.addEventListener('load', function onload() {
					f.removeEventListener('load', onload);
					injectToFrame(tabId, frameId);
				});
				f.src = data.url;

				for (var i = 0; i < 7; i++) {
					setTimeout(function() {
						injectToFrame(tabId, frameId);
					}, 500 + 200 * i);
				}

				setInterval(function() {
					injectToFrame(tabId, frameId);
				}, 30000);
			}

			Browser.runtime.onMessage.addListener(frameMessageListener);

			return data;
		},

		onRender: function() {
			this.el.style.height = (this.model.config.height || 400) + "px";
		}
	});
});