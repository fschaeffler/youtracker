# youtracker
Create default branches based on YouTrack issues

# requirements
- nodejs needs to be installed
- git needs to be installed

# installation npm
- `npm install -g youtracker`
- adjust the settings-yt-issue-branch.json to your needs

# installation manually
- checkout the repository
- `cp settings-yt-issue-branch.default.json settings-yt-issue-branch.json`
- adjust the settings-yt-issue-branch.json to your needs
- `npm install`
- add to PATH where yt-issue-branch is in

# usage
- `cd <other git tracked repository>`
- `yt-issue-branch 123` or `yt-issue-branch PROJECTID-123`

# what will it do
- connect to YouTrack and get the issue's summary
- normalize the summary
- checkout the default branch and pull the latest state
- create a branch from the latest default branch, name it `<PROJECTID-123>_add-functionality-xyz` and check it out
