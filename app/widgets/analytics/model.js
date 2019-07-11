define(["lodash", "jquery", "moment", "widgets/model"], function(_, $, moment, WidgetModel) {
	return WidgetModel.extend({
		refreshInterval: 300000,

		defaults: {
			config: {
				title: "Google Analytics™",
				size: "medium",
				profile: false,
				yearyear: "0",
				weekweek: "0",
				topvisited: "0",
				channels: "0"				
			},

			data: {
				common: {
					visits: 0,
					pageviews: 0,
					bounceRate: 0,
					completions: 0,
					pagesVisit: 0
				}
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
					if (errors !== 0) {
						return cb("Error");
					}

					if (++done < 3) {
						return;
					}

					profiles.forEach(function(e) {
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
						if (!d || !d.items) {
							return errors++;
						}

						d.items.forEach(function(e) {
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
						if (!d || !d.items) {
							return errors++;
						}

						d.items.forEach(function(e) {
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
						if (!d || !d.items) {
							return errors++;
						}

						d.items.forEach(function(e) {
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

			var that = this;

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

			var commonReq = {
				"viewId": this.config.profile,
				"dateRanges":[{
					"startDate": start,
					"endDate": end
				  }],
				"metrics": [
					{ "expression": "ga:visits" },
					{ "expression": "ga:pageviews" },
					{ "expression": "ga:visitBounceRate" },
					{ "expression": "ga:goal1Completions" }
				],
				"pageSize": "1"
			};

			var trafficChannelReq = null;
			var isSingleDay = start === end;
			if (isSingleDay) {
				trafficChannelReq = {
					"viewId": this.config.profile,
					"dateRanges": [
					{
					  "startDate": start,
					  "endDate": end
					}],
					"metrics": [{
					  "expression":"ga:sessions"
					}],
					"dimensions": [{
						"name":"ga:nthHour"
					},{
						"name":"ga:channelGrouping"
					}],
					"orderBys": [{
						"fieldName": "ga:nthHour",
						"sortOrder": "ASCENDING"
					},{
						"fieldName": "ga:channelGrouping",
						"sortOrder": "ASCENDING"
					}]
				};
			}else{
				trafficChannelReq = {
					"viewId": this.config.profile,
					"dateRanges": [
					{
					  "startDate": start,
					  "endDate": end,
					}],
					"metrics": [{
					  "expression":"ga:sessions"
					}],
					"dimensions": [{
						"name":"ga:date"
					},{
						"name":"ga:channelGrouping"
					}],
					"orderBys": [{
						"fieldName": "ga:date",
						"sortOrder": "ASCENDING"
					},{
						"fieldName": "ga:channelGrouping",
						"sortOrder": "ASCENDING"
					}]
				};
			}


			var top10Req = {
				"viewId": this.config.profile,
				"dateRanges": [
				{
					"startDate": start,
					"endDate": end
				  }],
				"metrics": [
				{
				  "expression":"ga:pageviews"
				}],
				"dimensions": [{
				  "name":"ga:pagePath"
				}],
				"pageSize": "20",
				"orderBys": [{
					"fieldName": "ga:pageviews",
					"sortOrder": "DESCENDING"
				}],
			};

			var startOfWeek = moment().add(-1, "days").startOf('week');
			var weeklyReq = {
				"viewId": this.config.profile,
				"dateRanges": [{
					"startDate": startOfWeek.clone().add(-7, 'days').format("YYYY-MM-DD"),
					"endDate": startOfWeek.clone().add(-1, 'days').format("YYYY-MM-DD")
				},{
					"startDate": startOfWeek.clone().format("YYYY-MM-DD"),
					"endDate": startOfWeek.clone().add(6, 'days').format("YYYY-MM-DD")
				}],
				"metrics": [
				{
				  "expression":"ga:sessions"
				}],
				"dimensions": [{
				  "name":"ga:dayOfWeek"
				}],
				"orderBys": [{
					"fieldName": "ga:dayOfWeek",
					"sortOrder": "ASCENDING"
				}],
			};

			var thisYear = moment([moment().year(), 0, 1]);
			var thisYearEnd = thisYear.clone().add(1, 'years').subtract(1, 'days');
			var prevYear = thisYear.clone().subtract(1, 'years');
			var prevYearEnd = thisYearEnd.clone().subtract(1, 'years');
			var yearlyReq = {
				"viewId": this.config.profile,
				"dateRanges": [{
					"startDate": prevYear.format("YYYY-MM-DD"),
					"endDate": prevYearEnd.format("YYYY-MM-DD")
				},{
					"startDate": thisYear.format("YYYY-MM-DD"),
					"endDate": thisYearEnd.format("YYYY-MM-DD")
				}],
				"metrics": [
				{
				  "expression":"ga:users"
				}],
				"dimensions": [{
				  "name":"ga:nthMonth"
				}],
				"orderBys": [{
					"fieldName": "ga:nthMonth",
					"sortOrder": "ASCENDING"
				}],
			};

			var data = {};
			data.isTopVisited = this.config.topvisited === "1";
			data.isChannels = this.config.channels === "1";
			data.isYearly = this.config.yearyear === "1";
			data.isWeekly = this.config.weekweek === "1";

			var requests = [commonReq];
			if (data.isTopVisited) {
				requests.push(top10Req);
			}
			if (data.isChannels) {
				requests.push(trafficChannelReq);
			}

			this.oAuth.ajax({
				type: "POST",
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Content-Type", "application/json");
			   	},
				data: JSON.stringify({
					"reportRequests": requests
				}),
				url: "https://analyticsreporting.googleapis.com/v4/reports:batchGet",
				success: function(d) {
					if (d && d.reports && d.reports.length === requests.length) {
						var respCommon = d.reports[0];
						if (respCommon.data && respCommon.data.rows && respCommon.data.rows.length === 1) {
							var row = respCommon.data.rows[0];
							if (row.metrics && row.metrics.length === 1) {
								var metric = row.metrics[0];
								if (metric.values && metric.values.length === 4) {
									var result = metric.values;

									data.common = _.mapValues({
										visits: result[0],
										pageviews: result[1],
										bounceRate: parseInt(result[2] * 100) / 100,
										completions: result[3],
										pagesVisit: parseInt((result[1] / result[0]) * 100) / 100
									}, function(e) {
										return parseInt(e).toLocaleString();
									});
								}
							}
						}

						if (data.isTopVisited) {
							var respTopPages = d.reports[1];
							if (respTopPages.data && respTopPages.data.rows) {
								var items = respTopPages.data.rows.map(function(row) {
									if (!row.dimensions || row.dimensions.length === 0) return null;
									if (!row.metrics || !row.metrics.length === 0) return null;
									var metric = row.metrics[0];
									if (!metric.values || metric.values.length == 0) return null;
									return {
										url: row.dimensions[0],
										count: metric.values[0]
									}
								}).filter(function(item) {
									return item != null;
								});

								data.top10 = {
									items: items
								};
							}
						}						

						if (data.isChannels) {
							var respChannelsTraffic = d.reports[data.isTopVisited ? 2 : 1];
							if (respChannelsTraffic.data && respChannelsTraffic.data.rows) {
								var allItems = respChannelsTraffic.data.rows.map(function(row) {
									if (!row.dimensions || row.dimensions.length !== 2) return;
									if (!row.metrics || row.metrics.length === 0) return;
									var metric = row.metrics[0];
									if (!metric.values || metric.values.length === 0) return;
									return {
										yyyymmdd: parseInt(row.dimensions[0]),
										channel: row.dimensions[1],
										value: Number(metric.values[0])
									};
								});

								var channels = _.uniq(allItems.map(function(el) {
									return el.channel;
								}));

								var chartData = [];
								var header = ["Channels"].concat(channels, [{ role: 'annotation' }])
								chartData.push(header);

								var groups = _.groupBy(allItems, "yyyymmdd");
								for (var date in groups) {
									var dateChannels = groups[date];
									var row = [];
									if (isSingleDay) {
										row.push(date);
									}else{
										row.push(moment(date + "", 'YYYYMMDD').format("MMM DD"));
									}

									channels.forEach(function(channel) {
										var foundItem = dateChannels.find(function(el) {
											return el.channel === channel;
										})

										row.push(foundItem ? foundItem.value : 0);
									})

									row.push('');
									chartData.push(row);
								}

								data.channels = {
									items: chartData
								}
							}
						}
					}
				},
				complete: function() {
					var yearlyComplete = function() {
						var weeklyComplete = function() {
							if (that.get("range") === "today") {
								that.saveData(data);
							}
							else {
								that.trigger("data:loaded", data);
							}
						}
						
						if (data.isYearly) {
							this.oAuth.ajax({
								type: "POST",
								dataType: "json",
								beforeSend: function (xhr) {
									xhr.setRequestHeader("Content-Type", "application/json");
								   },
								data: JSON.stringify({
									"reportRequests": [ yearlyReq ]
								}),
								url: "https://analyticsreporting.googleapis.com/v4/reports:batchGet",
								success: function(d) {
									if (d && d.reports && d.reports.length === 1) {
										var chartData = [['Year', 'Last Year', 'This Year']];
										var restWeekly = d.reports[0];
										if (restWeekly.data && restWeekly.data.rows) {
											restWeekly.data.rows.forEach(function(row) {
												if (!row.dimensions || row.dimensions.length === 0) return;
												if (!row.metrics || row.metrics.length !== 2) return;
												var metric0 = row.metrics[0];
												var metric1 = row.metrics[1];
												if (!metric0.values || metric0.values.length === 0) return;
												if (!metric1.values || metric1.values.length === 0) return;
												chartData.push([
													moment((parseInt(row.dimensions[0]) + 1) + "", "M").format("MMM"), 
													metric0.values[0] === "0" ? null : Number(metric0.values[0]), 
													metric1.values[0] === "0" ? null : Number(metric1.values[0])
												]);
											});
		
											data.yearly = {
												items: chartData
											}
										}
									}
		
									//this.trigger("data:loaded", data);
								},
								complete: function() {
									weeklyComplete();
								}
							});
						}else{
							weeklyComplete();
						}
					}.bind(this);

					if (data.isWeekly) {
						this.oAuth.ajax({
							type: "POST",
							dataType: "json",
							beforeSend: function (xhr) {
								xhr.setRequestHeader("Content-Type", "application/json");
							   },
							data: JSON.stringify({
								"reportRequests": [ weeklyReq ]
							}),
							url: "https://analyticsreporting.googleapis.com/v4/reports:batchGet",
							success: function(d) {
								if (d && d.reports && d.reports.length === 1) {
									var chartData = [['Week', 'Last Week', 'This Week']];
									var restWeekly = d.reports[0];
									if (restWeekly.data && restWeekly.data.rows) {
										restWeekly.data.rows.forEach(function(row) {
											if (!row.dimensions || row.dimensions.length === 0) return;
											if (!row.metrics || row.metrics.length !== 2) return;
											var metric0 = row.metrics[0];
											var metric1 = row.metrics[1];
											if (!metric0.values || metric0.values.length === 0) return;
											if (!metric1.values || metric1.values.length === 0) return;
											chartData.push([
												moment().isoWeekday(Number(row.dimensions[0])).format("ddd"), 
												metric0.values[0] === "0" ? null : Number(metric0.values[0]), 
												metric1.values[0] === "0" ? null : Number(metric1.values[0])
											]);
										});
	
										data.weekly = {
											items: chartData
										}
									}
								}
	
								//this.trigger("data:loaded", data);
							},
							complete: function() {
								yearlyComplete();

							}.bind(this)
						});
					}else{
						yearlyComplete();
					}
		
				}.bind(this)
			});

			
		}
	});
});