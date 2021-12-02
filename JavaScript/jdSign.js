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

// 保存配置文件
function savejson(filepath, data){
	let datastr = JSON.stringify(data, null, 4);
	if (datastr){
		try{
			fs.writeFileSync(filepath, datastr);
		}catch(err){}
	}
}

//拼接京东Cookie
async function getCookie(filepath){
	let data = loadjson(filepath);
	let jdCookie = [];
	let newData = [];
	for (let i = 0; i < data.length; i++) {
		if(data[i].pt_key && data[i].pt_pin){
			let str = "pt_key=" + data[i].pt_key + ";pt_pin=" + data[i].pt_pin + ";";
			let result = await checkCookie(str);
			if(!result.check){
				console.log('【Cookie失效账号】：' + result.nickname?result.nickname:data[i].pt_pin);
				BarkNotify('京东Cookie失效', '【Cookie失效账号】：' + result.nickname?result.nickname:data[i].pt_pin);
			}else if(result.userLevel < 56 && result.levelName == '注册用户'){
				console.log('【黑号账号】：' + result.nickname + '\n【用户分组】：' + result.levelName + '\n【用户等级】：' + result.userLevel);
				BarkNotify('京东黑号', '【黑号账号】：' + result.nickname + '\n【用户分组】：' + result.levelName + '\n【用户等级】：' + result.userLevel);
			}else{
				jdCookie.push(str);
				newData.push(data[i]);
			}
		}
	}
	savejson(filepath, newData);
	return jdCookie;
}

// 测试cookie是否有效
async function checkCookie(cookie){
	let result = {"check":false,"levelName": '注册用户',"nickname":'',"userLevel": '50'};
	const options = {
        url: 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion',
        headers: {
			'authority': 'me-api.jd.com',
			'cache-control': 'max-age=0',
			'sec-ch-ua': '"Microsoft Edge";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Windows"',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36 Edg/95.0.1020.40',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
			'sec-fetch-site': 'none',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-user': '?1',
			'sec-fetch-dest': 'document',
			'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
			'cookie': cookie,
			'dnt': '1',
			'sec-gpc': '1'
		}
	}
	await rp.get(options, (err, resp, data) => {
        try {
          if (err) {
            console.log(err);
          } else {
            data = JSON.parse(data);
            if (data.retcode === '0') {
				result.check = true;
				result.nickname = data.data.userInfo.baseInfo.nickname;
				result.levelName = data.data.userInfo.baseInfo.levelName;
				result.userLevel = data.data.userInfo.baseInfo.userLevel;
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
	// 1、替换cookie
	await setupCookie(cookie);
	// 2、执行脚本
	await exec(`node ${js_path} >> ${result_path}`);
	// 3、拼接通知
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
	// 4、删除文件
	await deleteFile(result_path);
}

async function jdAllSign(){
	// 下载脚本
	await downFile(js_url);
	if (!await fs.existsSync(js_path)) {
		return
	}
	// 获得并且分割cookie数组
	let CookieJDs = await getCookie(cookie_path);
	CookieJDs = [...new Set(CookieJDs.filter(item => !!item))];
	// 每一个cookie单独执行签到
	for(let i = 0; i < CookieJDs.length; i++){
		let cookie = CookieJDs[i].trim();
		await jdSign(cookie);
		//await checkCookie(cookie);
	}
	// 发送通知信息
	await sendNotify('京东多合一签到',allMessage);
}

jdAllSign()