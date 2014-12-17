module.exports = (function (){
	
	/*
		Returns an accumulator function that takes in
		a [base] and an [elem] and concatnates them using [sep]

		Arguments: seperator [sep] <string>
	*/
	var stringAccumulator = function (sep){
		return function (base, elem){
			return base + ((elem) ? elem + sep : '');
		};
	};


	/*
		Returns true if array has unique elements
	*/
	Array.prototype.unique = function (){
		var accum = {};
		this.forEach(function (elem){
			if(accum[elem]) return false;
			accum[elem] = true;
		});
		return true;
	};

	/*
		Continously applies regex to given string until all matches have been found
		Each match is an array matched groups in the regex
		Returns collection of those matches

		Arguments: given string [string] <string>
							 sequence of groups to extract <int>
	*/
	RegExp.prototype.matchAll = function (string){
		// type assertion
		if(typeof string != 'string'){ throw new TypeError("Input to matchAll must be a string."); }

		var current = this.exec(string), 
				output = [],
				// get sequence of groups to extract
				idx = [].slice.call(arguments, 1);

		while(current){
			var groups = [];
			// if speicifc sequence of target groups is defined
			if(idx.length){
				for(var i = 0; i < idx.length; i++){
					groups.push(current[idx[i]] || '');
				}
			}
			// otherwise, extract all groups
			else{
				groups = current.slice(1);
			}
			output.push(groups);
			// aplly regex again
			current = this.exec(string);
		}
		return output;
	};


})();
