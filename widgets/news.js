/*
 * The News widget.
 */
define(["jquery"], function($) {
	return {
		id: 4,
		interval: 300000,
		nicename: "news",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "number",
				nicename: "number",
				label: "Articles Shown",
				min: 1,
				max: 10
			},
			{
				type: "select",
				nicename: "edition",
				label: "Edition",
				help: "If your edition or topic is not listed here, please enter a Google News feed URL is the Custom Feed field below (check the help text there for an explanation).",
				options: {
					us: "U.S.",
					uk: "U.K.",
					ca: "Canada (English)",
					fr_ca: "Canada (French)",
					en_il: "Israel (English)",
					fr: "France",
					au: "Australia",
					"pt-BR_br": "Brazil"
				}
			},
			{
				type: "select",
				nicename: "topic",
				label: "Topic",
				chained: "edition",
				options: "getTopics"
			},
			{
				type: "text",
				nicename: "custom",
				label: "Custom Feed",
				help: "This is the feed at the URL listed at the bottom of every Google News page, look for an orange RSS icon and a link that says \"RSS\"",
				placeholder: "Enter a custom RSS feed to fetch news from"
			},
			{
				type: "text",
				nicename: "link",
				label: "Footer URL",
				placeholder: "Enter a URL that the \"More\" link should point to"
			}
		],
		config: {
			size: "variable",
			title: "News",
			number: 5,
			edition: "us",
			topic: "top",
			custom: "",
			link: "http://news.google.com"
		},
		data: {
			items: [
				{
					title: "Memories of a South African election day - Washington Post",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNE5dby4rKtKx6jUT1pUSRKFY…an-election-day/2013/12/06/7199c1f2-5e98-11e3-bc56-c6ca94801fac_story.html",
					image: "https://t1.gstatic.com/images?q=tbn:ANd9GcQhnU5rscvH7oQU9jtjBa3eUo4MP58mkUSRJ-twJuDoMIjErsXQtqA-gvuCGCBmtpePxvxsw6w",
					desc: "I remember his smile. His fist punched up in triumph. I stood among the many people crowded in a Johannesburg downtown hotel in 1994 dancing and rejoicing with Nelson Mandela as he celebrated South Africa's first all-race elections and his election as"
				},
				{
					title: "National unemployment rate hits five-year low - Kansas City Star",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNEl9D8rS8SFQxJHJbRgK_DQS…www.kansascity.com/2013/12/06/4673371/national-unemployment-rate-hits.html",
					image: "https://t2.gstatic.com/images?q=tbn:ANd9GcRl6RNceopaAIys1IR_hki58-WXcRhJOVKJ29BsDBRIZ6kLyPwCstZAfVh3-L-C8HesOa33pE_1",
					desc: "The national unemployment rate fell to a five-year low of 7 percent in November and payrolls grew by 203,000. More News. Read more Business. The better-than-expected numbers included a net gain of 196,000 private-sector and 7,000 government jobs"
				},
				{
					title: "Flights canceled as deadly icy blast hits South, Midwest - Fox News",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNGUSvF3z-_v6w8edKJ-0X23U…xnews.com/weather/2013/12/06/ice-friday-blast-bears-down-on-south-midwest/",
					image: "https://t2.gstatic.com/images?q=tbn:ANd9GcS2QH9HpsMCk6NEBsVzRz1vGg9M0aN4Jv3eg1NG3quI8tlgErp616wSnp_k-IpZdeFFCZxkduMe",
					desc: "Texas residents have been hit with a wintry storm system that has been blamed for at least one death and dumped 1 to 2 feet of snow in parts of the Midwest and draped many communities in skin-stinging cold. Earlier this week, many in Texas were basking in"
				},
				{
					title: "Mississippi Sen. Cochran to seek seventh Senate term - NBCNews.com",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNEx-yq0E3eX_lGoI6ny88Gvo…13/12/06/21792122-mississippi-sen-cochran-to-seek-seventh-senate-term?lite",
					image: "https://t1.gstatic.com/images?q=tbn:ANd9GcSI2m0XFN8UTTehRpyWEH-pLRiituOjlECDG_1fA91DX0Penh_eXWMHzNrYXD0mQj7l0hokEZcA",
					desc: "By Jessica Taylor, NBC News. Mississippi Sen. Thad Cochran will seek a seventh term in 2014, NBC News learned Friday, making the veteran lawmaker into a top target for conservative groups during next year's GOP primary. Amid murmurs that Cochran"
				},
				{
					title: "Scott Brown flubs, forgets he's in New Hampshire - CBS News",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNHxbWxS1kbt6rptPyoLsvRSY…ttp://www.cbsnews.com/news/scott-brown-flubs-forgets-hes-in-new-hampshire/",
					image: "https://t2.gstatic.com/images?q=tbn:ANd9GcTvFq23n1LXdz5OsLZ_wjHIgmitZn7R2lMQr5Xp0Rg7i1oMBK69O-l8U2Dzq77OMehPLghv8yA",
					desc: "Former Sen. Scott Brown, R-Mass., speaks during a news conference at the U.S. Capitol on February 16, 2012 in Washington, DC. Photo by Win McNamee/Getty Images. Shares. Tweets; Stumble. Email; More +. Former New Hampshire - er, Massachusetts"
				}
			]
		},
		getTopics: function(cb, edition) {
			var topics = {
				top: "Top Stories",
				w: "World",
				n: "Nation",
				b: "Business",
				s: "Sports",
				tc: "Technology",
				e: "Entertainment",
				m: "Health",
				snc: "Science",
				ir: "Spotlight"
			},
			edition = edition || "us";

			if (edition == "pt-BR_br") {
				delete topics.snc;
				delete topics.ir;

				topics.t = "Science/Technology";
				topics.po = "Spotlight";
			}

			cb(topics);
		},
		refresh: function() {
			var config = this.config;

			$.get((config.custom && config.custom !== "") ? config.custom.parseUrl() : ("https://news.google.com/news/feeds?ned=" + config.edition + "&topic=" + (config.topic !== "top" ? config.topic : "") + "&output=rss"), function(d) {
				d = $(d);

				var items = d.find("item"),
					news = {
						items: []
					};

				items.each(function(i) {
					var itm = $(this),
						html = $("<div>" + itm.find("description").text().replace(/ src="\/\//g, " data-src=\"https://").replace(/ src="http"/g, " data-src=\"http") + "</div>"),
						item = {
							title: itm.find("title").text().trim(),
							url: itm.find("link").text().trim(),
							image: html.find("img[data-src]").first().attr("data-src"),
							desc: html.find(".lh font:nth-of-type(2)").find("*").remove().end().text().trim()
						};

					if (item.desc == "") {
						item.desc = html.text().trim();
					}

					if (item.image == "") {
						delete item.image;
					}

					news.items.push(item);
				});

				this.data = news;

				this.render.call(this);

				this.utils.saveData(this.data);
			}.bind(this));
		},
		render: function() {
			var news = $.extend({}, this.data || {items:[]});

			news.items = news.items.slice(0, this.config.number);

			if (news.items[0]) {
				news.items[0].featured = true;
			}

			if (this.config.title && this.config.title !== "") {
				news.title = this.config.title;
			}

			if (this.config.link && this.config.link !== "") {
				news.link = this.config.link;
			}

			this.utils.render(news);
		}
	};
});