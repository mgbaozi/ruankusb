from handlers import IndexHandler, UserHandler, FavoriteHandler
import tornado.web

views = [
  (r'/', IndexHandler),
  (r'/login', UserHandler),
  (r'/favorite', FavoriteHandler),
  (r'/(.*)', tornado.web.StaticFileHandler, {"path": "static"}),
]
