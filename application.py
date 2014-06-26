import os
import sys
import inspect
import logging
log = logging.getLogger("application")

app_path = os.path.abspath(
    os.path.dirname(inspect.getfile(inspect.currentframe())))
sys.path.append(app_path)

import tornado.web
import tornado.httpserver
import tornado.ioloop
import tornado.options

from views import views

class Application(tornado.web.Application):
  def __init__(self):
    handlers = views
    settings = {
      'template_path': 'templates',
      'static_path': 'static',
      'login_url': '/login',
      'cookie_secret': 'T0yEnsiyRViAZ2/8KDhWdpiqkNix50qmh//GYJhuwas='
    }
    tornado.web.Application.__init__(self, handlers, debug = True, **settings)

if __name__ == '__main__':
  tornado.options.parse_command_line()
  app = Application()
  server = tornado.httpserver.HTTPServer(app)
  server.listen(8000)
  tornado.ioloop.IOLoop.instance().start()
