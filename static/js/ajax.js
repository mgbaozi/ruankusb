
/**
 * Ajax请求模块
 */

Ajax = (function () {

	var Ajax = {

		/**
		 * 发送AJAX请求
		 *
		 * options格式:
		 *   url: 请求的URL, 不可为空
		 *   method: 请求类型, 一般为'GET'或'POST', 默认为'GET'
		 *   data: 数据体, 将以键值对形式发送, 默认为空
		 *   requestType: 请求类型, 可以为'urlencoded','json','multipart'等, 默认为'urlencoded'
		 *   responseType: 返回类型, 可以为'text','json','blob'等, 默认为空字符串
		 *   onprogress: 请求收到数据时触发该句柄, 默认为空
		 *   onsuccess: 请求成功时触发该句柄, 默认为空
		 *   onerror: 请求出错时触发该句柄, 默认为空
		 */
		request: function (options) {

			if (!options.url) return;

			var xhr = new XMLHttpRequest();

			xhr.open(options.method || 'GET', options.url);

			xhr.responseType = options.responseType || '';

			xhr.addEventListener('progress', function (event) {

				if (options.onprogress) {

					options.onprogress({
						target: Ajax,
						loaded: event.loaded,
						total: event.total,
						percentage: event.loaded / event.total
					});
				}
			});

			xhr.addEventListener('load', function (event) {

				var status = xhr.status;

				if (status >= 200 && status < 300 || status === 304) {

					var response = xhr.response;
					var length = 0;
					var responseUrl = '';

					if (response) length = response.length || response.size || 0;

					if (options.responseType === 'json') {

						try {
							response = JSON.parse(response);

						} catch (err) {}
					} 

					try {
						responseUrl = URL.createObjectURL(response);

					} catch (err) {}

					if (options.onsuccess) {
						options.onsuccess({
							target: Ajax,
							response: response,
							length: length,
							responseUrl: responseUrl,
							status: status
						});
					}

				} else {

					if (options.onerror) {
						options.onerror({
							target: Ajax,
							status: status
						});
					}
				}
			});

			var errorEventListener = function (event) {

				if (options.onerror) {
					options.onerror({
						target: Ajax,
						status: 0
					});
				}
			};

			xhr.addEventListener('error', errorEventListener);
			xhr.addEventListener('abort', errorEventListener);
			xhr.addEventListener('timeout', errorEventListener);

			var requestBody = '';
			var requestType = options.requestType || 'urlencoded';

			if (options.method === 'POST' && options.data) {

				if (requestType === 'urlencoded') {

					for (var key in options.data) {

						requestBody += encodeURIComponent(key) + "=" +
							encodeURIComponent(options.data[key]) + "&";
					}
					
					xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

				} else if (requestType === 'json') {

					requestBody = JSON.stringify(options.data);
					
					xhr.setRequestHeader('Content-Type', 'application/json');

				} else if (requestType === 'multipart') {

					requestBody = new FormData();

					for (var key in options.data) {

						requestBody.append(key, options.data[key].toString());
					}
				}
			}

			xhr.send(requestBody);
		},

		/**
		 * 发送AJAX GET请求
		 */
		get: function (options) {

			options.method = 'GET';
			options.data = null;

			this.request(options);
		},

		/**
		 * 发送AJAX POST请求
		 */
		post: function (options) {

			options.method = 'POST';

			this.request(options);
		}
	};

	return Ajax;

})();