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
		raise cherrypy.HTTPRedirect('/get/' + '/'.join(trail))

	# SEE
	# http://docs.cherrypy.org/dev/refman/_cpreqbody.html
	def PUT(self, *trail, **params):
		response = {"success": True}
		success = True
		try:
			# User uploads directory structure
			# folderA/
			#    file.txt
			# 
			# To:
			# /Uploads
			#
			# PUT /Uploads/folderA/file.txt {path: /Uploads}
			if 'path' in params:
				path = params['path'].strip('/')
				pathtrail = tuple(path.split('/'))
				cherrypy.log("\n\n\n%s" % repr(pathtrail))
				localpath = os.path.join(self.userconf['librarypath'], *pathtrail)
				if os.path.exists(localpath):
					
					# Create subdirectories if missing
					parent = trail[0:-1]
					
					localsubpath = os.path.join(self.userconf['librarypath'], *parent)
					if not os.path.exists(localsubpath):
						os.makedirs(localsubpath)
						
					for i in range(len(parent)-1):
						self.events.trigger('folder.CHANGE', parent[0:i+1])
					
				else:
					raise Exception("Path %s doesn't exist" % localpath)
					
			upfile = cherrypy.request.params['file']
			localpath = os.path.join(self.userconf['librarypath'], *trail)
			f = open(localpath, 'w+b')
			f.write(upfile.fullvalue())
			self.events.trigger('folder.CHANGE', trail[:-1])
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
				self.events.trigger('file.CHANGE', trail)
				os.unlink(localpath)
			if os.path.isdir(localpath):
				files = glob.glob(localpath + '/*')
				if not len(files) == 0:
					raise Exception("Directory not empty")
				self.events.trigger('folder.CHANGE', trail[:-1])
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
					self.events.trigger('folder.CHANGE', trail[:-1])
					pass

				if params['action'] == 'mv':
					if not 'target' in params:
						raise Exception("Missing parameter: target")
					
					target = params['target'].encode('utf-8').strip("/")
					targettrail = tuple(target.split("/"))
					
					localtarget = os.path.join(self.userconf['librarypath'], *targettrail)
					
					if not os.path.exists(localpath):
						raise Exception("Path doesn't exist: " + "/".join(trail) + "(" + localpath + ")")
					if os.path.exists(localtarget):
						raise Exception("Target file or directory already exists: /%s" % target)

					os.rename(localpath, localtarget)
					
					# Source path is deleted:
					self.events.trigger('file.CHANGE', trail)
					
					# Target path is created:
					self.events.trigger('file.CHANGE', targettrail)
					
					pass
						
			except Exception as e:
				success = False
				response['error'] = "Error: %s" % e
					
		response['success'] = success
		return json.dumps(response)


