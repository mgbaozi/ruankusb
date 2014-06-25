from handlers import IndexHandler
import tornado.web

views = [
  (r'/', IndexHandler),
  (r'/(.*)', tornado.web.StaticFileHandler, {"path": "static"}),
]
