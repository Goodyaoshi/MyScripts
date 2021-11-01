#!/bin/bash
cd /root/MyConfig
git pull
yes | cp /root/MyConfig/IPNotification/setup.json /root/IPNotification/setup.json
cd /root/MyScripts
git pull
yes | cp /root/MyScripts/JavaScript/ipNotification.js /root/IPNotification/ipNotification.js
cd /root/IPNotification
node ./ipNotification.js
cd /root
yes | cp /root/IPNotification/setup.json /root/MyConfig/IPNotification/setup.json
cd /root/MyConfig
git add IPNotification/
git commit -m "$(date +"%Y-%m-%d %H:%M:%S")"
git push -u origin master
