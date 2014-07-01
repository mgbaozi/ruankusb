#coding: utf-8
import tornado.web
class BaseHandler(tornado.web.RequestHandler):
  def __init__(self, application, request, **kwargs):
    super(BaseHandler, self).__init__(application, request, **kwargs)

  def get_current_user(self):
    return self.get_secure_cookie("user")
  
  def set_current_user(self, user_name):
    return self.set_secure_cookie("user", user_name)
