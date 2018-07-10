#!/bin/bash

script_location="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"
cd $script_location/../lib/node_modules/youtracker/

npm start --branch 'master' $1 --silent