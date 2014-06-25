#coding: utf-8
import urllib2
import cookielib
import json
from xml.dom import minidom
import logging
from formatlrc import FormatLRC
from reader import UrlReader
log = logging.getLogger("lrclib")
log.setLevel(logging.DEBUG)

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
    lrc_url = 'http://music.baidu.com' + lrc_uri
    lrc = self._reader(lrc_url)
    log.debug(lrc)
    return lrc

class LrcLib(object):
  
  def __init__(self):
    self._apis = {
      "baidu": BaiduAPI()
    }
  def getlrc(self, song_name, artist):
    lrc = ""
    for key, api in self._apis.items():
      try:
        lrc = api.getlrc(song_name, artist)
      except:
        pass
      if lrc:
        break
    log.debug(lrc)
    return FormatLRC(lrc) if lrc else ""

