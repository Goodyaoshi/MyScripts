const exec = require('child_process').execSync
const rp = require('request-promise')
const download = require('download')
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
const js_url = 'https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js'
// Cookie路径
const cookie_path = './Cookie.json'
// 下载脚本路径
const js_path = './JD_DailyBonus.js'
// 脚本执行输出路径
const result_path = './result.txt'
// 短通知是否发送成功
let Short = false;
// 长通知是否发送成功
let Long = false;
// 通知内容
let allMessage = '';

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
		let str = "pt_key=" + data[i].pt_key + ";pt_pin=" + data[i].pt_pin + ";";
		jdCookie.push(str);
	}
	return jdCookie;
}

//时间格式化
Date.prototype.Format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'S+': this.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(String(o[k]).length)));
    }
  }
  return fmt;
};

//发送通知入口
async function sendNotify(text, desp) {
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
	  if(BARK_PUSH && BARK_PUSH.indexOf('https') === -1 && BARK_PUSH.indexOf('http') === -1) {
		  BARK_PUSH = `https://api.day.app/${BARK_PUSH}`
	  }
      const options = {
        url: `${BARK_PUSH}/${encodeURIComponent(text)}/${encodeURIComponent(desp)}?sound=silence&group=` + encodeURIComponent('京东签到'),
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

//日期格式化
function dateFormat() {
  var timezone = 8;
  var GMT_offset = new Date().getTimezoneOffset();
  var n_Date = new Date().getTime();
  var t_Date = new Date(n_Date + GMT_offset * 60 * 1000 + timezone * 60 * 60 * 1000);
  console.log(t_Date)
  return t_Date.Format('yyyy.MM.dd')
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
	if (!cookie) {
		console.log('请配置京东cookie!'); return;
	}
	// 1、替换cookie
	await setupCookie(cookie);
	// 2、执行脚本
	await exec(`node ${js_path} >> ${result_path}`);
	// 3、拼接通知
	if (fs.existsSync(result_path)) {
		const notifyContent = await fs.readFileSync(result_path, "utf8");
		const barkContentStart = notifyContent.indexOf('【签到概览】');
		const barkContentEnd = notifyContent.length;
		const matchReg = /(?<=pt_pin=).*?(?=;)/;
		let BarkContent = '';
		if (barkContentStart > -1 && barkContentEnd > -1) {
			BarkContent += '【签到账号】:' + cookie.match(matchReg) + '\n';
			BarkContent += notifyContent.substring(barkContentStart, barkContentEnd);
			BarkContent = BarkContent.split('\n\n')[0];
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