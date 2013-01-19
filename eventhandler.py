class EventHandler:
	def __init__(self):
		self.bindings = {}
		
	def bind(self, eventname, function):
		eventbindings = self.bindings.setdefault(eventname, [])
		binding = {
			"event":    eventname,
			"function": function
		}
		eventbindings.append(binding)
		return binding
		
	def unbind(self, binding):
		self.bindings[binding['event']].remove(binding)
		
	def trigger(self, eventname, *args):
		eventbindings = self.bindings.setdefault(eventname, [])
		for binding in eventbindings:
			binding['function'](*args)
