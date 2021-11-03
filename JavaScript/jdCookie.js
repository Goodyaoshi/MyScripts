const iconv = require('iconv-lite');
const fs = require('fs');
 
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

//获取京东Cookie
let CookieJDs = getCookie('./Cookie.json');
CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]

//导出京东Cookie
for (let i = 0; i < CookieJDs.length; i++) {
	const index = (i + 1 === 1) ? '' : (i + 1);
	exports['CookieJD' + index] = CookieJDs[i].trim();
}
