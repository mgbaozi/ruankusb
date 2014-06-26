from handlers import IndexHandler, UserHandler
import tornado.web

views = [
  (r'/', IndexHandler),
  (r'/login', UserHandler),
  (r'/(.*)', tornado.web.StaticFileHandler, {"path": "static"}),
]
