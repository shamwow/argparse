export class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;

        this.processSpecialCases();
    }

    processSpecialCases() {}

    toString() {
        return this.value;
    }

    equal(token) {
        return this.type === token.type && this.value === token.value;
    }
};
