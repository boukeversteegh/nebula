import simplejson as json

class Lyrics:
	exposed = True
	
	def __init__(self, settings):
		global cherrypy
		cherrypy = settings['cherrypy']
		self.userconf = settings['userconf']
		self.cache={}
		settings['conf']['/lyrics'] = {
		    'request.dispatch': cherrypy.dispatch.MethodDispatcher()
		}
	
	def GET(self, *trail):
		cherrypy.response.headers['Content-Type'] = "application/json"
		response = {'success': True}
		if trail in self.cache:
			response['data'] = {
				'lyrics': self.cache[trail]
			}
		return json.dumps(response)
		
	def PUT(self, *trail, **params):
		cherrypy.response.headers['Content-Type'] = "application/json"
		response = {'success': True}
		lyrics = params['lyrics']
		self.cache[trail] = lyrics
		return json.dumps(response)
