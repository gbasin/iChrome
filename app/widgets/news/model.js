define(["lodash", "jquery", "widgets/model"], function(_, $, WidgetModel) {
	var authHeader = "API_KEY 8b04677e27d5498a90e306eedbf19fb3";

	return WidgetModel.extend({
		refreshInterval: 300000,

		defaults: {
			config: {
				size: "variable",
				title: "i18n.name",
				number: 5,
				edition: "en-us",
				topic: "default",
				link: "https://news.google.com"
			},

			data: {
				topics: [
					["default", "Top"],
					["autos", "Autos"],
					["news", "News"],
					["technologyandinternet", "Technology and Internet"],
					["entertainment", "Entertainment"],
					["businessandfinance", "Business and Finance"],
					["sports", "Sports"],
					["homeandlifestyle", "Home and Lifestyle"],
					["recreation", "Recreation"],
					["electronics", "Electronics"],
					["health", "Health"]
				],
				items: [{
					"title": "Hurricane Matthew: Evacuations begin as deadly storm nears",
					"image": "http://images.outbrain.com/Imaginarium/api/uuid/379281b77d9bcda69a2a405173798d9cca99e9b55626aa534c005245b3d7752f/190/200",
					"desc": "Hurricane Matthew likely won't strike the United States for another day, but authorities are urging residents to get ready.",
					"url": "http://discover.outbrain.com/network/redir?p=i5PLOq8LebhOf9hNU4tlqJzVYpV54-…5tH-_YBJPiRF2lFiGn6XavcP8HZkUgRsFWpG7GgXflefnsA1r0ntdA4QdR_&c=db88b9a0&v=3",
					"date": 1475654400000,
					"source": "CNN"
				}, {
					"title": "New York governor denies role in Bridgegate case",
					"image": "http://images.outbrain.com/Imaginarium/api/uuid/3d9fb0be5065571488fdbefd55f3eff4cd6be83a3c3ad2149b164d8cd57a0c92/190/200",
					"desc": "Former Port Authority executive David Wildstein testified that New York Gov. Andrew Cuomo played a part in attempting to cover up the September 2013 lane closures on the New Jersey side of the George Washington Bridge, a claim that the governor's office denies.",
					"url": "http://discover.outbrain.com/network/redir?p=xmPa0fmEy1nazXYocx3ihNuTZp6J4p…1KYJc3WUOp_VIkLWL0lUH2qGrFYstjKv8-eVCQpCLWUn8dMcXOyLairHjfi&c=6289b0d5&v=3",
					"date": 1475568000000,
					"source": "CNN"
				}, {
					"title": "Philippines' President says he'll 'break up' with US, tells Obama 'go to hell'",
					"image": "http://images.outbrain.com/Imaginarium/api/uuid/fc8a8204ad80c0872a339fae89b36d2954ac3ea77f574cf59c6a2cec99693ee9/190/200",
					"desc": "Philippine President Rodrigo Duterte's vitriol against the United States took another caustic turn Tuesday, when he threatened to \"break up\" with the US and said President Barack Obama can \"go to hell.\"",
					"url": "http://discover.outbrain.com/network/redir?p=6RMK0zORg5fFe9dIxhn7ejfjXqkt16…SSZDmhR1ItQg0uSlDifg0uayNgWGedZ4MHfC2HvraMmF2LiUTQPaqnmX5iG&c=895d22c4&v=3",
					"date": 1475568000000,
					"source": "CNN"
				}, {
					"title": "Suspect pleads guilty in Dan Markel murder case",
					"image": "http://images.outbrain.com/Imaginarium/api/uuid/05085662dc828054d85559a4c11dabac3ea1cf8f19c7f0cda63c62815b730b54/190/200",
					"desc": "One of the men accused in the murder of Florida State University professor Dan Markel has pleaded guilty.",
					"url": "http://discover.outbrain.com/network/redir?p=zEa3OBfqG9CwvsMOeOPcKqWq1D2MlB…thVpKy0MqHJHj5Ef4GkF2juEFe7S7GvPUfaZixWG9RAMuLhzHmXkds9Sxq8&c=5ed3a3a2&v=3",
					"date": 1475610180000,
					"source": "WCTV"
				}, {
					"title": "Canoe fake death wife Anne Darwin: I'll feel guilt until I die",
					"image": "http://images.outbrain.com/Imaginarium/api/uuid/88148d922328672a661529bd926ac8d4d2875c1a2b0945d685ae63e1956bd91e/190/200",
					"desc": "A woman who helped her husband fake his own death says she will feel guilt \"for the rest of my life\" for lying about it to her two sons.",
					"url": "http://discover.outbrain.com/network/redir?p=3RBkQttsgQKHolMon8EBD2IlFJSATD…-khwY9rUDgzCyYuxzpJTwHhYKDt41afvm0XURaCuYI5Xx-GxqXKipI3uV3e&c=f7c101f1&v=3",
					"date": 1475654400000,
					"source": "BBC"
				}]
			}
		},


		/**
		 * Initialize
		 */
		initialize: function() {
			if (this.config.custom) {
				delete this.config.custom;
			}

			// Migrate pre-V2 settings to the new format
			if (["us", "uk", "ca", "fr_ca", "en_il", "fr", "au", "pt-BR_br"].indexOf(this.config.edition) !== -1) {
				var conversions = {
					us: "en-us",
					uk: "en-gb",
					ca: "en-ca",
					fr_ca: "fr-ca",
					en_il: "he-il",
					fr: "fr-fr",
					au: "en-au",
					"pt-BR_br": "pt-br"
				};

				this.config.edition = conversions[this.config.edition] || "en-us";
			}

			if (!this.config.number || this.config.number > 20) {
				this.config.number = 20;
			}


			this.set("activeTab", this.config.topic);

			this.on("change", function(model, options) {
				if (options && options.widgetChange === true) {
					return;
				}

				this.refresh();
			}, this);

			this.on("viewed", function() {
				$.ajax({
					url: this.reportUrl,
					headers: {
						Authorization: authHeader
					}
				});
			});
		},


		/**
		 * Loads the list of topics
		 *
		 * @param   {Function}  cb         The callback
		 */
		getTopics: function(cb) {
			var altNames = {
				technologyandinternet: "Technology",
				businessandfinance: "Business",
				homeandlifestyle: "Lifestyle"
			};

			$.ajax({
				url: "https://sphere.outbrain.com/api/v1/recommendations/categories?limit=10",
				headers: {
					Authorization: authHeader
				},
				dataType: "json",
				success: function(d) {
					var topics = _.map(d, function(d) {
						return [d.alternateName, altNames[d.alternateName] || d.name, d.href];
					});

					topics.unshift(["default", "Top"]);

					cb.call(this, topics || []);
				}.bind(this)
			});
		},


		/**
		 * Parses and normalizes articles
		 *
		 * @param   {Array}   docs       The items to parse
		 * @return  {Object}             An array of parsed, normalized entries
		 */
		parseArticles: function(docs) {
			var articles = _.map(docs, function(e) {
				var doc = e.document || {};

				return {
					promoted: !!e.promoted,
					title: doc.title || "",
					image: e.thumbnail || "",
					desc: doc.description || "",
					url: e._actions && e._actions.click,
					date: new Date(doc.publishTime).getTime(),
					source: (doc.site && doc.site.name) || ""
				};
			});

			return articles;
		},


		refresh: function() {
			// We load the list of topics once when the page loads since it might
			// have changed since we last loaded it
			if (!this.topicsLoaded) {
				this.getTopics(function(topics) {
					this.topicsLoaded = true;

					this.data.topics = topics;

					this.refresh();
				});

				return;
			}

			// We save the active tab in case it changes before the request is finished
			var activeTab = this.get("activeTab");

			if (!this.Auth.isPro && activeTab !== this.config.topic) {
				return this.set("activeTab", this.config.topic);
			}

			var maximized = this.get("state") === "maximized";

			var topic = _.find(this.data.topics, [activeTab]) || [];

			$.ajax({
				url: "https://sphere.outbrain.com/api/v1/trending/documents",
				data: {
					thumbnailSize: "190x200",
					limit: maximized ? 45 : this.config.number,
					filter: topic[0] === "default" ? undefined : "categories:" + topic[0]
				},
				headers: {
					Authorization: authHeader
				},
				dataType: "json",
				success: function(d) {
					// If the active tab has changed (i.e. the user has switched tabs
					// twice before the request finished), we don't want to emit any entries
					if (
						this.get("activeTab") === activeTab &&
						d && d.items
					) {
						var items = this.parseArticles(d.items, maximized);

						if (d._actions && d._actions.reportViewed) {
							this.reportUrl = d._actions.reportViewed;
						}

						// Only save data if this is the default tab and we aren't
						// maximized (and therefore didn't fetch more articles)
						if (activeTab === this.config.topic && !maximized) {
							this.data.items = items;

							this.saveData();
						}
						else {
							// We only trigger the entries:loaded event if this is not the
							// first tab so the view doesn't render twice
							this.trigger("entries:loaded", {
								items: items
							});
						}
					}
				}.bind(this)
			});
		}
	});
});