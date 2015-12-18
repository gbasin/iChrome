/**
 * The toolbar settings page
 */
define(["lodash", "jquery", "core/pro", "settings/page"], function(_, $, Pro, Page) {
	var searchEngineURLs = [
		"https://google.com/search?q=%s",
		"https://search.yahoo.com/search?p=%s",
		"https://www.bing.com/search?q=%s",
		"https://duckduckgo.com/?q=%s",
		"http://www.ask.com/web?q=%s",
		"http://search.aol.com/aol/search?q=%s"
	];

	var View = Page.extend({
		id: "toolbar",

		dynamicControls: {
			"style": "style",
			"search-engine": "searchEngine",
			"search-url": "customSearchURL",
			"voice-search": "voice",
			"ok-google": "ok_google",
			"new-tab": "searchInNewTab",
			"google-plus": "gplus",
			"gmail": "gmail",
			"apps-menu": "apps"
		},

		monitorProps: ["apps", "gmail", "links", "ok", "plus", "searchURL", "searchInNewTab", "toolbar", "voice"],

		events: {
			"click .links button.remove": function(e) {
				var elm = $(e.currentTarget.parentElement);

				var links = _.clone(this.model.get("links"));

				links.splice(elm.attr("data-link"), 1);

				this.model.set("links", links);

				elm.remove();
			}
		},


		/**
		 * Handles input changes, persisting changes to the model
		 *
		 * @param   {HTMLElement}  elm    The input element
		 * @param   {String}       name   The name of the input
		 * @param   {String}       value  The value of the input
		 */
		onInputChange: function(elm, name, value) {
			var keyMap = {
				"style": "toolbar",
				"voice-search": "voice",
				"ok-google": "ok",
				"new-tab": "searchInNewTab",
				"google-plus": "plus",
				"gmail": "gmail",
				"apps-menu": "apps"
			};

			if (keyMap[name]) {
				this.model.set(keyMap[name], value, {
					noRender: true
				});
			}
			else if (name === "search-engine" && value === "custom") {
				$(elm).parents(".input").first().children(".input.other").addClass("visible");
			}
			else if (name === "search-engine" || name === "searchURL") {
				$(elm).parents(".input").first().children(".input.other").removeClass("visible");

				this.model.set("searchURL", value, {
					noRender: true
				});
			}
			else if (name === "link-text" || name === "link-url") {
				var links = _.clone(this.model.get("links")),
					field = name === "link-text" ? "text" : "link",
					index = elm.parentElement.getAttribute("data-link");

				if (index === "new") {
					index = links.length;

					links.push({
						link: "",
						text: ""
					});
				}
				else {
					links[index] = _.clone(links[index]);
				}

				links[index][field] = value;

				this.model.set("links", links);
			}
		},


		onBeforeRender: function(data) {
			var ret = {
				style: data.toolbar,
				searchEngine: searchEngineURLs.indexOf(data.searchURL) === -1 ? "custom" : data.searchURL,
				voice: data.voice,
				ok_google: data.ok,
				searchInNewTab: data.searchInNewTab,
				gplus: data.plus,
				gmail: data.gmail,
				apps: data.apps,
				customLinks: _.map(data.links, function(e, i) {
					return _.assign({}, e, { i: i });
				}),
				canAddLinks: data.links.length < (Pro.isPro ? 8 : 3)
			};

			if (ret.searchEngine === "custom") {
				ret.customSearchURL = data.searchURL;
			}

			return ret;
		}
	});

	return View;
});