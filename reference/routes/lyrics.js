
/**
 * 歌词请求处理
 */

var lyricsProcessor = require('../processors/lyrics');

module.exports = function (req, res, callback) {

	(function (callback) {

		var fmInfo = {
			songId: null,
			artist: null,
			title: null,
			album: null,
			albumImgUrl: null,
			startTime: 0,
			channel: null,
			shareUrl: null
		};

		for (var key in fmInfo) {

			if (req.body[key]) {

				fmInfo[key] = req.body[key];

			} else {

				if (callback) callback({
					code: 2101,
					fatal: true,
					message: '请求格式不正确.',
					details : {},
					prevErr: null
				});

				return;
			}
		};

		lyricsProcessor(fmInfo, function (err, songInfo, lyricsInfo) {

			if (err && err.fatal) {

				if (callback) callback(err);

			} else {

				if (callback) callback(err, songInfo, lyricsInfo);
			}
		});

	})(function (err, songInfo, lyricsInfo) {
		
		if (err && err.fatal) {

			res.json({ code: err.code });

		} else {

			res.json({
				code: 0,
				songInfo: songInfo,
				lyricsInfo: lyricsInfo
			});
		}

		if (callback) callback(err);
	});
};