define(["lodash", "jquery", "widgets/model"], function(_, $, WidgetModel) {
	return WidgetModel.extend({
		widgetClassname: "tabbed-corner",

		refreshInterval: 300000,

		defaults: {
			config: {
				size: "variable",
				title: "i18n.name",
				number: 5,
				edition: "en-us",
				topic: "$allStories",
				link: "https://news.google.com"
			},

			data: {
				topics: [
					["$allStories", "All"],
					["rt_US", "Top Stories", "cms-amp-AA9tmo2"],
					["rt_usanatnews", "US", "cms-amp-AA9tmo3"],
					["rt_World", "World", "cms-amp-AAaeSyj"],
					["rt_Crime", "Crime", "cms-amp-AAavKVW"],
					["rt_Offbeat", "Offbeat", "cms-amp-AAavKWc"],
					["rt_ScienceAndTechnology", "Technology", "cms-amp-AAavzN1"],
					["rt_Politics", "Politics", "cms-amp-AAaviQH"],
					["rt_Opinion", "Opinion", "cms-amp-AA9tmod"],
					["rt_WeekendReads", "Weekend Reads", "cms-amp-AA9tmoc"],
					["rt_Entertainment", "Entertainment", "cms-amp-AAaviU8"],
					["rt_Business", "Money", "cms-amp-AAaf38w"],
					["rt_Sports", "Sports", "cms-amp-AAavGal"]
				],
				items: [
					{
						"title": "EXCLUSIVE-Chemical weapons used in Syrian fighting - watchdog",
						"desc": "Chemical weapons experts have determined that mustard gas was used during fighting in Syria in August, according to a report by an international watchdog seen by Reuters.",
						"date": 1446747372000,
						"image": "http://img-s-msn-com.akamaized.net/tenant/amp/entityid/BBmSQjO_m5_h190_w200.jpg",
						"url": "http://a.msn.com/r/2/BBmSxTl",
						"source": "Reuters"
					},
					{
						"title": "The tragic case of the boy who was missing for 13 years — and didn’t know it",
						"desc": "Julian Hernandez was abducted in Alabama by his father in 2002, police said. He was found in Ohio, living under assumed name.",
						"date": 1446746400000,
						"image": "http://img-s-msn-com.akamaized.net/tenant/amp/entityid/BBmSxnS_m5_h190_w200.jpg",
						"url": "http://a.msn.com/r/2/BBmSx48",
						"source": "The Washington Post"
					},
					{
						"title": "Rumsfeld: Bush 41 'getting up in years'",
						"desc": "The former Defense secretary is pushing back on criticism from the elder Bush.",
						"date": 1446752880000,
						"image": "http://img-s-msn-com.akamaized.net/tenant/amp/entityid/BBmSvmg_m5_h190_w200.jpg",
						"url": "http://a.msn.com/r/2/BBmSFha",
						"source": "The Hill"
					},
					{
						"title": "Russia, Egypt reject British PM's terrorist bomb speculation",
						"desc": "British Prime Minister David Cameron said Thursday there is a \"strong possibility\" a terrorist bomb brought down a Russian plane over the Sinai even as Russia and Egypt dismissed such talk as premature speculation.",
						"date": 1446746400000,
						"image": "http://img-s-msn-com.akamaized.net/tenant/amp/entityid/BBmSnRb_m5_h190_w200.jpg",
						"url": "http://a.msn.com/r/2/BBmPoS9",
						"source": "USA Today"
					},
					{
						"title": "Detective: 'Hero' cop sought hit-man to cover up thefts",
						"desc": "Months before an Illinois police officer staged his suicide to look like murder, prompting an expensive manhunt that put his community under siege, he tried to find a hit man to kill a village administrator.",
						"date": 1446750000000,
						"image": "http://img-s-msn-com.akamaized.net/tenant/amp/entityid/BBmS7SA_m5_h190_w200.jpg",
						"url": "http://a.msn.com/r/2/BBmScSG",
						"source": "Associated Press"
					}
				]
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

			this.authHeader = this.Auth.adFree ? "API_KEY db72b4be78c04a3a97b2b11ea8ab1e4a" : "API_KEY 8b04677e27d5498a90e306eedbf19fb3";


			this.set("activeTab", this.config.topic);

			this.on("change", function(model, options) {
				if (options && options.widgetChange === true) {
					return;
				}

				this.refresh();
			}, this);
		},


		/**
		 * Loads the list of topics for the current news edition.
		 *
		 * @param   {Function}  cb         The callback
		 * @param   {String}    [edition]  The edition to get topics for, defaults to the current edition
		 */
		getTopics: function(cb, edition) {
			edition = edition || this.config.edition;

			$.getJSON("http://cdn.content.prod.cms.msn.com/none/sources/alias/compositestreambyname/today?market=" + edition + "&tenant=amp&vertical=news", function(d) {
				var topics = _.map(d && d._links && d._links.sources, function(d) {
					return [d.categoryKey, d.sourceName, d.href];
				});

				topics.unshift(["$allStories", this.translate("all_stories")]);

				cb.call(this, topics || []);
			}.bind(this));
		},


		/**
		 * Parses and normalizes articles
		 *
		 * @param   {Array}   docs       The items to parse
		 * @return  {Object}             An array of parsed, normalized entries
		 */
		parseArticles: function(docs, maximized) {
			// Bing returns a relational data structure, we need to index the items
			// for fast lookups
			var images = {},
				sources = {},
				articles = [];

			_.each(docs, function(e) {
				var self = (e._links && e._links.self && e._links.self[0]) || {};

				if (self.type === "image") {
					images[self.href] = e;
				}
				else if (self.type === "provider") {
					sources[self.href] = e;
				}
				else if (self.type === "article" || self.type === "video" || self.type === "slideshow") {
					articles.push(e);
				}
			});


			var textDiv = document.createElement("div");

			articles = _.map(articles, function(e) {
				var image = _.find(e._links && e._links.references, { type: "image" });

				image = image && images[image.href] && images[image.href].href;

				textDiv.innerHTML = e.abstract || "";

				return {
					title: e.title || "",
					desc: textDiv.textContent.trim(),
					date: new Date(e.displayPublishedDateTime).getTime(),
					image: maximized ? image : (image || "").replace(".img", "_m5_h190_w200.jpg"),
					url: (((e._links && e._links.self && e._links.self[0]) || {}).href || "").replace("cms-amp-", "http://a.msn.com/r/2/"),
					source: e._links && e._links.provider && e._links.provider[0] && sources[e._links.provider[0].href] && sources[e._links.provider[0].href].displayName
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

			var topic = _.find(this.data.topics, [activeTab]);

			$.getJSON("http://cdn.content.prod.cms.msn.com/common/abstract/" + (topic[0] === "$allStories" ? "alias/compositestreambyname/today" : "id/" + topic[2]), {
				count: maximized ? 45 : this.config.number,
				market: this.config.edition,
				tenant: "amp",
				vertical: "news",
				_: new Date().getTime() //to avoid caching
			}, function(d) {
				// If the active tab has changed (i.e. the user has switched tabs
				// twice before the request finished), we don't want to emit any entries
				if (
					this.get("activeTab") === activeTab &&
					d && d._embedded && d._embedded.documents
				) {
					var items = this.parseArticles(d._embedded.documents, maximized);

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
			}.bind(this));
		}
	});
});