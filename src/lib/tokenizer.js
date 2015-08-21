import inputDFA from './dfa/input';
import { InputToken } from './dfa/input';
import patternDFA from './dfa/pattern';
import { PatternToken } from './dfa/pattern';

export class Scanner {
    constructor(dfa, Token) {
        this.name = dfa.name;
        this.transitions = dfa.transitions;
        this.accepting = dfa.accepting;
        this.Token = Token;
    }

    scan(string) {
        string += ' ';
        let currentState = 'start';
        let currentToken = '';
        const output = [];
        const input = string.split('');
        let i = 0;
        while (i < input.length) {
            const char = string[i];
            const transitions = this.transitions[currentState];
            const newState = (transitions) ? transitions(char) : undefined;

            // If the transition was successfull.
            if (newState) {
                currentState = newState;
                currentToken += char;
                i++;
            }
            // If transition failed but we are at an accepted state.
            else if (this.accepting[currentState]) {
                output.push(new this.Token(this.accepting[currentState], currentToken));
                // Reset.
                currentToken = '';
                currentState = 'start';
            }
             // If transition failed and we have a white space token.
            else if (currentState === 'space') {
                currentToken = '';
                currentState = 'start';
                continue;
            }
            // Otherwise, we have invalid input.
            else {
                throw new Error(`Unable to scan ${this.name.toLowerCase()}. Scanned: {` +
                        `${output.join(' ')}}. Error at: {${currentToken}${char}}.`);
            }
        }
        return output;
    }
};

export const PatternTokenizer = new Scanner(patternDFA, PatternToken);
export const InputTokenizer = new Scanner(inputDFA, InputToken);
