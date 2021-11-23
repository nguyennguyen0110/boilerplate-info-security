const express = require('express');
const app = express();
const helmet = require('helmet');

// Hide "X-Powered-By: Express" in header so no one knows website is powered by Express
// app.use(helmet.hidePoweredBy());
// But we should use this instead of helmet.hidePoweredBy()
app.disable("x-powered-by");

// helmet.frameguard() restricts who can put your site in a frame. It has three modes: DENY, SAMEORIGIN, and ALLOW-FROM.
// This header is superseded by the frame-ancestors Content Security Policy directive but is still useful on old browsers
app.use(helmet.frameguard({action: 'deny'}));

// Sets "X-XSS-Protection: 0"  to sanitize input sent to server
app.use(helmet.xssFilter());

// Sets "X-Content-Type-Options: nosniff", instructing the browser to not bypass the provided Content-Type
app.use(helmet.noSniff());

// Sets "X-Download-Options: noopen", which is specific to Internet Explorer 8. This will prevent IE users from executing downloads in the untrusted site’s context.
app.use(helmet.ieNoOpen());

// helmet.hsts() sets the Strict-Transport-Security header which tells browsers to prefer HTTPS over insecure HTTP
// Replit already has hsts enabled. To override its settings you need to set the field "force" to true in the config object
app.use(helmet.hsts({maxAge: 90*24*60*60, force: true}));

// To improve performance, most browsers prefetch DNS records for the links in a page. In that way the destination ip is already known when the user clicks on a link.
// helmet.dnsPrefetchControl() sets the X-DNS-Prefetch-Control header to help control DNS prefetching, which can improve user privacy at the expense of performance
// Options 'allow' is a boolean dictating whether to enable DNS prefetching. It defaults to false.
app.use(helmet.dnsPrefetchControl({allow: false}));

// Caching has performance benefits, so only use helmet.noCache() when there is a real need (like releasing an update for your website, and you want the users to always download the newer version)
app.use(helmet.noCache());

// helmet.contentSecurityPolicy() sets the Content-Security-Policy header which helps mitigate cross-site scripting attacks, among other things
// CSP works by defining an allowed list of content sources which are trusted
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "trusted-cdn.com"]
  }
}));

/*
app.use(helmet()) will automatically include all the middleware introduced above, except noCache(), and contentSecurityPolicy(), but these can be enabled if necessary. You can also disable or configure any other middleware individually, using a configuration object.
Example:

app.use(helmet({
  frameguard: {         // configure
    action: 'deny'
  },
  contentSecurityPolicy: {    // enable and configure
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ['style.com'],
    }
  },
  dnsPrefetchControl: false     // disable
}))

We introduced each middleware separately for teaching purposes and for ease of testing. Using the ‘parent’ helmet() middleware is easy to implement in a real project.
*/

module.exports = app;
const api = require('./server.js');
app.use(express.static('public'));
app.disable('strict-transport-security');
app.use('/_api', api);
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
