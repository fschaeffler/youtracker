ytib = (typeof ytib === 'undefined') ? { } : ytib;

ytib.run = (issueKey, sourceBranch) => {
	const settings = ytib.settings.getSettings();

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
		})
};
