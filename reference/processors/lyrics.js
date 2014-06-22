
/**
 * 歌词查找处理模块
 */

var doubanFMAccessor = require('../accessors/douban-fm');
var baiduAccessor = require('../accessors/baidu');
var lrcParser = require('./lrc-parser');

module.exports = function (fmInfo, callback) {

	doubanFMAccessor.getSongInfo(fmInfo, function (err, songInfo) {

		if (err && err.fatal) {

			if (callback) callback(err);

		} else {

			baiduAccessor.getLrcBySongInfo(songInfo, function (err, lrc) {

				if (err && err.fatal) {

					if (callback) callback({
						code: 3101,
						fatal: false,
						message: '未从百度音乐服务器查找到歌词.',
						details: {},
						prevErr: err
					}, songInfo, []);

				} else {

					var lyrics = lrcParser.parse(lrc);

					var lyricsInfo = {
						startTime: parseInt(fmInfo.startTime),
						offset: 0,
						lyrics: lyrics
					};

					if (callback) callback(err, songInfo, lyricsInfo);
				}
			});
		}
	});
};