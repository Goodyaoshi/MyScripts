const CryptoJS = require('crypto-js');
const fetch = require('node-fetch');
const iconv = require('iconv-lite');
const fs = require('fs');

function getIPAddress(){
	var interfaces = require('os').networkInterfaces();
	for(var devName in interfaces){
		var iface = interfaces[devName];
		for(var i=0;i<iface.length;i++){
			var alias = iface[i];
			if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
				return alias.address;
			}
		}
	}
}

async function getIPJson(){
	let result;
	await fetch('http://ifcfg.cn/echo')
	.then(res => res.json())
	.then(json => {
		result = json;
	});
	return result;
}

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

function savejson(filepath, data){
	let datastr = JSON.stringify(data, null, 4);
	if (datastr){
		try{
			fs.writeFileSync(filepath, datastr);
		}catch(err){}
	}
}

function Bark(key,title,old_ip,new_ip) {
    fetch('https://api.day.app/' + key + '/' + encodeURIComponent(title) + '/' + encodeURIComponent('旧IP为：' + old_ip + '\n新IP为：' + new_ip + '\n内网IP为：' + getIPAddress()) + '?sound=silence&group=' + encodeURIComponent(title))
	.then(res => res.json())
	.then(json => console.log(json.message));
}

async function main(){
	let data = loadjson('./setup.json');
	let json = await getIPJson();	
	if(json && json.ip && json.ip!=data.ip){
		Bark(data.Bark_Key,'IP变化通知',data.ip,json.ip);
		data.ip = json.ip;
	}
	savejson('./setup.json',data);
}

main();