/*
 * The Analytics widget.
 */
define(["jquery", "oauth2"], function($) {
	return {
		id: 3,
		interval: 300000,
		nicename: "analytics",
		sizes: ["tiny", "medium"],
		preconfig: true,
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide",
				defaultVal: ""
			},
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "profile",
				label: "Profile",
				options: "getProfiles"
			}
		],
		config: {
			title: "",
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
		oAuth: false,
		setOAuth: function() {
			this.oAuth = new OAuth2("google", {
				client_id: "559765430405-5rvu6sms3mc111781cfgp1atb097rrph.apps.googleusercontent.com",
				client_secret: "", // !! Remove key before committing
				api_scope: "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics"
			});
		},
		getProfiles: function(cb) {
			if (!this.oAuth) this.setOAuth();

			var done = 0,
				errors = 0,
				profiles = [],
				accounts = {},
				properties = {},
				data = {},
				oAuth = this.oAuth,
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

			oAuth.authorize.call(oAuth, function() {
				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/analytics/v3/management/accounts",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + oAuth.getAccessToken());
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
						xhr.setRequestHeader("Authorization", "OAuth " + oAuth.getAccessToken());
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
						xhr.setRequestHeader("Authorization", "OAuth " + oAuth.getAccessToken());
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
			if (!this.oAuth) this.setOAuth();

			if (!this.config.profile) {
				return false;
			}

			this.oAuth.authorize.call(this.oAuth, function() {
				$.ajax({
					type: "GET",
					dataType: "json",
					data: {
						ids: "ga:" + this.config.profile,
						"start-date": "today",
						"end-date": "today",
						"max-results": 1,
						metrics: "ga:visits,ga:pageviews,ga:visitBounceRate,ga:goal1Completions"
					},
					url: "https://www.googleapis.com/analytics/v3/data/ga",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + this.oAuth.getAccessToken());
					}.bind(this),
					success: function(d) {
						if (d && d.rows && d.rows[0] && d.rows[0].length == 4) {
							var result = d.rows[0],
								data = {
									visits:			parseInt(result[0]),
									pageviews:		parseInt(result[1]),
									bounceRate:		parseFloat(parseFloat(result[2]).toFixed(2)),
									completions:	parseInt(result[3]),

									pagesVisit: parseFloat((result[1] / result[0]).toFixed(2))
								};

							this.data = data;

							this.render();

							this.utils.saveData(this.data);
						}
					}.bind(this)
				});
			}.bind(this));
		},
		render: function(demo) {
			var data = $.extend({}, this.data);

			if (data.visits)		data.visits			= data.visits.toLocaleString().replace(/,/g, "<b>,</b>");
			if (data.pageviews)		data.pageviews		= data.pageviews.toLocaleString();
			if (data.bounceRate)	data.bounceRate		= data.bounceRate.toLocaleString() + "%";
			if (data.completions)	data.completions	= data.completions.toLocaleString();
			if (data.visitors)		data.visitors		= data.visitors.toLocaleString();
			if (data.pagesVisit)	data.pagesVisit		= data.pagesVisit.toLocaleString();

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (!this.config.profile && !demo) {
				data.noProfile = true;
			}

			this.utils.render(data);
		}
	};
});