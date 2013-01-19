#!/usr/bin/python
import glob
import os
import cherrypy
import mimetypes
import sys
import plugins.metadata
import plugins.files
import plugins.lyrics
import eventhandler

class Nebula:
	pass

if __name__ == '__main__':
	nebula = Nebula()
	
	
	librarypath = sys.argv[1]
	
	cherrypy.config.update({
		'server.socket_host': '0.0.0.0', 
		'server.socket_port': int(sys.argv[2])
	})

	userconf = {
		'librarypath':	librarypath 
	}
	
	conf = {
		'/index': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'www/index.html')
		},
		'/view': {
			'tools.staticfile.on': True,
			'tools.staticfile.filename': os.path.join(os.getcwd(), 'www/index.html')
		},
		'/www': {
			'tools.staticdir.on': True,
			'tools.staticdir.dir': os.path.join(os.getcwd(), 'www')
		}
    }
    # EventHandler is used to allow plugins to communicate indirectly
	events = eventhandler.EventHandler()
	
	# Objects that plugins need
	settings = {
		"cherrypy":	cherrypy,
		"userconf":	userconf,
		"conf":		conf,
		"events":	events
	}
	nebula.files = plugins.files.Files(settings)
	nebula.metadata = plugins.metadata.Metadata(settings)
	nebula.lyrics = plugins.lyrics.Lyrics(settings)
	
	cherrypy.config.update({
		'server.socket_host': '0.0.0.0', 
		'server.socket_port': int(sys.argv[2])
	})
	
	cherrypy.quickstart(nebula, '/', conf)
