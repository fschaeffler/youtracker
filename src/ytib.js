YTIB = (typeof YTIB === 'undefined') ? { } : YTIB;

module.exports = YTIB;

YTIB.run = (issueKey, sourceBranch) => {
	const settings = YTIBSettings.getSettings(),
		issueKeyChecked = YouTrack.getIssueKey(issueKey, settings.projectKey),
		sourceBranchChecked = sourceBranch || settings.defaultBranch;

	return YouTrack.getIssueName(
			settings.baseUrl,
			settings.login,
			settings.password,
			issueKeyChecked
		).then((issueName) => {
			return Git.checkoutBranch(
				Git.getGitBranch(issueKeyChecked, issueName, sourceBranchChecked),
				sourceBranchChecked
			);
		})
};
