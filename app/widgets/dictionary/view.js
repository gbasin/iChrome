define(["lodash", "jquery", "browser/api", "widgets/views/main"], function(_, $, Browser, WidgetView) {
	return WidgetView.extend({
		events: {
			"click button.more": function(e) {
				this._isExpanded = !this._isExpanded;

				this.$(".forms, ol li .synonyms, ol li .antonyms, ol li:nth-child(n + 2), .usage:nth-of-type(n + 3), .usage ~ .web-definitions")[this._isExpanded ? "slideDown" : "slideUp"](300);

				e.currentTarget.textContent = this.translate(this._isExpanded ? "less" : "more");
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
					});
				}
			}.bind(this));
		},

		onRender: function() {
			// If we're already expanded, keep it that way
			if (this._isExpanded) {
				this.$(".forms, ol li .synonyms, ol li .antonyms, .usage:nth-of-type(n + 3), .usage ~ .web-definitions").css("display", "block");

				this.$("ol li:nth-child(n + 2)").css("display", "list-item");

				this.$("button.more").text(this.translate("less")).attr("data-state", "maximized");
			}
		}
	});
});