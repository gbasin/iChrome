define(["lodash", "jquery", "widgets/model"], function(_, $, WidgetModel) {
	return WidgetModel.extend({
		refreshInterval: 300000,

		defaults: {
			config: {
				title: "Google Analytics™",
				size: "medium",
				profile: false
			},

			data: {
				visits: 5605,
				pageviews: 15033,
				bounceRate: 12.57,
				completions: 4853,
				pagesVisit: 8.54
			},

			range: "today"
		},

		oAuth: {
			id: "559765430405-5rvu6sms3mc111781cfgp1atb097rrph.apps.googleusercontent.com",
			secret: "__API_KEY_analytics__",
			scope: "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics"
		},

		getProfiles: function(cb) {
			var done = 0,
				errors = 0,
				profiles = [],
				accounts = {},
				properties = {},
				data = {},
				compile = function() {
					if (errors !== 0) cb("Error");

					if (++done < 3) return;

					profiles.forEach(function(e, i) {
						data[e.account] = data[e.account] || {label: accounts[e.account]};
						data[e.account][e.property] = data[e.account][e.property] || {label: properties[e.property].name};

						data[e.account][e.property][e.id] = decodeURIComponent(e.name);
					});

					cb(data);
				};

			this.oAuth.getToken(function(token) {
				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/analytics/v3/management/accounts",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "Bearer " + token);
					},
					success: function(d) {
						if (!d || !d.items) return errors++;

						d.items.forEach(function(e, i) {
							accounts[e.id] = e.name;
						});

						compile();
					}
				});

				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "Bearer " + token);
					},
					success: function(d) {
						if (!d || !d.items) return errors++;

						d.items.forEach(function(e, i) {
							properties[e.id] = {
								name: e.name,
								account: e.accountId
							};
						});

						compile();
					}
				});

				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties/~all/profiles",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "Bearer " + token);
					},
					success: function(d) {
						if (!d || !d.items) return errors++;

						d.items.forEach(function(e, i) {
							profiles.push({
								id: e.id,
								name: e.name,
								account: e.accountId,
								property: e.webPropertyId
							});
						});

						compile();
					}
				});
			});
		},

		refresh: function() {
			if (!this.config.profile) {
				return false;
			}


			var start, end;

			switch (this.get("range")) {
				case "yesterday":
					start = end = "yesterday";
				break;

				case "pastweek":
					start = "7daysAgo";
					end = "today";
				break;

				default:
					start = end = "today";
				break;
			}


			this.oAuth.ajax({
				type: "GET",
				dataType: "json",
				data: {
					ids: "ga:" + this.config.profile,
					"start-date": start,
					"end-date": end,
					"max-results": 1,
					metrics: "ga:visits,ga:pageviews,ga:visitBounceRate,ga:goal1Completions"
				},
				url: "https://www.googleapis.com/analytics/v3/data/ga",
				success: function(d) {
					if (d && d.rows && d.rows[0] && d.rows[0].length === 4) {
						var result = d.rows[0];

						var data = _.mapValues({
							visits: result[0],
							pageviews: result[1],
							bounceRate: parseInt(result[2] * 100) / 100,
							completions: result[3],
							pagesVisit: parseInt((result[1] / result[0]) * 100) / 100
						}, function(e) {
							return parseInt(e).toLocaleString();
						});

						if (this.get("range") === "today") {
							this.saveData(data);
						}
						else {
							this.trigger("data:loaded", data);
						}
					}
				}
			});
		}
	});
});