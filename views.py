from handlers import IndexHandler, UserHandler, FavoriteHandler, SignupHandler, SongHandler 
import tornado.web

views = [
  (r'/', IndexHandler),
  (r'/login', UserHandler),
  (r'/favorite', FavoriteHandler),
  (r'/signup', SignupHandler),
  (r'/redirect', SongHandler),
  (r'/(.*)', tornado.web.StaticFileHandler, {"path": "static"}),
]
