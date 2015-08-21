import assert from 'assert';
import { CommandTemplate, FlagNode, Node, OArgNode, OptionNode, RArgNode } from '../lib/Parser';
import Parser from '../lib/Parser';
import { PatternTokenizer } from '../lib/Tokenizer';

describe('Command Template Parser', () => {
    const nodeEquality = (node1, node2) => {
        assert.equal(node1.value, node2.value);
        assert.equal(node1.type, node2.type);
        assert.equal(node1.position, node2.position);
    };

    const argEquality = (arg1, arg2) => {
        assert.equal(arg1.value, arg2.value);
        assert.equal(arg1.tupleSize, arg2.tupleSize);
        assert.equal(arg1.sequenceSize, arg2.sequenceSize);
        assert.equal(arg1.type, arg2.type);
        assert.equal(arg1.position, arg2.position);
    };

    const optionEquality = (option1, option2) => {
        assert.equal(option1.value, option2.value);
        assert.equal(option1.type, option2.type);
        assert.equal(option1.position, option2.position);
        assert.equal(option1.args, option2.args);
    };

    it('should parse a sequence of tokens correctly', () => {
        // test two <rarg1> <rarg2, 9>
        const input = [
            new PatternTokenizer.Token('ID', 'test'),
            new PatternTokenizer.Token('ID', 'two'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg1'),
            new PatternTokenizer.Token('RANGLE', '>'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg2'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('RANGLE', '>')
        ];

        const actual = new Parser(input).parse();
        const expectedSeq = [
            new Node('ID', 'test', 0),
            new Node('ID', 'two', 1),
            new RArgNode('rarg1', 2, 1, 1),
            new RArgNode('rarg2', 3, 9, 1)
        ];
        const expected = new CommandTemplate({
            rargs: [expectedSeq[2], expectedSeq[3]],
            oarg: undefined,
            ids: [expectedSeq[0], expectedSeq[1]],
            options: {},
            flags: {},
            nodeSequence: expectedSeq
        });

        assert.equal(actual.oarg, expected.oarg);
        assert.deepEqual(actual.flags, {});
        assert.deepEqual(actual.options, {});
        nodeEquality(actual.ids[0], expected.ids[0]);
        nodeEquality(actual.ids[1], expected.ids[1]);
        argEquality(actual.rargs[0], expected.rargs[0]);
        argEquality(actual.rargs[1], expected.rargs[1]);

        nodeEquality(actual.nodeSequence[0], expectedSeq[0]);
        nodeEquality(actual.nodeSequence[1], expectedSeq[1]);
        argEquality(actual.nodeSequence[2], expectedSeq[2]);
        argEquality(actual.nodeSequence[3], expectedSeq[3]);
    });

    it('should parse an empty list correctly', () => {
        const actual = new Parser([]).parse();
        const expected = new CommandTemplate({
            rargs: [],
            oarg: undefined,
            options: {},
            flags: {},
            ids: [],
            nodeSequence: []
        });

        assert.deepEqual(actual.rargs, expected.rargs);
        assert.deepEqual(actual.options, expected.options);
        assert.deepEqual(actual.flags, expected.flags);
        assert.deepEqual(actual.ids, expected.ids);
        assert.deepEqual(actual.nodeSequence, expected.nodeSequence);
        assert.equal(actual.oarg, expected.oarg);
    });

    it('should parse a sequence of tokens correctly, with options and flags', () => {
        // two -o <rarg1> --flag -option:7
        const input = [
            new PatternTokenizer.Token('ID', 'two'),
            new PatternTokenizer.Token('OPTION', '-o'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg1'),
            new PatternTokenizer.Token('RANGLE', '>'),
            new PatternTokenizer.Token('FLAG', '--flag'),
            new PatternTokenizer.Token('NUMBEREDOPTION', '-option:7')
        ];

        const actual = new Parser(input).parse();
        const expectedSeq = [
            new Node('ID', 'two', 0),
            new OptionNode('o', 1, 1),
            new RArgNode('rarg1', 2, 1, 1),
            new FlagNode('flag', 3),
            new OptionNode('option', 4, 7)
        ];
        const expected = new CommandTemplate({
            rargs: [expectedSeq[2]],
            oarg: undefined,
            ids: [expectedSeq[0]],
            options: {
                o: expectedSeq[1],
                option: expectedSeq[4]
            },
            flags: {
                flag: expectedSeq[3]
            },
            nodeSequence: expectedSeq
        });

        assert.equal(actual.oarg, expected.oarg);

        nodeEquality(actual.ids[0], expected.ids[0]);
        argEquality(actual.rargs[0], expected.rargs[0]);
        optionEquality(actual.options['o'], expected.options['o']);
        optionEquality(actual.options['option'], expected.options['option']);
        nodeEquality(actual.flags['flag'], expected.flags['flag']);

        nodeEquality(actual.nodeSequence[0], expectedSeq[0]);
        argEquality(actual.nodeSequence[1], expectedSeq[1]);
        optionEquality(actual.nodeSequence[2], expectedSeq[2]);
        nodeEquality(actual.nodeSequence[3], expectedSeq[3]);
        optionEquality(actual.nodeSequence[4], expectedSeq[4]);
    });

    it('should parse a sequence of tokens correctly, with an ' +
            'optional argument and required argument tuple', () => {
        // two <rarg1, 9> <rarg2, 1> [oarg]
        const input = [
            new PatternTokenizer.Token('ID', 'two'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg1'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('RANGLE', '>'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg2'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '1'),
            new PatternTokenizer.Token('RANGLE', '>'),
            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg'),
            new PatternTokenizer.Token('RBRACK', ']')
        ];

        const actual = new Parser(input).parse();
        const expectedSeq = [
            new Node('ID', 'two', 0),
            new RArgNode('rarg1', 1, 9, 1),
            new RArgNode('rarg2', 2, 1, 1),
            new OArgNode('oarg', 3, 1, 1)
        ];
        const expected = new CommandTemplate({
            rargs: [expectedSeq[1], expectedSeq[2]],
            oarg: expectedSeq[3],
            ids: [expectedSeq[0]],
            options: {},
            flags: {},
            nodeSequence: expectedSeq
        });

        assert.deepEqual(actual.flags, expected.flags);
        assert.deepEqual(actual.options, expected.options);
        argEquality(actual.oarg, expected.oarg);

        nodeEquality(actual.ids[0], expected.ids[0]);
        argEquality(actual.rargs[0], expected.rargs[0]);
        argEquality(actual.rargs[1], expected.rargs[1]);

        nodeEquality(actual.nodeSequence[0], expectedSeq[0]);
        argEquality(actual.nodeSequence[1], expectedSeq[1]);
        argEquality(actual.nodeSequence[2], expectedSeq[2]);
        argEquality(actual.nodeSequence[3], expectedSeq[3]);
    });

    it('should parse a sequence of tokens correctly, with an ' +
            'infinite optional argument and required argument tuple with sequence size', () => {
        // two <rarg1, 9>..9 <rarg2, 1>..2 [oarg]...
        const input = [
            new PatternTokenizer.Token('ID', 'two'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg1'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('RANGLENUM', '>..9'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg2'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '1'),
            new PatternTokenizer.Token('RANGLENUM', '>..2'),
            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg'),
            new PatternTokenizer.Token('RBRACKELIP', ']...')
        ];

        const actual = new Parser(input).parse();
        const expectedSeq = [
            new Node('ID', 'two', 0),
            new RArgNode('rarg1', 1, 9, 9),
            new RArgNode('rarg2', 2, 1, 2),
            new OArgNode('oarg', 3, 1, Infinity)
        ];
        const expected = new CommandTemplate({
            rargs: [expectedSeq[1], expectedSeq[2]],
            oarg: expectedSeq[3],
            ids: [expectedSeq[0]],
            options: {},
            flags: {},
            nodeSequence: expectedSeq
        });

        assert.deepEqual(actual.flags, expected.flags);
        assert.deepEqual(actual.options, expected.options);
        argEquality(actual.oarg, expected.oarg);

        nodeEquality(actual.ids[0], expected.ids[0]);
        argEquality(actual.rargs[0], expected.rargs[0]);
        argEquality(actual.rargs[1], expected.rargs[1]);

        nodeEquality(actual.nodeSequence[0], expectedSeq[0]);
        argEquality(actual.nodeSequence[1], expectedSeq[1]);
        argEquality(actual.nodeSequence[2], expectedSeq[2]);
        argEquality(actual.nodeSequence[3], expectedSeq[3]);
    });

    it('should parse a sequence of tokens correctly, with an ' +
            'infinite required argument', () => {
        // two <rarg1, 9>...
        const input = [
            new PatternTokenizer.Token('ID', 'two'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg1'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('RANGLEELIP', '>...')
        ];

        const actual = new Parser(input).parse();
        const expectedSeq = [
            new Node('ID', 'two', 0),
            new RArgNode('rarg1', 1, 9, Infinity)
        ];
        const expected = new CommandTemplate({
            rargs: [expectedSeq[1]],
            oarg: undefined,
            ids: [expectedSeq[0]],
            options: {},
            flags: {},
            nodeSequence: expectedSeq
        });

        assert.deepEqual(actual.flags, expected.flags);
        assert.deepEqual(actual.options, expected.options);
        assert.equal(actual.oarg, expected.oarg);

        nodeEquality(actual.ids[0], expected.ids[0]);
        argEquality(actual.rargs[0], expected.rargs[0]);
    });

    it('should parse a sequence of tokens correctly, with an ' +
            'infinite optional argument and required argument tuple with sequence size', () => {
        // two <rarg1, 9>..9 <rarg2, 1>..2 [oarg]...
        const input = [
            new PatternTokenizer.Token('ID', 'two'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg1'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('RANGLENUM', '>..9'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg2'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '1'),
            new PatternTokenizer.Token('RANGLENUM', '>..2'),
            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg'),
            new PatternTokenizer.Token('RBRACKELIP', ']...')
        ];

        const actual = new Parser(input).parse();
        const expectedSeq = [
            new Node('ID', 'two', 0),
            new RArgNode('rarg1', 1, 9, 9),
            new RArgNode('rarg2', 2, 1, 2),
            new OArgNode('oarg', 3, 1, Infinity)
        ];
        const expected = new CommandTemplate({
            rargs: [expectedSeq[1], expectedSeq[2]],
            oarg: expectedSeq[3],
            ids: [expectedSeq[0]],
            options: {},
            flags: {},
            nodeSequence: expectedSeq
        });

        assert.deepEqual(actual.flags, expected.flags);
        assert.deepEqual(actual.options, expected.options);
        argEquality(actual.oarg, expected.oarg);

        nodeEquality(actual.ids[0], expected.ids[0]);
        argEquality(actual.rargs[0], expected.rargs[0]);
        argEquality(actual.rargs[1], expected.rargs[1]);

        nodeEquality(actual.nodeSequence[0], expectedSeq[0]);
        argEquality(actual.nodeSequence[1], expectedSeq[1]);
        argEquality(actual.nodeSequence[2], expectedSeq[2]);
        argEquality(actual.nodeSequence[3], expectedSeq[3]);
    });

    it('should parse a sequence of tokens correctly, with a ' +
            'sequence of optional arguments', () => {
        // two [oarg1, 9]...
        const input = [
            new PatternTokenizer.Token('ID', 'two'),
            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg1'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('RBRACKELIP', ']...')
        ];

        const actual = new Parser(input).parse();
        const expectedSeq = [
            new Node('ID', 'two', 0),
            new OArgNode('oarg1', 1, 9, Infinity)
        ];
        const expected = new CommandTemplate({
            rargs: [],
            oarg: expectedSeq[1],
            ids: [expectedSeq[0]],
            options: {},
            flags: {},
            nodeSequence: expectedSeq
        });

        assert.deepEqual(actual.flags, expected.flags);
        assert.deepEqual(actual.options, expected.options);
        assert.deepEqual(actual.rargs, expected.rargs);

        nodeEquality(actual.ids[0], expected.ids[0]);
        argEquality(actual.oarg, expected.oarg);
    });

    it('should throw when given RBRACK instead of RANGLE', () => {
        // <rarg1, 9]
        const input = [
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg1'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('RBRACK', ']')
        ];

        assert.throws(() => new Parser(input).parse(), err => err.message ===
                `Unexpected token. Expected RANGLE. Recieved RBRACK:]. Read input: < rarg1 , 9. Unread Input: ].`);
    });

    it('should throw when given INT instead of RBRACK', () => {
        // [oarg1, 9 90
        const input = [
            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg1'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('INT', '90')
        ];

        assert.throws(() => new Parser(input).parse(), err => err.message ===
                `Unexpected token. Expected RBRACK. Recieved INT:90. Read input: [ oarg1 , 9. Unread Input: 90.`);
    });

    it('should throw when optional argument is not last', () => {
        // [oarg] <rarg>
        const input = [
            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg'),
            new PatternTokenizer.Token('RBRACK', ']'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg'),
            new PatternTokenizer.Token('RANGLE', '>')
        ];

        assert.throws(() => new Parser(input).parse(), err => err.message ===
                `Optional and infinite arguments must be last. Read input: [ oarg ]. Unread Input: < rarg >.`);
    });

    it('should throw when required infinite argument is not last', () => {
        // <rarg1>... <rarg2>
        const input = [
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg1'),
            new PatternTokenizer.Token('RANGLEELIP', '>...'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg2'),
            new PatternTokenizer.Token('RANGLE', '>')
        ];

        assert.throws(() => new Parser(input).parse(), err => err.message ===
                `Optional and infinite arguments must be last. Read input: < rarg1 >.... Unread Input: < rarg2 >.`);
    });

    it('should throw when optional infinite argument is not last', () => {
        // [oarg]... <rarg>
        const input = [
            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg'),
            new PatternTokenizer.Token('RBRACKELIP', ']...'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg'),
            new PatternTokenizer.Token('RANGLE', '>')
        ];

        assert.throws(() => new Parser(input).parse(), err => err.message ===
                `Optional and infinite arguments must be last. Read input: [ oarg ].... Unread Input: < rarg >.`);
    });

    it('should throw when id appears in incorrect position', () => {
        // test <rarg> test2
        const input = [
            new PatternTokenizer.Token('ID', 'test'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg'),
            new PatternTokenizer.Token('RANGLE', '>'),
            new PatternTokenizer.Token('ID', 'test2')
        ];

        assert.throws(() => new Parser(input).parse(), err => err.message ===
                `Invalid token. Read input: test < rarg >. Unread Input: test2.`);
    });

    it('should throw when numbered options are not unique', () => {
        // test -o:3 -o:2
        const input = [
            new PatternTokenizer.Token('ID', 'test'),
            new PatternTokenizer.Token('NUMBEREDOPTION', '-o:3'),
            new PatternTokenizer.Token('NUMBEREDOPTION', '-o:2')
        ];

        assert.throws(() => new Parser(input).parse(), err => err.message ===
                `Options must be have unique ids. Read input: test -o:3. Unread Input: -o:2.`);
    });

    it('should throw when options are not unique', () => {
        // test -o:3 -o
        const input = [
            new PatternTokenizer.Token('ID', 'test'),
            new PatternTokenizer.Token('NUMBEREDOPTION', '-o:3'),
            new PatternTokenizer.Token('OPTION', '-o')
        ];

        assert.throws(() => new Parser(input).parse(), err => err.message ===
                `Options must be have unique ids. Read input: test -o:3. Unread Input: -o.`);
    });

    it('should throw when flags are not unique', () => {
        // test --o --o
        const input = [
            new PatternTokenizer.Token('ID', 'test'),
            new PatternTokenizer.Token('FLAG', '--o'),
            new PatternTokenizer.Token('FLAG', '--o')
        ];

        assert.throws(() => new Parser(input).parse(), err => err.message ===
                `Flags must be have unique ids. Read input: test --o. Unread Input: --o.`);
    });
});
