import os.path
try:
	import simplejson as json
except ImportError:
	import json

import glob

class Files:
	exposed = True
	def __init__(self, settings):
		global cherrypy
		cherrypy = settings['cherrypy']
		self.userconf = settings['userconf']
		settings['conf']['/files'] = {
		    'request.dispatch': cherrypy.dispatch.MethodDispatcher()
		}
		self.events = settings['events']
			
	def GET(self, *trail):
		localpath = os.path.join(self.userconf['librarypath'], *trail)
		if not os.path.exists(localpath):
			return False
		else:
			
			if os.path.isfile(localpath):
				return cherrypy.lib.static.serve_file(localpath)
			else:
				response = {
					"success":	False,
					"error":	"This path is a directory"
				}
				return json.dumps(response)

	# SEE
	# http://docs.cherrypy.org/dev/refman/_cpreqbody.html
	def PUT(self, *trail, **params):
		response = {"success": True}
		success = True
		try:
			if 'path' in params:
				response['params'] = params['path'];
				localpath = os.path.join(self.userconf['librarypath'], *(params['path'].split("/")[1:-1]))
				if os.path.exists(localpath):
					
					subpath = trail[0:-1]
					
					localsubpath = os.path.join(self.userconf['librarypath'], *subpath)
					response['debug'] = "Created directory structure: %s" % localsubpath
					response['subpath'] = subpath
					if not os.path.exists(localsubpath):
						os.makedirs(localsubpath)
				else:
					raise Exception("Path %s doesn't exist" % localpath)
					
			upfile = cherrypy.request.params['file']
			localpath = os.path.join(self.userconf['librarypath'], *trail)
			f = open(localpath, 'w+b')
			f.write(upfile.fullvalue())
		except Exception as e:
			response['success'] = False
			response['error']  = "Error writing file: " + repr(e)
			cherrypy.log("*******ERROR********\n" + repr(e))
			
		return json.dumps(response)
	
	def DELETE(self, *trail):
		cherrypy.response.headers['Content-Type'] = "application/json"
		localpath = os.path.join(self.userconf['librarypath'], *trail)
		response = {}
		success = True
		try:
			if not os.path.exists(localpath):
				raise Exception("Path doesn't exist")
			if os.path.isfile(localpath):
				self.events.trigger('files.DELETE', trail)
				os.unlink(localpath)
			if os.path.isdir(localpath):
				files = glob.glob(localpath + '/*')
				if not len(files) == 0:
					raise Exception("Directory not empty")
				os.rmdir(localpath)
				#raise Exception("Can't delete directories")
				
				
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
					
					os.rename(localpath, localtarget.encode('utf-8'))
					pass
						
			except Exception as e:
				success = False
				response['error'] = "Error: %s" % e
					
		response['success'] = success
		return json.dumps(response)


