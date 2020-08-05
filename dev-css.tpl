/**
 * A dev loader for stylesheets that will be concatenated in production.
 * (c) Thomas Peri <hello@thomasperi.net>
 * MIT License
 */
<%= dev_urls.map(item => '@import "' + item + '";').join('\n') %>