ytib = (typeof ytib === 'undefined') ? { } : ytib;
ytib.settings = (typeof ytib.settings === 'undefined') ? { } : ytib.settings;

const fs = require('fs'),
	path = require('path'),
	readline = require('readline');

const CONFIG_FILE_NAME = 'settings-yt-issue-branch.json';

ytib.settings.setup = () => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.question('Setup globally or locally [g|l]? ', (answerLocation) => {
		rl.question('Base URL (e.g. https://<ORGANIZATION>.myjetbrains.com/youtrack)? ', (answerBaseUrl) => {
			rl.question('YouTrack Login: ', (answerLogin) => {
				rl.question('YouTrack Password: ', (answerPassword) => {
					rl.question('YouTrack ProjectID: ', (answerProjectId) => {
						rl.question('Default git branch: ', (answerDefaultBranch) => {
							_persistSettings(
								{
									baseUrl: answerBaseUrl,
									login: answerLogin,
									password: answerPassword,
									projectKey: answerProjectId,
									defaultBranch: answerDefaultBranch
								},
								(answerLocation === 'g')
							);

							rl.close();
						});
					});
				});
			});
		});
	});
};

ytib.setting.getSettings = () => {
	const settingsPath = _getSettingsPath();

	if (settingsPath) {
		return _retrieveSettings(settingsPath);
	}
	else {
		ytib.settings.setup();
		return ytib.settings.getSettings();
	}
};

const _persistSettings = (settings, local = false) => {
	const settingsPath = local ? _getSettingsLocationLocal() : _getSettingsLocationGlobal(),
		dirname = path.dirname(settingsPath);

	if (!fs.existsSync(dirname)) {
		fs.mkdirSync(dirname);
	}

	fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
};

const _retrieveSettings = (location) {
	return JSON.parse(fs.readFileSync(location));
};

const _getHomeDir = () => {
	return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

const _getSettingsLocationGlobal = () => {
	return `${_getHomeDir()}/.yt-issue-branch/${CONFIG_FILE_NAME}`;
};

const _getSettingsLocationLocal = () => {
	return `${process.env.INIT_CWD}/${CONFIG_FILE_NAME}`;
};

const _getSettingsPath = () => {
	return _getSettingsLocationLocal() || _getSettingsLocationGlobal();
};
