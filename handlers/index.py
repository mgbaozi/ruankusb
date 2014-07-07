#coding: utf-8
import tornado.web
from basehandler import BaseHandler
from lib.lrclib import LrcLib
from lib.songinfo import SongInfo
from models import MusicModel, UserModel
import json
import re


import logging
log = logging.getLogger("index")
log.setLevel(logging.DEBUG)
rm_regex = r"/(\([^\)]*\))|(\[[^\]]*\])|(（[^）]*）)|(【[^】]*】)|((-|\/|&).*)/g"
def simplify(string):
  return re.sub(rm_regex, "", string)

class IndexHandler(BaseHandler):

  def __init__(self, application, request, **kwargs):
    self._lrclib = LrcLib()
    self._info = SongInfo()
    self._music = MusicModel()
    self._users = UserModel()
    super(IndexHandler, self).__init__(application, request, **kwargs)
  def get(self):
    user_id = self.current_user
    log.debug("user_id is {0}".format(user_id))
    # if not user_id:
      # return self.render('login.html')
    account = ""
    if user_id:
      user = self._users.get_one(user_id)
      log.debug(user)
      if user:
        account = user["account"]
    return self.render('index.html', current_user = account, domain=self.request.full_url())

  def on_error(self):
    return self.write(json.dumps({
                    "code": 1
                  }))

  def post(self):
    request = json.loads(self.request.body)
    song = dict(
                  sid = request.get("songId"),
                  artist = request.get("artist"),
                  title = request.get("title"),
                  channel = request.get("channel"),
                  share_url = request.get("shareUrl"),
                  album_img = request.get("albumImgUrl"),
                  start_time = request.get("startTime")
              )
    lrc, song_info = self._music.get_rep(song["sid"])
    if lrc and song_info:
      lrc.update({"startTime": song["start_time"]})
      return self.write(json.dumps({
                                    "code": 0,
                                    "lyricsInfo": lrc,
                                    "songInfo": song_info
                                  }))
    lrc = self._lrclib.getlrc(simplify(song["title"]), simplify(song["artist"]))  
    if not song_info:
      info_res = self._info.get_info(song["share_url"])
      if not info_res:
        return self.on_error()
      song_info = info_res["song"][0]
      song_info = {
                    "album": song_info["albumtitle"],
                    "albumId": song_info["aid"],
                    "albumImgUrl": song_info["picture"],
                    "albumUrl": song_info["album"],
                    "artist": song_info["artist"],
                    "company": song_info["company"],
                    "duration": song_info["length"],
                    "mp3Url": song_info["url"],
                    "rating": song_info["rating_avg"],
                    "releaseYear": song_info["public_time"],
                    "songId": song_info["sid"],
                    "ssid": song_info["ssid"],
                    "startToken": song_info["start_token"],
                    "title": song_info["title"],
                    "shareUrl": song["share_url"]
                  }
    response = json.dumps({
                "code": 0,
                "lyricsInfo": {
                        "lyrics": lrc,
                        "offset": 0,
                        "startTime": song["start_time"]
                      }, 
                "songInfo": song_info
              })
    self._music.set_rep(song["sid"], dict(lyrics=lrc,offset=0), song_info)
    return self.write(response)
