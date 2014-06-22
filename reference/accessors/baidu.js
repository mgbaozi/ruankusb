
/**
 * 百度音乐访问接口
 */

var querystring = require('querystring');

var config = require('../config');

var request = require('request').defaults({
	proxy: config.request.proxy
});

module.exports = {

	getLrcBySongInfo: function (songInfo, callback) {

		var accessor = this;

		var simplify = function (string) {

			return string.replace(
				/(\([^\)]*\))|(\[[^\]]*\])|(（[^）]*）)|(【[^】]*】)|((-|\/|&).*)/g, ''
			).trim();
		};

		var title = simplify(songInfo.title);
		var artist = simplify(songInfo.artist);

		var requestUrl = 'http://sug.music.baidu.com/info/suggestion?format=json&word=' +
			querystring.escape(title + '-' + artist);

		request.get(
			{
				url: requestUrl,
				headers: {
					'Host': 'sug.music.baidu.com',
					'Connection': 'keep-alive',
					'Cache-Control': 'max-age=0',
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:19.0) Gecko/20100101 Firefox/19.0',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3',
					'Accept-Encoding': 'identity',
					'Connection': 'keep-alive'
				},
				jar: true
			},
			function (err, res, body) {

				if (err || res.statusCode !== 200) {

					if (callback) callback({
						code: 4211,
						fatal: true,
						message: '从百度音乐服务器请求歌曲百度ID失败.',
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

					if (body.song) {

						if (body.song[0] && body.song[0].songid) {

							var baiduSongId = body.song[0].songid;

							accessor.getLrcByBaiduSongId(baiduSongId, function (err, lrc) {

								if (err && err.fatal) {

									if (callback) callback(err);

								} else {

									if (callback) callback(err, lrc);
								}
							});

						} else {

							if (callback) callback({
								code: 4213,
								fatal: true,
								message: '未从百度音乐服务器查找到该歌曲.',
								details : {
									'请求Url': requestUrl
								},
								prevErr: null
							});
						}

					} else {

						if (callback) callback({
							code: 4212,
							fatal: true,
							message: '从百度音乐服务器请求歌曲百度ID得到的数据格式错误.',
							details : {
								'请求Url': requestUrl,
								'数据内容': body,
							},
							prevErr: null
						});
					}
				}
			}
		);
	},

	getLrcByBaiduSongId: function (baiduSongId, callback) {

		var accessor = this;

		var requestUrl = 'http://play.baidu.com/data/music/songlink?type=mp3&songIds=' +
			querystring.escape(baiduSongId);

		request.get(
			{
				url: requestUrl,
				headers: {
					'Host': 'play.baidu.com',
					'Connection': 'keep-alive',
					'Cache-Control': 'max-age=0',
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:19.0) Gecko/20100101 Firefox/19.0',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3',
					'Accept-Encoding': 'identity',
					'Connection': 'keep-alive'
				},
				jar: true
			},
			function (err, res, body) {

				if (err || res.statusCode !== 200) {

					if (callback) callback({
						code: 4221,
						fatal: true,
						message: '从百度音乐服务器请求歌词URL失败.',
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

					if (body.data && body.data.songList && body.data.songList[0]
					 && body.data.songList[0].lrcLink && body.data.songList[0].showLink) {

						var lrcUrl = 'http://music.baidu.com' + body.data.songList[0].lrcLink;
						var mp3Url = body.data.songList[0].showLink;

						accessor.getLrcByUrl(lrcUrl, function (err, lrc) {

							if (err && err.fatal) {

								if (callback) callback(err);

							} else {

								if (callback) callback(err, lrc);
							}
						});

					} else {

						if (callback) callback({
							code: 4222,
							fatal: true,
							message: '从百度音乐服务器请求歌词URL得到的数据格式错误.',
							details : {
								'请求Url': requestUrl,
								'数据内容': body,
							},
							prevErr: null
						});
					}
				}
			}
		);
	},

	getLrcByUrl: function (lrcUrl, callback) {

		request.get(
			{
				url: lrcUrl,
				headers: {
					'Host': 'music.baidu.com',
					'Connection': 'keep-alive',
					'Cache-Control': 'max-age=0',
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:19.0) Gecko/20100101 Firefox/19.0',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3',
					'Accept-Encoding': 'identity',
					'Connection': 'keep-alive'
				},
				jar: true
			},
			function (err, res, body) {

				if (err || res.statusCode !== 200) {

					if (callback) callback({
						code: 4231,
						fatal: true,
						message: '从百度音乐服务器请求歌词内容失败.',
						details : {
							'请求Url': lrcUrl,
							'Http状态码': err ? undefined : res.statusCode,
						},
						prevErr: null
					});

				} else {

					if (callback) callback(null, body);
				}
			}
		);
	}
};