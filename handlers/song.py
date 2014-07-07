#coding: utf-8
import tornado.web
from basehandler import BaseHandler
from models import MusicModel
import json

class SongHandler(BaseHandler):
  def __init__(self, application, request, **kwargs):
    self._songs = MusicModel()
    super(SongHandler, self).__init__(application, request, **kwargs)

  def get(self):
    song_id = self.get_argument("song_id")
    lrc, song_info = self._songs.get_rep(song_id)
    if not song_info:
      return self.write(json.dumps({u"error": 1}))
    return self.render('redirect.html', url = song_info["shareUrl"])

