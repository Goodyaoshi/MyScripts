const exec = require('child_process').execSync;
const rp = require('request-promise');
const download = require('download');
const iconv = require('iconv-lite');
const fs = require('fs');

// Push Plus Token
const PUSH_PLUS_TOKEN = '848fc598cf3a4c0698be96ed16552aa7';
// Push Plus 分组
const PUSH_PLUS_USER = '';
// Server酱
const SCKEY = 'SCT24803TkGQpjDc2bge7Mhd2yzWBx1MX';
// Bark iOS
const BARK_PUSH = 'ZwSc2BDAiPYHLpicm5LQUA';

// 京东脚本文件
const js_url = 'https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js';
// Cookie路径
const cookie_path = './Cookie.json';
// 下载脚本路径
const js_path = './JD_DailyBonus.js';
// 脚本执行输出路径
const result_path = './result.txt';
// 短通知是否发送成功
let Short = false;
// 长通知是否发送成功
let Long = false;
// 通知内容
let allMessage = '【签到时间】：' + dateFormat() + '\n';
// 剪切账号的正则
const pinReg = /(?<=pt_pin=).*?(?=;)/;

//读取配置文件
function loadjson(filepath){
	let data;
	try{
		iconv.skipDecodeWarning = true;
		let jsondata = iconv.decode(fs.readFileSync(filepath, "binary"), "utf8");
		data = JSON.parse(jsondata);
	}catch(err){
		console.log(err);
	}
	return data;
}

//拼接京东Cookie
function getCookie(filepath){
	let data = loadjson(filepath);
	let jdCookie = [];
	for (let i = 0; i < data.length; i++) {
		if(data[i].pt_key && data[i].pt_pin){
			let str = "pt_key=" + data[i].pt_key + ";pt_pin=" + data[i].pt_pin + ";";
			jdCookie.push(str);
		}
	}
	return jdCookie;
}

// 测试cookie是否有效
function checkCookie(cookie){
	let result = false;
	const USER_AGENTS = [
		"jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
		"jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;android;10.0.2;9;network/4g;Mozilla/5.0 (Linux; Android 9; Mi Note 3 Build/PKQ1.181007.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
		"jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; GM1910 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
		"jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; 16T Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
		"jdapp;iPhone;10.0.2;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;13.5;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;13.7;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;13.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
		"jdapp;android;10.0.2;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K30 5G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045511 Mobile Safari/537.36",
		"jdapp;iPhone;10.0.2;11.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79",
		"jdapp;android;10.0.2;10;;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
		"jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
		"jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A6000 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045224 Mobile Safari/537.36",
		"jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
		"jdapp;android;10.0.2;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; 16 X Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
		"jdapp;android;10.0.2;8.0.0;network/wifi;Mozilla/5.0 (Linux; Android 8.0.0; HTC U-3w Build/OPR6.170623.013; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
		"jdapp;iPhone;10.0.2;14.0.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; LYA-AL00 Build/HUAWEILYA-AL00L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
		"jdapp;iPhone;10.0.2;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;android;10.0.2;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
		"jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Premium Edition Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
		"jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
		"jdapp;android;10.0.2;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K20 Pro Premium Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045513 Mobile Safari/537.36",
		"jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
		"jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
	];
	const options = {
        url: 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion',
        headers: {
			"Host": "me-api.jd.com",
			"Connection": "keep-alive",
			"Cookie": cookie,
			"User-Agent": USER_AGENTS[Math.floor(Math.random() * (USER_AGENTS.length))],
			"Accept-Language": "zh-cn",
			"Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
			"Accept-Encoding": "gzip, deflate, br"
        }
	}
	rp.get(options, (err, resp, data) => {
        try {
          if (err) {
            console.log(err);
          } else {
            data = JSON.parse(data);
            if (data.retcode === '0') {
				result = true;
            } else {
              console.log(`${data.message}\n`);
            }
          }
        } catch (e) {
          console.log(e);
        }
	})
	return result;
}

//替换cookie
async function setupCookie(cookie) {
	var js_content = fs.readFileSync(js_path, 'utf8')
	js_content = js_content.replace(/var Key = '.*'/, `var Key = '${cookie}'`)
	try {
		await fs.writeFileSync(js_path, js_content, 'utf8');
	} catch (e) {
		console.log("京东签到替换Cookie异常:" + e);
	}
}

//时间格式化
function formatTime(t,date){
    var date=new Date(date);
    var o = {   
        "M+" : date.getMonth()+1,                 //月份   
        "d+" : date.getDate(),                    //日   
        "h+" : date.getHours(),                   //小时   
        "m+" : date.getMinutes(),                 //分   
        "s+" : date.getSeconds(),                 //秒   
        "q+" : Math.floor((date.getMonth()+3)/3), //季度   
        "S"  : date.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(t)){
        t=t.replace(RegExp.$1,(date.getFullYear()+"").substr(4-RegExp.$1.length)); 
    };    
    for(var k in o){
        if(new RegExp("("+ k +")").test(t)){
            t=t.replace(RegExp.$1,(RegExp.$1.length==1)?(o[k]):(("00"+ o[k]).substr((""+o[k]).length))); 
        }; 
    }
    return t; 
};

//日期格式化
function dateFormat() {
  var timezone = 8;
  var GMT_offset = new Date().getTimezoneOffset();
  var newDate = new Date().getTime();
  var thisDate = new Date(newDate + GMT_offset * 60 * 1000 + timezone * 60 * 60 * 1000);
  console.log(thisDate);
  return formatTime('yyyy-MM-dd HH:mm:ss',thisDate)
}

//发送通知入口
async function sendNotify(text, desp) {
	if(desp.indexOf('获取失败') != -1){
		let Shorttext = text.match(/.*?(?=\s?-)/g) ? text.match(/.*?(?=\s?-)/g)[0] : text;
		await Promise.all([
			BarkNotify(Shorttext, desp)//iOS Bark APP
		])
		await Promise.all([
			pushPlusNotify(text, desp)//pushplus
		])
		await Promise.all([
			serverNotify(text, desp)//server酱
		])
	}
}

//Push Plus通知
function pushPlusNotify(text, desp) {
  return new Promise(resolve => {
    if (PUSH_PLUS_TOKEN && !Short) {
      desp = desp.replace(/[\n\r]/g, '<br>');
      const body = {
        token: `${PUSH_PLUS_TOKEN}`,
        title: `${text}`,
        content:`${desp}`,
        topic: `${PUSH_PLUS_USER}`
      };
      const options = {
        url: `https://pushplus.plus/send`,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': ' application/json'
        }
      }
      rp.post(options, (err, resp, data) => {
        try {
          if (err) {
            let Long = false;
            console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败！！\n`)
            console.log(err);
          } else {
            data = JSON.parse(data);
            if (data.code === 200) {
              Long = true;
              console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息完成。\n`)
            } else {
              let Long = false;
              console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败：${data.msg}\n`)
            }
          }
        } catch (e) {
          let Long = false;
          console.log(e);
        } finally {
          resolve(data);
        }
      })
    } else {
      resolve()
    }
  })
}

//Server酱通知
function serverNotify(text, desp, timeout = 2100) {
  return  new Promise(resolve => {
    if (SCKEY && !Short && !Long) {
      desp = desp.replace(/[\n\r]/g, '\n\n');
	  let url = '';
	  if(SCKEY.indexOf('SCU')){
		  url = `https://sc.ftqq.com/${SCKEY}.send`;
	  }else if(SCKEY.indexOf('SCT')){
		  url = `https://sctapi.ftqq.com/${SCKEY}.send`;
	  }
      const options = {
        url: `${url}`,
        body: `text=${text}&desp=${desp}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      setTimeout(() => {
        rp.post(options, (err, resp, data) => {
          try {
            if (err) {
              console.log('发送通知调用API失败！！\n')
              console.log(err);
            } else {
              data = JSON.parse(data);
              if (data.errno === 0) {
                console.log('server酱发送通知消息成功\n')
              } else if (data.errno === 1024) {
                console.log(`server酱发送通知消息异常: ${data.errmsg}\n`)
              } else {
                console.log(`server酱发送通知消息异常\n${JSON.stringify(data)}`)
              }
            }
          } catch (e) {
            console.log(e);
          } finally {
            resolve(data);
          }
        })
      }, timeout)
    } else {
      resolve()
    }
  })
}

//Bark iOS通知
function BarkNotify(text, desp) {
  return  new Promise(resolve => {
    if (BARK_PUSH) {
      const options = {
        url: `https://api.day.app/${BARK_PUSH}/${encodeURIComponent(text)}/${encodeURIComponent(desp)}?sound=silence&group=` + encodeURIComponent('京东签到'),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      rp.get(options, (err, resp, data) => {
        try {
          if (err) {
            Short = false;
            console.log('Bark APP发送通知调用API失败！！\n')
            console.log(err);
          } else {
            data = JSON.parse(data);
            if (data.code === 200) {
              Short = true;
              console.log('Bark APP发送通知消息成功\n')
            } else {
              Short = false;
              console.log(`${data.message}\n`);
            }
          }
        } catch (e) {
          Short = false;
          console.log(e);
        } finally {
          resolve();
        }
      })
    } else {
      resolve()
    }
  })
}

//下载文件
async function downFile (url) {
	try{
		const options = { };
		await download(url, './', options);
	} catch (e) {
		console.log("JD_DailyBonus.js 文件下载异常:" + e);
	}
}

//删除文件
async function deleteFile(path) {
	const fileExists = await fs.existsSync(path);
	if (fileExists) {
		const unlinkRes = await fs.unlinkSync(path);
	}
}

//每个账号执行京东签到
async function jdSign(cookie) {
	// 1、检查cookie
	if(!checkCookie(cookie)){
		let pin = cookie.match(pinReg);
		let desp = '【签到账号】：' + pin + '\n【账号所有者】：';
		if(pin == 'jd_4c10eb2c6c32c' || pin == 'jd_cmbklrvzIKCA'){
			desp += '李耀识';
		}else if(pin == 'wdNnUcnwxEEZun'){
			desp += '王浩东';
		}else if(pin == 'jd_6169da060a2d1'){
			desp += '任永羲';
		}else if(pin == 'jd_4046a2250f4b3'){
			desp += '李泽树';
		}else{
			desp += '未知';
		}
		BarkNotify('京东Cookie失效', desp);
		return;
	}
	// 2、替换cookie
	await setupCookie(cookie);
	// 3、执行脚本
	await exec(`node ${js_path} >> ${result_path}`);
	// 4、拼接通知
	if (fs.existsSync(result_path)) {
		const notifyContent = await fs.readFileSync(result_path, "utf8");
		const barkContentStart = notifyContent.indexOf('【签到概览】');
		const barkContentEnd = notifyContent.length;
		let BarkContent = '';
		if (barkContentStart > -1 && barkContentEnd > -1) {
			BarkContent += '【签到账号】：' + cookie.match(pinReg) + '\n';
			BarkContent += notifyContent.substring(barkContentStart, barkContentEnd);
			BarkContent = BarkContent.split('\n\n')[0];
			BarkContent += '\n';
		}
		if(BarkContent){
			allMessage += BarkContent;
		}
		console.log(BarkContent);
	}
	// 5、删除文件
	await deleteFile(result_path);
}

async function jdAllSign(){
	// 下载脚本
	await downFile(js_url);
	if (!await fs.existsSync(js_path)) {
		return
	}
	// 获得并且分割cookie数组
	let CookieJDs = getCookie(cookie_path);
	CookieJDs = [...new Set(CookieJDs.filter(item => !!item))];
	// 每一个cookie单独执行签到
	for(let i = 0; i < CookieJDs.length; i++){
		let cookie = CookieJDs[i].trim();
		await jdSign(cookie);
	}
	// 发送通知信息
	await sendNotify('京东多合一签到',allMessage);
}

jdAllSign()