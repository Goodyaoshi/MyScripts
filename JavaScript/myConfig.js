const iconv = require('iconv-lite');
const fs = require('fs');

// JDSign路径
const JDSign_path = './JDSign/Cookie.json';
// JDScripts路径
const JDScripts_path = './JDScripts/Cookie.json';

// 读取配置文件
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

// 剪切京东Cookie
function setCookie(load_path,save_path){
	let data = loadjson(load_path);
	let jdCookie = [];
	for (let i = 0; i < data.length; i++) {
		if((data[i].pt_pin == "jd_4c10eb2c6c32c") || (data[i].pt_pin == "jd_cmbklrvzIKCA")){
			jdCookie.push(data[i]);
		}
	}
	savejson(save_path, jdCookie);
}

setCookie(JDSign_path,JDScripts_path)
