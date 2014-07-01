from handlers import IndexHandler, UserHandler, FavoriteHandler, SignupHandler
import tornado.web

views = [
  (r'/', IndexHandler),
  (r'/login', UserHandler),
  (r'/favorite', FavoriteHandler),
  (r'/signup', SignupHandler),
  (r'/(.*)', tornado.web.StaticFileHandler, {"path": "static"}),
]
