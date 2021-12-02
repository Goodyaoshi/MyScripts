const CryptoJS = require('crypto-js');
const fetch = require('node-fetch');
const iconv = require('iconv-lite');
const fs = require('fs');

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

// 任务完成状态
async function getDailyTaskStatus(cookie) {
	let result;
	await fetch("https://api.bilibili.com/x/member/web/exp/reward", {
		"headers": {
			"cookie": cookie
		},
		"method": "GET"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			console.log("请求本日任务完成状态成功");
			result = json.data;
		}else {
			console.log(json.message);
		}
	});
	return result
}

// 随机睡眠
async function sleep(taskIntervalTime){
	let defaultTime = taskIntervalTime;
	if (defaultTime == 0) {
		defaultTime = 10;
	}
	let sleepTime = Math.floor(Math.random() + 0.5 + defaultTime*1000.0);
	console.log("-----随机暂停" + sleepTime + "ms-----\n");
	await new Promise(resolve = >setTimeout(() = >resolve(), sleepTime));
}

// 更新视频列表
async function videoUpdate(mid = "523543806"){
	let result = [];
	let urlParam = "?mid=" + mid + "&ps=30&tid=0&pn=1&keyword=&order=pubdate&jsonp=jsonp";
	await fetch("https://api.bilibili.com/x/space/arc/search" + urlParam)
	.then(res => res.json())
	.then(json => {
		if (json.data.list.vlist) {
			for (var v in json.data.list.vlist) {
				result.push(json.data.list.vlist[v].bvid);
			}
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 随机视频列表
async function regionRanking(rid = 0, day = 3){
	let result = [];
	if(rid == 0){
		let arr = [1, 3, 4, 5, 160, 22, 119];
		let random = Math.floor(Math.random()*arr.length);
		rid = arr[random];
	}
	let urlParam = "?rid=" + rid + "&day=" + day;
	await fetch("https://api.bilibili.com/x/web-interface/ranking/region" + urlParam)
	.then(res => res.json())
	.then(json => {
		if (json.data) {
			for (var v in json.data) {
				result.push(json.data[v].bvid);
			}
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 请求视频标题
async function getVideoTitle(bvid){
	let result;
	let urlParameter = "?bvid=" + bvid;
	await fetch("https://api.bilibili.com/x/web-interface/view" + urlParameter)
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = json.data.owner.name + ": " + json.data.title;
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 观看视频任务
async function videoWatch(cookie,bvid){
	let videoTitle = await getVideoTitle(bvid);
	let playedTime = Math.floor(Math.random()*90 + 1);
	let postBody = "bvid=" + bvid + "&played_time=" + playedTime;
	await fetch("https://api.bilibili.com/x/click-interface/web/heartbeat", {
	  "headers": {
		"cookie": cookie
	  },
	  "body": postBody,
	  "method": "POST"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			console.log("视频: " + videoTitle + "播放成功,已观看到第" + playedTime + "秒");
		}else {
			console.log("视频: " + videoTitle + "播放失败，原因: " + json.message);
		}
	});
}

// 分享视频任务
async function dailyAvShare(cookie,bvid){
	let matchReg = /(?<=bili_jct=).*?(?=;)/;
	let videoTitle = await getVideoTitle(bvid);
	let requestBody = "bvid=" + bvid + "&csrf=" + cookie.match(matchReg);
	await fetch("https://api.bilibili.com/x/web-interface/share/add", {
	  "headers": {
		"cookie": cookie
	  },
	  "body": requestBody,
	  "method": "POST"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			console.log("视频: " + videoTitle + "分享成功");
		}else {
			console.log("视频分享失败，原因: " + json.message);
		}
	});
}

// 观看分享视频
async function videoTask(cookie, watch, share){
	let bvid = getRegionRankingVideoBvid();
	if(watch){
		console.log("本日观看视频任务已经完成了，不需要再观看视频了");
	}
	else{
		await watchVideo(cookie,bvid);
	}
	if(share){
		console.log("本日分享视频任务已经完成了，不需要再分享视频了");
	}
	else{
		await dailyAvShare(cookie,bvid);
	}
}

// 哔哩漫画签到
async function mangaSignTask(cookie,platform){
	let requestBody "platform=" + platform;
	await fetch("https://manga.bilibili.com/twirp/activity.v1.Activity/ClockIn", {
	  "headers": {
		"cookie": cookie
	  },
	  "body": requestBody,
	  "method": "POST"
	})
	.then(res => res.json())
	.then(json => {
		if (json) {
			console.log("完成漫画签到");
		}else {
			console.log("哔哩哔哩漫画已经签到过了");
		}
	});
}

// 请求使用硬币
async function getUseCoin(cookie){
	let result = 5;
	await fetch("https://api.bilibili.com/x/web-interface/coin/today/exp", {
	  "headers": {
		"cookie": cookie
	  },
	  "method": "GET"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = json.data / 10;
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 请求硬币余额
async function getCoinBalance(cookie) {
	let result = 0.0;
	await fetch("https://account.bilibili.com/site/getCoin", {
	  "headers": {
		"cookie": cookie
	  },
	  "method": "GET"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			if(json.data.money){
				result = json.data.money;
			}
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 请求视频Bvid
async function getFollowUpRandomVideoBvid() {
	let followUpVideoList = await videoUpdate();
	if (followUpVideoList.length == 0) {
		return getRegionRankingVideoBvid();
	}
	let random = Math.floor(Math.random()*followUpVideoList.length);
	return followUpVideoList[random];
}

// 随机视频Bvid
async function getRegionRankingVideoBvid(){
	let arr = [1, 3, 4, 5, 160, 22, 119]
	let rid = arr[]
    let day = 3;
	let rankVideoList = regionRanking();
	let random = Math.floor(Math.random()*rankVideoList.length);
	return rankVideoList[random];
}

// 查询可否投币
async function isCoinAdded(cookie, bvid) {
	String urlParam = "?bvid=" + bvid;
	await fetch("https://api.bilibili.com/x/web-interface/archive/coins" + urlParam, {
	  "headers": {
		"cookie": cookie
	  },
	  "method": "GET"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			if(json.data.multiply){
				if (json.data.multiply > 0) {
					console.log("之前已经为av" + bvid + "投过" + multiply +"枚硬币啦");
					return false;
				}
			}
		}else {
			console.log(json.message);
		}
	});    
	return true;
}

// 执行投币行为
async function coinAdd(cookie, bvid, multiply, selectLike){
	let videoTitle = await getVideoTitle(bvid);
	let matchReg = /(?<=bili_jct=).*?(?=;)/;
	let requestBody = "bvid=" + bvid + "&multiply=" + multiply + "&select_like=" + selectLike + "&cross_domain=true&csrf=" + cookie.match(matchReg);
	let isCoinAdded = await isCoinAdded(cookie, bvid);
	if (isCoinAdded) {
		await fetch("https://api.bilibili.com/x/web-interface/coin/add", {
		  "headers": {
			"Referer":"https://www.bilibili.com/video/" + bvid,
			"Origin":"https://www.bilibili.com",
			"cookie": cookie
		  },
		  "body": requestBody,
		  "method": "POST"
		})
		.then(res => res.json())
		.then(json => {
			if (json.code == 0) {
				console.log("为 " + videoTitle + " 投币成功");
				return true;
			}else {
				console.log("投币失败" + json.message);
				return false;
			}
		});
	}
	console.log("已经为" + videoTitle + "投过币了");
    return false;
}

// 执行投币任务
async function coinAddTask(cookie,numberOfCoins,reserveCoins,coinAddPriority,selectLike){
	let addCoinOperateCount = 0;
    let maxNumberOfCoins = 5;
	let setCoin = numberOfCoins;
	let useCoin = await getUseCoin(cookie);
	if (setCoin > 5) {
		console.log("自定义投币数为: " + setCoin + "枚,为保护你的资产，自定义投币数重置为: 5枚");
		setCoin = 5;
	}
	console.log("自定义投币数为: " + setCoin + "枚,程序执行前已投: " + useCoin +"枚");
	let needCoins = setCoin - useCoin;
	let beforeAddCoinBalance = await getCoinBalance(cookie);
	let coinBalance = Math.floor(beforeAddCoinBalance)
	if (needCoins <= 0) {
		console.log("已完成设定的投币任务，今日无需再投币了");
		return;
	}
	console.log("投币数调整为: " + needCoins + "枚");
	if (needCoins > coinBalance) {
		console.log("完成今日设定投币任务还需要投: " + needCoins + "枚硬币，但是余额只有: " + beforeAddCoinBalance);
		console.log("投币数调整为: " + coinBalance);
		needCoins = coinBalance;
	}
	if (coinBalance < reserveCoins) {
		console.log("剩余硬币数为" + beforeAddCoinBalance + ",低于预留硬币数" + reserveCoins + ",今日不再投币");
		console.log("tips: 当硬币余额少于你配置的预留硬币数时，则会暂停当日投币任务");
		return;
	}
	console.log("投币前余额为 : " + beforeAddCoinBalance);
	while (needCoins > 0 && needCoins <= 5) {
		let bvid = coinAddPriority == 1 && addCoinOperateCount < 7 ? getFollowUpRandomVideoBvid() : getRegionRankingVideoBvid();
		++addCoinOperateCount;
		new VideoWatch().watchVideo(bvid);
		new SleepTime().sleepDefault();
		boolean flag = coinAdd(cookie, bvid, 1, selectLike);
		if (flag) {
			--needCoins;
		}
		if (addCoinOperateCount <= 15) continue;
		console.log("尝试投币/投币失败次数太多");
		break;
	}
	let coinBalance = await getCoinBalance(cookie);
	console.log("投币任务完成后余额为: " + coinBalance);
}

// 银瓜子换硬币
async function silverCoinTask(cookie){
	let queryStatus;
	await fetch("https://api.live.bilibili.com/xlive/revenue/v1/wallet/myWallet?need_bp=1&need_metal=1&platform=pc", {
	  "headers": {
		"cookie": cookie
	  },
	  "method": "GET"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0 && json.data) {
			if(json.data.multiply){
				if (json.data.multiply > 0) {
					queryStatus = json.data;
					return false;
				}
			}
		}else {
			console.log("获取银瓜子状态失败：" + json.message);
			return;
		}
	});
	let exchangeRate = 700;
	let silverNum = queryStatus.silver;
	if (silverNum < 700) {
		log.info("当前银瓜子余额为:" + silverNum + ",不足700,不进行兑换");
	} else {
		let matchReg = /(?<=bili_jct=).*?(?=;)/;
		let requestBody = "csrf_token=" + cookie.match(matchReg) + "&csrf=" + cookie.match(matchReg);
		await fetch("https://api.live.bilibili.com/xlive/revenue/v1/wallet/silver2coin", {
		  "headers": {
			"cookie": cookie
		  },
		  "body": requestBody,
		  "method": "POST"
		})
		.then(res => res.json())
		.then(json => {
			if (json.code == 0) {
				console.log("银瓜子兑换硬币成功");
				let coinMoneyAfterSilver2Coin = await getCoinBalance(cookie);
				console.log("当前银瓜子余额: " + silverNum - 700);
				console.log("兑换银瓜子后硬币余额: " + coinMoneyAfterSilver2Coin);
			}else {
				console.log("银瓜子兑换硬币失败 原因是:" + json.message);
			}
		});
	}
}

// 直播签到
async function liveCheckingTask(cookie){
	await fetch("https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign", {
	  "headers": {
		"cookie": cookie
	  },
	  "method": "GET"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			console.log("直播签到成功，本次签到获得" + json.data.text + "，" + json.data.specialText);
		}else {
			console.log(json.message);
		}
	});
}

// 直播礼品清单
async function xliveGiftBagList(cookie){
	let result = [];
	await fetch("https://api.live.bilibili.com/xlive/web-room/v1/gift/bag_list", {
	  "headers": {
		"cookie": cookie
	  },
	  "method": "GET"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = json.data.list;
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 得到房间号
async function getRoomInfoOld(mid) {
	let result;
	let urlPram = "?mid=" + mid;
	await fetch("http://api.live.bilibili.com/room/v1/Room/getRoomInfoOld" + urlPram)
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = json.data.roomid;
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 直播推荐房间
async function xliveGetRecommend(){
	let result;
	await fetch("https://api.live.bilibili.com/relation/v1/AppWeb/getRecommendList")
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = json.data.list[6].roomid;
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 直播房间主播
async function xliveGetRoomUid(roomId) {
	let result;
	let urlPram = "?room_id=" + roomId;
	await fetch("https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom" + urlPram)
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = json.data.room_info.uid;
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 请求uid和cid
async function getuidAndRid(upLive) {
	let result = {"uid":"","roomid":""};
	if (upLive != 0) {
		result.uid = upLive;
		result.roomId = await getRoomInfoOld(result.uid);
		if (result.roomId == 0) {
			console.log("自定义up " + result.uid + " 无直播间");
			result.roomId = await xliveGetRecommend();
			result.uid = await xliveGetRoomUid(result.roomId);
			console.log("随机直播间");
		} else {
			console.log("自定义up" + result.uid + "的直播间");
		}
	} else {
		result.roomId = await xliveGetRecommend();
		result.uid = await xliveGetRoomUid(result.roomId);
		console.log("随机直播间");
	}
	return result;
}

// 给直播间送礼物
async function xliveBagSend(cookie,requestBody) {
	let csrfReg = /(?<=bili_jct=).*?(?=;)/;
	let uidReg = /(?<=DedeUserID=).*?(?=;)/;0
	let result = false;
	requestBody = requestBody + "&uid=" + cookie.match(uidReg) + "&csrf=" + cookie.match(csrfReg) + "&send_ruid=0&storm_beat_id=0&price=0&platform=pc&biz_code=live";
	await fetch("https://api.live.bilibili.com/gift/v2/live/bag_send", {
	  "headers": {
		"cookie": cookie
	  },
	  "body": requestBody,
	  "method": "POST"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = true;
			let giftName = json.data.gift_name;
			let giftNum = json.data.gift_num;
			console.log("给直播间 - " + roomId + " - " + giftName + " - 数量: " + giftNum + "✔");
		}else {
			console.log("送礼失败, 原因 : " + json.message + "❌");
		}
	});
	return result;
}

// B站直播送出即将过期的礼物
async function giveGiftTask(cookie,giveGift,upLive){
	try{
		if (!giveGift) {
			console.log("未开启自动送出即将过期礼物功能");
			return;
		}
		let roomId = "";
		let uid = "";
		let nowTime = Date .parse ( new Date ());
		let jsonArray = await xliveGiftBagList(cookie);
		let flag = true;
		for (var json in jsonArray) {
			let requestBody;
			let expireAt = json.expire_at;
			if (expireAt - nowTime >= 90000 || expireAt == 0) continue;
			if (!roomId) {
				let uidAndRid = await getuidAndRid(upLive);
				uid = uidAndRid.uid;
				roomId = uidAndRid.roomid;
			}
			requestBody = "biz_id=" + roomId + "&ruid=" + uid + "&bag_id=" + json.bag_id + "&gift_id=" + json.gift_id + "&gift_num=" + json.gift_num;
			let isSend = await xliveBagSend(cookie,requestBody);
			if (isSend) {
				flag = false;
				continue;
			}
		}
		if (flag) {
			console.log("当前无即将过期礼物❌");
		}
	}catch(e){
		console.log("💔赠送礼物异常 : " + e);
	}
}

// 查询充电对象
async function queryUserNameByUid(uid) {
	let urlParameter = "?mid=" + uid + "&jsonp=jsonp";
	let result = "1";
	await fetch("https://api.bilibili.com/x/space/acc/info" + urlParameter)
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = json.data.name;
		}else {
			console.log("查询充电对象的用户名失败，原因：" + json.message);
		}
	});
	return result;
}

// 查询用户信息
async function getUserInfo(cookie){
	let result = 0;
	await fetch("https://api.bilibili.com/x/web-interface/nav")
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = json.data;
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 充电留言
async function chargeComments(cookie, token) {
	let matchReg = /(?<=bili_jct=).*?(?=;)/;
	let requestBody = "order_id=" + token + "&message=期待up主的新作品！&csrf=" + cookie.match(matchReg);
	await fetch("https://api.bilibili.com/x/ugcpay/trade/elec/message", {
	  "headers": {
		"cookie": cookie
	  },
	  "body": requestBody,
	  "method": "POST"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			console.log("充电留言成功");
		}else {
			console.log(json.message);
		}
	});
}

// 大会员月底B币券充电和月初大会员权益领取
async function chargeMeTask(cookie,chargeForLove,monthEndAutoCharge,chargeDay){
	let couponBalance;
	let day = (new Date()).getDate();
	let userId = chargeForLove;
	let userName = await queryUserNameByUid(userId);
	let userInfo = await getUserInfo(cookie);
	let vipType = userInfo.vipType;
	if (vipType == 0 || vipType == 1) {
		console.log("普通会员和月度大会员每月不赠送B币券，所以没法给自己充电哦");
		return;
	}
	if (!monthEndAutoCharge) {
		console.log("未开启月底给自己充电功能");
		return;
	}
	if (!userId || userId == 0) {
		console.log("充电对象uid配置错误");
		return;
	}
	if (day < chargeDay) {
		console.log("今天是本月的第: " + day + "天，还没到充电日子呢");
		return;
	}
	console.log("月底自动充电对象是: " + userName);
	if (userInfo != null) {
		couponBalance = TuserInfo.wallet.coupon_balance;
	} else {
		await fetch("https://api.bilibili.com/x/ugcpay/web/v2/trade/elec/panel?mid=" + userId)
		.then(res => res.json())
		.then(json => {
			if (json.code == 0) {
				result = json.data.bp_wallet.coupon_balance;
			}else {
				console.log(json.message);
			}
		});
	}
	if (day == chargeDay && couponBalance >= 2.0) {
		let matchReg = /(?<=bili_jct=).*?(?=;)/;
		let requestBody = "bp_num=" + couponBalance + "&is_bp_remains_prior=true&up_mid=" + userId + "&otype=up&oid=" + userId + "&csrf=" + cookie.match(matchReg);
		await fetch("https://api.bilibili.com/x/ugcpay/web/v2/trade/elec/pay/quick", {
		  "headers": {
			"cookie": cookie
		  },
		  "body": requestBody,
		  "method": "POST"
		})
		.then(res => res.json())
		.then(json => {
			if (json.code == 0) {
				if(json.data.status == 4){
					console.log("月底了，自动充电成功啦，送的B币券没有浪费哦");
					console.log("本次充值使用了: " + couponBalance + "个B币券");
					let orderNo = json.data.order_no;
					await chargeComments(cookie, orderNo);
				}else{
					console.log("充电失败了啊,原因: " + json.message);
				}
			}else {
				console.log("充电失败了啊,原因: " + json.message);
			}
		});
	}
}

// 领取年度大会员权益
async function getVipPrivilege(type) {
	let matchReg = /(?<=bili_jct=).*?(?=;)/;
	let requestBody = "type=" + type + "&csrf=" + cookie.match(matchReg);
	await fetch("https://api.bilibili.com/x/vip/privilege/receive", {
	  "headers": {
		"cookie": cookie
	  },
	  "body": requestBody,
	  "method": "POST"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			if (type == 1) {
				console.log("领取年度大会员每月赠送的B币券成功");
			} else if (type == 2) {
				console.log("领取大会员福利/权益成功");
			}
		}else {
			console.log("领取年度大会员每月赠送的B币券/大会员福利失败，原因: " + json.message);
		}
	});
}

// 漫画权益领取
async function getVipPrivilegeTask(cookie,reasonId){
	let day = (new Date()).getDate();
	let userInfo = await getUserInfo(cookie);
	let vipType = userInfo.vipType;
	if (vipType == 0) {
		console.log("非大会员，跳过领取大会员权益");
		return;
	}
	if (vipType == 1 && day == 1) {
		console.log("开始领取大会员漫画权益");
		let requestBody = '{"reason_id":' + reasonId + "}";
		await fetch("https://manga.bilibili.com/twirp/user.v1.User/GetVipReward", {
		  "headers": {
			"cookie": cookie
		  },
		  "body": requestBody,
		  "method": "POST"
		})
		.then(res => res.json())
		.then(json => {
			if (json.code == 0) {
				let num = json.data.amount;
				console.log("大会员成功领取" + num + "张漫读劵");
			}else {
				console.log("大会员领取漫读劵失败，原因为:" + json.msg);
			}
		});
	} else {
		console.log("本日非领取大会员漫画执行日期");
	}
	if (day == 1 || day % 7 == 0) {
		if (vipType == 2) {
			console.log("开始领取年度大会员权益");
			await getVipPrivilege(1);
			await getVipPrivilege(2);
		}
	} else {
		console.log("本日非领取年度大会员权益执行日期");
	}
}

// 获得当前日期
function getNowDay() {
	let day = (new Date()).getDate();
	let month = (new Date()).getMonth() + 1;
	let year = (new Date()).getFullYear();
	month = month < 10 ? "0"+month:month;
	day = day < 10 ? "0"+day:day;
	return year + '-' + month + '-' + day;
}

// 查询赛事信息
async function queryContestQuestion(today, pn, ps, gid = "", sids = "") {
	let result;
	let urlParam = "?pn=" + pn + "&ps=" + ps + "&gid=" + gid + "&sids=" + sids + "&stime=" + today + encodeURIComponent(" 00:00:00") + "&etime=" + today + encodeURIComponent(" 23:59:59") + "&pn=" + pn + "&ps=" + ps + "&stime=" + today + "+00:00:00&etime=" + today + "+23:59:59";
	await fetch("https://api.bilibili.com/x/esports/guess/collection/question" + urlParam)
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			result = json.data;
		}else {
			console.log("获取赛事信息失败，原因：" + json.message);
		}
	});
	return result;
}

// 赛事预测行为
async function doPrediction(cookie, oid, main_id, detail_id, count) {
	let matchReg = /(?<=bili_jct=).*?(?=;)/;
	let requestbody = "oid=" + oid + "&main_id=" + main_id + "&detail_id=" + detail_id + "&count=" + count + "&is_fav=0&csrf=" + cookie.match(matchReg);
	await fetch("https://api.bilibili.com/x/esports/guess/add", {
	  "headers": {
		"cookie": cookie
	  },
	  "body": requestBody,
	  "method": "POST"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			console.log("预测成功");
		}else {
			console.log(json.message);
		}
	});
}

// 赛事预测
async function matchGameTask(cookie,matchGame,minimumNumberOfCoins,predictNumberOfCoins,showHandModel){
	if (!matchGame) {
		console.log("赛事预测未开启");
		return;
	}
	let coinBalance = await getCoinBalance(cookie);
	if (coinBalance < minimumNumberOfCoins) {
		console.log(minimumNumberOfCoins + "个硬币都没有，参加什么预测呢？任务结束");
		return;
	}
	let resultJson = await queryContestQuestion(getTime(), 1, 50);
	if (resultJson) {
		let list = resultJson.list;
		let pageinfo = resultJson.page;
		if (pageinfo.total == 0) {
			console.log("今日无赛事或者本日赛事已经截止预测");
			return;
		}
		if (list != null) {
			let coinNumber = predictNumberOfCoins;
			for (var listinfo in list) {
				let teamName;
				let teamId;
				console.log("-----预测开始-----");
				let contestJson = list[listinfo].contest;
				let questionJson = ist[listinfo].questions[0];
				let contestId = contestJson.id;
				let contestName = contestJson.game_stage;
				let questionId = questionJson.id;
				let questionTitle = questionJson.title;
				let seasonName = contestJson.season.title;
				console.log(seasonName + " " + contestName + ":" + questionTitle);
				if (questionJson.is_guess == 1) {
					console.log("此问题已经参与过预测了，无需再次预测");
					continue;
				}
				let teamA = questionJson.details[0];
				let teamB = questionJson.details[1];
				console.log("当前赔率为:  " + teamA.odds + ":" + teamB.odds);
				if (showHandModel) {
					if (teamA.odds <= teamB.odds) {
						teamId = teamB.detail_id;
						teamName = teamB.option;
					} else {
						teamId = teamA.detail_id;
						teamName = teamA.option;
					}
				} else if (teamA.odds >= teamB.odds) {
					teamId = teamB.detail_id;
					teamName = teamB.option;
				} else {
					teamId = teamA.detail_id;
					teamName = teamA.option;
				}
				console.log("拟预测的队伍是:" + teamName + ",预测硬币数为:" + coinNumber);
				await doPrediction(cookie, contestId, questionId, teamId, coinNumber);
			}
		}
	}
}

// 每日漫画阅读
async function mangaReadTask(cookie,comic_id,ep_id){
	let requestbody = {
		"device": "pc",
		"platform": "web",
		"comic_id": comic_id,
		"ep_id": ep_id
	}
	await fetch("https://manga.bilibili.com/twirp/bookshelf.v1.Bookshelf/AddHistory?device=pc&platform=web", {
	  "headers": {
		"cookie": cookie
	  },
	  "body": requestBody,
	  "method": "POST"
	})
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			console.log("本日漫画自动阅读1章节成功！，阅读漫画为：" + json);
		}else {
			console.log("阅读失败,原因是" + json.message);
		}
	});
}

// 登录检查
async function userCheck(cookie){
	let result = false;
	await fetch("https://api.bilibili.com/x/web-interface/nav")
	.then(res => res.json())
	.then(json => {
		if (json.code == 0 && json.data.isLogin) {
			consol.log("Cookies有效，登录成功");
			consol.log("/n用户名称: ", + json.data.uname);
            consol.log("/n硬币余额: " + json.data.money);
			result = json.data.isLogin;
		}else {
			console.log(json.message);
		}
	});
	return result;
}

// 硬币情况统计
async function coinLogs(cookie){
	await fetch("https://api.bilibili.com/x/member/web/coin/log?jsonp=jsonp")
	.then(res => res.json())
	.then(json => {
		if (json.code == 0) {
			consol.log("最近一周共计" + json.data.count"条硬币记录");
			let coinList = json.data.list;
			let income = 0.0;
			let expend = 0.0;
			for (var c in coinList) {
				let delta = coinList[c].delta;
				if (delta > 0.0) {
					income += delta;
					continue;
				}
				expend += delta;
			}
			log.info("最近一周收入" + income + "个硬币");
			log.info("最近一周支出" + expend + "个硬币");
		}else {
			console.log(json.message);
		}
	});
}

// 执行每日任务
async function doDailyTask(cookie,platform,numberOfCoins,reserveCoins,coinAddPriority,selectLike,giveGift,upLive,chargeForLove,monthEndAutoCharge,chargeDay,reasonId,matchGame,minimumNumberOfCoins,predictNumberOfCoins,showHandModel,comic_id,ep_id,taskIntervalTime){
	let isLogin = await userCheck(cookie);
	if(!isLogin){
		return;
	}
	await coinLogs(cookie);
	let data = await getDailyTaskStatus(cookie);
	if(data){
		await videoTask(cookie, data.watch, data.share);
		await sleep(taskIntervalTime);
		await mangaSignTask(cookie,platform);
		await sleep(taskIntervalTime);
		await coinAddTask(cookie,numberOfCoins,reserveCoins,coinAddPriority,selectLike);
		await sleep(taskIntervalTime);
		await silverCoinTask(cookie);
		await sleep(taskIntervalTime);
		await liveCheckingTask(cookie);
		await sleep(taskIntervalTime);
		await giveGiftTask(cookie,giveGift,upLive);
		await sleep(taskIntervalTime);
		await chargeMeTask(cookie,chargeForLove,monthEndAutoCharge,chargeDay);
		await sleep(taskIntervalTime);
		await getVipPrivilegeTask(cookie,reasonId);
		await sleep(taskIntervalTime);
		await matchGameTask(cookie,matchGame,minimumNumberOfCoins,predictNumberOfCoins,showHandModel);
		await sleep(taskIntervalTime);
		await angaReadTask(cookie,comic_id,ep_id);
		await sleep(taskIntervalTime);
	}
}

async function doAllDailyTask(){
	let cookie;
	let platform = "ios";
	let numberOfCoins = 5;
	let reserveCoins = 10;
	let coinAddPriority = 1;
	let selectLike = 0;
	let giveGift = true;
	let upLive = 0;
	let chargeForLove = "523543806";
	let monthEndAutoCharge = true;
	let chargeDay = 8;
	let reasonId = 1;
	let matchGame = false;
	let minimumNumberOfCoins = 100;
	let predictNumberOfCoins = 1;
	let showHandModel = false;
	let comic_id = "28628";
	let ep_id = "500695";
	let taskIntervalTime = 20;
	await doDailyTask(cookie,platform,numberOfCoins,reserveCoins,coinAddPriority,selectLike,giveGift,upLive,chargeForLove,monthEndAutoCharge,chargeDay,reasonId,matchGame,minimumNumberOfCoins,predictNumberOfCoins,showHandModel,comic_id,ep_id,taskIntervalTime);
}

doAllDailyTask()