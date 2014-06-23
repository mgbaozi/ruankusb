#coding: utf-8
from reader import UrlReader
import urlparse
import logging
import json
log = logging.getLogger("songinfo")
log.setLevel(logging.DEBUG)
class SongInfo(object):
	def __init__(self):
		self._reader = UrlReader()
	
	def get_info(self, share_url):
		parsed_url = urlparse.urlparse(share_url)
		start_token = urlparse.parse_qs(parsed_url.query)["start"][0]
		log.debug(start_token)
		channel = start_token.split('g')[-1]
		url = 'http://douban.fm/j/mine/playlist?type=n&sid=&pt=0.0&from=mainsite&channel=' + channel
		result = self._reader.read(url, dict(bid = "xjJFyRRyPp4", start = start_token))
		result = json.loads(result)
		result["song"][0]["start_token"] = start_token
		return result
