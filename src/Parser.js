//Parser class

function Parser(scanner) {
    this.scanner = scanner;
    this.currentToken = new Token();
    this.lookaheadToken = new Token();
    this.lookaheadToken.consumed = true;
}

// this.lookaheadToken.consumed <=> this.currentToken == this.lookaheadToken
Parser.prototype.nextToken = function () {
    if (this.lookaheadToken.consumed) {
        var token = this.scanner.nextToken();

        //skip comments
        while (token == Token.tokens.LINECOMMENT || token == Token.tokens.BLOCKCOMMENT) {
            token = this.scanner.nextToken();
        }

        this.currentToken.type = token;
        this.currentToken.text = this.scanner.currentToken.text;

        console.log("nextToken executed, current token is: " + Token.backwardMap[this.currentToken.type]);

        return token;
    }
    else {
        this.currentToken.type = this.lookaheadToken.type;
        this.currentToken.text = this.lookaheadToken.text;
        this.lookaheadToken.consumed = true;

        console.log("nextToken executed, current token is: " + Token.backwardMap[this.currentToken.type]);
        return this.currentToken.type;
    }
};

// this.lookaheadToken.consumed <=> this.currentToken == this.lookaheadToken
Parser.prototype.lookahead = function () {
    if (this.lookaheadToken.consumed) {
        var token = this.scanner.nextToken();

        //skip comments
        while (token == Token.tokens.LINECOMMENT || token == Token.tokens.BLOCKCOMMENT) {
            token = this.scanner.nextToken();
        }

        this.lookaheadToken.type = token;
        this.lookaheadToken.text = this.scanner.currentToken.text;
        this.lookaheadToken.consumed = false;

        return token;
    }
    else {
        return this.lookaheadToken.type;
    }
};

//a naive implementation for skipping error
Parser.prototype.skipError = function () {
    this.scanner.skipNewLine = false;

    while (this.lookahead() != Token.tokens.NEWLINE && this.lookahead() != Token.tokens.EOS) {
        this.nextToken();
    }

    this.scanner.skipNewLine = true;
};

//the entry point of our parser
Parser.prototype.parse = function () {
    var rootBlock = new ExpressionBlockNode();

    this.parseExpressions(rootBlock);

    return rootBlock;
};

//to parse a list of expressions
Parser.prototype.parseExpressions = function (expressionBlockNode) {
    while (this.lookahead() != Token.tokens.EOS && this.lookahead() != Token.tokens.RIGHTBRACE) {
        var expressionNode = this.parseExpression();

        if (expressionNode) {
            expressionBlockNode.push(expressionNode);
        }
    }
};

// assert the expression ending with semicolon
Parser.prototype.matchSemicolon = function () {
    //consume the semicolon
    if (this.lookahead() == Token.tokens.SEMICOLON) {
        this.nextToken();
    }
    else {
        //syntax error
        Errors.push({
            type:Errors.SYNTAX_ERROR,
            msg:"Expecting a semicolon at the end of expression",
            line:this.scanner.currLine
        });
    }
};

// to parse an expression
Parser.prototype.parseExpression = function () {
    switch (this.lookahead()) {
        case Token.tokens.PRINT:
            var printToken = this.nextToken();
            var expressionNode = this.parseExpression();
            if (expressionNode == undefined) {
                Errors.push({
                    type: Errors.SYNTAX_ERROR,
                    msg: "Missing an expression after \"print\"",
                    line: this.scanner.currLine
                });
            }

            this.matchSemicolon();
            return new PrintNode(expressionNode).setLine(this.scanner.currLine);
            break;

        case Token.tokens.EVAL:
            var evalToken = this.nextToken();
            var expressionNode = this.parseExpression();
            if (expressionNode == undefined) {
                Errors.push({
                    type: Errors.SYNTAX_ERROR,
                    msg: "Missing an expression after \"eval\"",
                    line: this.scanner.currLine
                });
            }

            return new EvalNode(expressionNode).setLine(this.scanner.currLine);
            break;

        case Token.tokens.VAR:
            return this.parseVarExpression();
            break;

        case Token.tokens.IF:
            return this.parseIfExpression();
            break;

        case Token.tokens.WHILE:
            return this.parseWhileExpression();
            break;

        default:
            //unexpected, consume it
            return this.parseCompoundExpression(0);
    }
};

// 操作�? a, b, c, +, -, *, /
Parser.prototype.parseOperand = function () {
    var token = this.nextToken();
    var operandNode = null;
    switch (token) {
        case Token.tokens.HASH:

            // expecting an identifier
            if(this.lookahead() == Token.tokens.IDENTIFIER) {
                operandNode = this.parseHtmlIdExpression(operandNode);

                var finished = false;
                while(finished == false) {
                    switch(this.lookahead()) {
                        case Token.tokens.DOT:
                            this.nextToken();
                            break;
                        case Token.tokens.IDENTIFIER:
                            operandNode = this.parseHtmlTagExpression(operandNode);
                            break;
                        case Token.tokens.VALUE:
                        case Token.tokens.TEXT:
                            operandNode = this.parseHtmlManipulationExpression(operandNode, this.lookahead());
                            break;
                        default:
                            finished = true;
                            break;
                    }
                }
            }
            else {
                Errors.push({
                    type: Errors.SYNTAX_ERROR,
                    msg: "Missing identifier after #",
                    line: this.scanner.currLine
                });
            }
            break;
        case Token.tokens.AT:

            // expecting an identifier
            if(this.lookahead() == Token.tokens.IDENTIFIER) {
                var finished = false;
                while(finished == false) {
                    switch(this.lookahead()) {
                        case Token.tokens.DOT:
                            this.nextToken();
                            break;
                        case Token.tokens.IDENTIFIER:
                            operandNode = this.parseHtmlTagExpression(operandNode);
                            break;
                        case Token.tokens.VALUE:
                        case Token.tokens.TEXT:
                            operandNode = this.parseHtmlManipulationExpression(operandNode, this.lookahead());
                            break;
                        default:
                            finished = true;
                            break;
                    }
                }
            }
            else {
                Errors.push({
                    type: Errors.SYNTAX_ERROR,
                    msg: "Missing identifier after @",
                    line: this.scanner.currLine
                });
            }
            break;
        case Token.tokens.INTLITERAL:
        case Token.tokens.BOOLLITERAL:
        case Token.tokens.STRINGLITERAL:
            operandNode = new DataNode(this.currentToken.text).setLine(this.scanner.currLine);
            break;
        case Token.tokens.IDENTIFIER:
            operandNode = new IdentifierNode(this.currentToken.text).setLine(this.scanner.currLine);
            if (this.lookahead() == Token.tokens.MINUSMINUS) {
                //post decrement
                this.nextToken();
                operandNode = new PostDecrementNode(operandNode).setLine(this.scanner.currLine);
            }
            else if (this.lookahead() == Token.tokens.PLUSPLUS) {
                //post increment
                this.nextToken();
                operandNode = new PostIncrementNode(operandNode).setLine(this.scanner.currLine);
            }
            break;
        case Token.tokens.LEFTPAREN:
            operandNode = new ParenNode(this.parseCompoundExpression(0)).setLine(this.scanner.currLine);

            //consume the right paren )
            if (this.lookahead() == Token.tokens.RIGHTPAREN) {
                this.nextToken();
            }
            else {
                Errors.push({
                    type: Errors.SYNTAX_ERROR,
                    msg: "Missing right paren \")\"",
                    line: this.scanner.currLine
                });
            }
            break;
        case Token.tokens.MINUSMINUS:
            if (this.lookahead() == Token.tokens.IDENTIFIER) {
                this.nextToken();
                operandNode = new PreDecrementNode(new IdentifierNode(this.currentToken.text)).setLine(this.scanner.currLine);
            }
            else {
                Errors.push({
                    type: Errors.SYNTAX_ERROR,
                    msg: "Expecting an identifier for pre-decrement expression",
                    line: this.scanner.currLine
                });
                return null;
            }
            break;
        case Token.tokens.PLUSPLUS:
            if (this.lookahead() == Token.tokens.IDENTIFIER) {
                this.nextToken();
                operandNode = new PreIncrementNode(new IdentifierNode(this.currentToken.text)).setLine(this.scanner.currLine);
            }
            else {
                Errors.push({
                    type: Errors.SYNTAX_ERROR,
                    msg: "Expecting an identifier for pre-increment expression",
                    line: this.scanner.currLine
                });
                return null;
            }
            break;
        case Token.tokens.MINUS:
            operandNode = new NegateNode(this.parseOperand()).setLine(this.scanner.currLine);
            break;
        case Token.tokens.NOT:
            operandNode = new NotNode(this.parseOperand()).setLine(this.scanner.currLine);
            break;

        case Token.tokens.SEMICOLON:
            return null;
            break;

        default:
            // although this is a known token, but it cannot be parsed.
            Errors.push({
                type: Errors.SYNTAX_ERROR,
                msg: "Syntactic parser:: unexpected token: " + Token.backwardMap[token],
                line: this.scanner.currLine
            });
            return null;
    }
    return operandNode;
};

Parser.prototype.getBindingPower = function (token) {
    switch (token) {
        case Token.tokens.PLUS:
        case Token.tokens.MINUS:
            return 120;
        case Token.tokens.MULT:
        case Token.tokens.DIV:
        case Token.tokens.MOD:
            return 130;
        case Token.tokens.GREATER:
        case Token.tokens.GREATEREQUAL:
        case Token.tokens.LESS:
        case Token.tokens.LESSEQUAL:
            return 100;
        case Token.tokens.EQUAL:
        case Token.tokens.NOTEQUAL:
            return 90;
        case Token.tokens.AND:
            return 50;
        case Token.tokens.OR:
            return 40;
        case Token.tokens.ASSIGN:
        case Token.tokens.MINUSASSIGN:
        case Token.tokens.PLUSASSIGN:
            return 20;
    }

    return -1;
};

Parser.prototype.createOperatorNode = function (operatorToken) {
    switch (operatorToken) {
        case Token.tokens.PLUS:
            return new OperatorPlusNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.MINUS:
            return new OperatorMinusNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.MULT:
            return new OperatorMultNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.DIV:
            return new OperatorDivNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.MOD:
            return new OperatorModNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.AND:
            return new OperatorAndNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.OR:
            return new OperatorOrNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.EQUAL:
            return new OperatorEqualNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.NOTEQUAL:
            return new OperatorNotEqualNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.ASSIGN:
            return new OperatorAssignNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.PLUSASSIGN:
            return new OperatorPlusAssignNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.MINUSASSIGN:
            return new OperatorMinusAssignNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.GREATER:
            return new OperatorGreaterNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.GREATEREQUAL:
            return new OperatorGreaterEqualNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.LESS:
            return new OperatorLessNode().setLine(this.scanner.currLine);
            break;
        case Token.tokens.LESSEQUAL:
            return new OperatorLessEqualNode().setLine(this.scanner.currLine);
            break;
        default:
            // so it is not an operator, may be an identifier.
            break;
    }
};

Parser.prototype.parseIfExpression = function () {
    //consume "if"
    this.nextToken();

    var condition = this.parseParenExpression();

    var expressions = this.parseExpressionBlock();

    var elseExpressions;
    if (this.lookahead() == Token.tokens.ELSE) {
        //consume "else"
        this.nextToken();

        elseExpressions = this.parseExpressionBlock();
    }

    return new IfNode(condition, expressions, elseExpressions).setLine(this.scanner.currLine);
};

Parser.prototype.parseHtmlIdExpression = function (basenode) {
    // consume identifier
    this.nextToken();

    return new HtmlIdNode(this.currentToken.text).setLine(this.scanner.currLine);
};

Parser.prototype.parseHtmlTagExpression = function (basenode) {
    // consume identifier
    this.nextToken();

    var tag = this.currentToken.text;

    var index = 0;
    if (this.lookahead() == Token.tokens.LEFTBRACKET) {
        index = this.parseBracketExpression();
    }

    return new HtmlTagNode(basenode, tag, index).setLine(this.scanner.currLine);
};

Parser.prototype.parseHtmlManipulationExpression = function (basenode, type) {
    var result = null;

    // consume value
    this.nextToken();

    // expecting (
    if(this.lookahead() == Token.tokens.LEFTPAREN) {
        // consume (
        this.nextToken();

        if(this.lookahead() == Token.tokens.RIGHTPAREN) {
            switch (type) {
                case Token.tokens.TEXT:
                    result = new TextGetNode(basenode).setLine(this.scanner.currLine);
                    break;
                case Token.tokens.VALUE:
                    result = new ValueGetNode(basenode).setLine(this.scanner.currLine);
                    break;
            }

            // consume )
            this.nextToken();
        }
        else {
            switch (type) {
                case Token.tokens.TEXT:
                    result = new TextSetNode(basenode, this.parseCompoundExpression(0)).setLine(this.scanner.currLine);
                    break;
                case Token.tokens.VALUE:
                    result = new ValueSetNode(basenode, this.parseCompoundExpression(0)).setLine(this.scanner.currLine);
                    break;
            }

            // expecting )
            if(this.lookahead() == Token.tokens.RIGHTPAREN) {
                // consume )
                this.nextToken();
            }
            else {
                Errors.push({
                    type: Errors.SYNTAX_ERROR,
                    msg: "Missing right paren \")\"",
                    line: this.scanner.currLine
                });
            }
        }
    }
    else {
        Errors.push({
            type: Errors.SYNTAX_ERROR,
            msg: "Missing left paren \"(\"",
            line: this.scanner.currLine
        });
    }

    return result;
};

// a + b * c
Parser.prototype.parseCompoundExpression = function (rightBindingPower) {
    var operandNode = this.parseOperand();
    if (operandNode == null) {
        return operandNode;
    }

    var compoundExpressionNode = new CompoundNode().setLine(this.scanner.currLine);
    compoundExpressionNode.push(operandNode);

    var operator = this.lookahead();
    var leftBindingPower = this.getBindingPower(operator);
    if (leftBindingPower == -1) {
        return compoundExpressionNode;
        //not an operator
    }

    while (rightBindingPower < leftBindingPower) {
        operator = this.nextToken();
        compoundExpressionNode.push(this.createOperatorNode(operator));
        var node = this.parseCompoundExpression(leftBindingPower);
        compoundExpressionNode.push(node);

        var oper = this.lookahead();
        leftBindingPower = this.getBindingPower(oper);
        if (leftBindingPower == -1) {
            //not an operator
            return compoundExpressionNode;
        }
    }

    return compoundExpressionNode;
};

Parser.prototype.parseWhileExpression = function () {
    //consume "while"
    this.nextToken();

    var condition = this.parseParenExpression();

    var expressions = this.parseExpressionBlock();

    return new WhileNode(condition, expressions).setLine(this.scanner.currLine);
};

// {a + b * c}
Parser.prototype.parseExpressionBlock = function () {
    if (this.lookahead() != Token.tokens.LEFTBRACE) {
        Errors.push({
            type: Errors.SYNTAX_ERROR,
            msg: "Expecting \"{\"",
            line: this.scanner.currLine
        });
    }
    else {
        this.nextToken();
    }

    var block = new ExpressionBlockNode().setLine(this.scanner.currLine);
    var expressions = this.parseExpressions(block);

    if (this.lookahead() != Token.tokens.RIGHTBRACE) {
        Errors.push({
            type: Errors.SYNTAX_ERROR,
            msg: "Expecting \"}\"",
            line: this.scanner.currLine
        });
    }
    else {
        this.nextToken();
    }

    return block;
};

// [a + b * c]
Parser.prototype.parseBracketExpression = function () {
    if (this.lookahead() != Token.tokens.LEFTBRACKET) {
        Errors.push({
            type: Errors.SYNTAX_ERROR,
            msg: "Expecting \"[\"",
            line: this.scanner.currLine
        });
    }
    else {
        this.nextToken();
    }

    var expression = this.parseExpression();

    if (this.lookahead() != Token.tokens.RIGHTBRACKET) {
        Errors.push({
            type: Errors.SYNTAX_ERROR,
            msg: "Expecting \"]\"",
            line: this.scanner.currLine
        });
    }
    else {
        this.nextToken();
    }

    return expression;
};

// (a + b * c)
Parser.prototype.parseParenExpression = function () {
    if (this.lookahead() != Token.tokens.LEFTPAREN) {
        Errors.push({
            type: Errors.SYNTAX_ERROR,
            msg: "Expecting \"(\"",
            line: this.scanner.currLine
        });
    }
    else {
        this.nextToken();
    }

    var expression = this.parseExpression();

    if (this.lookahead() != Token.tokens.RIGHTPAREN) {
        Errors.push({
            type: Errors.SYNTAX_ERROR,
            msg: "Expecting \")\"",
            line: this.scanner.currLine
        });
    }
    else {
        this.nextToken();
    }

    return expression;
};

Parser.prototype.parseVarExpression = function () {
    //consume "var"
    this.nextToken();

    //expecting an identifier
    if (this.lookahead() == Token.tokens.IDENTIFIER) {
        this.nextToken();
        var varName = this.currentToken.text;

        var initNode;
        //check if it has initialization expression
        if (this.lookahead() == Token.tokens.ASSIGN) {
            initNode = this.parseSimpleAssignmentExpression();
        }

        this.matchSemicolon();

        return new VariableNode(varName, initNode).setLine(this.scanner.currLine);
    }

    this.skipError();
};

Parser.prototype.parseSimpleAssignmentExpression = function () {
    //consume the "=" sign
    this.nextToken();

    var expressionNode = this.parseExpression();
    return expressionNode;
};