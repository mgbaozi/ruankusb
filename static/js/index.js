(function () {

	document.addEventListener('DOMContentLoaded', function (event) {

		var wrap = document.getElementById('wrap');

		var songInfo = document.getElementById('song-info');
		var title = document.getElementById('title');
		var artist = document.getElementById('artist');
		var album = document.getElementById('album');
		var year = document.getElementById('year');

		var imageBackgroud = document.getElementById('image-backgroud');
		var imageWrap = document.getElementById('image-wrap');
		var image = document.getElementById('image');

		var lyricsWrap = document.getElementById('lyrics');
		var lyricsSlide = document.getElementById('lyrics-slide');
		var lyricList = document.getElementById('lyric-list');
		var lyricsNotFound = document.getElementById('lyrics-not-found');
		var initializing = document.getElementById('initializing');
		var selectArea = document.getElementById('select-area');

		var shareBox = document.getElementById('share');


		// 自动根据窗口大小调整wrap的高度

		var autoSize = function (event) {

			wrap.style.height = window.innerHeight + 'px';
		};

		window.addEventListener('resize', autoSize);
		autoSize();


		// 歌词分享框控制

		var foldShareBox = function (event) {

			wrap.removeEventListener('click', foldShareBox);

			lyricsBox.cancelSelect();

			shareBox.classList.add('hidden');
		};

		shareBox.addEventListener('click', function (event) {

			event.stopPropagation();
		});


		// 歌词框控制

		var lyricsBox = new LyricsBox({
			lyricsWrap: lyricsWrap,
			lyricsSlide: lyricsSlide,
			lyricList: lyricList,
			notice: {
				initializing: initializing,
				lyricsNotFound: lyricsNotFound
			},
			selectArea: selectArea,
			onselect: function (event) {

				console.log(event.content);

				setTimeout(function () {

					shareBox.classList.remove('hidden');

					wrap.addEventListener('click', foldShareBox);

				}, 500);
			}
		});

		var mousewheel = function (event) {

			event.preventDefault();
			event.stopPropagation();

			var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

			lyricsBox.setOffset(lyricsBox.getOffset() + delta * 400);
		};

		lyricsWrap.addEventListener('DOMMouseScroll', mousewheel);
		lyricsWrap.addEventListener('mousewheel', mousewheel);


		// Ajax请求处理
		
		var requestLyrics = function (fmInfo, callback) {

			Ajax.post({

				url: '/',
				data: fmInfo,
				requestType: 'json',
				responseType: 'json',

				onsuccess: function (event) {

					if (callback) callback(event.response);
				},

				onerror: function (event) {

					if (callback) callback(null);
				}
			});
		};


		// 刷新页面内容

		var refresh = function (fullInfo) {

			lyricsBox.clear();

			if (fullInfo && fullInfo.code === 0) {

				var updateSongInfo = function (event) {

					songInfo.removeEventListener('transitionend', updateSongInfo);

					title.innerHTML = fullInfo.songInfo.title;
					artist.innerHTML = fullInfo.songInfo.artist;
					album.innerHTML = fullInfo.songInfo.album;
					year.innerHTML = fullInfo.songInfo.releaseYear;
					title.href = 'http://music.douban.com' + fullInfo.songInfo.albumUrl;
					artist.href = 'http://music.douban.com' + fullInfo.songInfo.albumUrl;
					album.href = 'http://music.douban.com' + fullInfo.songInfo.albumUrl;

					songInfo.classList.remove('hidden');
				};

				document.title = '豆瓣LRC - ' + fullInfo.songInfo.title;

				if (songInfo.classList.contains('hidden')) {

					updateSongInfo();
					
				} else {

					songInfo.classList.add('hidden');
					songInfo.addEventListener('transitionend', updateSongInfo);
				}

				image.src = fullInfo.songInfo.albumImgUrl;
				imageWrap.classList.remove('hidden');

				setTimeout(function () {

					imageBackgroud.style.backgroundImage = 'url(' + image.src + ')';

					imageWrap.classList.add('hidden');

				}, 2000);

				var lyrics = fullInfo.lyricsInfo.lyrics || [];

				lyrics.sort(function (item1, item2) {

					return item1.time - item2.time;
				});

				lyricsBox.setStartTime(fullInfo.lyricsInfo.startTime);
				lyricsBox.setOffset(fullInfo.lyricsInfo.offset);

				lyrics.forEach(function (item) {

					lyricsBox.append(item);
				});
			}

			lyricsBox.update();

			lyricsBox.scrollTo(0);
		};


		// 主流程控制

		window.addEventListener('message', function (event) {

			var message = {};

			try {

				message = JSON.parse(event.data);

			} catch (err) {

				message = {};
			}

			var fmInfo = {
				songId: message.id,
				artist: message.artist,
				title: message.song_name,
				album: message.album,
				albumImgUrl: message.cover,
				startTime: message.timestamp,
				channel: message.channel,
				shareUrl: message.url
			};

			console.log(fmInfo);
			
			requestLyrics(fmInfo, function (fullInfo) {

				console.log(fullInfo);

				refresh(fullInfo);
			});
		});
	});

})();