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
						id: 400854243,
						sport: "basketball",
						league: "NCAA Basketball",
						clock: "0:00",
						period: 2,
						status: "post",
						label: "Final",
						date: 1448809200000,
						odds: 0,
						broadcasts: [],
						recap: "http://espn.go.com/ncb/recap?gameId=400854243",
						boxscore: "http://espn.go.com/ncb/boxscore?gameId=400854243",
						linescoreKey: ["1", "2", "Total"],
						home: {
							id: 2294,
							name: "Hawkeyes",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/2294.png&w=70&h=70&transparent=true",
							isWinner: true,
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500-dark/2294.png&w=70&h=70&transparent=true",
							record: "4-2",
							score: 84,
							location: "Iowa",
							linescores: [40, 44, 84]
						},
						away: {
							id: 2724,
							name: "Shockers",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/2724.png&w=70&h=70&transparent=true",
							isWinner: false,
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500-dark/2724.png&w=70&h=70&transparent=true",
							record: "2-4",
							score: 61,
							location: "Wichita St",
							linescores: [21, 40, 61]
						},
						venue: "HP Field House, Orlando, Florida"
					},
					{
						id: 400816818,
						sport: "basketball",
						league: "NCAA Basketball",
						clock: "11:43",
						period: 1,
						status: "in",
						label: "11:43 - 1st",
						date: 1448818200000,
						odds: 0,
						broadcasts: ["ESPNU"],
						boxscore: "http://espn.go.com/ncb/boxscore?gameId=400816818",
						live: "http://espn.go.com/ncb/gamecast?gameId=400816818",
						linescoreKey: ["1", "Total"],
						home: {
							id: 150,
							name: "Blue Devils",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/150.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500-dark/150.png&w=70&h=70&transparent=true",
							record: "5-1",
							score: 18,
							location: "Duke",
							linescores: [18, 18]
						},
						away: {
							id: 328,
							name: "Aggies",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/328.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500-dark/328.png&w=70&h=70&transparent=true",
							record: "4-0",
							score: 12,
							location: "Utah State",
							linescores: [12, 12]
						},
						venue: "Cameron Indoor Stadium, Durham, North Carolina"
					},
					{
						id: 400791516,
						sport: "football",
						league: "NFL",
						clock: "15:00",
						period: 1,
						status: "pre",
						label: "1:00 PM",
						date: 1448820000000,
						odds: 0,
						broadcasts: ["FOX"],
						preview: "http://espn.go.com/nfl/preview?gameId=400791516",
						tickets: "http://www.stubhub.com/cincinnati-bengals-cincinnati-paul-brown-stadium-11-29-2015-9298647",
						home: {
							id: 4,
							name: "Bengals",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/cin.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500-dark/scoreboard/cin.png&w=70&h=70&transparent=true",
							record: "8-2",
							location: "Cincinnati"
						},
						away: {
							id: 14,
							name: "Rams",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/stl.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500-dark/scoreboard/stl.png&w=70&h=70&transparent=true",
							record: "4-6",
							location: "St. Louis"
						},
						venue: "Paul Brown Stadium, Cincinnati, OH"
					},
					{
						id: 400791514,
						sport: "football",
						league: "NFL",
						clock: "15:00",
						period: 1,
						status: "pre",
						label: "1:00 PM",
						date: 1448820000000,
						odds: 0,
						broadcasts: ["FOX"],
						preview: "http://espn.go.com/nfl/preview?gameId=400791514",
						tickets: "http://www.stubhub.com/atlanta-falcons-atlanta-georgia-dome-11-29-2015-9298672",
						home: {
							id: 1,
							name: "Falcons",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/atl.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500-dark/scoreboard/atl.png&w=70&h=70&transparent=true",
							record: "6-4",
							location: "Atlanta"
						},
						away: {
							id: 16,
							name: "Vikings",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/min.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500-dark/scoreboard/min.png&w=70&h=70&transparent=true",
							record: "7-3",
							location: "Minnesota"
						},
						venue: "Georgia Dome, Atlanta, GA"
					},
					{
						id: 400791506,
						sport: "football",
						league: "NFL",
						clock: "15:00",
						period: 1,
						status: "pre",
						label: "1:00 PM",
						date: 1448820000000,
						odds: 0,
						broadcasts: ["FOX"],
						preview: "http://espn.go.com/nfl/preview?gameId=400791506",
						tickets: "http://www.stubhub.com/washington-redskins-landover-fedexfield-11-29-2015-9298625",
						home: {
							id: 28,
							name: "Redskins",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/wsh.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500-dark/scoreboard/wsh.png&w=70&h=70&transparent=true",
							record: "4-6",
							location: "Washington"
						},
						away: {
							id: 19,
							name: "Giants",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/nyg.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500-dark/scoreboard/nyg.png&w=70&h=70&transparent=true",
							record: "5-5",
							location: "New York"
						},
						venue: "FedEx Field, Landover, MD"
					},
					{
						id: 400791522,
						sport: "football",
						league: "NFL",
						clock: "15:00",
						period: 1,
						status: "pre",
						label: "1:00 PM",
						date: 1448820000000,
						odds: 0,
						broadcasts: ["CBS"],
						preview: "http://espn.go.com/nfl/preview?gameId=400791522",
						tickets: "http://www.stubhub.com/new-york-jets-east-rutherford-metlife-stadium-11-29-2015-9298555",
						home: {
							id: 20,
							name: "Jets",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/nyj.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500-dark/scoreboard/nyj.png&w=70&h=70&transparent=true",
							record: "5-5",
							location: "New York"
						},
						away: {
							id: 15,
							name: "Dolphins",
							logo: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/mia.png&w=70&h=70&transparent=true",
							logoDark: "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500-dark/scoreboard/mia.png&w=70&h=70&transparent=true",
							record: "4-6",
							location: "Miami"
						},
						venue: "MetLife Stadium, East Rutherford, NJ"
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

			this._activeView = this.config.last;

			WidgetModel.prototype.initialize.call(this);
		},

		setActiveView: function(view) {
			this._activeView = view;
			this.config.last = view;
			this.saveData();
		},

		getNews: function() {
			this.Auth.ajax({
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
				if (!this.Auth.isPro) {
					return;
				}

				return this.getNews();
			}

			var url = "/sports/v1/",
				requestedView = this._activeView;

			if (!this._activeView || this._activeView === "favorites") {
				if (this.config.teams && this.config.teams.length) {
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

			this.Auth.ajax({
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