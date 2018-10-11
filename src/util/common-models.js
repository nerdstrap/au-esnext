import _ from 'lodash';

export class EnumSymbol {
    sym = Symbol.for(name);
    ordinal;
    description;
    keyName;

    constructor(name, { ordinal, description }) {
        if (!Object.is) {
            Object.is = function (x, y) {
                // SameValue algorithm
                if (x === y) { // Steps 1-5, 7-10
                    // Steps 6.b-6.e: +0 != -0
                    return x !== 0 || 1 / x === 1 / y;
                } else {
                    // Step 6.a: NaN == NaN
                    return x !== x && y !== y;
                }
            };
        }
        if (!Object.is(ordinal, undefined)) {
            this.ordinal = ordinal;
        }
        if (description) {
            this.description = description;
        }
        this.keyName = name;
        Object.freeze(this);
    }

    get display() {
        return this.description || Symbol.keyFor(this.sym);
    }

    get key() {
        return this.keyName;
    }

    toString() {
        return this.sym;
    }

    valueOf() {
        return this.ordinal;
    }
}

export class Enum {
    constructor(enumLiterals) {
        for (let key in enumLiterals) {
            if (enumLiterals.hasOwnProperty(key)) {
                if (!enumLiterals[key]) {
                    throw new TypeError('each enum should have been initialized with at least empty {} value');
                }
                this[key] = new EnumSymbol(key, enumLiterals[key]);
            }
        }
        Object.freeze(this);
    }

    symbols() {
        let syms = [];
        let self = this;
        Object.keys(this).forEach(function (k) {
            syms.push(self[k]);
        });
        return syms; //for (key of Object.keys(this)) this[key];
    }

    keys() {
        return Object.keys(this);
    }

    contains(sym) {
        if (!(sym instanceof EnumSymbol)) {
            return false;
        }
        return this[Symbol.keyFor(sym.sym)] === sym;
    }

    get(ordinal) {
        let self = this;
        let symbol;
        this.keys().forEach(k => {
            if (self[k].ordinal === +ordinal) {
                symbol = self[k];
            }
        });
        return symbol;
    }
}

let determineShiftedValues = (total, highestValue) => {
    let values = [];
    let runningTotal = total;
    for (let i = highestValue; i >= 0; i--) {
        if (runningTotal >> i === 1) {
            let binValue = Math.pow(2, i);
            runningTotal = runningTotal - binValue;
            values.push(binValue);
        }
    }
    return values;
};

export let EnumeratedTypeHelper = function () {
    return {
        asArray: (type, value) => {
            if (value === undefined) {
                return [];
            }
            let v = determineShiftedValues(value, type.symbols().length);
            let enums = [];
            _.forEach(v, ordinal => {
                enums.push(type.get(ordinal));
            });
            return enums;
        }
    };
}();
