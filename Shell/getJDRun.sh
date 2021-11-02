#!/bin/bash

traverseDir()
{
    filepath=$1
    
    for file in `ls -a $filepath`
    do
        if [ -d ${filepath}/$file ]
        then
			echo "This is the directory"
##            if [[ $file != '.' && $file != '..' ]]
##            then
##                traverseDir ${filepath}/$file
##            fi
        else
            getJavaScript ${filepath}/$file
        fi
    done
}

getJavaScript()
{
    file=$1
    if [ "${file##*.}"x = "js"x ];then
        echo "node "$file >> /root/JDShell/jdScripts.sh
    fi    
}

setJDScripts()
{
	rm -rf /root/JDScripts
	cd /root/jd_scripts/
	git pull
	cd /root/
	cp -rf /root/jd_scripts/ /root/JDScripts/
	rm -rf /root/JDScripts/.git
	rm -rf /root/JDScripts/docker
	rm -rf /root/JDScripts/icon
	rm -rf /root/JDScripts/Loon
	rm -rf /root/JDScripts/QuantumultX
	rm -rf /root/JDScripts/*.py
	rm -rf /root/JDScripts/*.md
	rm -rf /root/JDScripts/jdCookie.js
	rm -rf /root/JDScripts/sendNotify.js
	rm -rf /root/JDScripts/jd_get_share_code.js
	rm -rf /root/JDScripts/jd_env_copy.js
	yes | cp /root/MyConfig/JDScripts/Cookie.json /root/JDScripts/Cookie.json
	yes | cp /root/MyScripts/JavaScript/jdCookie.js /root/JDScripts/jdCookie.js
	yes | cp /root/MyScripts/JavaScript/sendNotify.js /root/JDScripts/sendNotify.js
	cd /root/JDScripts/
	npm install request-promise
	npm install request
	npm install crypto-js
	npm install iconv-lite
	npm install fs
	npm install
}

setShell()
{
	echo "#!/bin/bash" > /root/JDShell/jdScripts.sh
	echo "yes | cp /root/MyConfig/JDScripts/Cookie.json /root/JDScripts/Cookie.json" >> /root/JDShell/jdScripts.sh
	echo "cd /root/JDScripts/" >> /root/JDShell/jdScripts.sh
	traverseDir /root/JDScripts
	echo "" >> /root/JDShell/jdScripts.sh
	yes | cp /root/JDShell/jdScripts.sh /root/MyScripts/Shell/jdScripts.sh
	cd /root/MyScripts/
	git add Shell/
	git commit -m "$(date +"%Y-%m-%d %H:%M:%S")"
	git push -u origin master
}

setCron()
{
	cp -rf /root/jd_scripts/docker/crontab_list.sh /var/spool/cron/root
	sed -i 's#30 * * * * sh +x /scripts/docker/auto_help.sh collect >> /scripts/logs/auto_help_collect.log 2>&1#/n#g'  /var/spool/cron/root
	sed -i "s# >> /scripts/logs#> /root/JDLogs#g" /var/spool/cron/root
	sed -i 's#scripts#root/MyConfig/JDScripts#g' /var/spool/cron/root
	service cron stop
	service cron start
	service cron restart
}

setJDScripts
setShell
setCron