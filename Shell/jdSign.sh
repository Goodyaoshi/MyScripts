#!/bin/bash
cd /root/MyConfig
git pull
yes | cp /root/MyConfig/JDSign/Cookie.json /root/JDSign/Cookie.json
cd /root/MyScripts
git pull
yes | cp /root/MyScripts/JavaScript/jdSign.js /root/JDSign/jdSign.js
cd /root/JDSign
node ./jdSign.js
cd /root
yes | cp /root/JDSign/Cookie.json /root/MyConfig/JDSign/Cookie.json
cd /root/MyConfig
git add JDSign/
git commit -m "$(date +"%Y-%m-%d %H:%M:%S")"
git push -u origin master
