const CryptoJS = require('crypto-js');
const fetch = require('node-fetch');
const iconv = require('iconv-lite');
const fs = require('fs');

// setup Path
const setup_Path = './setup.json';
// Bark iOS
const Bark_Key = loadjson(setup_Path).Bark_Key;
// BookList
var BookList = loadjson(setup_Path).BookList;
// 获得所有书籍更新信息
getAllUpdateInfo();

// 加载配置
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

// 保存配置
function savejson(filepath, data){
	let datastr = JSON.stringify(data, null, 4);
	if (datastr){
		try{
			fs.writeFileSync(filepath, datastr);
		}catch(err){}
	}
}

// 得到章节id
function getcid(id){
	for (var p in BookList) {
        for (let i = 0; i < BookList[p].length; i++) {
            if(BookList[p][i].id == id){
                return BookList[p][i].cid;
            }
        }
    }
}

// 设置章节id
function setcid(cid,id){
	for (var p in BookList) {
        for (let i = 0; i < BookList[p].length; i++) {
            if(BookList[p][i].id == id){
                BookList[p][i].cid = cid;
				return;
            }
        }
    }
}

// 发送通知
function Bark(BookName, Author, Chapter) {
    fetch('https://api.day.app/' + Bark_Key + '/' + encodeURIComponent('《' + BookName + '》') + '/' + encodeURIComponent(Chapter) + '?sound=silence&group=' + encodeURIComponent('小说更新提醒') + '&url=' + encodeURIComponent('iFreeTime://bk/a=' + encodeURIComponent(Author) + '&n=' + encodeURIComponent(BookName) + '&d=0'))
        .then(res => res.json())
        .then(json => console.log(json.message));
}

// 与旧章节对比
function updateChapter(id, BookName, Author, new_cid, UpdateChapterName) {
	if(getcid(id) < new_cid){
		Bark(BookName, Author, UpdateChapterName);
	}
    setcid(new_cid,id);
}

// 得到最新章节
async function getUpdateInfo(id, Channel) {
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
                    updateChapter(id, BookName, Author, new_cid, UpdateChapterName);
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
                    updateChapter(id, BookName, Author, new_cid, UpdateChapterName)
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
                    updateChapter(id, BookName, Author, new_cid, UpdateChapterName)
                }
            })
    }

}

// 每一本书都检查是否有更新
async function getAllUpdateInfo() {
    for (var p in BookList) {
        for (let i = 0; i < BookList[p].length; i++) {
            await getUpdateInfo(BookList[p][i].id, p);
        }
    }
	// 保存配置
	savejson(setup_Path,{"Bark_Key": Bark_Key,"BookList": BookList});
}
