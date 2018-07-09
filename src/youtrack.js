YouTrack = (typeof YouTrack === 'undefined') ? { } : YouTrack;

module.exports = YouTrack;

const Promise = require('bluebird'),
	request = require('request').defaults({jar: true}),
	parse = require('xml2js').parseString;

YouTrack.getIssueKey = (issueKey, projectKey) => {
	return !isNaN(parseInt(issueKey)) ? `${projectKey}-${issueKey}` : issueKey;
};

YouTrack.getIssueName = (baseUrl, login, password, issueId, formatName) => {
	Logging.log(`retrieving story-name for issue ${issueId}`);

	return _login(baseUrl, login, password)
		.then(() => {
			return _getIssue(baseUrl, issueId);
		})
		.then((issueResponse) => {
			return _getIssueName(issueResponse, formatName);
		});
};

const _login = (baseUrl, login, password) => {
	return new Promise((resolve, reject) => {
		request.post({
				url: `${baseUrl}/rest/user/login`,
				form: {
					login: login,
					password: password
				}
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
					rawNames = result['issue']['field'].filter(function(item) {
						return item['$']['name'] === 'summary';
					}),
					rawName = rawNames[0]['value'][0],
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
