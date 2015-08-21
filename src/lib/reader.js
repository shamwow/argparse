export default class Reader {
    constructor(tokens) {
        this.unread = tokens;
        this.read = [];
    }

    _throw(msg) {
        let err = `${msg}. Read input: ${this.read.join(' ')}. `
        err += `Unread Input: ${this.unread.join(' ')}.`;

        throw new Error(err);
    }

    _read(count=1) {
        if (count > this.unread.length) {
            this._throw(`Cannot read ${count} times, only ${this.unread.length} tokens left`);
        }

        const output = [];
        for (let i = 0; i < count; i++){
            const token = this.unread.shift();
            this.read.push(token);
            output.push(token);
        }
        return (output.length === 1) ? output[0] : output;
    }

    _reset() {
        this.unread = this.read.concat(this.unread);
        this.read = [];
    }

    _expect(item, errMsg) {
        if (this.unread.length === 0) {
            this._throw(errMsg ||
                    `Expected ${item}. Recieved nothing`);
        }

        const unreadType = this.unread[0].type;
        const unreadValue = this.unread[0].value;
        const result = item.split('|').reduce((accum, next) => {
            const raw = next.split(':');
            let result = raw[0] === unreadType;
            if (raw[1]) {
                result = result && raw[1] === unreadValue;
            }
            return accum || result;
        }, false);

        if (!result) {
            this._throw(errMsg ||
                    `Unexpected token. Expected ${item}. Recieved ${unreadType}:${unreadValue}`);
        }
    }

    _softExpect(item) {
        if (this.unread.length === 0) {
            return false;
        }

        const unreadType = this.unread[0].type;
        return item.split('|').reduce((accum, next) => {
            return accum || next === unreadType;
        }, false);
    }
};
