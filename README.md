# youtracker
Create default branches based on YouTrack issues

# requirements
- nodejs needs to be installed
- git needs to be installed

# installation
- `npm install -g youtracker`

# configuration
- `yt-issue-branch setup`

# usage
- `cd <other git tracked repository>`
- `yt-issue-branch 123` or `yt-issue-branch PROJECTID-123`

# usage (staging & master)
- `cd <other git tracked repository>`
- `yt-issue-branch-staging 123` or `yt-issue-branch 123 --branch staging`
- `yt-issue-branch-production 123` or `yt-issue-branch 123 --branch master`

# what will it do
- connect to YouTrack and get the issue's summary
- normalize the summary
- checkout the default branch and pull the latest state
- create a branch from the latest default branch, name it `<PROJECTID-123>_add-functionality-xyz` and check it out
