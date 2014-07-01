#coding: utf-8
import tornado.web
from basehandler import BaseHandler
from models import UserModel
import json

import logging
log = logging.getLogger("signup_handler")
log.setLevel(logging.DEBUG)

class SignupHandler(BaseHandler):
  def __init__(self, application, request, **kwargs):
    self._users = UserModel()
    super(SignupHandler, self).__init__(application, request, **kwargs)

  def get(self):
    if self.current_user:
      self.set_current_user("")
    return self.render('signup.html')

  def post(self):
    account = self.get_body_argument("usrn")
    passwd = self.get_body_argument("pswd")
    result = self._users.add_user({
                                 u"account": account,
                                 u"passwd": passwd
                               })
    if not result:
      return self.render('result.html', message = {
                                                    u"error": 10,
                                                    u"content": u"未知错误"
                                                  }, redirect = '/signup')
    user_id = self._users.login(account, passwd)
    self.set_current_user(user_id)
    return self.render('result.html', message = {
                                                  u"error": 0,
                                                  u"content": u"注册成功" 
                                                }, redirect = '/')

