const YTIB = require('./ytib');
const YTIBSettings = require('./ytib-settings');
const YouTrack = require('./youtrack');
const Git = require('./git');
const Logging = require('./logging');

const _getBranch = (parameters) => {
	return (parameters.original.indexOf('--branch') > -1) ? parameters.original[parameters.original.indexOf('--branch') + 1] : null;
};

const _getIssueKey = (parameters) => {
	const memory = [];

	for (let i = 1; i < parameters.original.length; i++) {
		const currentKey = parameters.original[i];

		if (currentKey === '--branch' || currentKey === '--silent') {
			i++;
		}
		else {
			memory.push(currentKey);
		}
	}

	return (memory.length === 1) ? memory[0] : null;
};

if (process.env.npm_config_argv) {
	const parameters = JSON.parse(process.env.npm_config_argv),
		isNpmRun = (parameters && parameters.original);

	if (isNpmRun) {
		if (parameters.original[1] === 'setup') {
			YTIBSettings.setup();
		}
		else if (parameters.original[1] === 'setup-no-enforce') {
			YTIBSettings.setup(noEnforce = true);
		}
		else if (parameters.original[1]) {
			YTIB.run(
				_getIssueKey(parameters),
				_getBranch(parameters)
			);
		}
		else {
			process.exit(1);
		}
	}
}
