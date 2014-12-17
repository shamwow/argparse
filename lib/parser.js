var CommandTemplate = require('./cmd-template');

module.exports = function (){

		var self = this;
		self.cmds = {};


		/*
			Used to parse raw arguments given by process.argv

			If a given element of [argv] matches a registered command
			it is run

		*/
		self.parse = function (){

			// @TODO: add support for flags
			var args = [].slice.call(process.argv, 2),
					flagRegex = new RegExp(' --?\\w+ ', 'g'),
					// determine location of command arguments
					idx = 0,
					match = false;

			args.some(function (arg){
				idx++;
				// currently flags are ignored
				if(flagRegex.test(arg)){
					return;
				}
				else if(self.cmds[arg]){
					self.cmds[arg].run(args.slice(idx));
					match = true;
					return true;
				}
				return;
			});

			// if a global cmd is registered, use that
			if(self.cmds.global && !match){
				self.cmds.global.run(args.slice(0));
				return;
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
		self.register = function (cmd, fn){
			// type assertions
			if(typeof cmd != 'string') { throw new TypeError('Command format must be a string.'); }
			if(typeof fn != 'function') { throw new TypeError('Callback function must be a function.'); }

			// create CommandTemplate (see lib/cmd-template.js) 
			var cmdTemp = new CommandTemplate(cmd, fn);

			if(self.cmds[cmdTemp.name]){
				throw new Error('Command ' + cmdTemp.name + ' already defined');
			}

			if(cmdTemp.name == 'node'){
				throw new Error('Command can\'t be named node, reserved keyword.');
			}
			if(cmdTemp.name == __filename){
				throw new Error('Command name can\'t be the same as file');
			}

			self.cmds[cmdTemp.name] = cmdTemp;

			// allow for cascading
			return self;
		};

};