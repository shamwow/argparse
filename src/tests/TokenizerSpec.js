import assert from 'assert';
import { InputTokenizer, PatternTokenizer } from '../lib/Tokenizer';

describe('Pattern Tokenizer', () => {
    it('should properly parse valid input', () => {
        const actual = PatternTokenizer.scan(
                ['global', 'id90', 'test', 'hel898lo', '<  rarg1>', '[oarg1  ]',
                '<rarg2, 90>', '[oarg2, 4]', '<rarg3>...', '[oarg3]...',
                '<rarg4>..4', '[oarg4]..6', '<rarg5, 8>...', '[oarg5, 9]...',
                '<rarg6, 8>..6', '[oarg6, 9]..6', '-o', '-o:90', '--flag'].join(' '));
        const expected = [
            new PatternTokenizer.Token('ID', 'global'),
            new PatternTokenizer.Token('ID', 'id90'),
            new PatternTokenizer.Token('ID', 'test'),
            new PatternTokenizer.Token('ID', 'hel898lo'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg1'),
            new PatternTokenizer.Token('RANGLE', '>'),
            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg1'),
            new PatternTokenizer.Token('RBRACK', ']'),
            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg2'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '90'),
            new PatternTokenizer.Token('RANGLE', '>'),

            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg2'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '4'),
            new PatternTokenizer.Token('RBRACK', ']'),

            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg3'),
            new PatternTokenizer.Token('RANGLEELIP', '>...'),

            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg3'),
            new PatternTokenizer.Token('RBRACKELIP', ']...'),

            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg4'),
            new PatternTokenizer.Token('RANGLENUM', '>..4'),

            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg4'),
            new PatternTokenizer.Token('RBRACKNUM', ']..6'),

            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg5'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '8'),
            new PatternTokenizer.Token('RANGLEELIP', '>...'),

            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg5'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('RBRACKELIP', ']...'),

            new PatternTokenizer.Token('LANGLE', '<'),
            new PatternTokenizer.Token('ID', 'rarg6'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '8'),
            new PatternTokenizer.Token('RANGLENUM', '>..6'),

            new PatternTokenizer.Token('LBRACK', '['),
            new PatternTokenizer.Token('ID', 'oarg6'),
            new PatternTokenizer.Token('COMMA', ','),
            new PatternTokenizer.Token('INT', '9'),
            new PatternTokenizer.Token('RBRACKNUM', ']..6'),

            new PatternTokenizer.Token('OPTION', '-o'),
            new PatternTokenizer.Token('NUMBEREDOPTION', '-o:90'),
            new PatternTokenizer.Token('FLAG', '--flag')
        ];
        actual.forEach((token, idx) => {
            assert.equal(token.type, expected[idx].type);
            assert.equal(token.value, expected[idx].value);
        });
    });

    it('should properly parse empty input', () => {
        const actual = PatternTokenizer.scan('');
        const expected = [];

        assert.deepEqual(actual, expected);
    });

    it('should throw when given invalid input', () => {
        assert.throws(() => PatternTokenizer.scan('<rarg, 90>..'), err => err.message ===
                'Unable to scan command pattern. Scanned: {< rarg , 90}. Error at: {>.. }.');

        assert.throws(() => PatternTokenizer.scan('<rarg, 90>.'), err => err.message ===
                'Unable to scan command pattern. Scanned: {< rarg , 90}. Error at: {>. }.');

        assert.throws(() => PatternTokenizer.scan('<rarg, 90>.90'), err => err.message ===
                'Unable to scan command pattern. Scanned: {< rarg , 90}. Error at: {>.9}.');

        assert.throws(() => PatternTokenizer.scan('[oarg, 90]..'), err => err.message ===
                'Unable to scan command pattern. Scanned: {[ oarg , 90}. Error at: {].. }.');

        assert.throws(() => PatternTokenizer.scan('[oarg, 90].'), err => err.message ===
                'Unable to scan command pattern. Scanned: {[ oarg , 90}. Error at: {]. }.');

        assert.throws(() => PatternTokenizer.scan('[oarg, 90].67'), err => err.message ===
                'Unable to scan command pattern. Scanned: {[ oarg , 90}. Error at: {].6}.');

        assert.throws(() => PatternTokenizer.scan('-90'), err => err.message ===
                'Unable to scan command pattern. Scanned: {}. Error at: {-9}.');

        assert.throws(() => PatternTokenizer.scan('--90'), err => err.message ===
                'Unable to scan command pattern. Scanned: {}. Error at: {--9}.');

        assert.throws(() => PatternTokenizer.scan('?'), err => err.message ===
                'Unable to scan command pattern. Scanned: {}. Error at: {?}.');

        assert.throws(() => PatternTokenizer.scan(':'), err => err.message ===
                'Unable to scan command pattern. Scanned: {}. Error at: {:}.');

        assert.throws(() => PatternTokenizer.scan('<rarg, 09>..'), err => err.message ===
                'Unable to scan command pattern. Scanned: {< rarg ,}. Error at: {0}.');

        assert.throws(() => PatternTokenizer.scan('<rarg, 9>..08'), err => err.message ===
                'Unable to scan command pattern. Scanned: {< rarg , 9}. Error at: {>..0}.');
    });
});


describe('Input Tokenizer', () => {
    it('should properly parse valid input', () => {
        const actual = InputTokenizer.scan('global test input <rarg> 90test-?hj 90 78 -o --flag -y:8 test90');
        const expected = [
            new InputTokenizer.Token('ID', 'global'),
            new InputTokenizer.Token('ID', 'test'),
            new InputTokenizer.Token('ID', 'input'),
            new InputTokenizer.Token('ID', '<rarg>'),
            new InputTokenizer.Token('ID', '90test-?hj'),
            new InputTokenizer.Token('ID', '90'),
            new InputTokenizer.Token('ID', '78'),
            new InputTokenizer.Token('OPTION', '-o'),
            new InputTokenizer.Token('FLAG', '--flag'),
            new InputTokenizer.Token('NUMBEREDOPTION', '-y:8'),
            new InputTokenizer.Token('ID', 'test90')
        ];

        actual.forEach((token, idx) => {
            assert.equal(token.value, expected[idx].value);
            assert.equal(token.type, expected[idx].type);
        })
    });

    it('should properly parse empty input', () => {
        const actual = InputTokenizer.scan('');
        const expected = [];

        assert.deepEqual(actual, expected);
    });
});
