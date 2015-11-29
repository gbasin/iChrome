define(["jquery", "lodash", "widgets/model"], function($, _, WidgetModel) {
	return WidgetModel.extend({
		refreshInterval: 180000,

		defaults: {
			config: {
				size: "variable",
				teams: []
			},
			data: {
				games: [
					{
						home_first: "San Francisco",
						home_last: "49ers",
						home_id: "nfl/sfo",
						away_first: "Atlanta",
						away_last: "Falcons",
						away_id: "nfl/atl",
						start: 1387849200000,
						status: "Today, 8:40 PM<br />ESPN",
						label: "8:40 pm ET",
						coverage: "ESPN",
						link: "http://sports.yahoo.com/nfl/atlanta-falcons-san-francisco-49ers-20131223025/",
						time: "Today, 8:40 PM"
					}
				]
			}
		},

		initialize: function() {
			if (this.config.title || this.config.league || this.config.number || this.config.unavailable || this.get("size") === "tiny") {
				delete this.config.title;
				delete this.config.league;
				delete this.config.number;
				delete this.config.unavailable;

				if (this.config.teams && this.config.teams[0] && typeof this.config.teams[0] !== "object") {
					delete this.config.teams;
				}

				this.set("size", "variable");
			}

			WidgetModel.prototype.initialize.call(this);
		},

		getNews: function() {
			this.Pro.ajax({
				url: "/sports/v1/news" + (!this._activeView || this._activeView === "favorites" || this._activeView === "all" ? "" : "/" + this._activeView),
				success: function(d) {
					this.trigger("news:loaded", {
						articles: d
					});
				}.bind(this)
			});
		},

		refresh: function() {
			if (this._state === "news") {
				return this.getNews();
			}

			var url = "/sports/v1/",
				requestedView = this._activeView;

			if (!this._activeView || this._activeView === "favorites") {
				if (this.config.teams.length) {
					url += "favorites/" + _.pluck(this.config.teams, "id").join(",");
				}
				else {
					url += "top";
				}
			}
			else if (this._activeView === "all") {
				url += "top";
			}
			else {
				url += this._activeView;
			}

			this.Pro.ajax({
				url: url,
				success: function(d) {
					if (this._activeView !== requestedView) {
						return;
					}

					// If any games are in progress refresh every 30 seconds instead of every 2.5 minutes
					if (_.some(d, { status: "in" })) {
						if (this.refreshInterval !== 30000) {
							this.refreshInterval = 30000;

							this.trigger("refreshInterval:change");
						}
					}
					else if (this.refreshInterval !== 180000) {
						this.refreshInterval = 180000;

						this.trigger("refreshInterval:change");
					}

					if (this._activeView && this._activeView !== "favorites") {
						this.trigger("games:loaded", {
							games: d
						});
					}
					else {
						this.saveData({
							games: d
						});
					}
				}.bind(this)
			});
		}
	});
});