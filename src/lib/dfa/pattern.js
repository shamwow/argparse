import { Token } from '../token';

export class PatternToken extends Token {
    processSpecialCases() {}
};


export default {
    name: 'Command Pattern',
    transitions: {
        start: char => {
            if (/^[a-zA-Z]$/.test(char)) {
                return 'id';
            }
            else if (/^[1-9]$/.test(char)) {
                return 'int';
            }
            else if ('<' === char) {
                return '<';
            }
            else if ('>' === char) {
                return '>';
            }
            else if ('[' === char) {
                return '[';
            }
            else if (']' === char) {
                return ']';
            }
            else if ('-' === char) {
                return '-';
            }
            else if (/^[\s]$/.test(char)) {
                return 'space';
            }
            else if (',' === char) {
                return ',';
            }
        },
        id: char => {
            if (/^[a-zA-Z0-9]$/.test(char)) {
                return 'id';
            }
        },
        int: char => {
            if (/^[0-9]$/.test(char)) {
                return 'int';
            }
        },
        '>': char => {
            if (char === '.') {
                return '>.';
            }
        },
        '>.': char => {
            if ('.' === char) {
                return '>..';
            }
        },
        '>..': char => {
            if ('.' === char) {
                return '>...';
            }
            else if (/^[1-9]$/.test(char)) {
                return '>..#';
            }
        },
        '>..#': char => {
            if (/^[0-9]$/.test(char)) {
                return '>..#';
            }
        },
        ']': char => {
            if (char === '.'){
                return '].';
            }
        },
        '].': char => {
            if ('.' === char) {
                return ']..';
            }
        },
        ']..': char => {
            if ('.' === char) {
                return ']...';
            }
            else if (/^[1-9]$/.test(char)) {
                return ']..#';
            }
        },
        ']..#': char => {
            if (/^[0-9]$/.test(char)) {
                return ']..#';
            }
        },
        '-': char => {
            if (/^[a-zA-Z]$/.test(char)) {
                return 'option';
            }
            else if ('-' === char) {
                return '--';
            }
        },
        '--': char => {
            if (/^[a-zA-Z]$/.test(char)) {
                return 'flag';
            }
        },
        option: char => {
            if (/^[a-zA-Z]$/.test(char)) {
                return 'option';
            }
            else if (':' === char) {
                return 'numoption:';
            }
        },
        'numoption:': char => {
            if (/^[1-9]$/.test(char)) {
                return 'numoption';
            }
        },
        numoption: char => {
            if (/^[0-9]$/.test(char)) {
                return 'numoption';
            }
        },
        flag: char => {
            if (/[a-zA-Z]/.test(char)) {
                return 'flag';
            }
        }
    },
    accepting: {
        'id': 'ID',
        '<': 'LANGLE',
        '>': 'RANGLE',
        '[': 'LBRACK',
        ']': 'RBRACK',
        '>...': 'RANGLEELIP',
        '>..#': 'RANGLENUM',
        ']...': 'RBRACKELIP',
        ']..#': 'RBRACKNUM',
        'flag': 'FLAG',
        ',': 'COMMA',
        'int': 'INT',
        'option': 'OPTION',
        'numoption': 'NUMBEREDOPTION'
    }
};
