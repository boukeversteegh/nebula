try:
	import simplejson as json
except ImportError:
	import json

import tempfile

import whoosh
import whoosh.index
from whoosh.fields import *
from whoosh.qparser import QueryParser, MultifieldParser
from whoosh.writing import BufferedWriter

class Search:
	exposed = True
	
	def __init__(self, settings):
		global cherrypy
		cherrypy = settings['cherrypy']
		self.userconf = settings['userconf']
		self.initWhoosh()

	def initWhoosh(self):
		indexdir = tempfile.mkdtemp()

		schema = Schema(
			path	= ID(stored=True),
			file	= TEXT,
			artist	= TEXT,
			title	= TEXT,
			album	= TEXT,
			metadata= STORED
		)

		index = whoosh.index.create_in(indexdir, schema)
		writer = BufferedWriter(index, period=10, limit=100)
		self.writer = writer
		self.index = index


	def default(self, field, querystring):
		querystring = querystring.decode('UTF-8')
		with self.index.searcher() as searcher:
		
			if field == "all":
				qparser = MultifieldParser(["artist", "title", "album", "file"], self.index.schema)
			else:
				qparser	= QueryParser(field, self.index.schema)
				
			query = qparser.parse(querystring)
			results	= searcher.search(query)
			files = []
			for result in results:
				file = result['metadata']
				files.append(file)
		response = {
			"data":		{
				"files":	files
			},
			"success":	True
		}
		return json.dumps(response)

	default.exposed = True

	def add(self, **fields):
		self.writer.add_document(**fields)
		
	def delete(self, field, value):
		self.writer.delete_by_term(field, value)

	def commit(self):
		self.writer.commit()
