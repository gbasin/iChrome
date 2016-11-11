/**
 * Handles "OK Google" detection and speech-based searching
 */
define(["jquery", "underscore", "backbone", "core/analytics", "storage/storage", "i18n/i18n"], function($, _, Backbone, Track, Storage, Translate) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set(storage.settings);
				}, this);
			}
		}),
		View = Backbone.View.extend({
			el: "body > .voicebar",
			events: {
				"click .close": "stop",
				"click .text a": "restart",
				"click button": function(e) {
					e.preventDefault();

					if (this.listening) {
						this.stop();
					}
					else {
						this.restart();
					}
				}
			},
			text: "",
			timeout: null,
			listening: false,
			inProgress: false,
			start: function() {
				this.restart();

				this.setText(Translate("voice.listening"));

				this.$el.add(this.overlay).addClass("visible");

				this.inProgress = true;

				this.recognition.onstart = function() {
					this.recognition.onstart = null;

					this.setText(Translate("voice.listening"));
				}.bind(this);
			},
			stop: function() {
				this.recognition.onspeechend();

				this.inProgress = false;

				this.$el.add(this.overlay).removeClass("visible");

				if (this.model.get("ok")) {
					this.restart();
				}
				else {
					this.recognition.abort();
				}
			},
			restart: function() {
				try {
					this.recognition.start();
				}
				catch (e) {
					this.recognition.onend = function() {
						this.recognition.onend = null;

						this.recognition.start();
					}.bind(this);

					this.recognition.abort();
				}
			},
			setText: function(text) {
				if (text && text !== "") {
					this.$(".text").text(text);
				}
				else {
					this.$(".text").html(Translate("voice.missed"));
				}
			},
			animate: function() {
				var val = Math.round((0.1 + 0.7 * Math.random()) * 40),
					speed = Math.round(200 + 500 * Math.random()) / 4;

				this.button
					.css("box-shadow", "0 0 0 " + val + "px #E5E5E5, 0 0 1px " + (val + 1) + "px rgba(0, 0, 0, 0.2), inset 0 0 1px 1px rgba(255, 255, 255, 0.3)")
					.css("transition-duration", speed + "ms");

				this.timeout = setTimeout(this.animate.bind(this), speed);
			},
			startAnimation: function() {
				this.button = this.$("button");

				this.timeout = setTimeout(this.animate.bind(this), 0);
			},
			stopAnimation: function() {
				clearTimeout(this.timeout);

				this.$("button").css("box-shadow", "").css("transition-duration", "");
			},
			isOK: function(str) {
				var arr = str.toLowerCase().split(" ");

				for (var i = arr.length - 1; i >= 0; i--) {
					var word = arr[i].replace(/[^A-z0-9]/ig, "");

					if (word.indexOf("google") !== -1 || word.indexOf("okay") !== -1 || word === "ok" || word === "computer") {
						return true;
					}
				}

				return false;
			},
			result: function(e) {
				var i;

				if (this.model.get("ok") && !this.inProgress) {
					for (i = e.resultIndex; i < e.results.length; i++) {
						if (e.results[i][0].confidence > 0.2 && this.isOK(e.results[i][0].transcript)) {
							this.start();

							Track.event("Search", "Speech", "Ok Google");
						}
					}
				}
				else if (this.inProgress) {
					for (i = e.results.length; i >= 0; i--) {
						if (e.results[i] && e.results[i][0].confidence > 0.2) {
							this.text = e.results[i][0].transcript.trim();

							this.setText(this.text);

							if (e.results[i].isFinal) {
								this.recognition.abort();

								this.setText(Translate("voice.searching", this.text));

								this.recognition.onend = function() {
									this.setText(Translate("voice.searching", this.text));

									this.trigger("result", this.text);
								}.bind(this);
							}
						}
					}
				}
			},
			initialize: function() {
				this.overlay = $("body > .speech-overlay").on("click", this.stop.bind(this));

				this.model = new Model();

				// Even though init could return this; there's a chance that the callback will be called asynchronously and this.model won't be defined yet
				this.model.on("change:ok change:voice", function() {
					if (!this.recognition) {
						this.setRec();
					}

					if (this.model.get("ok")) {
						this.restart();

						Track.event("Search", "Speech", "Background Start");
					}
					else {
						this.recognition.abort();
					}
				}, this).init();
			},
			setRec: function() {
				this.recognition = new (window.webkitSpeechRecognition)();

				this.recognition.continuous = true;
				this.recognition.interimResults = true;

				this.recognition.onspeechstart = function() {
					if (this.inProgress) {
						this.startAnimation();

						this.listening = true;
					}
				}.bind(this);

				this.recognition.onspeechend = function() {
					if (this.inProgress) {
						this.stopAnimation();

						this.listening = false;

						this.setText(this.text);
					}
				}.bind(this);

				this.recognition.onresult = this.result.bind(this);
			}
		});

	var speech = null;

	return function() {
		if (!speech) {
			speech = new View();
		}

		return speech;
	};
});