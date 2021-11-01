const CryptoJS = require('crypto-js');
const fetch = require('node-fetch');
const iconv = require('iconv-lite');
const fs = require('fs');

var Bark_Key;
var BookList;

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

function loadsetup(){
    var data = loadjson('./setup.json');
    Bark_Key = data.Bark_Key;
    BookList = data.BookList;
}

function getcid(id, Channel,data){
    var cid = "";
    if(Channel == "起点"){
        for(var i=0; i<data.BookList.起点.length; i++){
            if(data.BookList.起点[i].id == id)
            {
                cid = data.BookList.起点[i].cid;
            }
        }
    }else if(Channel == "纵横"){
        for(var i=0; i<data.BookList.纵横.length; i++){
            if(data.BookList.纵横[i].id == id)
            {
                cid = data.BookList.纵横[i].cid;
            }
        }
    }else{
        for(var i=0; i<data.BookList.晋江.length; i++){
            if(data.BookList.晋江[i].id == id)
            {
                cid = data.BookList.晋江[i].cid;
            }
        }
    }
    return cid;
}

function setcid(cid,id, Channel,data){
    if(Channel == "起点"){
        for(var i=0; i<data.BookList.起点.length; i++){
            if(data.BookList.起点[i].id == id)
            {
                data.BookList.起点[i].cid = cid;
            }
        }
    }else if(Channel == "纵横"){
        for(var i=0; i<data.BookList.纵横.length; i++){
            if(data.BookList.纵横[i].id == id)
            {
                data.BookList.纵横[i].cid = cid;
            }
        }
    }else{
        for(var i=0; i<data.BookList.晋江.length; i++){
            if(data.BookList.晋江[i].id == id)
            {
                data.BookList.晋江[i].cid = cid;
            }
        }
    }
    savejson('./setup.json', data);
}

function Bark(BookName, Author, Chapter, Bark_Key) {
    fetch('https://api.day.app/' + Bark_Key + '/' + encodeURIComponent('《' + BookName + '》') + '/' + encodeURIComponent(Chapter) + '?sound=silence&group=' + encodeURIComponent('小说更新提醒') + '&url=' + encodeURIComponent('iFreeTime://bk/a=' + encodeURIComponent(Author) + '&n=' + encodeURIComponent(BookName) + '&d=0'))
        .then(res => res.json())
        .then(json => console.log(json.message));
}

function refreshVariables(id, BookName, Author, new_cid, UpdateChapterName, Channel) {
    var data = loadjson('./setup.json');
    let old_cid = getcid(id,Channel,data);
    console.log('\n(' + id + ')' + BookName + '的 old_cid: ' + old_cid);
    if (old_cid >= new_cid) {
        console.log('\n(' + id + ')' + BookName + ': 暂无更新, 最新章节为 ' + UpdateChapterName + '(' + new_cid + ')');
    } else {
        console.log('\n(' + id + ')' + BookName + '_更新章节: ' + UpdateChapterName + '(' + new_cid + ')');
        Bark(BookName, Author, UpdateChapterName, Bark_Key);
    }
    setcid(new_cid,id,Channel,data);
}

async function refreshUpdateinfo(id, Channel) {
    if (Channel == "起点") {
        await fetch('http://druid.if.qidian.com/Atom.axd/Api/Book/GetChapterList?BookId=' + id + '&timeStamp=253402185599000')
            .then(res => res.json())
            .then(json => {
                if (json.Result == 0) {
                    let BookName = json.Data.BookName;
                    let Author = json.Data.Author;
                    let obj = json.Data.LastVipUpdateChapterId ? 'LastVip' : 'Last';
                    let new_cid = json.Data[obj + 'UpdateChapterId'];
                    let UpdateChapterName = json.Data[obj + 'UpdateChapterName'];
                    console.log('\n(' + id + ')' + BookName + '_更新时间: ' + json.Data[obj + 'ChapterUpdateTime']);
                    refreshVariables(id, BookName, Author, new_cid, UpdateChapterName, "起点")
                } else {
                    console.log('\n(' + id + ')' + BookName + '_错误: ' + json.Message);
                }
            })
    } else if (Channel == "纵横") {
        let sign = "082DE6CF1178736AF28EB8065CDBE5ACapi_key=27A28A4D4B24022E543E&bookId=" + id + "&clientVersion=6.2.0082DE6CF1178736AF28EB8065CDBE5AC";
        sign = CryptoJS.MD5(sign).toString();
        let bodystr = "api_key=27A28A4D4B24022E543E&bookId=" + id + "&clientVersion=6.2.0&sig=" + sign;
        await fetch('https://api1.zongheng.com/iosapi/book/bookInfo', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "ZongHeng/6.2.0"
                },
                body: bodystr
            })
            .then(res => res.json())
            .then(json => {
                if (json.result != null) {
                    let BookName = json.result.name;
                    let Author = json.result.authorName;
                    let new_cid = json.result.latestChapterId;
                    let UpdateChapterName = json.result.latestChapterName;
                    console.log('\n(' + id + ')' + BookName + '_更新时间: ' + json.result.updateTime);
                    refreshVariables(id, BookName, Author, new_cid, UpdateChapterName, "纵横")
                } else {
                    console.log('\n(' + id + ')' + BookName + '_错误: ' + json.message);
                }
            })
    } else if (Channel == "晋江") {
        await fetch('http://app-ios-cdn.jjwxc.net/iosapi/novelbasicinfo?novelId=' + id, {
                headers: {
                    "User-Agent": "JINJIANG-iOS/4.5.2"
                }
            })
            .then(res => res.json())
            .then(json => {
                if (json.hasOwnProperty("message") == 0) {
                    let BookName = json.novelName;
                    let Author = json.authorName;
                    let new_cid = json.renewChapterId;
                    let UpdateChapterName = json.renewChapterName;
                    console.log('\n(' + id + ')' + BookName + '_更新时间: ' + json.renewDate);
                    refreshVariables(id, BookName, Author, new_cid, UpdateChapterName, "晋江")
                } else {
                    console.log('\n(' + id + ')' + BookName + '_错误: ' + json.message);
                }
            })
    }

}

async function _refreshUpdateinfo(BookList) {
    for (var p in BookList) {
        for (let i = 0; i < BookList[p].length; i++) {
            await refreshUpdateinfo(BookList[p][i].id, p);
        }
    }
}

async function main() {
    loadsetup();
    await _refreshUpdateinfo(BookList);
}

main();