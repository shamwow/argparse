# ArgvParser

Simple command line argument (not flag) parser.

### Installation

```sh
$ npm i argvparser --save
```

### Usage

```
var ArgvParser = require('argvparser'),
    program = new ArgvParser();

// global namespace is triggered as toplevel command (see example command templates for clarification)
program.register('global <required_arg> [optional_arg]', function (rarg, oarg){
    console.log('Required Arg: ', rarg);
    console.log('Optional Arg: ', oarg);
});

// register calls can be chained [ArgsParser::register() returns instance of ArgsParser]
program
    .register('test [optional_arg]', function (oarg){
        console.log('Optional Argument', oarg);
    })
    .register('test2 <required_tuple, 3>', function (tuple){
        // tuple.length == 3
        console.log('Tuple Argument', tuple);
    });
    
// to actually parse arguments call ArgsParser::parse()
program.parse();

```

### Command Template Grammar

```
command_template = name rarg 0.. oarg_mod 0..
where
    name = string (no whitespaces, cannot equal node)
    
    rarg = <name> (required argument)
         = <name, N> (required N-tuple)
    
    oarg = [name] (optional argument)
         = [name, N] (optional N-tuple)

    oarg_mod = oarg
             = oarg... (infinite modifier)

infinite and optional arguments must appear last
```
Example Command Templates and Matching Commands:
(Assume script is defined in ./myfile)
```
global <required_inf_arg>...
$  ./myfile test
$  ./myfile test test2
$  ./myfile test test2 test3
```
```
sub_cmd <required_inf_arg, 2>...
$  ./myfile sub_cmd test test2
$  ./myfile sub_cmd test test2 test3 test4
```
```
tuple <required_inf_arg, 3> [optional_inf_arg]...
$  ./myfile tuple test test2 test3
$  ./myfile tuple test test2 test3 test4
$  ./myfile tuple test test2 test3 test4 test6
```
```
optional_tuple [optional_inf_tuple, 2]...
$  ./myfile optional_tuple
$  ./myfile optional_tuple test test2
$  ./myfile optional_tuple arg1 arg2 arg3 arg4
```


### Todo's

 - Write Tests!
 - Introduce support for flag parsing
 - Auto document generation (maybe)

License
----

MIT

