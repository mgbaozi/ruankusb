#coding: utf-8
import urllib2
import urlparse
import cookielib
import logging
log = logging.getLogger("reader")
log.setLevel(logging.DEBUG)
class UrlReader(object):
  def __init__(self):
    self._cj = cookielib.CookieJar()
    self._opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(self._cj))
  
  def set_cookies(self, cookies, domain, port = 80):
    while self._opener.addheaders[-1][0] == 'Cookie':
      self._opener.addheaders.pop(-1)
    for name, value in cookies.items():
      self._opener.addheaders.append(('Cookie', name+'='+value+'&'))

  def read(self, url, cookies = None):
    if cookies:
      parsed = urlparse.urlparse(url)
      self.set_cookies(cookies, parsed.hostname, parsed.port or 80)
    req = self._opener.open(url)
    return req.read()
  
  def __call__(self, url):
    return self.read(url)
  
