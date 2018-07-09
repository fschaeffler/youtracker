ytib = (typeof ytib === 'undefined') ? { } : ytib;
ytib.git = (typeof ytib.git === 'undefined') ? { } : ytib.git;

const Promise = require('bluebird'),
	child_process = require('child_process');

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
