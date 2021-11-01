#!/bin/bash
cd /root/MyConfig/
git pull
yes | cp /root/MyConfig/JDSign/Cookie.json /root/JDSign/Cookie.json
yes | cp /root/MyConfig/NovelNotice/setup.json /root/NovelNotice/setup.json
yes | cp /root/MyConfig/IPNotification/setup.json /root/IPNotification/setup.json
node ./myConfig.js
yes | cp /root/MyConfig/JDScripts/Cookie.json /root/JDScripts/Cookie.json

