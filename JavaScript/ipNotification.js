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

function main(){
let data;
try{
	iconv.skipDecodeWarning = true;
	let jsondata = iconv.decode(fs.readFileSync('./setup.json', "binary"), "utf8");
	data = JSON.parse(jsondata);
}catch(err){
	console.log(err);
}
fetch('http://ifcfg.cn/echo')
	.then(res => res.json())
	.then(json => {
		if(json.ip!=data.ip){
			fetch('https://api.day.app/' + data.Bark_Key + '/' + encodeURIComponent('IP变化通知') + '/' + encodeURIComponent('旧IP为：' + data.ip + '\n新IP为：' + json.ip + '\n内网IP为：' + getIPAddress()) + '?sound=silence&group=' + encodeURIComponent('IP变化通知'))
				.then(res => res.json())
				.then(json => console.log(json.message));
		}
		data.ip = json.ip;
		let datastr = JSON.stringify(data, null, 4);
		if (datastr){
			try{
				fs.writeFileSync('./setup.json', datastr);
			}catch(err){}
		}
	});
}

main();