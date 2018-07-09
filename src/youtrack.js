ytib = (typeof ytib === 'undefined') ? { } : ytib;
ytib.youtrack = (typeof ytib.youtrack === 'undefined') ? { } : ytib.youtrack;

const Promise = require('bluebird'),
	request = require('request').defaults({jar: true}),
	parse = require('xml2js').parseString;

ytib.youtrack.getIssueKey = (issueKey, projectKey) => {
	return !isNaN(parseInt(issueId)) ? `${projectKey}-${issueKey}` : issueKey;
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
