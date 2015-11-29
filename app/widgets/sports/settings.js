define(["lodash", "jquery", "widgets/views/settings", "jquery.serializejson"], function(_, $, WidgetView) {
	return WidgetView.extend({
		events: {
			"click header button.save": "serialize",

			"click .list li .delete": function(e) {
				e.currentTarget.parentNode.parentNode.removeChild(e.currentTarget.parentNode);
			},

			"keydown .add input": function(e) {
				if (e.which === 13) {
					e.preventDefault();

					this.addTeam();
				}
				else if (e.which === 38 || e.which === 40) {
					e.preventDefault();

					var active = this.$("ul.suggestions li.active").removeClass("active");

					active = active[e.which === 38 ? "prev" : "next"]();

					if (!active.length) {
						active = this.$("ul.suggestions li")[e.which === 38 ? "last" : "first"]();
					}

					e.currentTarget.value = active.addClass("active").find("h3").text();
				}
			},

			"mousedown .suggestions li": function(e) {
				$(e.currentTarget).addClass("active").siblings().removeClass("active");

				this.addTeam();
			},

			"input .add input": function(e) {
				this.updateSuggestions(e, "input");
			},

			"focusin .add": function(e) {
				this.updateSuggestions(e, "focusin");
			},

			"focusout .add": function(e) {
				this.updateSuggestions(e, "focusout");
			}
		},


		addTeam: function() {
			var tElm = this.$(".suggestions .active:first");

			if (!tElm.length) {
				tElm = this.$(".suggestions li:first");
			}

			this.$(".add").focusout().children("input").val("");

			var itm = tElm.clone().append('<button type="button" class="material toggle delete">' +
				'<svg viewBox="0 0 24 24">' +
					'<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>' +
				'</svg>' +
			'</button>');

			this.$(".list").append(itm).scrollTop(this.$(".list")[0].scrollHeight);
		},


		updateSuggestions: function(e, type) {
			var val = this.$(".add input").val(),
				sElm = this.$("ul.suggestions");

			if (val.trim() !== "" && type !== "focusout") {
				sElm.addClass("visible");

				this.Pro.ajax({
					url: "/sports/v1/teams/" + encodeURIComponent(val),
					success: function(d) {
						if (!d || !Array.isArray(d) || !d.length) {
							return sElm.removeClass("visible");
						}

						// Dynamic element creation... a bit messy but safer than plain HTML and
						// not too bad performance-wise
						sElm.empty().append(_.map(d, function(e, i) {
							return $(document.createElement("li")).addClass(i === 0 ? "active" : "").attr("data-value", JSON.stringify(e)).append(
								$(document.createElement("img")).addClass("logo").attr("src", this.isDark ? e.logoDark : e.logo),
								$(document.createElement("div")).addClass("name").append(
									$(document.createElement("h3")).text(e.name),
									$(document.createElement("span")).addClass("league").text(e.league)
								)
							);
						}, this));
					}.bind(this)
				});
			}
			else {
				sElm.removeClass("visible");
			}
		},


		/**
		 * Serializes and saves the contents of the settings form
		 */
		serialize: function() {
			delete this.model._state;
			delete this.model._activeView;

			this.model.config.teams = _(this.$(".list li").toArray()).map(function(e) {
				try {
					return JSON.parse(e.getAttribute("data-value"));
				}
				catch (err) {}

				return;
			}).compact().uniq("id").value();

			this.model.set({
				state: "default"
			});

			this.model.saveConfig();
		},


		initialize: function() {
			this.listenTo(this.model, "change:config", _.ary(this.render, 0));

			this.render();
		},


		onBeforeRender: function(config) {
			config.teams = _.map(config.teams, function(e) {
				e = _.clone(e);

				e.json = JSON.stringify(e);

				return e;
			});
		}
	});
});