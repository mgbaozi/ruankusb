#coding: utf-8
import tornado.web
from basehandler import BaseHandler
from models import UserModel
import json

import logging
log = logging.getLogger("user_handler")
log.setLevel(logging.DEBUG)

class UserHandler(BaseHandler):
  def __init__(self, application, request, **kwargs):
    self._users = UserModel()
    super(UserHandler, self).__init__(application, request, **kwargs)

  def get(self):
    if self.current_user:
      return self.redirect('/')
    return self.render('login.html')

  def post(self):
    account = self.get_body_argument("usrn", None)
    passwd = self.get_body_argument("pswd", None)
    if not account or not passwd:
      return self.render('result.html', message = {
                                                    u"error": 1,
                                                    u"content": u"请输入用户名和密码"
                                                  }, redirect = '/login')
    user_id = self._users.login(account, passwd)
    if not user_id:
      return self.render('result.html', message = {
                                                    u"error": 2,
                                                    u"content": u"用户名或密码错误"
                                                  }, redirect = '/login')
    self.set_current_user(account)
    return self.render('result.html', message = {
                                                  u"error": 0,
                                                  u"content": u"登录成功"
                                                }, redirect = '/')

