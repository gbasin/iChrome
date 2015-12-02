define(["lodash", "jquery", "browser/api", "widgets/views/main"], function(_, $, Browser, WidgetView) {
	return WidgetView.extend({
		events: {
			"click button.more": function(e) {
				this._isExpanded = !this._isExpanded;

				this.$(".forms, ol li .synonyms, ol li .antonyms, ol li:nth-child(n + 2), .usage:nth-of-type(n + 3), .usage ~ .web-definitions")[this._isExpanded ? "slideDown" : "slideUp"](300);

				e.currentTarget.textContent = this._isExpanded ? "Less" : "More";
				e.currentTarget.setAttribute("data-state", this._isExpanded ? "maximized" : "collapsed");
			},

			"click button.audio": function(e) {
				if (this._audio && !this._audio.paused) {
					this._audio.pause();
				}
				else {
					if (!this._audio) {
						this._audio = new Audio();
						this._audio.autoplay = true;
					}

					this._audio.currentTime = 0;
					this._audio.src = e.currentTarget.getAttribute("data-url");

					this._audio.play();
				}
			},

			"click .group span.has-def": function(e) {
				this.lookupTerm(e.currentTarget.textContent.trim());
			},

			"keydown header input": function(e) {
				if (e.which === 13) {
					this.lookupTerm(e.currentTarget.value.trim());
				}
			}
		},

		lookupTerm: function(term) {
			this.render({
				loading: true
			});

			this.model.getDefinition(term, function(err, d) {
				if (!err && d) {
					this.render({
						definition: d
					});
				}
				else {
					this.render({
						error: true
					})
				}
			}.bind(this))
		},

		/**
		 * After the widget's been rendered, we check the expanded height to
		 * see if the button should be hidden and we should just expand by default
		 */
		onRender: function() {
			var definition = this.$(".definition"),
				expandElms = this.$(".forms, ol li .synonyms, ol li .antonyms, .usage:nth-of-type(n + 3), .usage ~ .web-definitions");

			expandElms.css("display", "block");

			expandElms.add(this.$("ol li:nth-child(n + 2)").css("display", "list-item"));

			if (definition[0] && definition[0].offsetHeight > 350) {
				if (this._isExpanded) {
					this.$("button.more").text("Less").attr("data-state", "maximized");
				}
				else {
					expandElms.css("display", "");

					// Trigger layout so we always render properly
					definition[0].offsetHeight;
				}
			}
			else if (expandElms.length) {
				this.$("button.more").remove();
			}
		}
	});
});