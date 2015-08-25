import Matcher from './lib/Matcher';
import Parser from './lib/Parser';
import { InputTokenizer, PatternTokenizer } from './lib/Tokenizer';

export default class ArgvParser {
    constructor() {
        this.commands = {};
    }

    /**
        Helper that throws an error, printing the usage message if one is provided.

        Arguments:
            msg: Error message to print in addition to usage message.
    **/
    _throw(err, msg='') {
        let errMessage = msg;

        if (errMessage.length) {
            err.message = errMessage + '\n\n' + err.message;
        }

        throw err;
    }

    /**
        Registers a particular command. Returns ArgvParser object to allow for chaining.

        Arguments:
            pattern - Command pattern to register.
            fn - Function associate with command pattern.
                Last two arguments will be options and flags
            fail - Failure callback to call on command match fail.
    **/
    register(pattern, fn, fail) {
        // Type validation.
        if (typeof pattern !== 'string') {
            throw new Error('Pattern template must be a string');
        }
        if (typeof fn !== 'function') {
            throw new Error('Callback function must be a function');
        }

        // Tokenize pattern.
        let tokens;
        try {
            tokens = PatternTokenizer.scan(pattern);
        }
        catch (e) {
            this._throw(e, 'Unable to tokenize command pattern.');
        }

        // Parse command template tokens.
        let commandTemplate;
        try {
            commandTemplate = new Parser(tokens).parse();
        }
        catch (e) {
            this._throw(e, 'Unable to parse command template tokens.');
        }

        // Get id for this command.
        const id = commandTemplate.ids.map(node => node.value).join('');
        if (this.commands[id]) {
            this._throw(new Error('Commands must have unique identifiers.'));
        }

        this.commands[id] = {
            template: commandTemplate,
            fn: fn,
            fail: fail
        };

        return this;
    }

    /**
        Parse process.argv array, matching it to a registered command and calling the
        corresponding function.
    **/
    parse(manualArguments) {
        // First two arguments will be node and the name of the script file,
        // so we can remove them.
        let args;

        if (manualArguments) {
            args = manualArguments.join(' ');
        }
        else {
            args = [].slice.call(process.argv, 2).join(' ');
            if (process.argv[0] !== 'node') {
                console.warn('Expecting first two arguments of process.argv to be `node` and the filename.');
            }
        }

        // Tokenize the input.
        const tokens = InputTokenizer.scan(args);

        // Get id for command. Uses a greedy approach. For example, if input is
        // 'test two three four ...' and we have registered commands with ids 'test' and
        // 'test two three', the command with id 'test two three' will be matched.
        let id = '';
        let lastCommand = this.commands[id];
        for (let i = 0; i < tokens.length; i++) {
            // If token is an ID, match add it to the id string and check if
            // it corresponds to a command.
            if (tokens[i].type === 'ID') {
                id += tokens[i].value;
                if (this.commands[id]) {
                    // If it does, store the command.
                    lastCommand = this.commands[id];
                }
            }
            // All command ids must appear before any flags or options. If we encounter a
            // non id token, there is no need to keep looking for ids.
            else {
                break;
            }
        }

        // If we didn't find a valid command, throw.
        if (!lastCommand) {
            this._throw(new Error('Unknown command.'));
        }

        let result;
        try {
            // Otherwise match the input with the correct command template.
            result = new Matcher(tokens, lastCommand.template).match();
        }
        catch (e) {
            if (lastCommand.fail) {
                fail(e);
                return;
            }
            else {
                throw e;
            }
        }

        // Then call the corresponding function.
        lastCommand.fn.apply(this.callee, result.args.concat(result.options, result.flags));
    }
}
