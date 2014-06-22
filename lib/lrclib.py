#coding: utf-8
import urllib2
import cookielib
import json
from xml.dom import minidom
import logging
from formatlrc import FormatLRC
log = logging.getLogger("lrclib")
log.setLevel(logging.DEBUG)

class UrlReader(object):
	def __init__(self):
		self._cj = cookielib.CookieJar()
		self._opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(self._cj))
	
	def read(self, url):
		req = self._opener.open(url)
		return req.read()
	
	def __call__(self, url):
		return self.read(url)
	
class BaiduAPI(object):
	def __init__(self):
		self._reader = UrlReader()
	
	def getlrc(self, song_name, artist):
		url = 'http://sug.music.baidu.com/info/suggestion?format=json&word=' + \
				urllib2.quote(song_name.encode('utf-8')) + '-' + \
				urllib2.quote(artist.encode('utf-8'))
		content = json.loads(self._reader(url))
		log.debug(content)
		songid = content[u'song'][0][u'songid']
		url = 'http://play.baidu.com/data/music/songlink?songIds=' + \
				urllib2.quote(songid) + '&type=mp3'
		content = json.loads(self._reader(url))
		log.debug(content)
		lrc_uri = content[u'data'][u'songList'][0][u'lrcLink']
		mp3_url = content[u'data'][u'songList'][0][u'showLink']
		lrc_url = 'http://music.baidu.com' + lrc_uri
		lrc = self._reader(lrc_url)
		log.debug(lrc)
		return lrc, mp3_url

class LrcLib(object):
	
	def __init__(self):
		self._apis = {
			"baidu": BaiduAPI()
		}
	def getlrc(self, song_name, artist):
		lrc, mp3_url = "", ""
		for key, api in self._apis.items():
			lrc, mp3_url = api.getlrc(song_name, artist)
		log.debug(lrc)
		return dict(lrc = FormatLRC(lrc), mp3_url = mp3_url)

