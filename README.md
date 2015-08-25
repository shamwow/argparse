# ArgvParser

Simple command line argument parser. Allows the easy specification of required and optional arguments for command line utilities.

### Installation

```sh
$ npm i argvparser --save
```

### Usage

```
var ArgvParser = require('argvparser'),
    program = new ArgvParser();

program.register('<required_arg> [optional_arg]', function (rarg, oarg, options, flags) {
    console.log('Required Arg: ', rarg);
    console.log('Optional Arg: ', oarg);
});

// Register calls can be chained [ArgvParser::register() returns instance of ArgvParser]
program
    .register('test [optional_arg] --test', function (oarg, options, flags) {
        // flags.test === true or false
        console.log('Optional Argument', oarg);
    })
    .register('test2 -o:2 <required_tuple, 3>', function (tuple, options, flags) {
        // options.o.length === 3 (if option o is given)
        // tuple.length == 3
        console.log('Tuple Argument', tuple);
    });

// to actually parse arguments call ArgvParser::parse()
program.parse();

```
### API
##### ArgvParser::register(cmd_template, cb, [failCb])
`cmd_template`: a string giving the command template. See command template grammer for full details. Some notes:
- Flag and option ids must start with a letter and only contain letters and numbers.
- Arguments with sequence modifier (`...` or `..INT`) passed to callback in arrays.
- Arguments with tuple modifier (`<ID, INT>` or `[ID, INT]`) passed to callback in arrays.
- So `<ID, 2>..2` would be passed to callback as an array of arrays of two element (`[[1, 2], [1, 2]]`).
- Options expect 1 argument by default. Can be changed with quantifier (`-option_name:INT`).
- `INT > 0`

`cb`: callback to be called when a command matches the given template. `cb` passed required and optional arguments followed by a maps of `options` and `flags`. See more examples for more details.

`failCb`: optional failure callback. If specified, will be called with error that occured. Otherwise, if not given, error is thrown. An example error that could occur: `new Error('Not enough arguments given for option test;')`


### More Examples
Assume script is located in `./script`
Command template following by script calls and corresponding argument values.
```
program.register('<required_arg> -o [optional_arg]...', function (rarg, oarg, options, flags) {
    ...
});

$ ./script arg1 arg2 arg3
    rarg = 'arg1'
    oarg = ['arg2', 'arg3']
    options = {
        o: undefined
    }
    flags = {}

$ ./script arg1 arg2 -o test
    rarg = 'arg1'
    oarg = 'arg2'
    options = {
        o: 'test'
    }
    flags = {}
```

```
program.register('<required_arg>..2 -o:2 --flag [optional_arg, 2]...', function (rarg, oarg, options, flags) {
    ...
});

$ ./script arg1 arg2 arg3 arg4
    rarg = ['arg1', 'arg2']
    oarg = [['arg3', 'arg4']]
    options = {
        o: undefined
    }
    flags = {
        flag: false
    }

$ ./script arg1 arg2 -o test --flag
    rarg = ['arg1', 'arg2']
    oarg = undefined
    options = {
        o: 'test'
    }
    flags = {
        flag: true
    }
```


### Command Template Grammar

ε corresponds to the empty string.
```
template = ids aofs
ids = id ids
    = ε
aofs = aof aofs
     = lastaof
aof = rarg
    = option
    = flag
rarg = <ID>
     = <ID, INT>
     = <ID>..INT
     = <ID, INT>..INT
option = -ID
       = -ID:INT
flag = --ID
lastaof = lastarg ofs
ofs = option ofs
    = flag ofs
    = ε
lastarg = rarg
        = <ID>...
        = <ID, INT>...
        = [ID]
        = [ID, INT]
        = [ID]..INT
        = [ID, INT]..INT
        = [ID]...
        = [ID, INT]...

Infinite and optional arguments must appear last.
```

License
----

MIT

