#coding: utf-8
import tornado.web
from basehandler import BaseHandler
from models import FavoriteModel

def FavoriteHandler(BaseHandler):
  def __init__(self, *args, **kwargs):
    self._favorites = FavoriteModel()
    super(FavoriteHandler, self).__init__(application, request, **kwargs)

  @tornado.web.authenticated
  def get(self):
    user_id = self.current_user
    favorites = self._favorites.get_all(user_id)
    return self.write(json.dumps(favorite))

  @tornado.web.authenticated
  def post(self):
    user_id = self.current_user
    song_id = self.get_body_argument("song_id")
    result = self._favorites.add(user_id, song_id)
    if not result:
      return self.write(json.dumps({"error": 1, "content": u"未知错误"}))
    return self.write(json.dumps({
                                  "error": 0,
                                  "content": u"设置成功",
                                  "record_id": result
                                }))

  @tornado.web.authenticated
  def delete(self):
    user_id = self.current_user
    record_id = self.get_body_argument("id")
    if self._favorites.remove(user_id, record_id):
      return self.write(json.dumps({
                                    "error": 0,
                                    "content": u"删除成功"
                                  }))
    return self.write(json.dumps({
                                  "error": 1,
                                  "content": u"权限不足"
                                }))



