import tornado.web
from base.session_tools import SessionTools
from lib.lrclib import LrcLib
import json


import logging
log = logging.getLogger("index")
log.setLevel(logging.DEBUG)
class IndexHandler(tornado.web.RequestHandler):

	def __init__(self, application, request, **kwargs):
		self.session = SessionTools()
		self._lrclib = LrcLib()
		super(IndexHandler, self).__init__(application, request, **kwargs)
	def get(self):
		user_id = self.session.logged_user(self.get_cookie)
		log.debug("user_id is {0}".format(user_id))
		# if not user_id:
			# return self.render('login.html')
		return self.render('index.html', domain=self.request.full_url())
	def post(self):
		request = json.loads(self.request.body)
		song = dict(sid = request.get("songId"),
				artist = request.get("artist"),
				title = request.get("title"),
				channel = request.get("channel"),
				share_url = request.get("shareUrl"),
				album_img = request.get("albumImgUrl"),
				start_time = request.get("startTime"))
		result = self._lrclib.getlrc(song["title"], song["artist"])	
		log.debug(result)
		response = json.dumps({"code": 0, "lyricsInfo": 
				{"lyrics": result["lrc"], "offset": 0, "startTime": song["start_time"]}, 
				"songInfo": {"mp3Url": result["mp3_url"]}})
		return self.write(response)
