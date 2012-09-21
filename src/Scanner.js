//Scanner class

//reader: the reader used to read in characters
function Scanner(reader) {
    this.reader = reader;
    this.currentToken = new Token(); //storing the current analysed token
    this.currLine = 0; //the line number of the current line being read
    this.state = Scanner.START_STATE;
    this.skipNewLine = true;
}

Scanner.START_STATE = 1; //every FSM should have a start state
Scanner.IDENTIFIER_STATE = Scanner.START_STATE + 1; //find
Scanner.SLASH_STATE = Scanner.IDENTIFIER_STATE + 1;

Scanner.prototype.makeToken = function (type, text) {
    this.currentToken.type = type;
    this.currentToken.text = text;
    return type;
}

Scanner.prototype.nextToken = function() {
    var bufferStr = "";
    while (true) {
        switch (this.state) {
            case Scanner.START_STATE:
                var c = this.reader.nextChar();

                if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
                    this.state = Scanner.IDENTIFIER_STATE;
                    //we need to remember what the token's text is
                    bufferStr = c;
                }
                else if (c >= "0" && c <= "9") {
                    bufferStr = c;
                    var d = ''; // must assign value to avoid variable repeat
                    while (true) {
                        d = this.reader.nextChar();
                        if (d >= "0" && d <= "9") {
                            bufferStr += d;
                        }
                        else {
                            this.reader.retract();
                            return this.makeToken(Token.tokens.INTLITERAL, parseInt(bufferStr));
                        }
                    }
                }
                else if (c == "/") {
                    this.state = Scanner.SLASH_STATE;
                }
                else if (c == '\'' || c == '\"') {
                    var startquote = c;

                    bufferStr = ''; // bufferStr do not need ' or ""

                    while (true) {
                        c = this.reader.nextChar();

                        if( c == startquote ) {
                            break;
                        }
                        else if( c == '\r' || c == '\n' ) {
                            Errors.push({
                                type: Errors.SYNTAX_ERROR,
                                msg: "A string literal must be terminated before the line break.",
                                line: this.currLine
                            });
                            this.reader.retract();
                            break;
                        }
                        else if( c == -1 ) {
                            Errors.push({
                                type: Errors.SYNTAX_ERROR,
                                msg: "Input ended before reaching the closing quotation mark for a string literal.",
                                line: this.currLine
                            });
                            this.reader.retract();
                            break;
                        }
                        else {
                            bufferStr += c;
                        }
                    }

                    return this.makeToken(Token.tokens.STRINGLITERAL, bufferStr);
                }
                else {
                    switch (c) {
                        case ".":
                            return this.makeToken(Token.tokens.DOT);
                            break;
                        case "@":
                            return this.makeToken(Token.tokens.AT);
                            break;
                        case "#":
                            return this.makeToken(Token.tokens.HASH);
                            break;
                        case ":":
                            return this.makeToken(Token.tokens.COLON);
                            break;
                        case ";":
                            return this.makeToken(Token.tokens.SEMICOLON);
                            break;
                        case "(":
                            return this.makeToken(Token.tokens.LEFTPAREN);
                            break;
                        case ")":
                            return this.makeToken(Token.tokens.RIGHTPAREN);
                            break;
                        case "{":
                            return this.makeToken(Token.tokens.LEFTBRACE);
                            break;
                        case "}":
                            return this.makeToken(Token.tokens.RIGHTBRACE);
                            break;
                        case "%":
                            return this.makeToken(Token.tokens.MOD);
                            break;
                        case "[":
                            return this.makeToken(Token.tokens.LEFTBRACKET);
                            break;
                        case "]":
                            return this.makeToken(Token.tokens.RIGHTBRACKET);
                            break;

                        case "!":
                            if (this.reader.nextChar() == "=") {
                                return this.makeToken(Token.tokens.NOTEQUAL);
                            }
                            else {
                                //we have consumed one more char in if-condition
                                this.reader.retract();
                                return this.makeToken(Token.tokens.NOT);
                            }
                            break;
                        case "+":
                            var c = this.reader.nextChar();
                            if (c == "=") {
                                return this.makeToken(Token.tokens.PLUSASSIGN);
                            }
                            else if (c == "+") {
                                return this.makeToken(Token.tokens.PLUSPLUS);
                            }
                            else {
                                this.reader.retract();
                                return this.makeToken(Token.tokens.PLUS);
                            }
                            break;
                        case "-":
                            var c = this.reader.nextChar();
                            if (c == "=") {
                                return this.makeToken(Token.tokens.MINUSASSIGN);
                            }
                            else if (c == "-") {
                                return this.makeToken(Token.tokens.MINUSMINUS);
                            }
                            else {
                                this.reader.retract();
                                return this.makeToken(Token.tokens.MINUS);
                            }
                            break;
                        case "*":
                            return this.makeToken(Token.tokens.MULT);
                            break;
                        case "=":
                            if (this.reader.nextChar() == "=") {
                                return this.makeToken(Token.tokens.EQUAL);
                            }
                            else {
                                this.reader.retract();
                                return this.makeToken(Token.tokens.ASSIGN);
                            }
                            break;
                        case ">":
                            if (this.reader.nextChar() == "=") {
                                return this.makeToken(Token.tokens.GREATEREQUAL);
                            }
                            else {
                                this.reader.retract();
                                return this.makeToken(Token.tokens.GREATER);
                            }
                            break;
                        case "<":
                            if (this.reader.nextChar() == "=") {
                                return this.makeToken(Token.tokens.LESSEQUAL);
                            }
                            else {
                                this.reader.retract();
                                return this.makeToken(Token.tokens.LESS);
                            }
                            break;
                        case "&":
                            if (this.reader.nextChar() == "&") {
                                return this.makeToken(Token.tokens.AND);
                            }
                            else {
                                this.reader.retract();
                                Errors.push({
                                    type: Errors.SYNTAX_ERROR,
                                    msg: "You have only one &",
                                    line: this.currLine
                                });
                            }
                            break;
                        case "|":
                            if (this.reader.nextChar() == "|") {
                                return this.makeToken(Token.tokens.OR);
                            }
                            else {
                                this.reader.retract();
                                Errors.push({
                                    type: Errors.SYNTAX_ERROR,
                                    msg: "You have only one |",
                                    line: this.currLine
                                });
                            }
                            break;

                        case -1:
                            return this.makeToken(Token.tokens.EOS);
                            break;
                        case "\r":
                        case "\n":
                            this.currLine++;
                            if (! this.skipNewLine) {
                                return this.makeToken(Token.tokens.NEWLINE);
                            }
                            break;
                        default:
                            if(c == " ") {  // ignore space
                                break;
                            }

                            // warning and ignore them
                            Errors.push({
                                type: Errors.SYNTAX_ERROR,
                                msg: "Ignore unknown identifier: " + c,
                                line: this.currLine
                            });
                    }
                }
                break;
            case Scanner.IDENTIFIER_STATE:
                var c = this.reader.nextChar();

                if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
                    bufferStr += c;
                }
                else {
                    //stop reading it since it is not a letter anymore
                    //retract the last character we read because it does not belong to this identfier
                    this.reader.retract();

                    //change back the state to read the next token
                    this.state = Scanner.START_STATE;

                    switch (bufferStr) {     // our language is keyword case sensitive.
                        case "var":
                            return this.makeToken(Token.tokens.VAR);
                        case "true":
                        case "TRUE":
                            return this.makeToken(Token.tokens.BOOLLITERAL, true);
                        case "false":
                        case "FALSE":
                            return this.makeToken(Token.tokens.BOOLLITERAL, false);
                        case "if":
                            return this.makeToken(Token.tokens.IF);
                        case "else":
                            return this.makeToken(Token.tokens.ELSE);
                        case "while":
                            return this.makeToken(Token.tokens.WHILE);
                        case "print":
                            return this.makeToken(Token.tokens.PRINT);
                        case "eval":
                            return this.makeToken(Token.tokens.EVAL);

                        case "value":
                            return this.makeToken(Token.tokens.VALUE);
                        case "text":
                            return this.makeToken(Token.tokens.TEXT);
                        default:
                            return this.makeToken(Token.tokens.IDENTIFIER, bufferStr);
                    }
                }
                break;
            case Scanner.SLASH_STATE:
                var c = this.reader.nextChar();
                if (c == "/") {
                    //line comment
                    bufferStr = "";
                    //reading 1 more char here can prevent the case that a // is followed by a line break char immediately
                    c = this.reader.nextChar();
                    if (c != "\r" && c != "\n" && c != -1) {
                        while (c != "\r" && c != "\n" && c != -1) {
                            bufferStr += c;
                            c = this.reader.nextChar();
                        }

                        //to retract the line break char
                        this.reader.retract();
                    }

                    this.state = Scanner.START_STATE;

                    return this.makeToken(Token.tokens.LINECOMMENT, bufferStr);
                }
                else if (c == "*") {
                    //block comment
                    bufferStr = "";
                    var end = false;
                    while (! end) {
                        c = this.reader.nextChar();
                        if (c != -1) {
                            if (c == "\r" || c == "\n") {
                                this.currLine++;
                            }
                            if (c == "*") {
                                var d = this.reader.nextChar();
                                if (d == "/") {
                                    //meet */
                                    end = true;
                                }
                                else {
                                    bufferStr += "*" + d;
                                }
                            }
                            else {
                                bufferStr += c;
                            }
                        }
                        else {
                            end = true;
                        }
                    }

                    this.state = Scanner.START_STATE;

                    return this.makeToken(Token.tokens.BLOCKCOMMENT, bufferStr);
                }
                else {
                    this.state = Scanner.START_STATE;
                    this.reader.retract();
                    return this.makeToken(Token.tokens.DIV);
                }
                break;
        }
    }
}