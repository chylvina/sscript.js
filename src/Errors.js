// Errors class

function Errors() {
}

Errors.errors = [];

Errors.push = function (obj) {
    Errors.errors.push(obj);
};

Errors.each = function (func) {
    for (var i = 0, l = Errors.errors.length; i < l; i++) {
        func(Errors.errors[i], i);
    }
};

Errors.clear = function (func) {
    Errors.errors = [];
};

Errors.SYNTAX_ERROR = 0;
Errors.SEMANTIC_ERROR = 1;
Errors.COMPILER_ERROR = 2;

Errors.type = ["Syntax error", "Semantic error", "Compiler error"];




