
/**
 * 用于控制歌词框的模块
 */

LyricsBox = (function () {

	function LyricsBox(options) {

		var lyricsBox = this;

		options = options || {};

		lyricsBox.lyricsWrap = options.lyricsWrap;
		lyricsBox.lyricsSlide = options.lyricsSlide;
		lyricsBox.lyricList = options.lyricList;
		lyricsBox.notice = options.notice;
		lyricsBox.selectArea = options.selectArea;
		lyricsBox.onselect = options.onselect;

		lyricsBox.lyricsInfo = {
			startTime: Date.now(),
			offset: 0,
			lyrics: []
		};
		lyricsBox.lyricsInfoCache = {
			startTime: Date.now(),
			offset: 0,
			lyrics: []
		};

		lyricsBox.lyricList.addEventListener('mousemove', function (event) {

			lyricsBox.startSelect();

			lyricsBox.resizeSelectArea(event.layerY, event.clientY);
		});

		window.addEventListener('mouseup', function (event) {

			if (event.button === 0) {

				lyricsBox.stopHover();

				lyricsBox.stopSelect();
			}
		});

		function mousewheel(event) {

			event.preventDefault();
			event.stopPropagation();

			var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

			lyricsBox.setOffset(lyricsBox.getOffset() + delta * 400);
		};
		lyricsBox.lyricsWrap.addEventListener('DOMMouseScroll', mousewheel);
		lyricsBox.lyricsWrap.addEventListener('mousewheel', mousewheel);

		setInterval(function () {

			lyricsBox.refresh();

		}, 50);
	}

	LyricsBox.prototype = {

		/**
		 * 重置构造函数
		 */
		constructor: LyricsBox,

		/**
		 * 歌词外框元素
		 */
		lyricsWrap: null,

		/**
		 * 歌词滑动框元素
		 */
		lyricsSlide: null,

		/**
		 * 歌词列表元素
		 */
		lyricList: null,

		/**
		 * 歌词框中通知元素
		 */
		notice: null,

		/**
		 * 选择区域元素
		 */
		selectArea: null,

		/**
		 * 歌词信息
		 */
		lyricsInfo: null,

		/**
		 * 歌词信息缓存
		 */
		lyricsInfoCache: null,

		/**
		 * 当前歌词位置
		 */
		currentPosition: 0,

		/**
		 * 选择状态
		 *  'none' - 未选择
		 *  'hover' - 准备选择
		 *  'selecting' - 正在选择
		 *  'selected' - 已选择
		 */
		selectState: 'none',

		/**
		 * 选择开始元素序号
		 */
		selectStartIndex: null,

		/**
		 * 选择结束元素序号
		 */
		selectEndIndex: null,

		/**
		 * 已选择的歌词内容
		 */
		selectedContent: '',

		/**
		 * 当歌词被选中时触发该句柄
		 */
		onselect: null,

		/**
		 * 刷新歌词框中歌词位置
		 */
		refresh: function () {

			var transitionTime = 0;
			var transitionOffset = 300;
			var transitionEasing = function (t) {

				return 0.5 - Math.cos(t * Math.PI) / 2;
			};

			var lyricsBox = this;

			var time = Date.now() -
				(lyricsBox.lyricsInfo.startTime + lyricsBox.lyricsInfoCache.offset + transitionOffset);

			if (!lyricsBox.lyricsInfo.lyrics.some(function (item, position) {

				var timeOffset = time - item.time;
				var positionOffset = 0;

				if (!lyricsBox.lyricsInfo.lyrics[position + 1] && time >= item.time) {

					lyricsBox.scrollTo(position);

					return true;
				}

				if (time >= item.time && time < lyricsBox.lyricsInfo.lyrics[position + 1].time) {

					var duration = lyricsBox.lyricsInfo.lyrics[position + 1].time - item.time;

					if (duration > transitionTime) {

						var easingOffset = timeOffset - (duration - transitionTime);

						if (easingOffset >= 0 && transitionTime > 0) {

							positionOffset = transitionEasing(easingOffset / transitionTime);
						}

					} else {

						positionOffset = transitionEasing(timeOffset / duration);
					}

					lyricsBox.scrollTo(position + positionOffset);

					return true;
				}

				return false;

			})) {

				lyricsBox.scrollTo(0);
			}
		},

		/**
		 * 向歌词缓存中添加一行歌词
		 */
		append: function (item) {

			var lyricsBox = this;

			lyricsBox.lyricsInfoCache.lyrics.push(item);
		},

		/**
		 * 获取歌词的开始时间
		 */
		getStartTime: function () {

			var lyricsBox = this;

			return lyricsBox.lyricsInfoCache.startTime;
		},

		/**
		 * 设置歌词的开始时间
		 */
		setStartTime: function (startTime) {

			var lyricsBox = this;

			lyricsBox.lyricsInfoCache.startTime = startTime || Date.now();
		},

		/**
		 * 获取歌词的全局时间偏移量
		 */
		getOffset: function () {

			var lyricsBox = this;

			return lyricsBox.lyricsInfoCache.offset;
		},

		/**
		 * 设置歌词的全局时间偏移量
		 */
		setOffset: function (offset) {

			var lyricsBox = this;

			lyricsBox.lyricsInfoCache.offset = offset || 0;
		},

		/**
		 * 从歌词缓存中加载歌词
		 */
		update: function () {

			var lyricsBox = this;

			lyricsBox.lyricsInfo.startTime = 0;

			if (lyricsBox.selectState === 'none') {

				lyricsBox.lyricList.innerHTML = '';

				lyricsBox.lyricsInfo = {
					startTime: lyricsBox.lyricsInfoCache.startTime,
					offset: lyricsBox.lyricsInfoCache.offset,
					lyrics: lyricsBox.lyricsInfoCache.lyrics.map(function (item) {

						return item;
					})
				};

				if (lyricsBox.lyricsInfo.lyrics.length > 0) {

					lyricsBox.lyricsInfo.lyrics.forEach(function (item) {

						var element = document.createElement('li');

						element.innerHTML = item.lyric;

						if (item.lyric === '') element.classList.add('blank');

						element.addEventListener('mousedown', function (event) {

							event.preventDefault();

							if (event.button === 0) {

								lyricsBox.startHover(event.target, event.layerY);
							}
						});

						element.addEventListener('mouseleave', function (event) {

							lyricsBox.stopHover();
						});

						lyricsBox.lyricList.appendChild(element);
					});

					for (var index = 0; index < lyricsBox.lyricList.children.length; index++) {

						var element = lyricsBox.lyricList.children[index];

						element.offsetBottom = lyricsBox.lyricList.clientHeight -
							element.offsetTop - element.clientHeight;
						element.offsetMidline = element.offsetTop +
							element.clientHeight / 2;
					}

					lyricsBox.scrollTo();

					lyricsBox.notice.initializing.classList.add('hidden');
					lyricsBox.notice.lyricsNotFound.classList.add('hidden');

				} else {

					lyricsBox.scrollTo(0);

					lyricsBox.notice.initializing.classList.add('hidden');
					lyricsBox.notice.lyricsNotFound.classList.remove('hidden');
				}
			}
		},

		/**
		 * 清空歌词缓存
		 */
		clear: function () {

			var lyricsBox = this;

			lyricsBox.lyricsInfoCache = {
				startTime: Date.now(),
				offset: 0,
				lyrics: []
			};
		},

		/**
		 * 滚动到指定行的歌词
		 */
		scrollTo: function (position) {

			var lyricsBox = this;

			if (typeof(position) === 'undefined') position = lyricsBox.currentPosition;

			lyricsBox.currentPosition = position;

			for (var index = 0; index < lyricsBox.lyricList.children.length; index++) {

				var element = lyricsBox.lyricList.children[index];

				if (index === Math.floor(position)) {

					element.classList.add('highlight');

				} else {

					element.classList.remove('highlight');
				}
			}

			var element = lyricsBox.lyricList.children[Math.floor(position)];

			position = Math.min(position, lyricsBox.lyricList.children.length - 1);
			position = Math.max(position, 0);

			element = lyricsBox.lyricList.children[Math.floor(position)];

			if (lyricsBox.selectState === 'none') {

				var offset = 0;

				if (element) {

					offset = element.offsetMidline + ((element.nextElementSibling ||
						element).offsetMidline - element.offsetMidline) *
						(position - Math.floor(position)) + lyricsBox.lyricList.offsetTop;
				}

				lyricsBox.lyricsSlide.style.top = (320 - offset) + 'px';
			}
		},

		/**
		 * 滚动到下一行歌词
		 */
		scroll: function () {

			var lyricsBox = this;
			
			lyricsBox.scrollTo(Math.floor(lyricsBox.currentPosition + 1));
		},

		/**
		 * 设置选择区域范围
		 */
		setSelectArea: function (startIndex, endIndex) {

			var lyricsBox = this;

			var topElement = lyricsBox.lyricList.children[Math.min(startIndex, endIndex)];
			var bottomElement = lyricsBox.lyricList.children[Math.max(startIndex, endIndex)];

			lyricsBox.selectArea.style.top = (lyricsBox.lyricList.offsetTop + topElement.offsetTop) + 'px';
			lyricsBox.selectArea.style.bottom = bottomElement.offsetBottom + 'px';
		},

		/**
		 * 准备开始选择
		 */
		startHover: function (element, cursorOffset) {

			var lyricsBox = this;

			if (lyricsBox.selectState === 'none') {

				lyricsBox.selectState = 'hover';

				for (var index = 0; index < lyricsBox.lyricList.children.length; index++) {

					if (lyricsBox.lyricList.children[index] === element) {

						lyricsBox.selectStartIndex = index;
						lyricsBox.selectEndIndex = index;;

						break;
					}
				}

				lyricsBox.selectArea.style.top = (lyricsBox.lyricList.offsetTop + cursorOffset) + 'px';
				lyricsBox.selectArea.style.bottom = lyricsBox.lyricList.clientHeight - cursorOffset + 'px';

				setTimeout(function () {

					lyricsBox.selectArea.classList.add('scroll');

				}, 1);

				setTimeout(function () {

					lyricsBox.startSelect();

				}, 850);
			}
		},

		/**
		 * 取消开始选择准备
		 */
		stopHover: function () {

			var lyricsBox = this;

			if (lyricsBox.selectState === 'hover') {

				lyricsBox.selectState = 'none';

				lyricsBox.update();
			}
		},

		/**
		 * 开始选择
		 */
		startSelect: function () {

			var lyricsBox = this;

			if (lyricsBox.selectState === 'hover') {

				lyricsBox.selectState = 'selecting';

				lyricsBox.selectArea.classList.remove('hidden');
				lyricsBox.lyricsWrap.classList.add('selecting');

				lyricsBox.setSelectArea(
					lyricsBox.selectStartIndex,
					lyricsBox.selectStartIndex
				);
			}
		},

		/**
		 * 改变选择区域范围大小
		 */
		resizeSelectArea: function (cursorOffset, cursorOffsetToWindow) {

			var lyricsBox = this;

			if (lyricsBox.selectState === 'selecting') {

				if (cursorOffsetToWindow < 80
				 && lyricsBox.selectEndIndex > 0) {

					lyricsBox.lyricsSlide.style.top =
						(parseInt(lyricsBox.lyricsSlide.style.top) + 4) + 'px';
				}

				if (window.innerHeight - cursorOffsetToWindow < 80
				 && lyricsBox.selectEndIndex < lyricsBox.lyricList.children.length - 1) {

					lyricsBox.lyricsSlide.style.top =
						(parseInt(lyricsBox.lyricsSlide.style.top) - 4) + 'px';
				}

				if (cursorOffset < lyricsBox.lyricList.children[lyricsBox.selectStartIndex].offsetMidline) {

					for (var index = 0;
						index <= lyricsBox.selectStartIndex; index++) {

						lyricsBox.selectEndIndex = index;

						if (lyricsBox.lyricList.children[index].offsetMidline > cursorOffset) break;
					}

				} else {

					for (var index = lyricsBox.lyricList.children.length - 1;
						index >= lyricsBox.selectStartIndex; index--) {

						lyricsBox.selectEndIndex = index;

						if (lyricsBox.lyricList.children[index].offsetMidline < cursorOffset) break;
					}
				}

				lyricsBox.setSelectArea(
					lyricsBox.selectEndIndex,
					lyricsBox.selectStartIndex
				);
			}
		},

		/**
		 * 结束选择
		 */
		stopSelect: function () {

			var lyricsBox = this;

			if (lyricsBox.selectState === 'selecting') {

				lyricsBox.selectState = 'selected';

				lyricsBox.lyricsSlide.style.top = (407 - lyricsBox.selectArea.offsetTop -
					lyricsBox.selectArea.clientHeight * 0.6) + 'px';

				lyricsBox.lyricsWrap.classList.remove('selecting');

				lyricsBox.selectedContent = [];

				var topIndex = Math.min(lyricsBox.selectStartIndex, lyricsBox.selectEndIndex);
				var bottomIndex = Math.max(lyricsBox.selectStartIndex, lyricsBox.selectEndIndex);

				for (var index = topIndex; index <= bottomIndex; index++) {

					lyricsBox.selectedContent.push(lyricsBox.lyricList.children[index].innerHTML);
				}

				if (lyricsBox.onselect) lyricsBox.onselect({
					target: lyricsBox,
					content: lyricsBox.selectedContent
				});
			}
		},

		/**
		 * 取消选择
		 */
		cancelSelect: function () {

			var lyricsBox = this;

			if (lyricsBox.selectState === 'selected') {

				lyricsBox.selectState = 'none';

				lyricsBox.selectArea.classList.remove('scroll');
				lyricsBox.selectArea.classList.add('hidden');

				lyricsBox.update();
			}
		}

	};

	return LyricsBox;

})();