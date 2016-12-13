/**
 * Displays a search results page in app
 */
define(["backbone", "jquery", "lodash", "browser/api", "core/analytics", "search/suggestions", "search/speech", "core/render"], function(Backbone, $, _, Browser, Track, Suggestions, Speech, render) {
	var Model = Backbone.Model.extend({
		url: function() {
			if (!this.md5) {
				/* jshint ignore:start */
				this.md5 = function(){for(var m=[],l=0;64>l;)m[l]=0|4294967296*Math.abs(Math.sin(++l));return function(c){var e,g,f,a,h=[];c=unescape(encodeURI(c));for(var b=c.length,k=[e=1732584193,g=-271733879,~e,~g],d=0;d<=b;)h[d>>2]|=(c.charCodeAt(d)||128)<<8*(d++%4);h[c=16*(b+8>>6)+14]=8*b;for(d=0;d<c;d+=16){b=k;for(a=0;64>a;)b=[f=b[3],(e=b[1]|0)+((f=b[0]+[e&(g=b[2])|~e&f,f&e|~f&g,e^g^f,g^(e|~f)][b=a>>4]+(m[a]+(h[[a,5*a+1,3*a+5,7*a][b]%16+d]|0)))<<(b=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21][4*b+a++%4])|f>>>32-b),e,g];for(a=4;a;)k[--a]=k[a]+b[a]}for(c="";32>a;)c+=(k[a>>3]>>4*(1^a++&7)&15).toString(16);return c}}();
				/* jshint ignore:end */
			}

			return "http://ichrxml.com/feed.php?" +
				"ch=ichrhp" +
				"&sk=" + this.md5(this.get("query") + "ichrxml.com" + "fixplp4s2") +
				"&q=" + encodeURIComponent(this.get("query")) +
				"&qtype=oa" +
				"&ns=" + (this.get("next") ? 4 : 7) +
				"&no=10" +
				(this.get("next") ? "&pnArgs=" + encodeURIComponent(this.get("next")) : "");
		},

		defaults: {
			query: "",
			next: null,
			results: []
		},

		initialize: function() {
			this.on("change:query", function() {
				this.set({
					next: this.defaults.next,
					results: this.defaults.results
				});

				this.fetch();
			});

			if (this.get("query").trim() !== "") {
				this.fetch();
			}
		},

		parse: function(d) {
			if (!d || !d.o) {
				return d;
			}

			var ads = _.map(d.a || [], function(e) {
				e = _.pick(e, "title", "text", "domain", "link");

				e.ad = true;

				return e;
			});

			var organic = _.map(d.o, function(e) {
				return _.pick(e, "title", "text", "domain", "link");
			});


			var topAds = this.get("ads") || [],
				results = this.get("results") || [];

			if (results.length) {
				results = results.concat(organic, ads.slice(0, 4));
			}
			else {
				topAds = ads.slice(0, 4);

				results = results.concat(organic, ads.slice(4, 7));
			}

			return {
				ads: topAds,
				results: results,
				next: d.next || null
			};
		},

		// Proxy Backbone's fetch to prevent multiple requests from happening at the same time
		fetch: function(options) {
			if (this._fetchXhr && this._fetchXhr.readyState > 0 && this._fetchXhr.readyState < 4) {
				this._fetchXhr.abort();
			}

			this._fetchXhr = Backbone.Model.prototype.fetch.call(this, options);

			return this._fetchXhr;
		},
	});

	var View = Backbone.View.extend({
		tagName: "div",
		className: "search-container",

		events: {
			"click .exit":		"hide",
			"input input":		"change",
			"keydown input":	"keydown",
			"focusin input":	function(e) { this.change(e, "focusin"); },
			"focusout input":	function(e) { this.change(e, "focusout"); },

			"click button.submit": function() {
				this.submit(null, "button");
			},

			"click button.speech": function() {
				this.Speech.start();

				Track.event("Search", "Speech", "Start");
			},

			"click button.load-more": function() {
				this.model.fetch();
			},

			"click .tabs a": function(e) {
				e.currentTarget.href = e.currentTarget.href.split("q=")[0] + "q=" + encodeURIComponent(this.model.get("query"));
			}
		},

		keydown: function(e) {
			if ([13, 38, 40].indexOf(e.which) !== -1) {
				e.preventDefault();
			}

			if (e.which === 13) {
				this.submit();
			}
			else if (e.which === 38) {
				this.Suggestions.setFocus("prev");

				Track.event("Search", "Suggestions", "Key Prev");
			}
			else if (e.which === 40) {
				this.Suggestions.setFocus("next");

				Track.event("Search", "Suggestions", "Key Next");
			}
		},

		change: function(e, w) {
			var val = e.currentTarget.value.trim();

			if (val !== "" && w !== "focusout") {
				this.handleInstant(val);

				this.Suggestions.load(val);
			}
			else if (!w || (w === "focusout")) {
				this.Suggestions.hide();
			}
		},

		submit: function(val, source) {
			if (typeof val !== "string") {
				val = this.$("input").val().trim();
			}


			var queryURL = this.Suggestions.isURL(val);

			// Button clicks are clearly intended to be searches, not url visits
			if (queryURL && source !== "button") {
				if (queryURL.indexOf("chrome:") === 0 || queryURL.indexOf("about:")) {
					Browser.tabs.getCurrent(function(d) {
						Browser.tabs.update(d.id, {
							url: queryURL
						});
					});
				}
				else {
					var link = document.createElement("a");

					link.setAttribute("href", queryURL);

					link.click();
				}

				return;
			}


			if (!source || source !== "speech") {
				Track.queue("search", val);

				Track.ga("send", {
					useBeacon: true,
					hitType: "pageview",
					title: "Search: " + val,
					page: "/search/page?q=" + encodeURIComponent(val)
				});
			}

			this.$("input").blur();

			this.model.set("query", val);
		},

		initialize: function() {
			this.model = new Model();

			this.Speech = Speech();

			this.Suggestions = new Suggestions();

			this.$el.appendTo(document.body);

			this.model.on("change", this.render, this);

			// This is attached to both select and focuschange since searches won't happen instantly and it's good for users to see what they've selected
			this.Suggestions.on("select focuschange", function(val) {
				this.$("input").val(val);

				this.handleInstant(val);
			}, this).on("select", this.submit, this).on("show", function() {
				this.$el.addClass("suggestions-visible");
			}, this).on("hide", function() {
				this.$el.removeClass("suggestions-visible");
			}, this);

			// Speech results are forwarded from the toolbar search handler
			this.on("speech:result", function(val) {
				Track.queue("search", val, true);

				Track.ga("send", {
					useBeacon: true,
					hitType: "pageview",
					title: "Voice Search: " + val,
					page: "/search/speech?q=" + encodeURIComponent(val)
				});

				this.$("input").val(val);

				this.submit(val, "speech");
			}, this);

			this.render(true);
		},

		setQuery: function(query) {
			this.show();

			this.$("input").val(query).trigger("input").focus();

			return this;
		},

		handleInstant: _.debounce(function(val) {
			this.model.set("query", val);
		}, 250, { maxWait: 1000 }),

		isVisible: false,

		show: function() {
			if (this.isVisible) {
				return;
			}

			$(document.documentElement).css("overflow", "hidden").on("keydown.searchPage", function(e) {
				if (e.keyCode === 27) {
					this.hide();
				}
			}.bind(this));

			this.$el.addClass("visible")[0].animate([
				{ opacity: 0 },
				{ opacity: 1 }
			], {
				duration: 150,
				easing: "cubic-bezier(.4, 0, .2, 1)"
			});

			this.isVisible = true;
		},

		hide: function() {
			if (!this.isVisible) {
				return;
			}

			this.el.animate([
				{ opacity: 1 },
				{ opacity: 0 }
			], {
				duration: 150,
				easing: "cubic-bezier(.4, 0, .2, 1)"
			}).onfinish = function() {
				this.$el.removeClass("visible");

				$(document.documentElement).css("overflow", "").off("keydown.searchPage");

				this.isVisible = false;
			}.bind(this);

			this.trigger("hide", this.$("input").val());
		},

		render: function(initial) {
			var data = this.model.toJSON();

			data.initial = initial === true;

			data.hasResults = data.results && data.results.length;

			if (initial === true) {
				this.$el.html(render("search-page", data));

				this.Suggestions.setElement(this.$(".suggestions")).trigger("element:updated");

				this.show();
			}
			else {
				this.$(".results-container").replaceWith(render("search-page", data));
			}

			return this;
		}
	});

	return View;
});