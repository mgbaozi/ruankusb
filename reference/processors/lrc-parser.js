
/**
 * LRC解析模块
 */

module.exports = {

	parse: function (lrc) {

		lrc = lrc || '';

		var lyrics = [];

		lrc.split('\n').map(function (line) {

			var timeLables = line.match(/\[[^\]]*\]/g) || [];

			timeLables = timeLables.map(function (lable) {

				var segments = lable.replace(/\[|\]/g, '').split(':');

				var second = parseFloat(segments.pop() || 0);
				var minute = parseInt(segments.pop() || 0);
				var hour = parseInt(segments.pop() || 0);

				var time = Math.floor(((hour * 60 + minute) * 60 + second) * 1000);
				
				line = line.replace(lable, '');

				return time;

			}).forEach(function (time) {

				if (!isNaN(time)) {

					lyrics.push({
						time: time,
						lyric: line.trim()
					});
				}
			});
		});

		lyrics.sort(function (item1, item2) {

			return item1.time - item2.time;
		});

		return lyrics;
	}
};