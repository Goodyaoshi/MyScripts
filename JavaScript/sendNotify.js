const rp = require('request-promise');

let SCKEY = 'SCT24803TkGQpjDc2bge7Mhd2yzWBx1MX';
let PUSH_PLUS_TOKEN = '848fc598cf3a4c0698be96ed16552aa7';
let PUSH_PLUS_USER = '';
let BARK_PUSH = 'ZwSc2BDAiPYHLpicm5LQUA';
let Short = false;
let Long = false;

async function sendNotify(text, desp) {
	if(((text.indexOf("京东资产变动通知") != -1) && (text.indexOf("失效") != -1)) || (text.indexOf("已可领取") != -1) || (text.indexOf("已可兑换") != -1) || (desp.indexOf("已可领取") != -1) || (desp.indexOf("已可兑换") != -1))
	{
		if(desp.indexOf("但未继续") == -1)
		{
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
}

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

module.exports = {
  sendNotify,
  BARK_PUSH
}