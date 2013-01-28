function EventHandler() {
		this.bindings = {};
		
		this.bind = function(eventname, fn) {
			var eventbindings = this.getBindings(eventname);
			var binding = {
				"event":	eventname,
				"fn":		fn
			}
			eventbindings.push(binding);
			return binding;
		}
		
		this.unbind = function(binding) {
			var eventname = binding.event;
			var eventbindings = this.bindings[eventname];
			var index = eventbindings.indexOf(binding);
			eventbindings.splice(index,1);
		}
		
		this.trigger = function(eventname, args) {
			var eventbindings = this.getBindings(eventname);
			for( var i=0; i<eventbindings.length; i++ ) {
				var binding = eventbindings[i];
				binding.fn.apply(null, args);
			}
		}
		
		this.getBindings = function(eventname) {
			if( !this.bindings[eventname] ) {
				this.bindings[eventname] = [];
			}
			var eventbindings = this.bindings[eventname];
			return eventbindings;
		}
}
