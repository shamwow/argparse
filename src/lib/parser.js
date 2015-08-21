import Reader from './reader';

export class CommandTemplate {
    constructor(args) {
        this.rargs = args.rargs;
        this.oarg = args.oarg;
        this.options = args.options;
        this.flags = args.flags;
        this.ids = args.ids;
        this.nodeSequence = args.nodeSequence;
    }
}

export class Node {
    constructor(type, value, position) {
        this.type = type;
        this.value = value;
        this.position = position;
    }
};

export class RArgNode extends Node {
    constructor(value, position, tupleSize, sequenceSize) {
        super('RARG', value, position);
        this.tupleSize = tupleSize;
        this.sequenceSize = sequenceSize;
    }
};

export class OArgNode extends Node {
    constructor(value, position, tupleSize, sequenceSize) {
        super('OARG', value, position);
        this.tupleSize = tupleSize;
        this.sequenceSize = sequenceSize;
    }
};

export class FlagNode extends Node {
    constructor(value, position) {
        super('FLAG', value, position);
    }
};

export class OptionNode extends Node {
    constructor(value, position, args=1) {
        super('OPTION', value, position);
        this.args = args;
    }
};

export default class Parser extends Reader {
    constructor(tokens) {
        super(tokens);

        this.ids = [];
        this.global = false;
        this.rargs = [];
        this.oarg;
        this.flags = {};
        this.options = {};
        this.nodeSequence = [];
    }

    _parseIds() {
        while (this.unread.length > 0) {
            if (this.unread[0].type === 'ID') {
                const node = new Node('ID', this.unread[0].value, this.nodeSequence.length);
                this.ids.push(node);
                this._read();
                this.nodeSequence.push(node);
            }
            else {
                break;
            }
        }
    }

    parse() {
        let lastArg = false;
        this._parseIds();
        while (this.unread.length > 0) {
            // Required arg.
            if (this.unread[0].type === 'LANGLE') {
                if (lastArg) {
                    this._throw('Optional and infinite arguments must be last');
                }

                let id, sequenceSize = 1, tupleSize = 1;

                this._expect('LANGLE', 'ID');
                this._read();

                id =  this.unread[0].value;

                this._read();
                if (this.unread[0].type === 'COMMA') {
                    this._expect('COMMA', 'INT');
                    this._read();
                    tupleSize = parseInt(this.unread[0]);
                    this._read();
                }
                if (this.unread[0].type === 'RANGLEELIP') {
                    sequenceSize = Infinity;
                    lastArg = true;
                }
                else if (this.unread[0].type === 'RANGLENUM') {
                    sequenceSize = parseInt(this.unread[0].value.substring(3));
                }
                else {
                    this._expect('RANGLE');
                }
                this._read();

                const node = new RArgNode(id, this.nodeSequence.length, tupleSize, sequenceSize);
                this.rargs.push(node);
                this.nodeSequence.push(node);
            }
            // Optional arg.
            else if (this.unread[0].type === 'LBRACK') {
                if (lastArg) {
                    this._throw('Optional and infinite arguments must be last');
                }

                let id, sequenceSize = 1, tupleSize = 1;

                this._expect('LBRACK', 'ID');
                this._read();

                id =  this.unread[0].value;

                this._read();
                if (this.unread[0].type === 'COMMA') {
                    this._expect('COMMA', 'INT');
                    this._read();
                    tupleSize = parseInt(this.unread[0]);
                    this._read();
                }
                if (this.unread[0].type === 'RBRACKELIP') {
                    sequenceSize = Infinity;
                }
                else if (this.unread[0].type === 'RBRACKNUM') {
                    sequenceSize = parseInt(this.unread[0].value.substring(3));
                }
                else {
                    this._expect('RBRACK');
                }
                this._read();

                lastArg = true;

                const node = new OArgNode(id, this.nodeSequence.length, tupleSize, sequenceSize);
                this.oarg = node;
                this.nodeSequence.push(node);
            }
            else if (this.unread[0].type === 'FLAG') {
                // Skip initial '--';
                let id = this.unread[0].value.substring(2);
                if (this.flags[id]) {
                    this._throw('Flags must be have unique ids');
                }

                const node = new FlagNode(id, this.nodeSequence.length);
                this.flags[id] = node;
                this.nodeSequence.push(node);
                this._read();
            }
            else if (this.unread[0].type === 'OPTION') {
                // Skip initial '-';
                let id = this.unread[0].value.substring(1);
                if (this.options[id]) {
                    this._throw('Options must be have unique ids');
                }

                const node = new OptionNode(id, this.nodeSequence.length);
                this.options[id] = node;
                this.nodeSequence.push(node);
                this._read();
            }
            else if (this.unread[0].type === 'NUMBEREDOPTION') {
                // Skip initial '-';
                const raw = this.unread[0].value.substring(1).split(':');
                let id = raw[0], n = parseInt(raw[1]);
                if (this.options[id]) {
                    this._throw('Options must be have unique ids');
                }

                const node = new OptionNode(id, this.nodeSequence.length, n);
                this.options[id] = node;
                this.nodeSequence.push(node);
                this._read();
            }
            else {
                this._throw('Invalid token');
            }
        }

        return new CommandTemplate({
            rargs: this.rargs,
            oarg: this.oarg,
            options: this.options,
            flags: this.flags,
            ids: this.ids,
            nodeSequence: this.nodeSequence
        });
    }
};
