(function () {

	document.addEventListener('DOMContentLoaded', function (event) {

		// DOM元素缓存

		var wrap = document.getElementById('wrap');

		var popupBox = document.getElementById('popup');
		var popupContent = document.getElementById('popup-content');

		var songInfoBox = document.getElementById('song-info');
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
		var shareButtons = {
			'weibo': document.getElementById('share-weibo'),
			'renren': document.getElementById('share-renren'),
			'douban': document.getElementById('share-douban'),
		};
		var copyToClipboard = document.getElementById('share-clipboard');


    var fovoriteButton = document.getElementById('favorite-button');
    var userBox = document.getElementById('user-box');
    var favoriteList = document.getElementById('favorite');

		// 当前播放的歌曲信息

		var songInfo = {};


		// 自动根据窗口大小调整wrap的高度

		function autoSize(event) {

			wrap.style.height = window.innerHeight + 'px';
		};

		window.addEventListener('resize', autoSize);
		autoSize();


		// 歌词分享框控制

		function foldShareBox(event) {

			wrap.removeEventListener('click', foldShareBox);

			lyricsBox.cancelSelect();

			shareBox.classList.add('hidden');
		};

		shareBox.addEventListener('click', function (event) {

			event.stopPropagation();
		});


		// 歌词分享按钮控制

		for (var target in shareButtons) {

			(function (target) {

				shareButtons[target].addEventListener('click', function (event) {

					event.preventDefault();
					event.stopPropagation();

					Share[target]({
						url: 'http://douban.fm/?start=' + songInfo.startToken,
						title: songInfo.title,
						artist: songInfo.artist,
						content: lyricsBox.selectedContent,
						imageUrl: songInfo.albumImgUrl,
						callback: foldShareBox
					});
				});

			})(target);
		}


		// 复制歌词到剪贴板

		ZeroClipboard.config({ swfPath: 'js/zero-clipboard/zero-clipboard.swf' });

		new ZeroClipboard(copyToClipboard).on('copy', function (event) {

			event.clipboardData.setData('text/plain', lyricsBox.selectedContent.join('\n'));

			popupContent.innerHTML = '歌词已复制到剪贴板';
			popupBox.classList.remove('hidden');

			setTimeout(function () {

				popupBox.classList.add('hidden');

			}, 1300);

			setTimeout(foldShareBox, 400);
		});

		copyToClipboard.addEventListener('click', function (event) {

			event.preventDefault();
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

				setTimeout(function () {

					shareBox.classList.remove('hidden');

					wrap.addEventListener('click', foldShareBox);

				}, 500);
			}
		});


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

				// 更新歌曲信息显示

				songInfo = fullInfo.songInfo;

				function updateSongInfo(event) {

					songInfoBox.removeEventListener('transitionend', updateSongInfo);

					title.innerHTML = songInfo.title;
					artist.innerHTML = songInfo.artist;
					album.innerHTML = songInfo.album;
					year.innerHTML = songInfo.releaseYear;
					title.href = 'http://music.douban.com' + songInfo.albumUrl;
					artist.href = 'http://music.douban.com' + songInfo.albumUrl;
					album.href = 'http://music.douban.com' + songInfo.albumUrl;

					songInfoBox.classList.remove('hidden');
				};

				if (songInfoBox.classList.contains('hidden')) {

					updateSongInfo();

				} else {

					songInfoBox.classList.add('hidden');
					songInfoBox.addEventListener('transitionend', updateSongInfo);
				}

				image.src = songInfo.albumImgUrl;
				imageWrap.classList.remove('hidden');

				setTimeout(function () {

					imageBackgroud.style.backgroundImage = 'url(' + image.src + ')';

					imageWrap.classList.add('hidden');

				}, 2000);

				// 更新窗口标题

				document.title = '豆瓣LRC - ' + songInfo.title;

				// 更新歌词

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


    fovoriteButton.addEventListener('click', function (event) {

      event.preventDefault();
      event.stopPropagation();

      Ajax.post({

        url: 'favorite',
        data: { song_id: songInfo.songId },
        requestType: 'urlencoded',
        responseType: 'json'
      });
    });

    userBox.addEventListener('mouseenter', function (event) {

      event.preventDefault();
      event.stopPropagation();

      Ajax.get({

        url: 'favorite',
        responseType: 'json',

        onsuccess: function (event) {

          var songList = event.response;

          favoriteList.innerHTML = '';

          songList.forEach(function (song) {

            var title = song.songInfo.title;
            var artist = song.songInfo.artist;
            var shareUrl = song.songInfo.shareUrl;

            favoriteList.innerHTML +=
              '<li><a href="' + shareUrl + '" rel="noreferrer">' + title + '</a> - ' + artist + '</li>';

          });

          var list = document.querySelectorAll('#favorite li a');

          /*for (var index = 0; index < list.length; index++) {

            var link = list.item(index);

            link.addEventListener('click', function (event) {

              event.preventDefault();
              event.stopPropagation();

              window.open(link.href, 'DoubanFM');
            });

          }*/
        }
      });
    });
	});

})();
