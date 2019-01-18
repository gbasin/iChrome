window.pgjs = window.pgjs || {};
pgjs.gdpr = pgjs.gdpr || {};
pgjs.publisher = pgjs.publisher || {};
pgjs.publisher.name = 'iChrome';
pgjs.publisher.privacyPolicy = 'http://www.yourdomain.com/link-to-your-privacy-policy.html';			
// pgjs.publisher.dataUses = 'user experience customization, analytics';
// pgjs.publisher.logo = 'https://pubguru.com/wp-content/uploads/2017/06/PubGuru-Logo-Final-color-high-res-trans-2000.png';

// use the direct link instead of the CDN temporarily as we continue to add more customizations and
var script = document.createElement("script");
script.async = true;
script.type = "text/javascript";
var useSSL = 'https:' == document.location.protocol;
script.src = 'https://cdn.pubguru.com/pg.js';
var target = document.getElementsByTagName("head")[0];
target.insertBefore(script, target.firstChild);