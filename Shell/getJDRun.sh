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
	rm -rf /root/JDScripts/.github
	rm -rf /root/JDScripts/docker
	rm -rf /root/JDScripts/icon
	rm -rf /root/JDScripts/Loon
	rm -rf /root/JDScripts/QuantumultX
	rm -rf /root/JDScripts/*.py
	rm -rf /root/JDScripts/*.md
	cp -rf /root/JDShell/.git /root/JDScripts/
	cd /root/JDScripts/
	git pull
	git add .
	git commit -m "$(date +"%Y-%m-%d %H:%M:%S")"
	git push -u origin master
	cd /root/
	rm -rf /root/JDShell/.git
	cp -rf /root/JDScripts/.git /root/JDShell/
	rm -rf /root/JDScripts/jdCookie.js
	rm -rf /root/JDScripts/sendNotify.js
	rm -rf /root/JDScripts/jd_get_share_code.js
	rm -rf /root/JDScripts/jd_env_copy.js
	yes | cp /root/MyConfig/JDScripts/Cookie.json /root/JDScripts/Cookie.json
	yes | cp /root/MyScripts/JavaScript/jdCookie.js /root/JDScripts/jdCookie.js
	yes | cp /root/MyScripts/JavaScript/sendNotify.js /root/JDScripts/sendNotify.js
	sed -i 's#./Cookie.json#/root/JDScripts/Cookie.json#g' /root/JDScripts/jdCookie.js
}

setShell()
{
	echo "#!/bin/bash" > /root/JDShell/jdScripts.sh
	echo "yes | cp /root/MyConfig/JDScripts/Cookie.json /root/JDScripts/Cookie.json" >> /root/JDShell/jdScripts.sh
	echo "cd /root/JDScripts/" >> /root/JDShell/jdScripts.sh
	traverseDir /root/JDScripts
	echo "" >> /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/JDJRValidator_Pure.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/JD_DailyBonus.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/JD_extra_cookie.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/JS_USER_AGENTS.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/TS_USER_AGENTS.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/USER_AGENTS.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/ZooFaker_Necklace.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jdCookie.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jd_getShareCodes.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jdDreamFactoryShareCodes.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jdFactoryShareCodes.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jdFruitShareCodes.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jdJxncShareCodes.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jdPetShareCodes.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jdPlantBeanShareCodes.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jd_family.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/jd_delCoupon.js##g' /root/JDShell/jdScripts.sh
	sed -i 's#node /root/JDScripts/sendNotify.js##g' /root/JDShell/jdScripts.sh
	sed -i '/^$/d' /root/JDShell/jdScripts.sh
	yes | cp /root/JDShell/jdScripts.sh /root/MyScripts/Shell/jdScripts.sh
	cd /root/MyScripts/
	git add .
	git commit -m "$(date +"%Y-%m-%d %H:%M:%S")"
	git push -u origin master
}

setCron()
{
	cp -rf /root/jd_scripts/docker/crontab_list.sh /var/spool/cron/crontabs/root
	sed -i 's#>> /scripts/logs/auto_help_collect.log 2>&1##g'  /var/spool/cron/crontabs/root
	sed -i 's#30 * * * * sh +x /scripts/docker/auto_help.sh collect##g'  /var/spool/cron/crontabs/root
	sed -i "s#>> /scripts/logs#> /root/JDLogs#g" /var/spool/cron/crontabs/root
	sed -i 's#scripts#root/MyConfig/JDScripts#g' /var/spool/cron/crontabs/root
	service cron stop
	service cron start
	service cron restart
}

cd /root/JDScripts/
git restore .
git pull -f
rm -rf /root/JDScripts/jdCookie.js
rm -rf /root/JDScripts/sendNotify.js
rm -rf /root/JDScripts/jd_get_share_code.js
rm -rf /root/JDScripts/jd_env_copy.js
yes | cp /root/MyConfig/JDScripts/Cookie.json /root/JDScripts/Cookie.json
yes | cp /root/MyScripts/JavaScript/jdCookie.js /root/JDScripts/jdCookie.js
yes | cp /root/MyScripts/JavaScript/sendNotify.js /root/JDScripts/sendNotify.js
sed -i 's#./Cookie.json#/root/JDScripts/Cookie.json#g' /root/JDScripts/jdCookie.js
sed -i 's#./#/root/JDScripts/#g' /root/JDScripts/jdScripts.sh
sed -i 's#/root/JDScripts/bi/root/JDScripts/bash#!/bin/bash#g' /root/JDScripts/jdScripts.sh
sed -i 's#/root/JDScripts/roo/root/JDScripts/JDScript/root/JDScripts/# /root/JDScripts/#g' /root/JDScripts/jdScripts.sh
cd /root/JDScripts/
npm install
cd /
yes | cp /root/JDScripts/jdScripts.sh /root/JDShell/jdScripts.sh
rm -rf /root/MyScripts/Shell/jdScripts.sh
yes | cp /root/JDShell/jdScripts.sh /root/MyScripts/Shell/jdScripts.sh
cd /root/MyScripts/
git add .
git commit -m "$(date +"%Y-%m-%d %H:%M:%S")"
git push -u origin master
