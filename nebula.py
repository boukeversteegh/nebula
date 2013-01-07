#!/usr/bin/python

import string,cgi,time,sys
import email
from os import curdir, sep
import os
import os.path as path
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import simplejson as json
import mimetypes
import urllib

class MyHandler(BaseHTTPRequestHandler):

			
	def setup(self):
		self.conf = {}
		self.conf['routes'] = None
		self.conf['library_dir'] = sys.argv[1]
		
		self.debug = True
		BaseHTTPRequestHandler.setup(self)
		
	
	def getRoutes(self, force=False):
		if force or not self.conf['routes']:
			f = open('config/routes.json')
			routes = json.load(f)
			self.conf['routes'] = routes
			
		return self.conf['routes']
	
	def send_contenttype(self, filename):
		extension = path.splitext(filename)[1]
		if extension in mimetypes.types_map:
			self.send_header('Content-type', mimetypes.types_map[extension])
		else:
			self.send_header('Content-type', 'text/plain')
	
	def do_GET(self):
		try:
			self.path = urllib.unquote(self.path)
			print self.path
			
			# API Calls
			if self.path.startswith('/api'):
				return self.handle_API()
			
			# Pages and files
			routes = self.getRoutes(self.debug)
			if self.path in routes:
				targetfile = routes[self.path]
			else:
				targetfile = routes['*']
			
			self.send_response(200)
			self.send_contenttype(targetfile)
				
			self.end_headers()
			self.wfile.write(open(targetfile).read())
			return
			
		except IOError:
			self.send_error(404,'File Not Found: %s' % self.path)

	def do_POST(self):
		if self.path == "/upload":
			return self.handle_upload()
		
	def handle_API(self):
		response = {}
		success = True
		libdir = self.conf['library_dir']
				
		if self.path.startswith('/api/files'):
			subdir = self.path[len('/api/files/'):]
			targetpath = path.join(libdir, subdir)
			print targetpath
			if path.isfile(targetpath):
				self.send_response(200)
				self.send_contenttype(targetpath)
				self.end_headers()
				f = open(targetpath)
				self.wfile.write(open(targetpath).read())
				return
			else:
				folders = []
				files = []
				for item in os.listdir(targetpath):
					if path.isfile(path.join(targetpath, item)):
						files.append(item)
					else:
						folders.append(item)
				folders.sort()
				files.sort()
				response['data'] = {
					"folders":	folders,
					"files":	files,
					"path":		'/' + subdir if subdir else '',
					"pathname":	subdir,
					"folder": subdir.split('/')[-1],
					"parent":	path.join("/", *subdir.split('/')[0:-1])
				}
		if self.path.startswith('/api/metadata'):
			subdir = self.path[len('/api/metadata/'):]
			targetpath = path.join(libdir, subdir)
			if path.isfile(targetpath):
				response['data'] = {
					"path": path.join("/", subdir),
					"file":	subdir.split('/')[-1]
				}
		
		response['success'] = success
		if success:
			self.send_response(200);
		
		self.send_header('Content-type', 'application/json')
		self.end_headers()
		self.wfile.write(json.dumps(response));


	def handle_upload(self):
		ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
		if ctype == 'multipart/form-data':
			query=cgi.parse_multipart(self.rfile, pdict)
		
		
		print query.get('filename');
		filename = query.get('filename')[0]
		
		filecontent = query.get('upfile')
		
		response = {}
		
		try:
			f = open(path.join(self.conf['library_dir'], filename), 'w')
			f.write(filecontent[0])
			response['success'] = True
			self.send_response(200)
		except:
			response['success'] = False
			response['errors'] = [
				"Failed to write file to disk"
			]
			self.send_response(403)
		self.send_header('Content-type', 'application/json')
		self.end_headers()
		self.wfile.write(json.dumps(response));
def main():
	try:
		port = int(sys.argv[2])
		server = HTTPServer(('', port), MyHandler)
		print 'started httpserver on port', port
		server.serve_forever()
	except KeyboardInterrupt:
		print '^C received, shutting down server'
		server.socket.close()

if __name__ == '__main__':
	main()
