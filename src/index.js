// global

ytib = (typeof ytib === 'undefined') ? { } : ytib;
ytib.youtrack = (typeof ytib.youtrack === 'undefined') ? { } : ytib.youtrack;
ytib.git = (typeof ytib.git === 'undefined') ? { } : ytib.git;
ytib.settings = (typeof ytib.settings === 'undefined') ? { } : ytib.settings;

const Promise = require('bluebird'),
	request = require('request').defaults({jar: true}),
	parse = require('xml2js').parseString,
	child_process = require('child_process'),
	fs = require('fs'),
	path = require('path'),
	readline = require('readline');



// youtrack

ytib.youtrack.getIssueKey = (issueKey, projectKey) => {
	return !isNaN(parseInt(issueKey)) ? `${projectKey}-${issueKey}` : issueKey;
};

ytib.youtrack.getIssueName = (baseUrl, username, password, issueId, formatName) => {
	return _login(baseUrl, username, password)
		.then(() => {
			return _getIssue(baseUrl, issueId);
		})
		.then((issueResponse) => {
			return _getIssueName(issueResponse, formatName);
		});
};

const _login = (baseUrl, username, password) => {
	return new Promise((resolve, reject) => {
		request.post({
				url: `${baseUrl}/rest/user/login`,
				form: {login: settings.login, password: settings.password}
			},
			(error, response, body) => {
				if (error || response.statusCode !== 200) {
					return reject('wrong credentials or server offline');
				}
				else {
					return resolve();
				}
			}
		);
	});
};

const _getIssue = (baseUrl, issueId) => {
	return new Promise((resolve, reject) => {
		request.get({
			url: `${baseUrl}/rest/issue/${issueId}`},
			(error, response, body) => {
				if (error || response.statusCode !== 200) {
					return reject('issue not found');
				}
				else {
					return resolve(body);
				}
			}
		);
	});
};

const _getIssueName = (rawIssue, formatName = true) => {
	return new Promise((resolve, reject) => {
		parse(rawIssue, (error, result) => {
			if (!error && result) {
				const json = JSON.stringify(result),
					rawNames = parseResult['issue']['field'].filter(function(item) {
						return item['$']['name'] === 'summary';
					}),
					rawName = summaryNodes[0]['value'][0],
					name = _formatIssueName(rawName);

				return resolve(name);
			}
			else {
				reject('issue-response invalid');
			}
		});
	});
};

const _formatIssueName = (issueName) => {
	return issueName.toLowerCase().replace(/\W+/g, " ").split(' ').join('-');
};



// git

ytib.git.getGitBranch = (issueKey, issueName) => {
	return `feature/${issueKey}_${issueName}`;
};

ytib.git.checkoutBranch = (targetBranch, sourceBranch = 'development') => {
	return new Promise((resolve) => {
		child_process.exec(
			`git checkout ${sourceBranch}; git pull; git checkout -b ${targetBranch}; created and checked out branch ${targetBranch}`,
			(error, stdout, stderr) => {
				return resolve();
			}
		);
	});
};



// youtracker

ytib.run = (issueKey, sourceBranch) => {
	const settings = ytib.settings.getSettings();

	if (settings) {
		return ytib.youtrack.getIssueName(
				settings.baseUrl,
				settings.login,
				settings.password,
				ytib.youtrack.getIssueKey(issueKey, settings.projectKey)
			).then((issueName) => {
				return ytib.git.checkoutBranch(
					ytib.git.getGitBranch(issueKey, issueName),
					sourceBranch || settings.defaultBranch
				);
			});
	}
};



// settings

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

ytib.settings.getSettings = () => {
	const settingsPath = _getSettingsPath();

	console.log(settingsPath)

	if (fs.existsSync(settingsPath)) {
		return _retrieveSettings(settingsPath);
	}
	else {
		ytib.settings.setup();
		// return ytib.settings.getSettings();
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

const _retrieveSettings = (location) => {
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
	if (fs.existsSync(_getSettingsLocationLocal())) {
		return _getSettingsLocationLocal();
	}
	else if (fs.existsSync(_getSettingsLocationGlobal())) {
		return _getSettingsLocationGlobal();
	}
	else {
		return null;
	}
};



// cli execution

if (process.env.npm_config_argv) {
	console.log('reading input parameters ...');	

	const parameters = JSON.parse(process.env.npm_config_argv),
		isNpmRun = (parameters && parameters.original);

	if (isNpmRun) {
		if (parameters.original[1] === 'setup') {
			ytib.settings.setup();
		}
		else if (parameters.original[1]) {
			ytib.run(
				parameters.original[1],
				parameters.original[parameters.original.indexOf('--branch') + 1]
			);
		}
		else {
			process.exit(1);
		}
	}
}