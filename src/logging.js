Logging = (typeof Logging === 'undefined') ? { } : Logging;

module.exports = Logging;

const COLOR_GREEN = '\x1b[32m';

Logging.log = (message, useColor = false, flush = false) => {
	console.log(useColor ? COLOR_GREEN : '', `===> ${message}`);

	if (flush) {
		console.log('');
	}
};
