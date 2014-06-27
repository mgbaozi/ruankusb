
/**
 * 歌词分享接口
 */

Share = (function () {

	function popupShareWindow(shareLink, callback) {

		if (shareLink && shareLink.baseUrl) {

			var shareUrl = shareLink.baseUrl;

			if (shareLink.params) {

				shareUrl += '?';

				for (var key in shareLink.params) {

					shareUrl += encodeURIComponent(key) + "=" +
						encodeURIComponent(shareLink.params[key]) + "&";
				}
			}

			var popupWindow = window.open(shareUrl, 'DoubanLRC-Share',
				'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=500,height=350');

			if (callback) callback(popupWindow);
		}
	};

	return {
		
		'weibo': function (options) {

			var weiboAppKey = '2403884134';

			var content = (options.content || []).join(' ') + ' —— ' +
				 (options.artist || '') + '《' + (options.title || '') +'》';

			popupShareWindow({
				baseUrl: 'http://service.weibo.com/share/share.php',
				params: {
					'url': options.url || '',
					'title': content,
					'pic': options.imageUrl || '',
					'appkey': weiboAppKey || '',
					'searchPic': 'false'
				}
			});
		},
		
		'renren': function (options) {

			var title = (options.title || '') + ' - ' + (options.artist || '');

			popupShareWindow({
				baseUrl: 'http://widget.renren.com/dialog/share',
				params: {
					'resourceUrl': options.url || '',
					'srcUrl': options.url || '',
					'title': title,
					'description': (options.content || []).join(' '),
					'pic': options.imageUrl || '',
					'charset': 'UTF-8'
				}
			});
		},
		
		'douban': function (options) {

			var title = (options.title || '') + ' - ' + (options.artist || '');

			popupShareWindow({
				baseUrl: 'http://www.douban.com/share/service',
				params: {
					'href': options.url || '',
					'name': title,
					'text': (options.content || []).join(' '),
					'image': options.imageUrl || '',
					'bm': '1'
				}
			});
		}
	};

})();