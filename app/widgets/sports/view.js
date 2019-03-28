define(["lodash", "jquery", "moment", "widgets/views/main"], function(_, $, moment, WidgetView) {
	return WidgetView.extend({
		events: {
			"click .game .summary": function(e) {
				$(e.currentTarget).next(".extended").toggleClass("visible");
			},

			"click header .tabs li": function(e) {
				this.model._state = e.currentTarget.getAttribute("data-id");

				if (this.model._state === "news" && !this.Auth.isPro) {
					this.render();
				}
				else {
					this.render({
						loading: true
					});

					this.model.refresh();
				}
			},

			"click header .select .options li": function(e) {
				delete this.model._state;

				this.model.setActiveView(e.currentTarget.getAttribute("data-id"));

				this.render({
					loading: true
				});

				this.model.refresh();
			}
		},

		initialize: function() {
			this.listenTo(this.model, "change", _.ary(this.render, 0));

			// Here we want the data object to be passed
			this.listenTo(this.model, "news:loaded games:loaded", this.render);

			this.render();
		},

		onBeforeRender: function(data) {
			var activeView = this.model._activeView || (this.model.config.teams && this.model.config.teams.length ? "favorites" : "top");

			data.news = this.model._state === "news";

			if (data.news && !this.Auth.isPro) {
				data.proSplash = true;

				delete data.games;
			}

			if (data.games) {
				var open = [];

				if (this._rendered) {
					open = _.map(this.$(".extended.visible").toArray(), function(e) {
						return parseInt(e.getAttribute("data-id"));
					});

					this._scrollTop = this.$(".games").scrollTop();
				}

				this._rendered = true;


				data.allView = activeView === "top";

				data.sections = _(data.games).map(function(game) {
					// If this is a V1-format game, skip
					if (game.home_first) {
						return;
					}

					game = _.clone(game);

					// These are loser instead of winner so upcoming games are darker and higher contrast
					game.home_loser = (typeof game.home.isWinner === "boolean" ? !game.home.isWinner : (game.home.score && game.home.score < game.away.score)) ? "loser" : "";
					game.away_loser = (typeof game.away.isWinner === "boolean" ? !game.away.isWinner : (game.away.score && game.away.score < game.home.score)) ? "loser" : "";

					game.groupDate = new Date(game.date).toDateString();


					if (open.indexOf(game.id) !== -1) {
						game.extendedVisible = "visible";
					}


					var mDate = moment(game.date);

					game.longDate = mDate.format("dddd, MMMM Do" + (mDate.year() !== new Date().getFullYear() ? " YYYY" : "") + ", LT");

					if (game.date > new Date().getTime()) {
						game.pre = true;

						game.shortDate = mDate.format("LT");

						if (game.broadcasts) {
							game.broadcasts = game.broadcasts.join(", ");
						}
					}

					return game;
				}).compact().groupBy(data.allView ? "league" : "groupDate").map(function(e, k) {
					var title;

					if (data.allView) {
						title = k;
					}
					else {
						var date = new Date(k);

						title = moment(new Date(k)).format("dddd, MMMM Do" + (date.getFullYear() !== new Date().getFullYear() ? " YYYY" : ""));
					}

					return {
						title: title,
						games: e
					};
				}).value();

				if (data.allView) {
					data.sections = _.sortBy(data.sections, function(e) {
						return e.title.indexOf("NCAA") === 0 ? 1 : -1;
					});
				}
			}

			data.views = _.map({
				"favorites": this.translate("favorites"),
				"top": this.translate("top_games"),
				"football/nfl": "NFL",
				"football/college-football": "NCAA Football",
				"baseball/mlb": "MLB",
				"baseball/college-baseball": "NCAA Men's Baseball",
				"hockey/nhl": "NHL",
				"basketball/nba": "NBA",
				"basketball/mens-college-basketball": "NCAA Basketball",
				"basketball/wnba": "WNBA",
				"basketball/womens-college-basketball": "NCAA Women's Basketball",
				"tennis/atp": "Men's Tennis",
				"tennis/wta": "Women's Tennis",
				"soccer/eng.1": "Barclays Premier League",
				"soccer/uefa.uefa": "UEFA Champions League",
				"soccer/esp.1": "Spanish Primera División",
				"soccer/usa.1": "Major League Soccer",
				"soccer/mex.1": "Mexican Liga MX",
				"soccer/ita.1": "Italian Serie A",
				"soccer/ger.1": "German Bundesliga",
				"soccer/fifa.wwc": "Women's World Cup",
				"soccer/fifa.world": "FIFA World Cup"
			}, function(e, k) {
				if (k === activeView) {
					data.activeView = e;
				}

				return {
					id: k,
					name: e,
					active: k === activeView
				};
			}, this);

			return data;
		},

		onRender: function() {
			if (this._scrollTop) {
				this.$(".games").scrollTop(this._scrollTop);
			}
		}
	});
});