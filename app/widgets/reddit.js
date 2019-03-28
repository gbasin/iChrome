/*
 * The Reddit widget.
 */
define(["jquery", "moment"], function($, moment) {
	return {
		id: 18,
		size: 6,
		order: 30,
		interval: 300000,
		nicename: "reddit",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "text",
				nicename: "subreddit",
				label: "i18n.settings.subreddit",
				help: "i18n.settings.subreddit_help",
				placeholder: "i18n.settings.subreddit_placeholder"
			},
			{
				type: "select",
				nicename: "sort",
				label: "i18n.settings.sort",
				options: {
					hot: "i18n.settings.sort_options.hot",
					top: "i18n.settings.sort_options.top",
					"new": "i18n.settings.sort_options.new",
					gilded: "i18n.settings.sort_options.gilded",
					rising: "i18n.settings.sort_options.rising",
					controversial: "i18n.settings.sort_options.controversial",
				}
			},
			{
				type: "number",
				nicename: "number",
				label: "i18n.settings.links",
				min: 1,
				max: 10
			},
			{
				type: "radio",
				nicename: "click",
				label: "i18n.settings.click",
				options: {
					link: "i18n.settings.click_options.link",
					comments: "i18n.settings.click_options.comments"
				}
			},
			{
				type: "radio",
				nicename: "link",
				label: "i18n.settings.footer_link",
				options: {
					show: "i18n.settings.footer_link_options.show",
					hide: "i18n.settings.footer_link_options.hide"
				}
			}
		],
		config: {
			size: "variable",
			title: "i18n.name",
			number: 5,
			sort: "hot",
			subreddit: "all",
			link: "show",
			click: "link"
		},
		data: {
			links: [
				{
					id: "t3_1u5nzu",
					link: "http://imgur.com/pa5X7gH",
					user: "BigGulpsHuh7",
					score: 1740,
					title: "Worst lady of 2013 (fixed) (fixed)",
					domain: "imgur.com",
					subreddit: "funny",
					permalink: "/r/funny/comments/1u5nzu/worst_lady_of_2013_fixed_fixed/",
					created: 1388583609000,
					comments: "124",
					image: "http://f.thumbs.redditmedia.com/x1LB_aco57Z-zBEk.jpg"
				},
				{
					id: "t3_1u5j8t",
					link: "http://www.youtube.com/watch?v=-N_UuImPL4E",
					user: "untranslatable_pun",
					score: 2060,
					title: "THE WIRE: Snoop Buys a Nail Gun. My favorite scene from the entire series. (No spoilers)",
					domain: "youtube.com",
					subreddit: "videos",
					permalink: "/r/videos/comments/1u5j8t/the_wire_snoop_buys_a_nail_gun_my_favorite_scene/",
					created: 1388574231000,
					comments: "697",
					image: "http://b.thumbs.redditmedia.com/OINzo6WMdTbZUHQa.jpg"
				},
				{
					id: "t3_1u5m1r",
					link: "http://i.imgur.com/fBHxyZl.jpg",
					user: "hms90",
					score: 1471,
					title: "Meet the latest addition to our family, Slim Shady.",
					domain: "i.imgur.com",
					subreddit: "aww",
					permalink: "/r/aww/comments/1u5m1r/meet_the_latest_addition_to_our_family_slim_shady/",
					created: 1388579835000,
					comments: "78",
					image: "http://c.thumbs.redditmedia.com/oJNpAN5uFgXD9zH8.jpg"
				},
				{
					id: "t3_1u5gru",
					link: "http://i.imgur.com/Ia845vX.gif",
					user: "teap0ts",
					score: 2449,
					title: "Best use of my tax dollars I've seen yet",
					domain: "i.imgur.com",
					subreddit: "gifs",
					permalink: "/r/gifs/comments/1u5gru/best_use_of_my_tax_dollars_ive_seen_yet/",
					created: 1388569461000,
					comments: "209"
				},
				{
					id: "t3_1u5ier",
					link: "http://www.reuters.com/article/2014/01/01/us-hongkong-democracy-idUSBREA0005420140101?feedType=RSS&amp;feedName=worldNews",
					user: "Litteratur",
					score: 1967,
					title: "Thousands march in Hong Kong in escalating battle for democracy",
					domain: "reuters.com",
					subreddit: "worldnews",
					permalink: "/r/worldnews/comments/1u5ier/thousands_march_in_hong_kong_in_escalating_battle/",
					created: 1388572611000,
					comments: "365"
				},
				{
					id: "t3_1u5ieg",
					link: "http://www.aljazeera.com/indepth/opinion/2013/12/what-snowden-really-revealed-20131228113515573236.html",
					user: "jstratg",
					score: 1886,
					title: "What Snowden really revealed: We have sacrificed our freedoms and morals in order to make war on those abroad, and, more subtly, on ourselves",
					domain: "aljazeera.com",
					subreddit: "politics",
					permalink: "/r/politics/comments/1u5ieg/what_snowden_really_revealed_we_have_sacrificed/",
					created: 1388572589000,
					comments: "230"
				},
				{
					id: "t3_1u5dj5",
					link: "http://imgur.com/ISzszsN",
					user: "cp3woo",
					score: 2910,
					title: "Mike Tyson just posted this on twitter with the caption, \"Happy New Ears\"",
					domain: "imgur.com",
					subreddit: "funny",
					permalink: "/r/funny/comments/1u5dj5/mike_tyson_just_posted_this_on_twitter_with_the/",
					created: 1388563858000,
					comments: "217",
					image: "http://f.thumbs.redditmedia.com/bK1m2Urw9lDtWVoA.jpg"
				},
				{
					id: "t3_1u5gow",
					link: "http://i.imgur.com/6QXBwM9.jpg",
					user: "Our_gamers",
					score: 2148,
					title: "One of my favorite family guy scenes",
					domain: "i.imgur.com",
					subreddit: "funny",
					permalink: "/r/funny/comments/1u5gow/one_of_my_favorite_family_guy_scenes/",
					created: 1388569299000,
					comments: "59"
				},
				{
					id: "t3_1u5mwr",
					link: "http://i.imgur.com/COeUCqr.gif",
					user: "not_a_famous_actor",
					score: 1028,
					title: "Richie wouldn't let his blindness stop him from following his dreams of becoming a graffiti artist",
					domain: "i.imgur.com",
					subreddit: "wheredidthesodago",
					permalink: "/r/wheredidthesodago/comments/1u5mwr/richie_wouldnt_let_his_blindness_stop_him_from/",
					created: 1388581499000,
					comments: "17",
					image: "http://d.thumbs.redditmedia.com/JWoNW_i9l2zful9o.jpg"
				},
				{
					id: "t3_1u5e3d",
					link: "http://i.imgur.com/SglJI42.jpg",
					user: "queen_of_the_koopas",
					score: 2236,
					title: "Wicked awesome bunk bed my friend built her kid!",
					domain: "i.imgur.com",
					subreddit: "gaming",
					permalink: "/r/gaming/comments/1u5e3d/wicked_awesome_bunk_bed_my_friend_built_her_kid/",
					created: 1388564740000,
					comments: "107"
				}
			]
		},
		refresh: function() {
			var config = this.config;

			$.get("http://www.reddit.com/" + (config.subreddit && config.subreddit !== "" ? "r/" + config.subreddit : "") + (config.sort && config.sort !== "" && config.sort !== "hot" ? "/" + config.sort : "") + ".json?limit=10", function(d) {
				var links = [];

				d.data.children.slice(0, 10).forEach(function(e) {
					e = e.data;

					var link = {
						id: e.name,
						link: e.url,
						user: e.author,
						score: e.score,
						title: e.title,
						domain: e.domain,
						subreddit: e.subreddit,
						permalink: e.permalink,
						created: e.created_utc * 1000,
						comments: e.num_comments.toLocaleString()
					};

					if (e.thumbnail && e.thumbnail !== "" && e.thumbnail.trim().indexOf("http") === 0) {
						link.image = e.thumbnail.trim();
					}

					links.push(link);
				});

				this.data = {
					links: links
				};

				this.render.call(this);

				this.utils.saveData(this.data);
			}.bind(this));
		},
		render: function(demo) {
			var data = $.extend(true, {}, this.data || {links:[]});

			data.links = data.links.slice(0, this.config.number || 5);

			data.links.forEach(function(e) {
				if (demo) {
					e.created = moment(e.created).from([2014, 0, 1, 11]).replace("hour", "hr").replace("minute", "min").replace("a few ", "");
				}
				else {
					e.created = moment(e.created).fromNow().replace("hour", "hr").replace("minute", "min").replace("a few ", "");
				}

				if (!e.subreddit.toLowerCase || e.subreddit.toLowerCase() === this.config.subreddit.toLowerCase()) {
					e.subreddit = false;
				}

				if (this.config.click && this.config.click === "comments") {
					e.link = "http://www.reddit.com" + e.permalink;
				}

				if (e.score < 0) {
					e.direction = " down";
				}

				e.score = e.score.toLocaleString();
			}.bind(this));

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (this.config.link && this.config.link === "show") {
				data.link = "http://www.reddit.com/" + (this.config.subreddit && this.config.subreddit !== "" ? "r/" + this.config.subreddit : "");
			}

			this.utils.render(data);
			this.elm.addClass("tabbed");
		}
	};
});