Git = (typeof Git === 'undefined') ? { } : Git;

module.exports = Git;

const Promise = require('bluebird'),
	child_process = require('child_process');

Git.getGitBranch = (issueKey, issueName, sourceBranch) => {
	return `${_getBranchType(sourceBranch)}/${issueKey}_${issueName}`;
};

Git.checkoutBranch = (targetBranch, sourceBranch = 'development') => {
	return new Promise((resolve) => {
		child_process.exec(
			`git checkout ${sourceBranch}; git pull; git checkout -b ${targetBranch};`,
			{cwd: process.env.OLDPWD},
			(error, stdout, stderr) => {
				if (error) {
					console.log(error);
				}

				console.log(stdout);
				console.log(stderr);

				Logging.log(`checked out branch ${targetBranch} from ${sourceBranch}`, useColor = true, flash = true);
			}
		);
	});
};

const _getBranchType = (sourceBranch) => {
	if (sourceBranch === 'staging' || sourceBranch === 'master') {
		return 'hotfix';
	}
	else {
		return 'feature';
	}
};
