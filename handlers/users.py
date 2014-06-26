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
    return self.render('login.html')

  def post(self):
    account = self.get_body_argument("account", None)
    passwd = self.get_body_argument("passwd", None)
    if not account or not passwd:
      return self.write(json.dumps({
                                    u"error": 1,
                                    u"content": u"请输入用户名和密码"
                                  }))
    user_id = self._users.login(account, passwd)
    if not user_id:
      return self.write(json.dumps({
                                    u"error": 2,
                                    u"content": u"用户名或密码错误"
                                  }))
    self.set_current_user(account)
    return self.write(json.dumps({
                                  u"error": 0
                                }))

