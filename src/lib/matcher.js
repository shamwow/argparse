import Reader from './reader';
import MapUtils from '../utils/MapUtils';

export default class Matcher extends Reader {
    constructor(tokens, template) {
        super(tokens);

        this.template = template;
        this.args = [];
        this.flags = MapUtils.defaultMap(Object.keys(this.template.flags), false);
        this.options = MapUtils.defaultMap(Object.keys(this.template.options), () => []);
    }

    _throw(err) {
        throw new Error(`${err}.`);
    }

    _unwrapArr(item) {
        if (Array.isArray(item) && item.length === 1) {
            return item[0];
        }
        return item;
    }

    _readArgs(node, givenSequences, msg) {
        givenSequences = givenSequences || 0;
        const tupleArgs = [];
        const argName = (node.type === 'RARG') ? 'required' : 'optional';
        for (let i = 0; i < node.tupleSize; i++) {
            const errMsg = (node.sequenceSize === Infinity) ?
                    `Expected ${node.tupleSize} more argument(s) for ${argName} `
                    + `argument ${node.value}. Given ${i} argument(s)` :
                    `Expected ${node.sequenceSize * node.tupleSize} argument(s)`
                    + ` for ${argName} argument ${node.value}. `
                    + `Given ${givenSequences * node.tupleSize + i} argument(s)`;

            this._expect('ID', msg || errMsg);
            tupleArgs.push(this._read().value);
        }
        return tupleArgs;
    }

    match() {
        // Process IDs - Sanity check.
        this.template.ids.forEach(node => {
            const ids = this.template.ids.map(node => node.value);
            this._expect(`ID:${node.value}`,
                    `Expected ${this.template.ids.length} id(s) - ${ids.join(' ')}`);
            this._read();
        });

        // Process options + arguments and flags.
        const tokens = [];
        let i = 0;
        while (i < this.unread.length) {
            if (this.unread[i].type === 'OPTION') {
                // Options always begin with '-'.
                const id = this.unread[i].value.substring(1);
                const option = this.template.options[id];
                // If option is invalid, throw.
                if (!option) {
                    this._throw('Invalid option used');
                }
                // As we have processed a token, increment the counter.
                i++;
                // Process option arguments.
                for (let j = 0; j < option.args; j++) {
                    const token = this.unread[i];
                    if (!token || token.type !== 'ID') {
                        this._throw(`Not enough arguments given for option ${id}. `
                                + `Expected ${option.args}. Given ${j}`);
                    }
                    // Add token to option arguments.
                    this.options[id].push(token.value);
                    // As we have processed a token, increment the counter.
                    i++;
                }
            }
            else if (this.unread[i].type === 'FLAG') {
                // Flags always begin with '--'.
                const id = this.unread[i].value.substring(2);
                if (!this.template.flags[id]) {
                    this._throw('Invalid flag used');
                }
                this.flags[id] = true;
                // As we have processed a token, increment the counter.
                i++;
            }
            else {
                // Add this token to the list of non option and flag related tokens.
                tokens.push(this.unread[i]);
                // As we have processed a token, increment the counter.
                i++;
            }
        }

        // New list of unread tokens is list of non option and flag related tokens.
        this.unread = tokens;

        // Filter out option and flag nodes from command template.
        const nodes = this.template.nodeSequence.filter(node =>
                node.type !== 'FLAG' && node.type !== 'OPTION' && node.type !== 'ID');

        // All we have left are required args and optional args.
        // RARGs and OARGs read as a sewuence of tuples. For non infinite
        // arguments, if a tuple is of size 1, it is unwrapped. Similarily,
        // if a sequence if of size 1, it is unwrapped.
        nodes.forEach(node => {
            if (node.type === 'RARG') {
                // If RARG is non infinite, we expect there to be sequenceSize * tupleSize
                // arguments.
                if (node.sequenceSize !== Infinity) {
                    const tupleSeq = [];

                    for (let i = 0; i < node.sequenceSize; i++) {
                        // Read ${tupleSize} arguments and add them to the sequence list.
                        // If tupleSize === 1, then unwrap the array and then add it to the
                        // sequence list.
                        tupleSeq.push(this._unwrapArr(this._readArgs(node, i)));
                    }

                    // Add sequence list to final arguments list. If sequence list has 1 element
                    // unwrap the array and add it the final arguments list.
                    this.args.push(this._unwrapArr(tupleSeq));
                }
                // If RARG is inifinte, we expect 1 or more tuples.
                else {
                    // Get one expected tuple, unwrapping if tuple is of size 1.
                    const tupleSeq = [this._unwrapArr(this._readArgs(node, 0))];

                    // As long as there is more input available...
                    while (this._softExpect('ID')) {
                        // Read ${tupleSize} arguments and add them to the sequence list.
                        // If tupleSize === 1, then unwrap the array and then add it to the
                        // sequence list.
                        tupleSeq.push(this._unwrapArr(this._readArgs(node)));
                    }

                    // Add sequence list to final arguments list. Don't unwrap as infinite
                    // arguments always contained in an array.
                    this.args.push(tupleSeq);
                }
            }
            else if (node.type === 'OARG') {
                // If OARG is non infinite, we expect there to be sequenceSize * tupleSize
                // arguments, only if the next token is an ID.
                if (node.sequenceSize !== Infinity && this._softExpect('ID')) {
                    const tupleSeq = [];

                    for (let i = 0; i < node.sequenceSize; i++) {
                        tupleSeq.push(this._unwrapArr(this._readArgs(node, i)));
                    }

                    this.args.push(this._unwrapArr(tupleSeq));
                }
                // If OARG is non infinite and next token is not an ID, then the optional
                // argument is not included. So push undefined.
                else if (node.sequenceSize !== Infinity && !this._softExpect('ID')) {
                    this.args.push(undefined);
                }
                // If OARG is infinite we expect 0 or more tuples.
                else if (node.sequenceSize === Infinity) {
                    // Don't get 1st tuple as we did with RARG.
                    const tupleSeq = [];

                    // As long as there is more input available...
                    while (this._softExpect('ID')) {
                        // Read ${tupleSize} arguments and add them to the sequence list.
                        // If tupleSize === 1, then unwrap the array and then add it to the
                        // sequence list.
                        tupleSeq.push(this._unwrapArr(this._readArgs(node)));
                    }

                    if (tupleSeq.length) {
                        // Add sequence list to final arguments list. Don't unwrap as infinite
                        // arguments always contained in an array.
                        this.args.push(tupleSeq);
                    }
                    // As optional, we could have 0 tuples.
                    else {
                        // If we do, push undefined.
                        this.args.push(undefined);
                    }
                }
            }
            // If a non RARG or OARG, something went wrong.
            else {
                this._throw('Unexpected node type');
            }
        });

        // If we tokens remaining, there were too many tokens in the input.
        if (this.unread.length) {
            this._throw('Too many arguments given');
        }

        // Remove empty and single element arrays from options.
        for (let option in this.options) {
            if (this.options[option].length === 0) {
                this.options[option] = undefined;
            }
            else if (this.options[option].length === 1) {
                this.options[option] = this.options[option][0];
            }
        }

        return { args: this.args, options: this.options, flags: this.flags };
    }
}
