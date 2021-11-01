#!/bin/bash
cd /root/MyConfig
git pull
yes | cp /root/MyConfig/NovelNotice/setup.json /root/NovelNotice/setup.json
cd /root/MyScripts
git pull
yes | cp /root/MyScripts/JavaScript/novelNotice.js /root/NovelNotice/novelNotice.js
cd /root/NovelNotice
node ./novelNotice.js
cd /root
yes | cp /root/NovelNotice/setup.json /root/MyConfig/NovelNotice/setup.json
cd /root/MyConfig
git add NovelNotice/
git commit -m "$(date +"%Y-%m-%d %H:%M:%S")"
git push -u origin master
