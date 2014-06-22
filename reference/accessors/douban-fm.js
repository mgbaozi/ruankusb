
/**
 * 豆瓣电台访问接口
 */

var url = require('url');

var config = require('../config');

var request = require('request').defaults({
	proxy: config.request.proxy
});

var cookieJar = request.jar();

module.exports = {

	getSongInfo: function (fmInfo, callback) {

		var startToken = null;

		try {

			startToken = url.parse(fmInfo.shareUrl, true).query.start;

		} catch (err) { }

		if (!startToken) {

			if (callback) callback({
				code: 4101,
				fatal: true,
				message: '分享链接格式错误.',
				details: {},
				prevErr: null
			});

			return;
		}

		var requestUrl = 'http://douban.fm/j/mine/playlist?type=n&sid=&pt=0.0&from=mainsite&channel=' +
			startToken.replace(/^.*g/, '');

		cookieJar.add(request.cookie('bid="xjJFyRRyPp4"'));
		cookieJar.add(request.cookie('start="' + startToken + '"'));

		request.get(
			{
				url: requestUrl,
				headers: {
					'Host': 'douban.fm',
					'Connection': 'keep-alive',
					'Cache-Control': 'max-age=0',
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:19.0) Gecko/20100101 Firefox/19.0',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3',
					'Accept-Encoding': 'identity',
					'Connection': 'keep-alive'
				},
				jar: cookieJar
			},
			function (err, res, body) {

				if (err || res.statusCode !== 200) {

					if (callback) callback({
						code: 4102,
						fatal: true,
						message: '从豆瓣FM服务器请求歌曲完整信息失败.',
						details : {
							'请求Url': requestUrl,
							'Http状态码': err ? undefined : res.statusCode,
						},
						prevErr: null
					});

				} else {

					try {

						body = JSON.parse(body);

					} catch (err) {

						body = { song: [] };
					}

					if (body.r > 0) {

						if (callback) callback({
							code: 4103,
							fatal: true,
							message: '从豆瓣FM服务器请求歌曲完整信息时服务器返回错误信息.',
							details : {
								'请求Url': requestUrl,
								'错误信息': body.err,
							},
							prevErr: null
						});

					} else {

						if (body.song && body.song[0]) {

							var songInfo = body.song[0];

							songInfo = {
								songId: songInfo.sid,
								ssid: songInfo.ssid,
								title: songInfo.title,
								albumId: songInfo.aid,
								album: songInfo.albumtitle,
								albumUrl: songInfo.album,
								albumImgUrl: songInfo.picture,
								artist: songInfo.artist,
								company: songInfo.company,
								releaseYear: songInfo.public_time,
								rating: songInfo.rating_avg,
								duration: songInfo.length,
								mp3Url: songInfo.url,
								startToken: startToken
							};

							if (callback) callback(null, songInfo);

						} else {

							if (callback) callback({
								code: 4104,
								fatal: true,
								message: '从豆瓣FM服务器请求歌曲完整信息得到的数据格式错误.',
								details : {
									'请求Url': requestUrl,
									'数据内容': body,
								},
								prevErr: null
							});
						}
					}
				}
			}
		);
	}
};