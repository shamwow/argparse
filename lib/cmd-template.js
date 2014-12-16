// import utility functions
require('./utils');

/*
	Command Syntax:

	name arg ...

	name
		= string no whitespaces

	arg
		= <name> (required)
		= [name] (optional - must be in last position)
		= <name, N> (required N-tuple)
		= <name>... (1 or more - must be in last position)
		= [name]... (0 or more - must be in last position)

	examples:
		create <test> <test2>
		test <arg1> [arg2]
*/


/*
	Properties:
		_formatExp [regex]
		_nameExp [regex]
		_rArgExp [regex]
		_oArgExp [regex]

		_requiredProps [array]
		_optionalProp [array]

		_raw [string]
		fn [function]
		name [string]

		argTemplates [array]
			array of arguments template objects
			[
				...
				{
					name: name of argument
					required: true
					tuple: number of elements in tuple - if not tuple defaults to 0
					infinite: boolean indicating wether unspecified number of arguments are possible
				},
				...
			]
			constarints:
				an optional argument is the last element
				an infinite argument is the last element
*/

module.exports = function (template, fn){
	var self = this;

	// Regular Expressions to parse cmd template

	// used validate entire format of command template
	self._formatExp = new RegExp('^ *(\\w+)(?: +(?:< *(\\w+) *(?:, *([1-9]+))? *>))*( +(\\[ *(\\w+) *\\]))?(\\.\\.\\.)? *$');
	// used to retrieve name of command from command template
	self._nameExp = new RegExp('^ *(\\w+) +', 'g');
	// used to retrieve required argument from command template
	self._rArgExp = new RegExp('< *(\\w+) *(?:, *([1-9]+))? *>(?:(\\.\\.\\.)$)?', 'g');
	// used to retrieve optional argument from command template
	self._oArgExp = new RegExp('\\[ *(\\w+) *\\](?:(\\.\\.\\.)$)? *$', 'g');
	
	// test to check if command template follows format correctly
	if(!self._formatExp.test(template)){
		throw new Error('Invalid Command Format');
	}

	self._raw = template;
	self.fn = fn;
	self.argTemplates = [];
	// get name from template
	self.name = nameExp.matchAll(template)[0];
	

	// get required arguments and optional argument from command template
	self._requiredProps = self._rArgExp.matchAll(template);
	self._optionalProp = self._oArgExp.matchAll(template);


	/*
		Go through each argument and build argument template objects
	*/
	self._requiredProps.forEach(function (elem){

		var split = elem.split(' '),
				name = split[0],
				number = parseInt(split[1]) || 0;

		self.argTemplates.push({
			name: name,
			required: true,
			tuple: number,
			infinite: split[1] == '...' || split[2] == '...'
		});
	});

	if(self._optionalProp.length){

		var split = self._optionalProp[0].split(' '),
				name = split[0];

		self.argTemplates.push({
			name: self._optionalProp[0],
			required: false,
			tuple: false,
			infinite: split[1] == '...'
		});
	}

	

	/*
		Returns an array of arguments according to command template

		Assumes constraints for self.argTemplates are satisfied
	*/
	self._getArgs = function(rawArgs){
		var output = [];

		// copy to prevent unintended mutation
		rawArgs = rawArgs.slice(0);

		// iterate though each argument templates
		// each iteration removes elements from rawArgs array
		self.argTemplates.forEach(function (a, index){
			// if argument is a tuple and infinite
			if(a.tuple && a.infinite){
				// if the remaining number of raw arguments is not a multiple of the tuple length
				// thre are not enough raw arguments
				if(rawArgs.length % a.tuple !== 0){
					throw new Error('Not enough arguments to complete tuple.');
				}

				// create tuples out of remaining raw arguments
				var groups = [];
				rawArgs.forEach(function (elem, idx){
					if(idx % a.tuple === 0){
						groups.push([elem]);
					}
					else{
						groups[groups.length-1].push(elem);
					}
				});

				output.push(groups);
				// clear remaining rawArgs array
				rawArgs = [];
			}
			// if argument is just a tuple
			else if(a.tuple){
				// if remaining raw arguments are less than the length of the tuple
				// there are not enough raw arguments
				if(rawArgs.length < a.tuple){
					throw new Error('Not enough arguments to complete tuple.');
				}
				// create tuple (a.tuple gives length of tuple)
				output.push(rawArgs.splice(0, a.tuple));
			}
			// if argument is infinite
			else if(a.infinite){
				// if it is a required argument but no raw arguments remain
				// there are not enough raw arguments
				if(rawArgs.length === 0 && a.required){
					throw new Error('Not enough arguments.');
				}
				// create collection of remaining arguments
				output.push(rawArgs.splice(0, rawArgs.length));
			}
			// a single optional or required argument
			else{
				// if argument is required but now raw argument given
				// there are not enough raw arguments
				if(a.required && rawArgs.length === 0){
					throw new Error('Not enough arguments.');
				}
				// if argument is optional and no raw argument given, continue
				if(!a.required && rawArgs.length === 0){
					return;
				}
				// if raw argument is given and argument is required or optional,
				// add it to output
				output.push(rawArgs.splice(0, 1)[0]);
			}
		});
		
		// if raw arguments still remain, there are too many arguments		
		if(rawArgs.length){
			throw new Error('Too Many Arguments');
		}

		return output;

	};


	// call call back function with parsed arguments
	self.run = function (args){
		self.fn.apply(undefined, self._getArgs(args));
	};
};