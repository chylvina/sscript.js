//Token class

//type: Token's type
//text: the actual text that makes this token, may be null if it is not important
function Token(type, text) {
    this.type = type;
    this.text = text;
}

Token.tokens = {};
Token.tokens.EOS = 1; //end of stream
// using + 1 allows adding a new token easily later
Token.tokens.COLON = Token.tokens.EOS + 1;                  // :
Token.tokens.SEMICOLON = Token.tokens.COLON + 1;            // ;
Token.tokens.LEFTPAREN = Token.tokens.SEMICOLON + 1;        // (
Token.tokens.RIGHTPAREN = Token.tokens.LEFTPAREN + 1;       // )
Token.tokens.LEFTBRACE = Token.tokens.RIGHTPAREN + 1;       // {
Token.tokens.RIGHTBRACE = Token.tokens.LEFTBRACE + 1;       // }
Token.tokens.LEFTBRACKET = Token.tokens.RIGHTBRACE + 1;     // [
Token.tokens.RIGHTBRACKET = Token.tokens.LEFTBRACKET + 1;   // ]
Token.tokens.MOD = Token.tokens.RIGHTBRACKET + 1;           // %

Token.tokens.VAR = Token.tokens.MOD + 1;                    // var
Token.tokens.BOOLLITERAL = Token.tokens.VAR + 1;            // true, false
Token.tokens.INTLITERAL = Token.tokens.BOOLLITERAL + 1;     // 1234567890
Token.tokens.STRINGLITERAL = Token.tokens.INTLITERAL + 1;   // "abcdefghijklmn..."
Token.tokens.ARRAYLITERAL = Token.tokens.STRINGLITERAL + 1; // [abcdef]
Token.tokens.IF = Token.tokens.ARRAYLITERAL + 1;            // if
Token.tokens.ELSE = Token.tokens.IF + 1;                    // else
Token.tokens.WHILE = Token.tokens.ELSE + 1;                 // while
Token.tokens.PRINT = Token.tokens.WHILE + 1;                // print
Token.tokens.EVAL = Token.tokens.PRINT + 1;                 // eval
Token.tokens.IDENTIFIER = Token.tokens.EVAL + 1;            // identifier?


Token.tokens.PLUS = Token.tokens.IDENTIFIER + 1;            // +
Token.tokens.PLUSPLUS = Token.tokens.PLUS + 1;              // ++
Token.tokens.PLUSASSIGN = Token.tokens.PLUSPLUS + 1;        // +=
Token.tokens.MINUS = Token.tokens.PLUSASSIGN + 1;           // -
Token.tokens.MINUSMINUS = Token.tokens.MINUS + 1;           // --
Token.tokens.MINUSASSIGN = Token.tokens.MINUSMINUS + 1;     // -=
Token.tokens.MULT = Token.tokens.MINUSASSIGN + 1;           // *
Token.tokens.DIV = Token.tokens.MULT + 1;                   // /
Token.tokens.ASSIGN = Token.tokens.DIV + 1;                 // =
Token.tokens.EQUAL = Token.tokens.ASSIGN + 1;               // ==
Token.tokens.NOTEQUAL = Token.tokens.EQUAL + 1;             // !=
Token.tokens.GREATER = Token.tokens.NOTEQUAL + 1;           // >
Token.tokens.GREATEREQUAL = Token.tokens.GREATER + 1;       // >=
Token.tokens.LESS = Token.tokens.GREATEREQUAL + 1;          // <
Token.tokens.LESSEQUAL = Token.tokens.LESS + 1;             // <=
Token.tokens.AND = Token.tokens.LESSEQUAL + 1;              // &&
Token.tokens.OR = Token.tokens.AND + 1;                     // ||
Token.tokens.NOT = Token.tokens.OR + 1;                     // !

Token.tokens.LINECOMMENT = Token.tokens.NOT + 1;            // //
Token.tokens.BLOCKCOMMENT = Token.tokens.LINECOMMENT + 1;   // /* abc */
Token.tokens.NEWLINE = Token.tokens.BLOCKCOMMENT + 1;       // /r /n

Token.tokens.AT = Token.tokens.NEWLINE + 1;                 // @
Token.tokens.HASH = Token.tokens.AT + 1;                    // #
Token.tokens.DOT = Token.tokens.HASH + 1;                   // .
Token.tokens.VALUE = Token.tokens.DOT + 1;                  // value
Token.tokens.TEXT = Token.tokens.VALUE + 1;                 // text


Token.backwardMap = {}; //for inverse look-up
for (var x in Token.tokens) {
    Token.backwardMap[Token.tokens[x]] = x;
}