import os.path
import simplejson as json
from cherrypy.lib.static import serve_file

class Files:
	exposed = True
	def __init__(self, cp, userconf, conf):
		global cherrypy
		cherrypy = cp
		self.userconf = userconf
		conf['/files'] = {
		    'request.dispatch': cherrypy.dispatch.MethodDispatcher()
		}
			
	def GET(self, *trail):
		localpath = os.path.join(self.userconf['librarypath'], *trail)
		if not os.path.exists(localpath):
			return False
		else:
			
			if os.path.isfile(localpath):
				return serve_file(localpath)
			else:
				response = {
					"success":   False,
					"error":	"This path is a directory"
				}
				return json.dumps(response)

	# SEE
	# http://docs.cherrypy.org/dev/refman/_cpreqbody.html
	def PUT(self, *trail, **kwargs):
		response = {}
		success = True
		try:
			upfile = cherrypy.request.params['file']
			localpath = os.path.join(self.userconf['librarypath'], *trail)
			f = open(localpath, 'w+b')
			f.write(upfile.fullvalue())
		except Exception as e:
			success = False
			response['error'] = "Error writing file: " + repr(e)
			cherrypy.log("*******ERROR********\n" + repr(e))
			
		response["success"] = success
		return json.dumps(response)
	
	def DELETE(self, *trail):
		cherrypy.response.headers['Content-Type'] = "application/json"
		localpath = os.path.join(self.userconf['librarypath'], *trail)
		response = {}
		success = True
		try:
			if not os.path.isfile(localpath):
				raise Exception("Path doesn't exist")
			os.unlink(localpath)
		except Exception as e:
			success = False
			response['error'] = "Can't delete item: " + repr(e)
			
		response['success'] = success
		return json.dumps(response)
		
	def POST(self, *trail, **params):
		cherrypy.response.headers['Content-Type'] = "application/json"
		
		localpath = os.path.join(self.userconf['librarypath'], *trail)
		response = {}
		success = True
		if 'action' not in params:
			success = False
			response['error'] = "Missing parameter: action"
		else:
			try:
				if params['action'] == 'mkdir':
					if os.path.exists(localpath):
						raise Exception("Path already exists")
					os.mkdir(localpath)
					pass

				if params['action'] == 'mv':
					if not 'target' in params:
						raise Exception("Missing parameter: target")
					
					target = params['target'].lstrip("/")
					localtarget = os.path.join(self.userconf['librarypath'], target)
					
					if not os.path.exists(localpath):
						raise Exception("Path doesn't exist: " + "/".join(trail) + "(" + localpath + ")")
						
					os.rename(localpath, localtarget)
					pass
						
			except Exception as e:
				success = False
				response['error'] = "Error: %s" % e
					
		response['success'] = success
		return json.dumps(response)


