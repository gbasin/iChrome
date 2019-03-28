/*
 * The Feedly widget.
 */
define(["jquery", "moment", "oauth"], function($, moment, OAuth) {
	var abbreviate = function(num, min, precision) {
		var newValue = num;

		min = min || 1000;
		precision = precision || 3;

		if (num >= min) {
			var suffixes = ["", "K", "M", "B","T"],
				suffixNum = Math.floor((("" + parseInt(num)).length - 1) / 3),
				shortValue = "";

			for (var length = precision; length >= 1; length--) {
				shortValue = parseFloat((suffixNum !== 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(length));

				var dotLessShortValue = (shortValue + "").replace(/[^A-z0-9 ]+/g, "");

				if (dotLessShortValue.length <= precision) {
					break;
				}
			}

			if (shortValue % 1 !== 0) {
				shortValue = shortValue.toFixed(1);
			}

			newValue = shortValue + suffixes[suffixNum];
		}
		else {
			newValue = newValue.toLocaleString();
		}

		return newValue;
	};

	return {
		id: 19,
		size: 6,
		order: 22,
		interval: 300000,
		nicename: "feedly",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "select",
				nicename: "source",
				label: "i18n.settings.source",
				options: "getSources"
			},
			{
				type: "radio",
				nicename: "show",
				label: "i18n.settings.show",
				options: {
					all: "i18n.settings.show_options.all",
					unread: "i18n.settings.show_options.unread"
				}
			},
			{
				type: "select",
				nicename: "view",
				label: "i18n.settings.layout",
				options: {
					list: "i18n.settings.layout_options.titles",
					magazine: "i18n.settings.layout_options.magazine",
					cards: "i18n.settings.layout_options.cards",
					"cards dual": "i18n.settings.layout_options.cards_columns",
				}
			},
			{
				type: "radio",
				nicename: "mark",
				label: "i18n.settings.mark",
				options: {
					scroll: "i18n.settings.mark_options.scroll",
					click: "i18n.settings.mark_options.click"
				}
			},
			{
				type: "radio",
				nicename: "sort",
				label: "i18n.settings.sort",
				options: {
					newest: "i18n.settings.sort_options.newest",
					oldest: "i18n.settings.sort_options.oldest"
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
			source: "feed/http://feeds.gawker.com/lifehacker/vip/",
			show: "all",
			view: "cards dual",
			mark: "click",
			sort: "newest",
			link: "show"
		},
		data: {
			articles: [
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_14354a6731b:d089:623b9014",
					content: "<img alt=\"\" src=\"http://cdn1.sbnation.com/entry_photo_images/9627611/shutterstock_61775431_large.jpg\">\n<p>A few weeks ago, the Innocence Project of New York (IP) announced that it had helped to release another innocent person from prison. This time it was Gerard Richardson. As <a target=\"_blank\" href=\"http://www.theverge.com/2013/9/25/4770070/biting-controversy-forensic-dentistry-battles-to-prove-its-not-junk\"><i>The Verge</i> outlined in September</a>, Richardson was convicted of murdering a New Jersey woman in 1994 after a forensic odontologist concluded that the shape of Richardson’s jaw and the orientation of his teeth matched a bite mark on the murdered woman’s back.</p>\n<p>After years of legal wrangling, IP was finally allowed to conduct a DNA test to double-check the odontologist’s conclusions. Their goal: to determine whether saliva swabbed from the bite mark in 1994 matched Richardson’s genetic makeup. It didn’t. The odontologist’s conclusion was proven false. Given this new information, prosecutors dropped Richardson’s case, and a judge declared him exonerated. After serving 19 years behind bars for a crime he had nothing to do with, <a target=\"_blank\" href=\"http://www.usatoday.com/story/news/nation/2013/12/18/gerald-richardson-exonerated-dna/4107817/\">Richardson finally walked home to his family as a free man on December 17th</a>.</p>\n<p>Richardson’s ordeal is but one in a steadily increasing number of cases overturned using DNA evidence. To this day, IP is aware of <a target=\"_blank\" href=\"http://www.innocenceproject.org/know/\">311 such exonerations</a> — cases in which someone was declared innocent of a crime long after they had been convicted in court. About 70 percent of those exonerations relied on DNA evidence.</p>\n<p>But if you ask David A. Harris, that number should be much higher. Not only that; he also says new technology could accelerate such exonerations now — if only law enforcement would make the decision to use it.</p>\n<p><q>DNA has exonerated hundreds of innocent prisoners</q></p>\n<p>Harris is <a target=\"_blank\" href=\"http://law.pitt.edu/people/full-time-faculty/david-a-harris\">a law professor at the University of Pittsburgh</a> who focuses on police behavior and law enforcement regulation. Last year, he published his third book, <a target=\"_blank\" href=\"http://nyupress.org/books/book-details.aspx?bookid=7958#.UrNXR2RDt9c\"><i>Failed Evidence</i></a>, which argues that people in law enforcement are not only late to adopt state-of-the-art technology and scientific breakthroughs, they’re also fundamentally resistant to new innovations and to science.</p>\n<p>An example of this, he writes, can be found in law enforcement’s approach to DNA.</p>\n<p>While DNA evidence is often seen as a hyper-advanced, solve-anything, find-anyone technology from its portrayal on TV shows like <i>Law and Order: SVU</i> and <i>Dexter</i>, many of the FBI’s standards for DNA analysis are nearly 20 years old. (The <a target=\"_blank\" href=\"http://www.fbi.gov/about-us/lab/biometric-analysis/codis/swgdam-interpretation-guidelines\">FBI’s current standards cite a committee report</a> from the National Research Council titled, <i>An Update: The Evaluation of Forensic DNA Evidence</i>. That update occurred in 1996.)</p>\n<p>Those FBI standards, Harris writes, are way out of date. And as those standards sink further into obsolescence, many criminal cases are likely going unsolved, and many faulty convictions are likely going unchallenged.</p>\n<p>Today’s forensic DNA analysis relies on &quot;rules and procedures set up to allow relatively easy processing by lab personnel,&quot; Harris explains. Human beings, in other words, are expected to interpret DNA evidence one piece at a time, and then explain their analysis in court. Because current standards require a human being, and not a computer, to interact with every DNA sample, the analysis is labor intensive and can take a long time to carry out. As a result, crime labs can get bogged down if there’s a lot of evidence to analyze. And most DNA evidence gets tossed aside because it’s too complicated for a human to interpret.</p>\n<p><q>&quot;DNA evidence is much more complex than most labs can handle.&quot;</q></p>\n<p>About that: an ideal DNA swab has one clear contributor. The Gerard Richardson case is a perfect example: one <i>unknown</i> person bit into a <i>known</i> person’s flesh. Analysts needed only to determine whether Richardson’s DNA matched that of the <i>unknown</i> person. It didn’t, and so his charges were dropped.</p>\n<p>But when the number of unknown contributors to a DNA sample goes above one — or when the sample is tarnished in some way, or determined to be too miniscule to be analyzed by a person — there’s not much than can be done under current standards. Complicated DNA samples are thus called &quot;uninterpretable&quot; and often ignored.</p>\n<p>This is no secret, either. Even the quintessential document about forensic science written in the last decade — the National Academy of Sciences’ (NAS) <a target=\"_blank\" href=\"https://www.ncjrs.gov/pdffiles1/nij/grants/228091.pdf\">Strengthening Forensic Science in the United States</a>, published in August, 2009 — laments that &quot;DNA tests performed on a contaminated or otherwise compromised sample cannot be used reliably to identify or eliminate an individual as the perpetrator of a crime.&quot;</p>\n<p>In reality, that’s not true anymore. DNA analysis has moved way beyond both FBI standards and NAS’ depiction of DNA’s limits.</p>\n<p>Harris points to <a target=\"_blank\" href=\"http://www.cybgen.com/\">Cybergenetics</a>, a company based down the road from his university office in Pittsburgh, that’s developed software called TrueAllele. An allele is a gene form that helps distinguish one person’s DNA as unique. TrueAllele uses algorithms rather than the naked eye to identify contributors to a DNA sample. Because it’s computer-based, it can interpret a lot of DNA evidence at once. The technique can also interpret DNA evidence currently considered tarnished. And it can identify as many as five unknown contributors to a DNA sample instead of just one.</p>\n<p>&quot;DNA evidence is much more complex than most labs can handle,&quot; says Dr. Ria David, one of Cybergenetics’ principals, who says as much as 80 percent of the evidence collected at crime scenes gets thrown away or cast aside. Cybergenetics’ software has been used in a number of high-profile cases, she says, but its use is limited.</p>\n<p>According to Harris, law enforcement’s resistance to accepting computer-based DNA analysis amounts to a travesty. Think about it: if Dr. David is correct, and 80 percent of the DNA evidence collected at crime scenes today is neglected, what would happen if even half of that neglected evidence were able to be tested going forward? &quot;You would get many more convictions and probably many more exonerations, too,&quot; Harris says. &quot;If you thought DNA was a powerful tool for finding the truth, [Cybergenetics’] method is just that much more powerful and precise.&quot;</p>\n<p><q>&quot;If you thought DNA was a powerful tool for finding the truth...&quot;</q></p>\n<p>Harris sees computer-aided DNA analysis as &quot;indisputably better&quot; than what’s available today. (The technical descriptor for Cybergenetics’ software is &quot;automated short tandem repeat STR analysis,&quot; and other companies such as the <a target=\"_blank\" href=\"http://advancedforensicdna.com/corporate/management/\">Center for Advanced DNA Analysis</a>, <a target=\"_blank\" href=\"http://www.bodetech.com/forensic-solutions/dna-identification/\">Bode Technology</a>, and <a target=\"_blank\" href=\"http://www.zygem.com/about/the-company\">ZyGem</a> are making similar strides forward.) &quot;In five years,&quot; he predicts, &quot;law enforcement will have no choice. But that moment hasn't come yet.&quot; He imagines it could arrive, however, as more prisoners such as Gerard Richardson force courts to allow the retesting of old DNA evidence.</p>\n<p>&quot;It’s my belief that we’re just at the tip of the iceberg when it comes to exonerations,&quot; he says. &quot;Three hundred may not sound like a lot in comparison to the number of people who are in prison right now. But the number is only going to rise as advanced DNA analysis finds its way into the hands of more law enforcement agencies, more prosecutors, more defense attorneys.&quot;</p>",
					excerpt: "A few weeks ago, the Innocence Project of New York (IP) announced that it had helped to release another innocent person from prison. This time it was Gerard Richardson. As The Verge outlined in September, Richardson was convicted of murdering a New Jersey woman in 1994 after a forensic odontologist ",
					author: "mattstroud",
					title: "Is DNA analysis stuck in the past?",
					date: 1388692811000,
					link: "http://www.theverge.com/2014/1/2/5266196/is-dna-analysis-stuck-in-the-past",
					source: "The Verge -\tAll Posts",
					image: "http://b.vimeocdn.com/ts/452/218/452218069_1280.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143548aea14:cd7b:623b9014",
					content: "<img alt=\"\" src=\"http://cdn3.sbnation.com/entry_photo_images/9628447/2013-09-09_21-23-13-1020_large.jpg\">\n<p>Intel spent much of the last year talking up its <a href=\"http://www.theverge.com/2013/2/12/3980948/intel-confirms-internet-tv-plans-complete-with-a-set-top-box\">ambitious plan to launch an internet TV service</a> — but its grand plans eventually <a href=\"http://www.theverge.com/2013/11/25/5145508/intel-looking-to-sell-internet-tv-technology-for-500-million\">fell by the wayside</a>. Now, we're hearing why: new CEO Brian Krzanich told <i>Recode</i> that Intel's plans went up in smoke because it wasn't able to get the content it needed. &quot;When you go and play with the content guys, it's all about volume,&quot; said Krzanich. &quot;and we come at it with no background, no experience, no volume. We were ramping from virtually zero.&quot;</p>\n<p>Verizon has been <a href=\"http://www.theverge.com/2013/10/30/5046510/intel-may-leave-web-tv-service-in-verizons-hands\">rumored to be the front-runner</a> to purchase Intel's failed venture, and Krzanich's quotes make it sound like they'd be a natural match for what Intel has developed thus far. &quot;What we've said is we are out looking for a partner that can help us scale that volume at a much quicker rate,&quot; he said. Verizon already has extensive relationships with content providers for its cable services — the hardware that Intel's been building could eventually power Verizon's content network if the deal comes to pass. Krzanich still sounds proud of that hardware, saying that Intel build a &quot;great device&quot; with &quot;great technology.&quot;</p>\n<p>Krzanich's admissions come after earlier reports said that Intel's new CEO <a href=\"http://www.theverge.com/tech/2013/11/21/5128592/why-intel-canned-its-planned-intel-tv-service\">decided not to focus on TV</a> almost immediately after he <a href=\"http://www.theverge.com/2013/5/2/4292976/intel-brian-krzanich-ceo\">took over in May of last year.</a> Breaking into the TV market would have ultimately been to costly and too much of a distraction to Intel, particularly as he tried to focus Intel's efforts on two bigger threats: the declining PC industry and Intel's lack of progress in the fast-growing mobile and tablet markets. The saga of Intel's failed TV venture still isn't quite over yet, though — despite the rumors of Verizon's interest, the company hasn't sold off its work just yet.</p>",
					excerpt: "Intel spent much of the last year talking up its ambitious plan to launch an internet TV service — but its grand plans eventually fell by the wayside. Now, we're hearing why: new CEO Brian Krzanich told Recode that Intel's plans went up in smoke because it wasn't able to get the content it needed. \"",
					author: "Nathan Ingraham",
					title: "Intel killed its internet TV project because it couldn't make content deals",
					date: 1388692408000,
					link: "http://www.theverge.com/2014/1/2/5266924/intel-killed-its-internet-tv-project-because-it-couldnt-make-content-deals",
					source: "The Verge -\tAll Posts",
					image: "http://cdn1.sbnation.com/entry_photo_images/9188405/LG_G_Flex-3_large_verge_medium_landscape.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143548aea14:cd7a:623b9014",
					content: "<img alt=\"\" src=\"http://cdn3.sbnation.com/entry_photo_images/9628429/IMG_4234-1024_large.jpg\">\n<p>Microsoft has started updating the Intel processor in its Surface Pro 2 tablets. The software giant originally released the Surface Pro 2 on October 22nd, and after just two months the latest retail units now contain a processor clocked at 1.9GHz instead of the stock 1.6GHz Intel i5-4200U chip that originally shipped with the tablet.</p>\n<p>A Microsoft spokesperson confirmed the change in a statement to <i>The Verge</i>. &quot;Microsoft routinely makes small changes to internal components over the lifetime of a product, based on numerous factors including supply chain partnerships, availability, and value for our customers,&quot; says a Microsoft spokesperson. &quot;With any change to hardware or software, we work to ensure that the product experience remains excellent.&quot;</p>\n<p><q>New models appear to have started shipping in late December</q></p>\n<p>One Surface Pro 2 owner <a target=\"_blank\" href=\"http://answers.microsoft.com/en-us/surface/forum/surfpro2-surfhardware/surface-pro-25-i5-4300u-19-ghz-25-ghz/bb77fa47-1516-4979-ad74-af6b021d6656\">noticed the change</a> after swapping his faulty unit following a recent<a href=\"http://www.theverge.com/2013/12/18/5224996/microsoft-pulls-latest-surface-pro-2-firmware-update\"> firmware update issue</a>. Recent <a target=\"_blank\" href=\"http://browser.primatelabs.com/geekbench3/search?page=1&q=Surface+Pro+2&utf8=%E2%9C%93\">Geekbench scores</a> suggest Microsoft made the change in late December, but Microsoft has not provided timing to<i> The Verge</i>. Aside from the speed improvement, the two Intel i5 processors (<a target=\"_blank\" href=\"http://ark.intel.com/products/75459/\">4200U</a> and <a target=\"_blank\" href=\"http://ark.intel.com/products/76308/\">4300U</a>) are relatively similar. The new i5-4300U chipset is clocked higher, and it also includes Intel’s Trusted Execution Technology for improved software security.</p>\n<p>The rationale behind a processor speed bump is unclear, and Microsoft isn’t commenting on its decision to improve the Surface Pro 2 components after just two months. Several <a target=\"_blank\" href=\"http://mashable.com/2013/12/15/microsoft-surface-pro-2-and-surface-2-sold-out-at-many-locations/\">recent reports</a> have noted that Microsoft’s Surface 2 and Surface Pro 2 tablets have remained largely out of stock over the holidays, alongside the timing of the processor change on the Pro 2 model. The refreshed model is now filtering into retail channels, so any future stock should start to ship with the faster Intel processor.</p>\n<p><i>Thanks, Leonardo!</i></p>",
					excerpt: "Microsoft has started updating the Intel processor in its Surface Pro 2 tablets. The software giant originally released the Surface Pro 2 on October 22nd, and after just two months the latest retail units now contain a processor clocked at 1.9GHz instead of the stock 1.6GHz Intel i5-4200U chip that ",
					author: "Tom Warren",
					title: "Surface Pro 2 now shipping with faster processor, just two months after launch",
					date: 1388691929000,
					link: "http://www.theverge.com/2014/1/2/5266988/surface-pro-2-intel-i5-processor-updated-specifications",
					source: "The Verge -\tAll Posts",
					image: "http://cdn1.sbnation.com/entry_photo_images/9188405/LG_G_Flex-3_large_verge_medium_landscape.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143546f6d54:ca14:623b9014",
					excerpt: "That was quick. BlackBerry is parting ways with Alicia Keys, less than a year after recording artist was hired to come on as the company's \"global creative director.\" The partnership was unveiled at an event last January when the company launched its BlackBerry 10 OS. Keys was tapped to \"inspire the",
					content: "<img alt=\"\" src=\"http://cdn2.sbnation.com/entry_photo_images/9628193/alicia-keys-blackberry-thorsten-heins-stock2_1020_large.jpg\">\n<p>That was quick. BlackBerry is parting ways with Alicia Keys, less than a year after recording artist was hired to<a href=\"http://www.theverge.com/2013/1/30/3932048/blackberry-announces-alicia-keys-as-global-creative-director\"> come on as the company's &quot;global creative director.</a>&quot; The partnership was unveiled at an event last January when the company launched its BlackBerry 10 OS. Keys was tapped to &quot;inspire the future&quot; of the company, which took years to ready a new platform to more readily compete with the burgeoning crop of smartphones and tablets from competitors like Google and Apple. In a statement to <a target=\"_blank\" href=\"http://www.ctvnews.ca/business/singer-alicia-keys-to-leave-blackberry-after-year-long-collaboration-1.1615273#ixzz2pGl0TGTH\">CTV News</a> today, the company thanked Keys for her service, without going detail about what exactly she had done during her tenure.</p>\n<hr>\n<p><q>Less than a year later</q></p>\n<p>Keys' hire was just the latest in <a href=\"http://www.theverge.com/2013/1/30/3934122/why-alicia-keys-for-blackberry-10\">a string of celebrity endorsements for tech companies</a>, though came with some controversy. Prior to signing on with BlackBerry, Keys was an avid iPhone user, and had even developed an iOS app that let users add her image to their own photos. Just a month after signing on with BlackBerry, she sent out <a href=\"http://www.theverge.com/2013/2/11/3977958/blackberry-creative-director-alicia-keys-tweeting-iphone-hacked\">a tweet from her iPhone</a>, something she later attributed to being hacked.\tShe also walked away from a very active, and well-followed Instagram account, which at the time was only available on iOS and Android.</p>\n<p>Keys already appears to be back to using other platforms; the artist tweeted from her iPad on New Year's Eve:</p>\n<blockquote lang=\"en\">\n<p>Wishing u a blissful new year! Let go of our shadows; Old things,old thoughts, old ways. Lets step nto our light! Here's 2 the best 2 come!</p>\n— Alicia Keys (@aliciakeys) <a href=\"https://twitter.com/aliciakeys/statuses/418257194308476928\">January 1, 2014</a>\n</blockquote>\n<p>\n</p>\n<p>The end of the partnership comes as BlackBerry continues its attempt at a comeback. The beleaguered company tallied up billions in losses last year, while shedding executives like CEO Thorsten Heins, who <a href=\"http://www.theverge.com/2013/11/4/5064278/blackberry-ceo-steps-down-as-company-secures-1-billion-funding-from\">left in November</a>, <a href=\"http://www.theverge.com/2013/11/25/5143144/three-key-blackberry-executives-ousted\">and was quickly followed by other top executives</a>. Attempts to take over the company have also been scrapped, <a href=\"http://www.theverge.com/2013/10/10/4824858/blackberry-co-founders-lazaridis-fregin-considering-acquisition\">including one from Mike Lazaridis</a>, who co-founded the company and was its CEO, though more recently has been <a target=\"_blank\" href=\"http://www.vancouversun.com/business/Lazaridis+sells+BlackBerry+shares/9327084/story.html\">selling off millions of his shares</a> in the company.</p>",
					author: "Josh Lowensohn",
					title: "BlackBerry and singer Alicia Keys part ways",
					date: 1388690688000,
					link: "http://www.theverge.com/2014/1/2/5266838/blackberry-and-singer-alicia-keys-part-ways",
					source: "The Verge -\tAll Posts",
					unread: true,
					recommendations: 35,
					image: "http://cdn0.sbnation.com/entry_photo_images/9628193/alicia-keys-blackberry-thorsten-heins-stock2_1020_large.jpg"
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143546f6d54:ca13:623b9014",
					excerpt: "Just as loud noises can make small objects jitter on a table, powerful acoustic vibrations can lift things like toothpicks or water droplets into mid-air. Rather than just letting them levitate, though, researchers from the University of Tokyo and Nagoya Institute of Technology set tiny particles in",
					content: "<img alt=\"\" src=\"http://cdn1.sbnation.com/entry_photo_images/9628187/Screen_Shot_2014-01-02_at_11.11.00_AM_large.png\">\n<p>Just as loud noises can make small objects jitter on a table, powerful acoustic vibrations can lift things like toothpicks or water droplets into mid-air. Rather than just letting them levitate, though, researchers from the University of Tokyo and Nagoya Institute of Technology set tiny particles in a dance between shifting, overlapping ultrasonic beams that could shift them around a small cubic space. The resulting video combines graceful, gravity-defying motion with an explanation of how the system actually works, and the <a target=\"_blank\" href=\"http://arxiv.org/pdf/1312.4006.pdf\">full research paper</a> goes deeper into the technology's precise details.</p>\n<p>The roughly millimeter-sized balls that perform the most impressive stunts are composed of polystyrene, but the group also tested screws, matchsticks, and other objects — other researchers have successfully levitated <a target=\"_blank\" href=\"http://www.nature.com/news/2006/061127/full/news061127-6.html\">ants and even small fish</a>. While the sound must be extremely intense, its high frequency makes it inaudible to human ears, and levitation can open up new ways for us to manipulate objects. Earlier this year, another group of researchers made a similar breakthrough in moving floating particles, <a target=\"_blank\" href=\"http://www.webcitation.org/6I9uYzTzr\">mixing together solutions</a> in mid-air without fear of contamination from a container.</p>\n<hr>\n<p><iframe height=\"315\" width=\"560\" src=\"http://www.youtube.com/embed/odJxJRAxdFU\"></iframe></p>",
					author: "Adi Robertson",
					title: "Watch the intricate dance of objects levitated by sound",
					date: 1388690282000,
					link: "http://www.theverge.com/2014/1/2/5266670/watch-the-intricate-dance-of-objects-levitated-by-sound",
					source: "The Verge -\tAll Posts",
					unread: true,
					recommendations: 35,
					image: "http://cdn1.sbnation.com/entry_photo_images/9628187/Screen_Shot_2014-01-02_at_11.11.00_AM_large.png"
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_1435453eecb:c6f4:623b9014",
					content: "<img alt=\"\" src=\"http://cdn1.sbnation.com/entry_photo_images/9628153/_MG_7923_large.jpg\">\n<p>Mount Royal Avenue in Montreal has a new, comic book-inspired look — and all it took was some new lights. Created by Estelle Jugant and Yazid Belkhir from design firm Turn Me On, the &quot;<a target=\"_blank\" href=\"http://turnmeondesign.com/projets/idee-o-rama.html\">Idea-O-Rama</a>&quot; project has filled up the street with light fixtures reminiscent of cartoon speech bubbles. The new lamps were born from a city-wide competition, in which Turn Me On won, aimed at creating &quot;a unique winter atmosphere and conversation on the Avenue.&quot; Each light features original graphics from artists <a target=\"_blank\" href=\"http://misterastro.com/\">Astro</a> and <a target=\"_blank\" href=\"http://jaimelejaune.com/\">Jean-François Poliquin</a>. You can check out the installation from now until the end of February, but if you can't make it, don't worry — it's expected to pop up again over the following two winters.</p>\n<p><em>Image credit: <a target=\"new\" href=\"https://drive.google.com/a/theverge.com/folderview?id=0BwGYWIZt99SUSjVnbF8wUHVqclU&usp=drive_web#\">Bernard Fougères</a></em></p>\n<div>\n<br><img alt=\"3\" src=\"http://cdn3.sbnation.com/assets/3797451/_MG_7634.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn3.sbnation.com/assets/3797459/_MG_7652.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn1.sbnation.com/assets/3797467/_MG_7658.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn3.sbnation.com/assets/3797475/_MG_7669.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn0.sbnation.com/assets/3797483/_MG_7763.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn3.sbnation.com/assets/3797491/_MG_7917.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn0.sbnation.com/assets/3797499/_MG_7967.jpg\">\n</div>",
					excerpt: "Mount Royal Avenue in Montreal has a new, comic book-inspired look — and all it took was some new lights. Created by Estelle Jugant and Yazid Belkhir from design firm Turn Me On, the \"Idea-O-Rama\" project has filled up the street with light fixtures reminiscent of cartoon speech bubbles. The new lam",
					author: "Andrew Webster",
					title: "Street lamps transform Montreal into a living comic book",
					date: 1388688187000,
					link: "http://www.theverge.com/2014/1/2/5266704/street-lamps-transform-montreal-into-a-living-comic-book",
					source: "The Verge -\tAll Posts",
					image: "http://www.blogcdn.com/www.engadget.com/media/2013/10/irlbanner-1382819058.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143541cf505:c032:623b9014",
					content: "<img alt=\"\" src=\"http://cdn1.sbnation.com/entry_photo_images/9627981/netflix-recommendations_1020_large.jpg\">\n<p>Netflix's extraordinarily specific micro-categories have become both a running joke and a <a href=\"http://www.theverge.com/2012/4/8/2934375/netflix-recommendation-system-explained\">surprisingly effective recommendation tool</a>, but how does it serve up personalized recommendations for &quot;violent sci-fi thrillers&quot; and &quot;gory action and adventure,&quot; and why are &quot;violent&quot; and &quot;gory&quot; separate descriptors? And why, when you reverse-engineer Netflix categories as <a target=\"_blank\" href=\"http://www.theatlantic.com/technology/archive/2014/01/how-netflix-reverse-engineered-hollywood/282679/\">Ian Bogost and Alexis Madrigal did</a> for <i>The Atlantic</i>, are there 19 genres dedicated to the man who played Perry Mason? By scraping the tens of thousands of possible Netflix categories (most of which users will never see), Bogost and Madrigal put together a strangely effective map of how Hollywood makes movies and how we seek them. And behind it all is Todd Yellin, the Netflix VP who envisioned the tagging system in the first place: &quot;Predicting something is 3.2 stars is kind of fun if you have an engineering sensibility, but it would be more useful to talk about dysfunctional families and viral plagues.&quot;</p>",
					excerpt: "Netflix's extraordinarily specific micro-categories have become both a running joke and a surprisingly effective recommendation tool, but how does it serve up personalized recommendations for \"violent sci-fi thrillers\" and \"gory action and adventure,\" and why are \"violent\" and \"gory\" separate descri",
					author: "Adi Robertson",
					title: "A quantum theory of Netflix's genre tags",
					date: 1388684996000,
					link: "http://www.theverge.com/2014/1/2/5266526/a-quantum-theory-of-netflixs-genre-tags",
					source: "The Verge -\tAll Posts",
					image: "http://b.vimeocdn.com/ts/451/794/451794956_1280.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143541cf505:c031:623b9014",
					content: "<img alt=\"\" src=\"http://cdn2.sbnation.com/entry_photo_images/9627943/Moto_G_review11_1020_large.jpg\">\n<p>Verizon Wireless prepaid customers will be able to order the Moto G starting January 9th for $99.99. Motorola's budget handset will be available first online and will appear at the carrier's retail stores &quot;in the coming weeks.&quot; A picture of the Moto G in Verizon's prepaid retail packaging emerged at the end of December, and <a href=\"http://www.theverge.com/2013/12/31/5260988/moto-g-for-verizon-coming-to-best-buy-off-contract-for-99-99\">Best Buy confirmed it would be selling the device</a> almost immediately. In fact, Best Buy stores are reportedly allowed to sell the Moto G as soon as shipments arrive, so it may be a better option if you're eager to get a hold of the low-cost smartphone. As we've said before, it may be cheap (and Verizon's price is the lowest yet), but the Moto G is plenty capable for those core mobile tasks. The lack of LTE may be harder to swallow on &quot;America's largest LTE network,&quot; but it's still a fantastic device for the price.</p>\n<p>Separately, <a target=\"_blank\" href=\"http://newsroom.boostmobile.com/press-release/products-offers/boost-mobile-reunites-motorola-launch-smart-and-stylish-moto-g-nextrad\">Boost Mobile has announced</a> that it too will be selling the Moto G, but you'll have to wait a bit longer and pay slightly more. It's set to be released on January 14th for $129.99. If you can't wait until then, apparently Boost Mobile's version of the Moto G will be appearing on the Home Shopping Network (and its website) today.</p>",
					excerpt: "Verizon Wireless prepaid customers will be able to order the Moto G starting January 9th for $99.99. Motorola's budget handset will be available first online and will appear at the carrier's retail stores \"in the coming weeks.\" A picture of the Moto G in Verizon's prepaid retail packaging emerged at",
					author: "Chris Welch",
					title: "Moto G coming to Verizon Wireless on January 9th for $99.99 off-contract",
					date: 1388684565000,
					link: "http://www.theverge.com/2014/1/2/5266532/moto-g-verizon-release-date-january-9",
					source: "The Verge -\tAll Posts",
					image: "http://b.vimeocdn.com/ts/451/794/451794956_1280.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_1435401781b:bbf7:623b9014",
					excerpt: "Next week, LG will unveil new televisions running webOS, the ill-fated operating system it acquired in last February. Although LG is expected to retain some form of webOS’ interface, exactly what that will mean on a television instead of a phone or tablet is still a mystery. If LG has any luck at al",
					content: "<img alt=\"\" src=\"http://cdn3.sbnation.com/entry_photo_images/9627107/webos-lost-2-theverge-4_1020_large.jpg\">\n<p>Next week, <a href=\"http://www.theverge.com/2013/12/19/5226634/lg-webos-smart-tv-coming-at-ces-2014\">LG will unveil new televisions running webOS</a>, the ill-fated operating system <a href=\"http://www.theverge.com/2013/2/25/4027018/lg-buys-webos-smart-tv/in/2388197\">it acquired in last February</a>. Although LG is <a href=\"http://www.theverge.com/2013/12/30/5256186/lg-webos-smart-tv-cards-interface-rumor\">expected to retain some form of webOS’ interface</a>, exactly what that will mean on a television instead of a phone or tablet is still a mystery. If LG has any luck at all, it will be more successful than the last consumer webOS products. It's been over two years since HP’s TouchPad and the Pre 3 were released and then discontinued in a surprise decision from then-CEO Léo Apotheker. In fact, most people within HP were blindsided when executives decided to stop hardware production and left the software team twisting in the winds of uncertainty. Apotheker's decision ultimately led to the open sourcing of some parts of webOS and the sale of the rest to LG under current CEO Meg Whitman.</p>\n<p>But back in 2011, before and after Apotheker's fateful decision, Palm had been actively working on both new hardware and new software. <em>The Verge</em> has obtained documents describing Palm's plans and even a design prototype of a new smartphone. They tell a story of a company struggling to innovate in the face of daunting competition and perishingly few resources. They also show that, even at the end, Palm’s ambition outstretched its ability.</p>\n<p>This is the webOS that never was.</p>\n<div>\n<div>\n<img alt=\"Hp-web_640\" src=\"http://cdn3.sbnation.com/assets/820341/hp-web_640.jpg\"><h2>Embark</h2>\n<p>On February 9th, 2011, Palm's Jon Rubinstein took to the stage to unveil the first major products to come out of the division since the HP sale. The Pre 3 and Veer phones weren't much better than the Pre phones that came before them, but the TouchPad showed promise, at least on the software side. Unbeknownst to Rubinstein and his staff, the event — known internally as &quot;Embark&quot; — would be the high point of Palm's brief tenure at HP.</p>\n</div>\n</div>\n<div>\n<div>\n<p>But the good vibes from the event didn't last long. Apple announced the iPad 2 on March 2nd, less than one month later and well before Palm's TouchPad was released. Though webOS on the TouchPad had some clever features and an elegant software design, the TouchPad itself was a hulking, plastic monster. It was for all intents and purposes a glossy black look-alike of the original iPad.</p>\n<p>Apple's iPad 2 was as much of a revelation as the original iPad. It was radically thinner, lighter, and faster than what had come before and it immediately made the TouchPad — not to mention competing Android tablets — look stale by comparison. Apple released the iPad 2 to consumers just over a week after it was announced, while the TouchPad wasn't released until July.</p>\n</div>\n</div>\n<div>\n<div>\n<h2>Sapphire</h2>\n<div><img alt=\"Topaz-theverge-1_560\" src=\"http://cdn2.sbnation.com/assets/3796403/topaz-theverge-1_560.jpg\"></div>\n<p>If the documents we obtained detailing HP's product plans are any indication, the iPad 2 sent the company into a panic. In a document distributed in late March, HP admitted that the iPad 2 had &quot;changed the competitive trajectory&quot; and foresaw rapid responses from Samsung — which had shaved over 2mm from its Galaxy Tab tablet in response to the iPad 2. HP had also gotten pushback from the likes of AT&amp;T, which wasn't happy with the TouchPad's &quot;thickness, weight, [and industrial design].&quot;</p>\n<p>HP created a plan to refresh the TouchPad with the &quot;Sapphire&quot; (the TouchPad's codename was Topaz, and the Sapphire was also referred to as the &quot;Topaz2&quot;), with the unrealistic goal of developing it in &quot;record time&quot; and releasing it in late 2011. At the same time, it was working on another tablet that would feature a high resolution screen to be released in the latter half of 2012. The former would have brought the company to some kind of parity with Apple (albeit a year late), while the latter would have arrived a few months after Apple introduced a Retina display iPad. It also planned to work on a successor to the &quot;Opal,&quot; the 7-inch tablet that was nearly released as the TouchPad Go before it was canceled.</p>\n<p>HP's tablet plans looked reactionary in both specs and design. It was caught flat-footed by Apple and was rushing to make its traditional tablets competitive. It’s not clear how far along HP got with any of these plans, but it seems unlikely that any of them would have made their ship-date targets.</p>\n</div>\n</div>\n<div>\n<div><img alt=\"Webos-lost-2-theverge-1_1020\" src=\"http://cdn3.sbnation.com/assets/3796411/webos-lost-2-theverge-1_1020.jpg\"></div>\n</div>\n<div>\n<div>\n<h2>Mako</h2>\n<p>HP was also painfully aware that though the Palm faithful still liked hardware keyboards and the slide-out design of the Pre (and even the Veer), the rest of the world was moving to touchscreen-only phones. It had developed a version of the Pre 3 that had no physical keyboard, codenamed &quot;<a href=\"http://www.webosnation.com/windsornot-webos-slate-smartphone-never-was\">WindsorNot</a>.&quot; The WindsorNot was meant for AT&amp;T but didn’t have LTE, and it was delayed past the point when AT&amp;T would require all smartphones to have LTE.</p>\n<div><img alt=\"Webos-lost-2-theverge-2_1020\" src=\"http://cdn3.sbnation.com/assets/3796419/webos-lost-2-theverge-2_1020.jpg\"></div>\n<p>However, HP was also working on a significantly more advanced phone, codenamed &quot;Mako.&quot; <em>The Verge</em> obtained a design prototype of the device that reveals a new design direction eschewing the soft, nature-inspired pebble look of the Pre for something much more angular. It was to have a glass front and back, wireless charging, LTE, and a high-resolution screen. By today's standards, the Mako looks thick and this particular prototype isn't exactly beautiful — but it is at least unique and presumably the final hardware would have been fairly elegant, especially compared to other devices in late 2011 and early 2012.</p>\n<p>In terms of specs, we are told that it was to be about on par with the HTC One X, and had things gone according to plan it would have possibly been released in early 2012, beating the One X to market. Had Palm managed to pull it off, the Mako would have been one of the first Palm devices in a long time to feature competitive performance — albeit in a form that was still thicker than other devices at the time. However, development on the Mako never made it very far, and to our knowledge no working models ever got off the development board, much less into real-world testing.</p>\n</div>\n</div>\n<div>\n<div><img alt=\"Webos-lost-1-theverge-10_1020\" src=\"http://cdn1.sbnation.com/assets/3796435/webos-lost-1-theverge-10_1020.jpg\"></div>\n</div>\n<div>\n<div>\n<h2>Twain</h2>\n<p>But HP wasn't just working on &quot;traditional tablets&quot; like the Topaz2 and Opal and &quot;traditional&quot; phones like the Mako: it was also in the process of developing a hybrid device that would combine a tablet with a keyboard and a new sliding hinge. It would have been a precursor to the many hybrid Windows 8 devices on the market today. HP codenamed it &quot;Twain.&quot;</p>\n<p>Development on Twain was already underway by March, 2011, when Apple’s iPad 2 blindsided HP. The knock on iOS on the iPad was always that it wasn't great at being &quot;productive,&quot; and HP intended to take that perceived weakness head on. In an early presentation outlining Twain's features, HP asked &quot;Are traditional notebooks a thing of the past?&quot; and answered &quot;If they are, Twain is the notebook of the future.&quot;</p>\n<img alt=\"Webos-lost-1-theverge-8_1020\" src=\"http://cdn2.sbnation.com/assets/3796443/webos-lost-1-theverge-8_1020.jpg\"><p>Twain's core design involved a touchscreen that could slide out and then up to reveal a keyboard underneath. The proposed hardware specs were up to date, but most importantly it was to feature the stark new industrial design direction meant for all future Palm products.</p>\n<p>HP wanted to add a magnetic charger, NFC, HDMI-out, and a set of software features designed to make the Twain appeal to enterprise and productivity customers. HP also planned on extending the &quot;Touch to share&quot; feature it had introduced on the original TouchPad so that you could swipe data from the Twain to another webOS device using &quot;ultrasonic transmission to sense the location of fellow webOS devices.&quot;</p>\n</div>\n</div>\n<div>\n<div><img alt=\"Webos-lost-1-theverge-2_1020\" src=\"http://cdn1.sbnation.com/assets/3796467/webos-lost-1-theverge-2_1020.jpg\"></div>\n</div>\n<div>\n<div>\n<h2>Eel</h2>\n<p>While most of HP's tablet and phone plans (save the Twain) were reactionary and predictable, the software team was working on some truly innovative designs.</p>\n<div>\n<img alt=\"Webos-lost-1-theverge-4_1020\" src=\"http://cdn3.sbnation.com/assets/3796475/webos-lost-1-theverge-4_1020.jpg\"><br>\n</div>\n<p>For the Twain to have any success, HP would need to do more than just release the hardware with webOS as it was currently known. webOS has had a long and fractured history of rushing to get a less-than-ideal product out the door — putting off necessary and important projects like unifying the OS under a single backend framework. Unfortunately, that trend was still fully in play as Palm began work on the next version of webOS. But while the underpinnings were still in flux, the actual design and functionality of webOS was moving forward in a surprisingly good direction.</p>\n<p>Under the leadership of its then-director of human interface, Itai Vonshak, Palm was moving forward with a software strategy to complement the productivity targets it had set for Twain. That meant webOS would need to become more useful for traditional work tasks — without turning itself into something that looked and felt like Windows.</p>\n<div>\n<img alt=\"Webos-lost-1-theverge-3_1020\" src=\"http://cdn2.sbnation.com/assets/3796491/webos-lost-1-theverge-3_1020.jpg\"><br>\n</div>\n<p>The answer to both of those questions would be &quot;Eel,&quot; the codename for the next major version of webOS in 2011. At the heart of Eel was an attempt to expand on the &quot;card&quot; metaphor that Matias Duarte had first unveiled with the original Palm Pre in 2009.</p>\n<p>webOS had already introduced &quot;card stacks&quot; in an earlier version, letting you stack your active application cards into logical groupings. It had also introduced another concept that was finally beginning to gain widespread adoption: responsive panels. In essence, a &quot;panel&quot; presented different views depending on where you were in the app and how large a screen you had, but did so without requiring you to rewrite the app. Thus, in the email app, you could tap through your list of emails to a single email on a phone, or on a tablet see both side by side.</p>\n<div>\n<img alt=\"Webos-lost-1-theverge-5_1020\" src=\"http://cdn2.sbnation.com/assets/3796499/webos-lost-1-theverge-5_1020.jpg\"><br>\n</div>\n<p>Vonshak and his team were tasked with extending both of those two UX metaphors and making them more useful. To do it, the team essentially mixed them together. In Eel, you could tap on a link to open it up in a new panel, which would appear on the left. But instead of simply being a panel within an app, it would be a separate card, which you could slide left or right to have multiple cards visible. You could also &quot;shear&quot; off the card and put it into an entirely different stack. It wasn’t dissimilar from the way that Windows 8 allows you to &quot;snap&quot; windows, but on Eel it was to be more flexible in terms of window size and grouping. Panels and cards weren't quite the &quot;windows&quot; that we're used to on desktops, but it approached their utility while still being manageable on both phones and tablets.</p>\n</div>\n</div>\n<iframe name=\"38285-chorus-video-iframe\" src=\"http://www.theverge.com/videos/iframe?id=38285\"></iframe>\n<div>\n<div>\n<h2>Design</h2>\n<p>Though Eel added more power to the core interface of webOS (along with, it must be said, more complexity), it also did something more. Years before Apple went &quot;flat&quot; with its design for iOS 7 and even well before Android cleaned itself up, the Vonshak and visual design director Liron Damir were finalizing a new software design language it called &quot;Mochi.&quot;</p>\n<p>In fact, Palm had been working on two different design languages for Eel. One was significantly harsher and more industrial-looking, the better to match the hard lines of products like Twain and Mako. However, when Apotheker made the decision to scuttle webOS hardware, the team focused its efforts on the softer Mochi design — which was more in fitting with Palm's ethos.</p>\n<img alt=\"Webos-lost-1-theverge-11_1020\" src=\"http://cdn2.sbnation.com/assets/3796483/webos-lost-1-theverge-11_1020.jpg\"><p>As HP's management struggled to decide what to do with webOS, Palm's software team moved forward on redesigning the entire OS with a flatter, cleaner look. Soft white backgrounds were mixed with bold colors. At one point, the team had proposed creating subtle animations for the panels, having them &quot;breathe&quot; as though they were pieces of paper, so you could tell that they could be moved around more easily. In lieu of back buttons, panels had a small curved tab at the bottom that indicated they could be grabbed and resized.</p>\n<p>Mochi wasn't completely flat in the vein of Windows Phone, or even what we'd eventually see with iOS 7. There were still gradients and curves — but they were mixed with big typography and an elegant use of white space to help make data easier to parse. Fonts were improved and Eel made heavy use of circles — an homage to the Palm logo of old.</p>\n</div>\n</div>\n<div>\n<div><img alt=\"Twain-hardware-d2i_03162011-4\" src=\"http://cdn2.sbnation.com/assets/3794319/Twain-Hardware-D2I_03162011-4.jpg\"></div>\n</div>\n<div>\n<div>\n<p>Obviously, none of these webOS dreams came to pass — nor did other ideas like a stylus that could read color in the real world and then use it to draw on a tablet. Even if HP had not decided to give up on webOS hardware and all but abandon webOS software, the chances that any of these products would have seen the market and gained any sort of real success seems awfully small. Both Palm and HP had difficulties shipping on time and competing successfully even in the best of circumstances — and it was clear that HP didn't think it would be able to take on the challenges that would have lain ahead for webOS.</p>\n<p>The competitive landscape for tablets and phones wasn't quite as locked down in late 2011 and early 2012 as it is now — back then, it still seemed like there might be space for at least four major players in the market. However, since then we've seen BlackBerry implode almost as spectacularly as Palm, and a host of other companies have failed to make a dent. Microsoft may have established itself in third place behind iOS and Android — but with the benefit of hindsight it seems obvious now that there wouldn't have been much space for webOS to hang on.</p>\n<p>Though it's painful to Palm fans to have to admit it (especially when looking at the clean lines on Mochi), the marketplace probably would have doomed these webOS products if HP hadn't done it first. We'll never be able to say definitively that HP made the right call in killing off webOS and selling what was left for LG to put on televisions. But now, in 2014, <a href=\"http://www.theverge.com/2014/1/2/5265490/lgs-webos-tv-ui-photo-leak\">LG's forthcoming TV</a> will be yet another new beginning for webOS — a smaller ambition for a bigger screen.</p>\n<p><em>Photography by Michael Shane</em></p>\n</div>\n</div>\n<p> </p>",
					author: "Dieter Bohn",
					title: "The lost secrets of webOS",
					date: 1388683692000,
					link: "http://www.theverge.com/2014/1/2/5264580/the-lost-secrets-of-webos",
					source: "The Verge -\tAll Posts",
					unread: true,
					recommendations: 35,
					image: "http://cdn3.sbnation.com/entry_photo_images/9627107/webos-lost-2-theverge-4_1020_large.jpg"
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_1435401781b:bbf6:623b9014",
					excerpt: "Reliving movies on Twitter has become a trend, and a cult classic just popped up online. Argentinean advertising creative Jorge Zacher used 15 Twitter accounts and 1,125 tweets to recreate the entire Reservoir Dogs script. He made each character a Twitter account where they all tweeted lines from th",
					content: "<img alt=\"\" src=\"http://cdn0.sbnation.com/entry_photo_images/9627253/Screen_Shot_2014-01-02_at_10.43.44_AM_large.png\">\n<p>Reliving movies on Twitter has become a <a target=\"_blank\" href=\"http://www.theverge.com/2013/12/3/5170068/mob-city-miniseries-script-twitter-adaptation\">trend</a>, and a cult classic just popped up online. Argentinean advertising creative Jorge Zacher used <a target=\"_blank\" href=\"http://cargocollective.com/zacher/Reservoir-Tweets\">15 Twitter accounts and 1,125 tweets</a> to recreate the entire <i>Reservoir Dogs</i> script. He made each character a Twitter account where they all tweeted lines from the movie, which were then retweeted by the <a target=\"_blank\" href=\"https://twitter.com/ReservoirDogs_\">@ReservoirDogs_</a> account in reverse order so it could be read on Twitter.</p>\n<blockquote lang=\"en\">\n<p>What was that? I'm sorry. I didn't catch it. Would you repeat it?</p>\n— Mr. White (@MrWhite_z) <a href=\"https://twitter.com/MrWhite_z/statuses/417710398763040768\">December 30, 2013</a>\n</blockquote>\n<p>\n</p>\n<blockquote lang=\"en\">\n<p>Are you going to bark all day, little doggie, or are you going to bite?</p>\n— Mr. Blonde (@MrBlonde_z) <a href=\"https://twitter.com/MrBlonde_z/statuses/417720208921358336\">December 30, 2013</a>\n</blockquote>\n<p>Some of the best tweets are the short and sweet exposition lines from the @ReservoirDogs_ that tie the entire story together, capturing both the violent essence of the movie's most memorable scenes as well as the small gestures that make the movie a strange and beloved classic. Other films like <a target=\"_blank\" href=\"https://twitter.com/_hillvalley/the-hill-valley-project\"><i>Back to the Future</i></a> have been revitalized in the same way, but there's something about reading a Tarantino film in tweets that's both unsettling and awesome.</p>\n<blockquote lang=\"en\">\n<p>Mr Orange is now rehearsing outside, by a grafitii-covered wall. He's much more smooth and confident now. Holdaway is watching and listening</p>\n— Reservoir Dogs (@ReservoirDogs_) <a href=\"https://twitter.com/ReservoirDogs_/statuses/417892081093201920\">December 31, 2013</a>\n</blockquote>\n<p>\n</p>",
					author: "Valentina Palladino",
					title: "The story of 'Reservoir Dogs' retold in over 1,000 tweets",
					date: 1388682591000,
					link: "http://www.theverge.com/2014/1/2/5266094/reservoir-dogs-script-in-tweets",
					source: "The Verge -\tAll Posts",
					unread: true,
					recommendations: 35,
					image: "http://cdn0.sbnation.com/entry_photo_images/9627253/Screen_Shot_2014-01-02_at_10.43.44_AM_large.png"
				}
			]
		},
		names: {
			"feed/http://www.theverge.com/rss/full.xml": "The Verge",
			"feed/http://feeds.gawker.com/lifehacker/vip": "Lifehacker",
			"feed/http://feeds.feedburner.com/Techcrunch": "TechCrunch",
			"feed/http://feeds.betakit.com/betakit": "Betakit",
			"feed/http://www.engadget.com/rss.xml": "Engadget",
			"feed/http://feeds.gawker.com/gizmodo/vip": "Gizmodo",
			"feed/http://feeds2.feedburner.com/Mashable": "Mashable!",
			"feed/http://readwrite.com/main/feed/articles.xml": "ReadWrite",
			"feed/http://feeds2.feedburner.com/thenextweb": "The Next Web",
			"feed/http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml": "The New York Times",
			"feed/http://feeds.reuters.com/reuters/topNews?irpc=69": "Reuters",
			"feed/http://rss.cnn.com/rss/cnn_topstories.rss": "CNN",
			"feed/http://www.lemonde.fr/rss/sequence/0,2-3208,1-0,0.xml": "Le Monde",
			"feed/http://www.lefigaro.fr/rss/figaro_une.xml": "Le Figaro",
			"feed/http://www.rue89.com/homepage/feed": "Rue89",
			"feed/http://newsfeed.zeit.de/index": "Zeit Online",
			"feed/http://www.elpais.com/rss/feed.html?feedId=1022": "EL PAIS",
			"feed/http://www.guardian.co.uk/rssfeed/0,,1,00.xml": "The Guardian",
			"feed/http://newsrss.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml": "BBC",
			"feed/http://feeds.feedburner.com/venturebeat": "VentureBeat",
			"feed/http://sethgodin.typepad.com/seths_blog/atom.xml": "Seth Godin",
			"feed/http://feeds.feedburner.com/AVc": "A VC : Venture Capital and Technology",
			"feed/http://feeds.feedburner.com/ommalik": "GigaOM",
			"feed/http://pandodaily.com/feed/": "Pando Daily",
			"feed/http://allthingsd.com/feed": "All Things D",
			"feed/http://www.calculatedriskblog.com/feeds/posts/default": "Calculated Risk",
			"feed/http://feeds.harvardbusiness.org/harvardbusiness/": "Harvard Business Review",
			"feed/http://www.polygon.com/rss/full.xml": "Polygon",
			"feed/http://www.joystiq.com/rss.xml": "Joystiq",
			"feed/http://feeds.feedburner.com/Massively": "Massively",
			"feed/http://www.indiegames.com/blog/atom.xml": "Indie Games",
			"feed/http://feeds.arstechnica.com/arstechnica/gaming/": "Opposable Thumbs",
			"feed/http://feed.500px.com/500px-editors": "500px",
			"feed/http://thomashawk.com/feed": "Thomas Hawk Digital Connection",
			"feed/http://www.boston.com/bigpicture/index.xml": "The Big Picture",
			"feed/http://www.nationalgeographic.com/rss/photography/photo-of-the-day": "National Geographic",
			"feed/http://wvs.topleftpixel.com/index.rdf": "Daily Dose Of Imagery",
			"feed/http://theimpossiblecool.tumblr.com/rss": "The Impossible Cool",
			"feed/http://feeds.feedburner.com/design-milk": "Design Milk",
			"feed/http://feeds.feedburner.com/FreshInspirationForYourHome": "Fresh Home",
			"feed/http://www.swiss-miss.com/feed": "Swiss Miss",
			"feed/http://www.home-designing.com/feed": "Home Designing",
			"feed/http://www.yatzer.com/feed/index.php": "Yatzer",
			"feed/http://feeds.feedburner.com/core77/blog": "Core77",
			"feed/http://www.yankodesign.com/feed/": "Yanko Design",
			"feed/http://feeds.feedburner.com/abduzeedo?format=xml": "Abduzeedo",
			"feed/http://blog.2modern.com/atom.xml": "2Modern",
			"feed/http://www.sfgirlbybay.com/feed/": "SF Girl By The Bay",
			"feed/http://feeds.feedburner.com/dezeen": "Dezeen",
			"feed/http://www.fastcodesign.com/rss.xml": "Co.Design",
			"feed/http://www.fubiz.net/en/feed/": "Fubiz",
			"feed/http://mocoloco.com/index.rdf": "Mocoloco",
			"feed/http://www.unplggd.com/unplggd/atom.xml": "Unplggd",
			"feed/http://www.apartmenttherapy.com/main/atom.xml": "Apartment Therapy",
			"feed/http://www.designspongeonline.com/feed": "Design*Sponge",
			"feed/http://ikeahacker.blogspot.com/feeds/posts/default": "IKEA Hackers",
			"feed/http://decor8blog.com/feed/": "Decor8",
			"feed/http://archinect.com/news.xml": "Archinect",
			"feed/http://www.archdaily.com/feed/": "Arch Daily",
			"feed/http://feeds.feedburner.com/contemporist": "Contemporist",
			"feed/http://www.trendir.com/house-design/atom.xml": "Modern House Designs",
			"feed/http://adsoftheworld.com/node/feed": "Ads Of The World",
			"feed/http://www.underconsideration.com/brandnew/atom.xml": "Brand New",
			"feed/http://feeds.feedburner.com/logodesignlove": "Logo Design World",
			"feed/http://www.corporate-identity-design.com/feed/": "Corporate Identity Design",
			"feed/http://feeds.frogdesign.com/frog-design-mind": "Design Mind",
			"feed/http://feeds.feedburner.com/whitneyhess": "Pleasure and Pain",
			"feed/http://feeds.feedburner.com/NirAndFar": "Nir and Far",
			"feed/http://metacool.typepad.com/metacool/atom.xml": "Metacool",
			"feed/http://www.jnd.org/index.xml": "JND",
			"feed/http://page2rss.com/rss/9fc3ae12a1465446684506f7461b9129": "Graphic Exchange",
			"feed/http://www.designworklife.com/feed/": "Design Work Life",
			"feed/http://feeds.feedburner.com/ucllc/fpo": "Under Consideration - For Print Only",
			"feed/http://www.aisleone.net/feed/": "Aisle One",
			"feed/http://grainedit.com/feed/": "Grain Edit",
			"feed/http://gridness.net/feed/": "Gridness",
			"feed/http://feeds.feedburner.com/TheDieline": "The Dieline",
			"feed/http://www.packagingoftheworld.com/feeds/posts/default": "Packaging Of The World",
			"feed/http://lovelypackage.com/feed/": "Lovely Package",
			"feed/http://ambalaj.se/feed/": "Ambalaj",
			"feed/http://thepackagingdesignblog.com/?feed=rss2": "The Packaging Design Blog",
			"feed/http://tdc.org/feed/": "tdc",
			"feed/http://feedproxy.google.com/ILoveTypography": "I Love Typography",
			"feed/http://www.typetoken.net/feed/": "Typetoken",
			"feed/http://feeds.feedburner.com/FontsInUse": "Fonts In Use",
			"feed/http://feeds.feedburner.com/TypographyDaily": "Typography Daily",
			"feed/http://ministryoftype.co.uk/words/rss/": "Ministry Of Type",
			"feed/http://feeds2.feedburner.com/veerlesblog": "Veerle's Blog",
			"feed/http://feeds.feedburner.com/adaptivepath": "Adaptive Path",
			"feed/http://feeds.feedburner.com/CssTricks": "CSS-Tricks",
			"feed/http://feeds.feedburner.com/cooper-journal": "Cooper",
			"http://feeds.feedburner.com/creativeapplicationsnet": "Creative Applications",
			"feed/http://feeds.feedburner.com/UXM": "UX Magazine",
			"feed/http://rss1.smashingmagazine.com/feed/": "Smashing Magazine",
			"feed/http://feeds.feedburner.com/FunctioningForm": "Luke W",
			"feed/http://feeds.feedburner.com/37signals/beMH": "Signal vs. Noise",
			"feed/http://www.chipple.net/rss/custom/alertbox/index.rdf": "Use It",
			"feed/http://feeds.feedburner.com/subtraction": "Subtraction",
			"feed/http://feeds.feedburner.com/52WeeksOfUx": "52 Weeks Of UX",
			"feed/http://feeds.feedburner.com/DesignStaff?format=xml": "Design Staff",
			"feed/http://feeds.feedburner.com/minimalsites": "Minimal Sites",
			"feed/http://feeds.feedburner.com/FlowingData": "Flowing Data",
			"feed/http://feeds.feedburner.com/Datavisualization": "Data Visualization",
			"feed/http://infosthetics.com/atom.xml": "Information Aesthetics",
			"feed/http://feeds.feedburner.com/thesartorialist": "The Sartorialist",
			"feed/http://seaofshoes.typepad.com/sea_of_shoes/atom.xml": "Sea of shoes",
			"feed/http://www.fashiontoast.com/feeds/posts/default": "fashiontoast",
			"feed/http://www.stylebubble.co.uk/style_bubble/atom.xml": "Style Bubble",
			"feed/http://www.theblondesalad.com/feeds/posts/default": "The Blonde Salad",
			"feed/http://www.cocosteaparty.com/feeds/posts/default": "Coco's Tea Party",
			"feed/http://feeds.feedburner.com/smittenkitchen": "smitten kitchen",
			"feed/http://cannelle-vanille.blogspot.com/feeds/posts/default": "Cannelle et Vanille",
			"feed/http://www.latartinegourmande.com/feed/": "La Tartine Gourmande",
			"feed/http://www.davidlebovitz.com/archives/index.rdf": "David Lebovitz",
			"feed/http://www.herbivoracious.com/atom.xml": "Herbivoracious",
			"feed/http://www.101cookbooks.com/index.rdf": "101 Cookbooks",
			"feed/http://feedproxy.google.com/elise/simplyrecipes": "Simply Recipes",
			"feed/http://daringfireball.net/index.xml": "Daring Fireball",
			"feed/http://www.macrumors.com/macrumors.xml": "MacRumors",
			"feed/http://www.tuaw.com/rss.xml": "The Unofficial Apple Weblog",
			"feed/http://feeds.arstechnica.com/arstechnica/apple/": "Infinite Loop",
			"feed/http://feeds.feedburner.com/cultofmac/bFow": "Cult of Mac",
			"feed/http://feeds.feedburner.com/theappleblog": "TheAppleBlog",
			"feed/http://www.mactrast.com/feed/": "MacTrast",
			"feed/http://androidandme.com/feed/": "Android and Me",
			"feed/http://androidcommunity.com/feed/": "Android Community",
			"feed/http://feeds.feedburner.com/blogspot/hsDu": "Android Developers Blog",
			"feed/http://www.androidcentral.com/feed": "Android Central",
			"feed/http://blog.makezine.com/index.xml": "Make",
			"feed/http://www.instructables.com/tag/type:instructable/rss.xml": "Instructables",
			"feed/http://blog.craftzine.com/index.xml": "Craft",
			"feed/http://www.hackaday.com/rss.xml": "Hack A Day",
			"feed/http://www.yougrowgirl.com/feed/": "You Grow Girl",
			"feed/http://www.gardenrant.com/my_weblog/atom.xml": "Garden Rant",
			"feed/http://awaytogarden.com/feed": "A Way To Garden",
			"feed/http://feeds.feedburner.com/LifeOnTheBalcony": "Life On The Balcony",
			"feed/http://feeds.feedburner.com/bridalmusings": "Bridal Musings",
			"feed/http://www.stylemepretty.com/feed/": "Style Me Pretty",
			"feed/http://ruffledblog.com/feed/": "Ruffled",
			"feed/http://bridalsnob.tumblr.com/rss": "Bridal Snob",
			"feed/http://thecinderellaproject.blogspot.com/feeds/posts/default": "The Cinderella Project",
			"feed/http://masterpieceweddings.blogspot.com/feeds/posts/default": "Adventures In Wedding Planning",
			"feed/http://bridechic.blogspot.com/feeds/posts/default": "Bride Chic",
			"feed/http://blogs.suntimes.com/ebert/atom.xml": "Roger Ebert's Journal",
			"feed/http://www.davidbordwell.net/blog/?feed=atom": "Observations On Film Art",
			"feed/http://feeds.feedburner.com/firstshowing": "First Showing",
			"feed/http://mubi.com/notebook/posts.atom": "The Daily Notebook",
			"feed/http://gdata.youtube.com/feeds/base/users/WSJDigitalNetwork/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "WSJ Digital Network",
			"feed/http://gdata.youtube.com/feeds/base/users/NationalGeographic/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "National Geographic",
			"feed/http://gdata.youtube.com/feeds/base/users/TEDtalksDirector/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Ted Talks",
			"feed/http://gdata.youtube.com/feeds/base/users/trailers/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Viso Trailers",
			"feed/http://gdata.youtube.com/feeds/base/users/TEDEducation/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "TED Education",
			"feed/http://gdata.youtube.com/feeds/base/users/TheEllenShow/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "The Ellen Show",
			"feed/http://gdata.youtube.com/feeds/base/users/JimmyKimmelLive/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Jimmy Kimmel Live",
			"feed/http://gdata.youtube.com/feeds/base/users/vsauce/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Vsauce",
			"feed/http://gdata.youtube.com/feeds/base/users/kevjumba/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Kevin Jumba",
			"feed/feed/http://gdata.youtube.com/feeds/base/users/GOODMagazine/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "GOOD Magazine",
			"feed/http://vimeo.com/channels/staffpicks/videos/rss": "Vimeo Staff Pick",
			"feed/http://vimeo.com/channels/fubiz/videos/rss": "Fubiz",
			"feed/http://vimeo.com/channels/everythinganimated/videos/rss": "Everything Animated",
			"feed/http://vimeo.com/channels/nicetype/videos/rss": "Nice Type",
			"feed/http://vimeo.com/channels/documentaryfilm/videos/rss": "Documentary Film",
			"feed/http://vimeo.com/channels/40086/videos/rss": "Socially Minded Documentaries",
			"feed/http://vimeo.com/channels/hd/videos/rss": "The Vimeo HD Channel",
			"feed/http://www.etsy.com/shop/PerDozenDesign/rss": "Per Dozen Design",
			"feed/http://www.etsy.com/shop/TFrancisco/rss": "TFrancisco",
			"feed/http://www.etsy.com/shop/claireswilson/rss": "Claire S. Wilson",
			"feed/http://www.etsy.com/shop/skinblaster/rss": "Skinblaster",
			"feed/http://www.etsy.com/shop/SharonFosterArt/rss": "Sharon Foster Art",
			"feed/http://www.etsy.com/shop/tukeon/rss": "Tukeon",
			"feed/http://www.etsy.com/shop/dawndishawceramics/rss": "Dawn Dishaw Ceramics",
			"feed/http://www.etsy.com/shop/sarapaloma/rss": "Sara Paloma Pottery"
		},
		oAuth: false,
		setOAuth: function() {
			this.oAuth = new OAuth({
				id: "ichrome",
				name: "feedly",
				redirectURL: "http://localhost/",
				secret: "__API_KEY_feedly__",
				scope: "https://cloud.feedly.com/subscriptions",
				tokenURL: "https://cloud.feedly.com/v3/auth/token",
				authURL: "https://cloud.feedly.com/v3/auth/auth?response_type=code&client_id={{clientID}}&redirect_uri={{redirectURL}}&scope={{scope}}"
			});
		},
		getSources: function(cb) {
			if (!this.oAuth) {
				this.setOAuth();
			}

			var oAuth = this.oAuth;

			oAuth.getToken(function(token, data) {
				var categories = {};

				categories["user/" + data.id + "/category/global.all"] = this.utils.translate("all");
				categories["user/" + data.id + "/tag/global.saved"] = this.utils.translate("saved");
				categories["user/" + data.id + "/category/global.uncategorized"] = this.utils.translate("uncategorized");

				oAuth.ajax({
					type: "GET",
					url: "http://cloud.feedly.com/v3/subscriptions",
					cache: false,
					success: function(d) {
						var feeds = {
							label: this.utils.translate("settings.source_feeds")
						};

						d.forEach(function(e) {
							e.categories.forEach(function(c) {
								categories[c.id] = c.label;
							});

							feeds[e.id] = e.title;
						});

						categories.feeds = feeds;

						cb(categories);
					}.bind(this)
				});
			}.bind(this));
		},
		getArticles: function(d) {
			if (!this.oAuth) {
				this.setOAuth();
			}

			var names = this.names,
				articles = [],
				oAuth = this.oAuth,
				getImage = function(article) {
					if (article.visual && article.visual.url && article.visual.url !== "none" && article.visual.url !== "") {
						if (article.visual.url.indexOf("files.wordpress.com") !== -1) {
							article.visual.url = article.visual.url.substr(0, article.visual.url.lastIndexOf("?")) + "?w=370&h=250&crop=1";
						}
						else if (article.visual.url.indexOf("blogcdn.com") !== -1) {
							article.visual.url = article.visual.url.replace("_thumbnail", "");
						}
						else if (article.visual.url.indexOf("img.gawkerassets.com") !== -1) {
							article.visual.url = article.visual.url.replace("ku-xlarge", "ku-medium");
						}

						return article.visual.url;
					}

					var image = false,
						srcs = [],
						html = $(("<div>" + (article.content || "") + "</div>")
									.replace(/ src="\/\//g, " data-src=\"https://")
									.replace(/ src="/g, " data-src=\"")
									.replace(/ src='\/\//g, " data-src='https://")
									.replace(/ src='/g, " data-src='"));

					Array.prototype.slice.apply(html[0].querySelectorAll(
						"img[data-src]" +
						':not(.mf-viral)' +								':not(.feedflare)' +
						':not([width="1"])' + 						':not([height="1"])' +
						':not([data-src*="feeds.wordpress.com"])' +		':not([data-src*="stats.wordpress.com"])' +
						':not([data-src*="feedads"])' +					':not([data-src*="tweet-this"])' +
						':not([data-src*="-ads"])' +					':not([data-src*="_ads"])' +
						':not([data-src*="zemanta"])' +					':not([data-src*="u.npr.org/iserver"])' +
						':not([data-src*="slashdot-it"])' +				':not([data-src*="smilies"])' +
						':not([data-src*="commindo-media.de"])' +		':not([data-src*="creatives.commindo-media"])' +
						':not([data-src*="i.techcrunch"])' +			':not([data-src*="adview"])' +
						':not([data-src*=".ads."])' +					':not([data-src*="/avw.php"])' +
						':not([data-src*="feed-injector"])' +			':not([data-src*="/plugins/"])' +
						':not([data-src*="_icon_"])' +					':not([data-src*="/ad-"])' +
						':not([data-src*="buysellads"])' +				':not([data-src*="holstee"])' +
						':not([data-src*="/ad_"])' +					':not([data-src*="/button/"])' +
						':not([data-src*="/sponsors/"])' +				':not([data-src*="googlesyndication.com"])' +
						':not([data-src*="/adx"])' +					':not([data-src*="assets/feed-fb"])' +
						':not([data-src*="feedburner.com/~ff"])' +		':not([data-src*="gstatic.com"])' +
						':not([data-src*="feedproxy"])' +				':not([data-src*="feedburner"])' +
						':not([data-src*="/~"])' +						':not([data-src*="googleadservices.com"])' +
						':not([data-src*="fmpub"])' +					':not([data-src*="pheedo"])' +
						':not([data-src*="openx.org"])' +				':not([data-src*="/ico-"])' +
						':not([data-src*="doubleclick.net"])' +			':not([data-src*="/feed.gif"])' +
						':not([data-src*="wp-digg-this"])' +			':not([data-src*="tweetmeme.com"])' +
						':not([data-src*="share-buttons"])' +			':not([data-src*="musictapp"])' +
						':not([data-src*="donate.png"])' +				':not([data-src*="/pagead"])' +
						':not([data-src*="assets/feed-tw"])' +			':not([data-src*="feedsportal.com/social"])'
					)).forEach(function(e) {
						srcs.push(e.getAttribute("data-src"));
					});

					if (srcs.length) {
						image = srcs[0];
					}
					else if (html.find("iframe[data-chomp-id]").length) {
						image = "http://img.youtube.com/vi/" + html.find("iframe[data-chomp-id]").attr("data-chomp-id") + "/1.jpg";
					}

					if (image && image.indexOf("files.wordpress.com") !== -1) {
						image = image.substr(0, image.lastIndexOf("?")) + "?w=370&h=250&crop=1";
					}
					else if (image && image.indexOf("blogcdn.com") !== -1) {
						image = image.replace("_thumbnail", "");
					}
					else if (image && image.indexOf("http://img.gawkerassets.com/") !== -1) {
						image = image.replace("ku-xlarge", "ku-medium");
					}
					else if (article.enclosure) { //checks if the enclosure object exist, then if it contains an image it uses the first found
						for (var i = 0; i < article.enclosure.length; i++) {
							if (["image/jpeg", "image/png"].indexOf(article.enclosure[i].type) >= 0) {
								image = article.enclosure[i].href;
								break;
							}
						}
					}

					return image;
				},
				div = document.createElement("div");

			if (!(typeof d.items === "object" && typeof d.items.forEach !== "undefined")) {
				return articles;
			}

			d.items.forEach(function(e) {
				var article = {
					id: e.id,
					title: e.title,
					author: e.author,
					unread: !!e.unread,
					date: e.published || 0,
					recommendations: abbreviate(parseInt(e.engagement || 0), 1000, 2)
				};

				if (e.content) {
					article.content = e.content.content || "";

					div.innerHTML = article.content;

					article.excerpt = div.textContent.trim().slice(0, 300).replace(/\n/g, "  ");
				}
				else if (e.summary) {
					article.content = e.summary.content || "";

					div.innerHTML = article.content;

					article.excerpt = div.textContent.trim().slice(0, 300).replace(/\n/g, "  ");
				}

				if (e.tags && e.tags[0]) {
					e.tags.forEach(function(t) {
						if (t.id === "user/" + oAuth.data.id + "/tag/global.saved") {
							article.saved = true;
						}
					});
				}

				if (e.alternate && e.alternate[0]) {
					article.link = e.alternate[0].href || "";
				}

				if (e.origin) {
					article.source = names[e.origin.streamId || ""] || e.origin.title || e.title;
				}

				if (e.enclosure) { //sometime this object contains the image
					article.enclosure = e.enclosure;
				}

				if (e.visual) {
					article.visual = e.visual;
				}

				article.image = getImage(article);

				articles.push(article);
			});

			return articles;
		},
		refresh: function() {
			var req;

			if (this.config.source.indexOf("feed/") === 0 && !this.oAuth.hasToken()) {
				req = $.ajax;
			}
			else {
				req = this.oAuth.ajax.bind(this.oAuth);
			}

			req({
				type: "GET",
				url: "http://cloud.feedly.com/v3/streams/contents?count=10&streamId=" + encodeURIComponent(this.config.source) + (this.config.show === "unread" ? "&unreadOnly=true" : "") + "&ranked=" + this.config.sort,
				cache: false,
				success: function(d) {
					if (!d) {
						return;
					}

					var data = {
						articles: this.getArticles(d),
						next: d.continuation || false
					};

					this.data = data;

					this.render.call(this);

					this.utils.saveData(this.data);
				}.bind(this)
			});
		},
		setHandlers: function() {
			if (!this.oAuth) {
				this.setOAuth();
			}

			var loading = false,
				that = this,
				last = 0,
				sent = {},
				sendout = "",
				outset = false,
				submitting = false,
				next = this.data.next,
				submit = function() {
					var parent = $(this),
						ptop = parent.offset().top,
						pheight = this.offsetHeight,
						ids = [],
						id, elm;

					parent.find(".item").each(function() {
						if (((elm = $(this)).offset().top - ptop) + this.offsetHeight - pheight <= 0 && !sent.hasOwnProperty(id = elm.attr("data-id"))) {
							ids.push(id);

							sent[id] = true;
						}
					});

					submitting = true;

					that.oAuth.ajax({
						type: "POST",
						data: JSON.stringify({
							action: "markAsRead",
							type: "entries",
							entryIds: ids
						}),
						contentType: "application/json",
						url: "http://cloud.feedly.com/v3/markers",
						success: function() {
							submitting = false;
						}
					});

					last = new Date().getTime();
				};

			this.elm.find(".items").on("mousedown", ".item", function() {
				// mousedown handles left, middle, and right clicks

				var id = $(this).attr("data-id");

				if (!sent.hasOwnProperty(id)) {
					sent[id] = true;

					that.oAuth.ajax({
						type: "POST",
						data: JSON.stringify({
							action: "markAsRead",
							type: "entries",
							entryIds: [id]
						}),
						contentType: "application/json",
						url: "http://cloud.feedly.com/v3/markers"
					});
				}
			}).on("click", ".item .recommendations", function(e) {
				e.preventDefault();
				e.stopPropagation();

				var elm = $(this);

				if (elm.hasClass("saved")) {
					that.oAuth.ajax({
						type: "DELETE",
						url: "http://cloud.feedly.com/v3/tags/" + encodeURIComponent("user/" + that.oAuth.data.id + "/tag/global.saved") + "/" + encodeURIComponent(elm.parents(".item").first().attr("data-id")),
						complete: function() {
							elm.removeClass("saved").text(parseInt(elm.text()) - 1);
						}
					});
				}
				else {
					that.oAuth.ajax({
						type: "PUT",
						data: JSON.stringify({
							entryId: elm.parents(".item").first().attr("data-id")
						}),
						url: "http://cloud.feedly.com/v3/tags/" + encodeURIComponent("user/" + that.oAuth.data.id + "/tag/global.saved"),
						complete: function() {
							elm.addClass("saved").text(parseInt(elm.text()) + 1);
						}
					});
				}
			}).on("scroll", function() {
				if (!loading && next && (this.scrollHeight - this.offsetHeight) < (this.scrollTop + this.offsetHeight)) {
					loading = true;

					that.oAuth.ajax({
						type: "GET",
						url: "http://cloud.feedly.com/v3/streams/contents?count=20&streamId=" + encodeURIComponent(that.config.source) + "&continuation=" + encodeURIComponent(next) + (that.config.show === "unread" ? "&unreadOnly=true" : "") + "&ranked=" + that.config.sort,
						cache: false,
						success: function(d) {
							if (!(d)) {
								return;
							}

							next = d.continuation || false;

							var articles = that.getArticles(d);

							if (that.config.view === "cards dual") {
								var column1 = [],
									column2 = [],
									columns = $(this).find(".column");

								articles.forEach(function(e, i) {
									e.age = moment(e.date).fromNow(true).replace("hour", "hr").replace("minute", "min").replace("an ", "1 ").replace("a ", "1 ").replace("a few ", "");

									if (i % 2 === 0) {
										column2.push(e);
									}
									else {
										column1.push(e);
									}
								});

								columns.first().append(that.utils.renderTemplate("articles", {
									articles: column1
								}));

								columns.last().append(that.utils.renderTemplate("articles", {
									articles: column2
								}));
							}
							else {
								articles.forEach(function(e) {
									e.age = moment(e.date).fromNow(true).replace("hour", "hr").replace("minute", "min").replace("an ", "1 ").replace("a ", "1 ").replace("a few ", "");
								});

								$(this).append(that.utils.renderTemplate("articles", {
									articles: articles
								}));
							}

							loading = false;

							articles = d = null;
						}.bind(this)
					});
				}

				if (that.config.mark === "scroll" && !submitting && new Date().getTime() - last > 5000) {
					clearTimeout(sendout);

					outset = false;

					submit.call(this);
				}
				else if (that.config.mark === "scroll" && !submitting && !outset) {
					setTimeout(function() {
						outset = false;

						submit.call(this);
					}.bind(this), 5000);

					outset = true;
				}
			});
		},
		render: function(demo) {
			var data = $.extend(true, {}, this.data || {articles:[]});

			if (this.config.view === "cards dual") {
				var articles = [],
					column2 = [];

				data.articles.forEach(function(e, i) {
					e.age = moment(e.date).fromNow(true).replace("hour", "hr").replace("minute", "min").replace("an ", "1 ").replace("a ", "1 ").replace("a few ", "");

					if (i % 2 === 0) {
						column2.push(e);
					}
					else {
						articles.push(e);
					}
				});

				data.articles = this.utils.renderTemplate("articles", {
					articles: articles
				});

				data.column2 = this.utils.renderTemplate("articles", {
					articles: column2
				});
			}
			else {
				data.articles.forEach(function(e) {
					e.age = moment(e.date).fromNow(true).replace("hour", "hr").replace("minute", "min").replace("an ", "1 ").replace("a ", "1 ").replace("a few ", "");
				});

				data.articles = this.utils.renderTemplate("articles", {
					articles: data.articles
				});
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			data.link = this.config.link === "show";

			data.class = this.config.view;

			this.utils.render(data);

			if (!demo) {
				this.setHandlers();
			}
		}
	};
});
