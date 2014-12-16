var CommandTemplate = require('./cmd-template');

module.exports = function (){

		var self = this;
		self.cmds = {};


		/*
			Used to parse raw arguments given by process.argv

			If a given element of process.argv matches a registered comand
			it is run

		*/
		self.parse = function (){

			// @TODO: add support for flags
			var sliced = [].slice.call(process.argv, 0),
					flagRegex = new RegExp(' --?\\w+ ', 'g'),
					// determine location of command arguments
					idx = 0;

			for(var arg in sliced){
				idx++;
				// currently, flags are ignored
				if(flagRegex.test(arg)){
					continue;
				}
				else if(self.cmds[arg]){
					return self.cmds[args].run(args.slice(idx));
				}
			}
		};

		/*
			Used to register new cmd
			Arguments: command format [cmd] <string>
								 callback function [fn] <function>

			creates a new CommandTemplate from [cmd] and [fn]
			registers CommandTemplate in self.cmd map

			Exceptions:
				TypeError - if [cmd] is not <string> or [fn] is not <function>
				Error - if command with the same name has already been registered
		*/
		self.cmd = function (cmd, fn){
			// type assertions
			if(typeof cmd != 'string') { throw new TypeError('Command format must be a string.'); }
			if(typeof fn != 'function') { throw new TypeError('Callback function must be a function.'); }

			// create CommandTemplate (see lib/cmd-template.js) 
			var cmdTemp = new CommandTemplate(cmd, fn);

			if(self.cmds[cmdTemp.name]){
				throw new Error('Command ' + cmdTemp.name + ' already defined');
			}

			self.cmds[cmdTemp.name] = cmdTemp;
		};

};