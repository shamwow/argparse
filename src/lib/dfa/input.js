import { Token } from '../token';

export class InputToken extends Token {
    processSpecialCases() {}
};

export default {
    name: 'User Input',
    transitions: {
        start: char => {
            if ('-' === char) {
                return '-';
            }
            else if (/^[\s]$/.test(char)) {
                return 'space';
            }
            else {
                return 'id';
            }
        },
        id: char => {
            if (!/^[\s]$/.test(char)) {
                return 'id';
            }
        },
        '-': char => {
            if (/^[a-zA-Z]$/.test(char)) {
                return 'option';
            }
            else if ('-' === char) {
                return '--';
            }
            else if (!/^[\s]$/.test(char)) {
                return 'id';
            }
        },
        '--': char => {
            if (/^[a-zA-Z]$/.test(char)) {
                return 'flag';
            }
            else if (!/^[\s]$/.test(char)) {
                return 'id';
            }
        },
        option: char => {
            if (/^[a-zA-Z]$/.test(char)) {
                return 'option';
            }
            else if (':' === char) {
                return 'numoption:';
            }
            else if (!/^[\s]$/.test(char)) {
                return 'id';
            }
        },
        'numoption:': char => {
            if (/^[1-9]$/.test(char)) {
                return 'numoption';
            }
            else if (!/^[\s]$/.test(char)) {
                return 'id';
            }
        },
        numoption: char => {
            if (/^[0-9]$/.test(char)) {
                return 'numoption';
            }
           else if (!/^[\s]$/.test(char)) {
                return 'id';
            }
        },
        flag: char => {
            if (/[a-zA-Z]/.test(char)) {
                return 'flag';
            }
            else if (!/^[\s]$/.test(char)) {
                return 'id';
            }
        }
    },
    accepting: {
        'id': 'ID',
        'flag': 'FLAG',
        'option': 'OPTION',
        'numoption': 'NUMBEREDOPTION'
    }
};
