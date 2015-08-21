import assert from 'assert';
import { CommandTemplate, FlagNode, Node, OArgNode, OptionNode, RArgNode } from '../lib/parser';
import { InputTokenizer, PatternTokenizer } from '../lib/tokenizer';
import Matcher from '../lib/matcher';

describe('Matcher', () => {
    describe('valid inputs for \'test <rarg> -t:2 [oarg]... -o --flag --test\'.', () => {
        const seq = [
            new Node('ID', 'test', 0),
            new RArgNode('rarg', 1, 1, 1),
            new OptionNode('t', 2, 2),
            new OArgNode('oarg', 3, 1, Infinity),
            new OptionNode('o', 4, 1),
            new FlagNode('flag', 5),
            new FlagNode('test', 6)
        ];
        const template = new CommandTemplate({
            ids: [seq[0]],
            rargs: [seq[1]],
            oarg: seq[3],
            options: {
                o: seq[4],
                t: seq[2],
            },
            flags: {
                flag: seq[5],
                test: seq[6]
            },
            nodeSequence: seq
        });

        it('should properly match valid input: \'test input 90 -t test90 test80 --flag\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'input'),
                new InputTokenizer.Token('ID', '90'),
                new InputTokenizer.Token('OPTION', '-t'),
                new InputTokenizer.Token('ID', 'test90'),
                new InputTokenizer.Token('ID', 'test80'),
                new InputTokenizer.Token('FLAG', '--flag')
            ];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [
                    'input',
                    ['90']
                ],
                options: {
                    o: undefined,
                    t: ['test90', 'test80']
                },
                flags: {
                    flag: true,
                    test: false
                }
            };

            assert.deepEqual(actual, expected);
        });

        it('should properly match valid input: \'test -t test90 test80 input 90 --flag\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('OPTION', '-t'),
                new InputTokenizer.Token('ID', 'test90'),
                new InputTokenizer.Token('ID', 'test80'),
                new InputTokenizer.Token('ID', 'input'),
                new InputTokenizer.Token('ID', '90'),
                new InputTokenizer.Token('FLAG', '--flag')
            ];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [
                    'input',
                    ['90']
                ],
                options: {
                    o: undefined,
                    t: ['test90', 'test80']
                },
                flags: {
                    flag: true,
                    test: false
                }
            };

            assert.deepEqual(actual, expected);
        });

        it('should properly match valid input: \'test input --test 90 -o test90 --flag\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'input'),
                new InputTokenizer.Token('FLAG', '--test'),
                new InputTokenizer.Token('ID', '90'),
                new InputTokenizer.Token('OPTION', '-o'),
                new InputTokenizer.Token('ID', 'test90'),
                new InputTokenizer.Token('FLAG', '--flag')
            ];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [
                    'input',
                    ['90']
                ],
                options: {
                    o: 'test90',
                    t: undefined
                },
                flags: {
                    flag: true,
                    test: true
                }
            };

            assert.deepEqual(actual, expected);
        });

        it('should properly match valid input: \'test input --flag\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'input'),
                new InputTokenizer.Token('FLAG', '--flag')
            ];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [
                    'input',
                    undefined
                ],
                options: {
                    o: undefined,
                    t: undefined
                },
                flags: {
                    flag: true,
                    test: false
                }
            };

            assert.deepEqual(actual, expected);
        });


        it('should properly match valid input: \'test input 90 80 70 --flag\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'input'),
                new InputTokenizer.Token('ID', '90'),
                new InputTokenizer.Token('ID', '80'),
                new InputTokenizer.Token('ID', '70'),
                new InputTokenizer.Token('FLAG', '--flag')
            ];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [
                    'input',
                    ['90', '80', '70']
                ],
                options: {
                    o: undefined,
                    t: undefined
                },
                flags: {
                    flag: true,
                    test: false
                }
            };

            assert.deepEqual(actual, expected);
        });

        it('should throw error when given invalid input: \'test\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'test')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Expected 1 argument(s) for required argument rarg. Given 0 argument(s).');
        });

        it('should throw error when given invalid input: \'test -t 90\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('OPTION', '-t'),
                new InputTokenizer.Token('ID', '90')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Not enough arguments given for option t. Expected 2. Given 1.');
        });

        it('should throw error when given invalid input: \'--flag test\'', () => {
            const tokens = [
                new InputTokenizer.Token('FLAG', '--flag'),
                new InputTokenizer.Token('ID', 'test')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Expected 1 id(s) - test.');
        });
    });

    describe('valid inputs for \'two test <rarg, 2>..2 -t:2 <rarg, 2>... -o --flag\'.', () => {
        const seq = [
            new Node('ID', 'two', 0),
            new Node('ID', 'test', 1),
            new RArgNode('rarg', 2, 2, 2),
            new OptionNode('t', 3, 2),
            new RArgNode('rarg', 4, 2, Infinity),
            new OptionNode('o', 5, 1),
            new FlagNode('flag', 6)
        ];
        const template = new CommandTemplate({
            ids: [seq[0], seq[1]],
            rargs: [seq[2], seq[4]],
            oarg: undefined,
            options: {
                t: seq[3],
                o: seq[5],
            },
            flags: {
                flag: seq[6]
            },
            nodeSequence: seq
        });

        it('should properly match valid input: \'two test r1 r2 r3 r4 r5 r6\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4'),
                new InputTokenizer.Token('ID', 'r5'),
                new InputTokenizer.Token('ID', 'r6')
            ];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [
                    [['r1', 'r2'], ['r3', 'r4']],
                    [['r5', 'r6']]
                ],
                options: {
                    t: undefined,
                    o: undefined
                },
                flags: {
                    flag: false
                }
            };

            assert.deepEqual(actual, expected);
        });

        it('should properly match valid input: \'two test r1 r2 r3 r4 r5 r6 r7 r8 r9 r10\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4'),
                new InputTokenizer.Token('ID', 'r5'),
                new InputTokenizer.Token('ID', 'r6'),
                new InputTokenizer.Token('ID', 'r7'),
                new InputTokenizer.Token('ID', 'r8'),
                new InputTokenizer.Token('ID', 'r9'),
                new InputTokenizer.Token('ID', 'r10')
            ];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [
                    [['r1', 'r2'], ['r3', 'r4']],
                    [['r5', 'r6'], ['r7', 'r8'], ['r9', 'r10']]
                ],
                options: {
                    t: undefined,
                    o: undefined
                },
                flags: {
                    flag: false
                }
            };

            assert.deepEqual(actual, expected);
        });

        it('should throw when given invalid input: \'two test r1 r2 r3 r4\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Expected 2 more argument(s) for required argument rarg. Given 0 argument(s).');
        });

        it('should throw when given invalid input: \'two test r1 r2 r3 r4 r5\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4'),
                new InputTokenizer.Token('ID', 'r5')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Expected 2 more argument(s) for required argument rarg. Given 1 argument(s).');
        });

        it('should throw when given invalid input: \'two test r1 r2\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Expected 4 argument(s) for required argument rarg. Given 2 argument(s).');
        });

        it('should throw when given invalid input: \'two test r1 r2 r3\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Expected 4 argument(s) for required argument rarg. Given 3 argument(s).');
        });
    });

    describe('valid inputs for \'two test <rarg, 2>..2 -t:2 [oarg, 2]..2 -o --flag\'.', () => {
        const seq = [
            new Node('ID', 'two', 0),
            new Node('ID', 'test', 1),
            new RArgNode('rarg', 2, 2, 2),
            new OptionNode('t', 3, 2),
            new OArgNode('oarg', 4, 2, 2),
            new OptionNode('o', 5, 1),
            new FlagNode('flag', 6)
        ];
        const template = new CommandTemplate({
            ids: [seq[0], seq[1]],
            rargs: [seq[2]],
            oarg: seq[4],
            options: {
                t: seq[3],
                o: seq[5],
            },
            flags: {
                flag: seq[6]
            },
            nodeSequence: seq
        });

        it('should properly match valid input: \'two test r1 r2 r3 r4\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4')
            ];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [
                    [['r1', 'r2'], ['r3', 'r4']],
                    undefined
                ],
                options: {
                    t: undefined,
                    o: undefined
                },
                flags: {
                    flag: false
                }
            };

            assert.deepEqual(actual, expected);
        });

        it('should properly match valid input: \'two test r1 r2 r3 r4 r5 r6 r7 r8\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4'),
                new InputTokenizer.Token('ID', 'r5'),
                new InputTokenizer.Token('ID', 'r6'),
                new InputTokenizer.Token('ID', 'r7'),
                new InputTokenizer.Token('ID', 'r8')
            ];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [
                    [['r1', 'r2'], ['r3', 'r4']],
                    [['r5', 'r6'], ['r7', 'r8']]
                ],
                options: {
                    t: undefined,
                    o: undefined
                },
                flags: {
                    flag: false
                }
            };

            assert.deepEqual(actual, expected);
        });

        it('should throw when given invalid input: \'two test r1 r2 r3 r4 r5\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4'),
                new InputTokenizer.Token('ID', 'r5')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Expected 4 argument(s) for optional argument oarg. Given 1 argument(s).');
        });

        it('should throw when given too many arguments: \'two test r1 r2 r3 r4 r5 r6 r7 r8 r9 r10\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4'),
                new InputTokenizer.Token('ID', 'r5'),
                new InputTokenizer.Token('ID', 'r6'),
                new InputTokenizer.Token('ID', 'r7'),
                new InputTokenizer.Token('ID', 'r8'),
                new InputTokenizer.Token('ID', 'r9'),
                new InputTokenizer.Token('ID', 'r10')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Too many arguments given.');
        });

        it('should throw when option before ids: \'-o two test r1 r2 r3 r4\'', () => {
            const tokens = [
                new InputTokenizer.Token('OPTION', '-o'),
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Expected 2 id(s) - two test.');
        });

        it('should throw when given unknown option used: \'two test r1 r2 r3 r4 -unknown test\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4'),
                new InputTokenizer.Token('OPTION', '-unknown'),
                new InputTokenizer.Token('ID', 'test')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Invalid option used.');
        });

        it('should throw when given unknown flag used: \'two test r1 r2 r3 r4 --unknown\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4'),
                new InputTokenizer.Token('FLAG', '--unknown'),
                new InputTokenizer.Token('ID', 'test')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Invalid flag used.');
        });
    });

    describe('valid inputs for \'\'.', () => {
        const template = new CommandTemplate({
            rargs: [],
            oarg: undefined,
            options: {},
            flags: {},
            ids: [],
            nodeSequence: []
        });

        it('should properly match valid input: \'\'', () => {
            const tokens = [];

            const actual = new Matcher(tokens, template).match();
            const expected = {
                args: [],
                options: {},
                flags: {}
            };

            assert.deepEqual(actual, expected);
        });

        it('should throw when given too many arguments: \'two test r1 r2 r3 r4 r5\'', () => {
            const tokens = [
                new InputTokenizer.Token('ID', 'two'),
                new InputTokenizer.Token('ID', 'test'),
                new InputTokenizer.Token('ID', 'r1'),
                new InputTokenizer.Token('ID', 'r2'),
                new InputTokenizer.Token('ID', 'r3'),
                new InputTokenizer.Token('ID', 'r4'),
                new InputTokenizer.Token('ID', 'r5')
            ];

            assert.throws(() => new Matcher(tokens, template).match(), err => err.message ===
                    'Too many arguments given.');
        });
    });
});
