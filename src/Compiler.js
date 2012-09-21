//Compiler class

function Compiler() {
    this.register = 0;
    this.label = 0;

    this.trueRegister = this.getNextRegister();
    this.falseRegister = this.getNextRegister();

    this.varMap = {};
}

Compiler.prototype.getMachineCode = function (expressionBlockNode) {
    this.codeArr = [];
    this.bufferArr = [];

    this.writeln("lwi", this.trueRegister, true);
    this.writeln("lwi", this.falseRegister, false);
    this.evaluateExpressionBlockNode(expressionBlockNode);

    return this.codeArr;
};

Compiler.prototype.getNextRegister = function () {
    return "$" + this.register++;
};

Compiler.prototype.getNextLabel = function () {
    return "lbl" + this.label++;
};

Compiler.prototype.writeln = function (opcode) {
    var ins = {};
    ins.opcode = opcode;

    ins.operands = [];
    for(var i = 1; k = arguments.length, i < k; i ++) {
        ins.operands.push(arguments[i]);
    }

    this.codeArr.push(ins);
};

Compiler.prototype.write = function (insArr) {
    this.codeArr = this.codeArr.concat(insArr);
};

Compiler.prototype.writelnToBuffer = function (opcode) {
    var ins = {};
    ins.opcode = opcode;

    ins.operands = [];
    for(var i = 1; k = arguments.length, i < k; i ++) {
        ins.operands.push(arguments[i]);
    }

    this.bufferArr.push(ins);
};

Compiler.prototype.evaluateExpressionBlockNode = function (node) {
    if (node == null) {
        return;
    }
    for (var i = 0, l = node.expressions.length; i < l; i++) {
        var expressionNode = node.expressions[i];
        this.evaluateExpressionNode(expressionNode);
        if(this.bufferArr) {
            this.write(this.bufferArr);
            this.bufferArr = [];
        }
    }
};

Compiler.prototype.evaluateExpressionNode = function (node) {
    if (node instanceof VariableNode) {
        return this.evaluateVariableNode(node);
    }
    else if (node instanceof PrintNode) {
        return this.evaluatePrintNode(node);
    }
    else if (node instanceof EvalNode) {
        return this.evaluateEvalNode(node);
    }
    else if (node instanceof CompoundNode) {
        return this.evaluateCompoundNode(node);
    }
    else if (node instanceof IdentifierNode) {
        return this.evaluateIdentifierNode(node);
    }
    else if (node instanceof HtmlTagNode) {
        return this.evaluateHtmlTagNode(node);
    }
    else if (node instanceof HtmlIdNode) {
        return this.evaluateHtmlIdNode(node);
    }
    else if (node instanceof ValueGetNode) {
        return this.evaluateValueGetNode(node);
    }
    else if (node instanceof ValueSetNode) {
        return this.evaluateValueSetNode(node);
    }
    else if (node instanceof TextGetNode) {
        return this.evaluateTextGetNode(node);
    }
    else if (node instanceof TextSetNode) {
        return this.evaluateTextSetNode(node);
    }
    else if (node instanceof DataNode) {
        return this.evaluateDataNode(node);
    }
    else if (node instanceof PostIncrementNode) {
        return this.evaluatePostIncrementNode(node);
    }
    else if (node instanceof PreIncrementNode) {
        return this.evaluatePreIncrementNode(node);
    }
    else if (node instanceof PostDecrementNode) {
        return this.evaluatePostDecrementNode(node);
    }
    else if (node instanceof PreDecrementNode) {
        return this.evaluatePreDecrementNode(node);
    }
    else if (node instanceof NegateNode) {
        return this.evaluateNegateNode(node);
    }
    else if (node instanceof NotNode) {
        return this.evaluateNotNode(node);
    }
    else if (node instanceof ParenNode) {
        return this.evaluateParenNode(node);
    }
    else if (node instanceof IfNode) {
        return this.evaluateIfNode(node);
    }
    else if (node instanceof WhileNode) {
        return this.evaluateWhileNode(node);
    }
};

Compiler.prototype.evaluateIfNode = function (node) {
    var condReg = this.evaluateExpressionNode(node.conditionExpression);

    var elseLbl = this.getNextLabel();
    var endLbl = this.getNextLabel();

    // fix me, here we can only pass a string parameter, so no type!!
    this.writeln("beq", condReg, this.falseRegister, "_" + elseLbl);
    this.evaluateExpressionBlockNode(node.expressions);
    this.writeln("j", "_" + endLbl);

    this.writeln("vlabel", elseLbl);
    this.evaluateExpressionBlockNode(node.elseExpressions);
    this.writeln("vlabel", endLbl);
};

Compiler.prototype.evaluateWhileNode = function (node) {
    var whileLbl = this.getNextLabel();
    var endLbl = this.getNextLabel();

    this.writeln("vlabel", whileLbl);
    var condReg = this.evaluateExpressionNode(node.conditionExpression);
    this.writeln("beq", condReg, this.falseRegister, "_" + endLbl);

    this.evaluateExpressionBlockNode(node.expressions);
    this.writeln("j", "_" + whileLbl);
    this.writeln("vlabel", endLbl);
};

Compiler.prototype.evaluateNegateNode = function (node) {
    var reg = this.evaluateExpressionNode(node.node);
    this.writeln("multi", reg, reg, -1);
    return reg;
};

Compiler.prototype.evaluateNotNode = function (node) {
    var reg = this.evaluateExpressionNode(node.node);
    this.writeln("addi", reg, reg, 1);
    this.writeln("modi", reg, reg, 2);
    return reg;
};

Compiler.prototype.evaluateParenNode = function (node) {
    return this.evaluateExpressionNode(node.node);
};

Compiler.prototype.evaluatePostIncrementNode = function (node) {
    var reg = this.evaluateExpressionNode(node.node);
    this.writelnToBuffer("addi", reg, reg, 1);
    return reg;
};

Compiler.prototype.evaluatePreIncrementNode = function (node) {
    var reg = this.evaluateExpressionNode(node.node);
    this.writeln("addi", reg, reg, 1);
    return reg;
};

Compiler.prototype.evaluatePostDecrementNode = function (node) {
    var reg = this.evaluateExpressionNode(node.node);
    this.writelnToBuffer("subi", reg, reg, 1);
    return reg;
};

Compiler.prototype.evaluatePreDecrementNode = function (node) {
    var reg = this.evaluateExpressionNode(node.node);
    this.writeln("subi", reg, reg, 1);
    return reg;
};

Compiler.prototype.evaluateDataNode = function (node) {
    var register = this.getNextRegister();
    this.writeln("lwi", register, node.data);
    return register;
};

Compiler.prototype.evaluateHtmlIdNode = function (node) {
    var register = this.getNextRegister();

    // id
    var idRegister = this.getNextRegister();
    this.writeln("lwi", idRegister, node.id);

    this.writeln("idget", register, idRegister);

    return register;
};

Compiler.prototype.evaluateHtmlTagNode = function (node) {
    var register = this.getNextRegister();

    // index
    var indexRegister;
    if(node.index == 0) {
        indexRegister = this.getNextRegister();
        this.writeln("lwi", indexRegister, 0);
    }
    else {
        indexRegister = this.evaluateExpressionNode(node.index);
    }

    // tag
    var tagRegister = this.getNextRegister();
    this.writeln("lwi", tagRegister, node.tag);

    // basenode
    if(node.basenode) {
        var basenodeRegister = this.evaluateExpressionNode(node.basenode);

        this.writeln("tagfind", register, tagRegister, indexRegister, basenodeRegister);
    }
    else {
        this.writeln("tagget", register, tagRegister, indexRegister);
    }

    return register;
};

Compiler.prototype.evaluateValueGetNode = function (node) {
    var register = this.getNextRegister();

    var basenodeRegister = this.evaluateExpressionNode(node.basenode);

    this.writeln("getvalue", register, basenodeRegister);
    return register;
};

Compiler.prototype.evaluateValueSetNode = function (node) {
    var register = this.getNextRegister();

    var basenodeRegister = this.evaluateExpressionNode(node.basenode);

    var valueRegister = this.evaluateExpressionNode(node.value);

    this.writeln("setvalue", register, basenodeRegister, valueRegister);
    return register;
};

Compiler.prototype.evaluateTextGetNode = function (node) {
    var register = this.getNextRegister();

    var basenodeRegister = this.evaluateExpressionNode(node.basenode);

    this.writeln("gettext", register, basenodeRegister);
    return register;
};

Compiler.prototype.evaluateTextSetNode = function (node) {
    var register = this.getNextRegister();

    var basenodeRegister = this.evaluateExpressionNode(node.basenode);

    var valueRegister = this.evaluateExpressionNode(node.value);

    this.writeln("settext", register, basenodeRegister, valueRegister);
    return register;
};

Compiler.prototype.evaluateIdentifierNode = function (node) {
    var reg = this.varMap[node.identifier];
    return reg;
};

Compiler.prototype.evaluateEvalNode = function (node) {
    var resultRegister = this.getNextRegister();

    var register = this.evaluateExpressionNode(node.expressionNode);

    this.writeln("eval", resultRegister, register);

    return resultRegister;
};

Compiler.prototype.evaluateCompoundNode = function (node) {
    var operator = null;
    var operand = null;

    var resultRegister;
    for (var i = 0, l = node.nodes.length; i < l; i++) {
        var subNode = node.nodes[i];

        if (subNode instanceof OperatorNode) {
            operator = subNode;
        }
        else {
            if (resultRegister == null) {   // recursive in to next compound
                resultRegister = this.getNextRegister();
                var reg = this.evaluateExpressionNode(subNode);
                this.writeln("move", resultRegister, reg);
            }
            else {                          // go back and calculate
                var currRegister = this.evaluateExpressionNode(subNode);

                if (operator instanceof OperatorPlusNode) {
                    this.writeln("add", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorMinusNode) {
                    this.writeln("sub", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorMultNode) {
                    this.writeln("mult", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorDivNode) {
                    this.writeln("div", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorModNode) {
                    this.writeln("mod", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorEqualNode) {
                    this.writeln("eq", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorNotEqualNode) {
                    this.writeln("ne", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorLessNode) {
                    this.writeln("lt", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorLessEqualNode) {
                    this.writeln("le", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorGreaterNode) {
                    this.writeln("gt", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorGreaterEqualNode) {
                    this.writeln("ge", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorAndNode) {
                    this.writeln("and", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorOrNode) {
                    this.writeln("or", resultRegister, resultRegister, currRegister);
                }
                else if (operator instanceof OperatorAssignNode) {
                    this.writeln("move", this.evaluateIdentifierNode(operand), currRegister);
                }
                else if (operator instanceof OperatorPlusAssignNode) {
                    var reg = this.evaluateIdentifierNode(operand);
                    this.writeln("add", reg, reg, currRegister);
                }
                else if (operator instanceof OperatorMinusAssignNode) {
                    var reg = this.evaluateIdentifierNode(operand);
                    this.writeln("sub", reg, reg, currRegister);
                }
            }

            operand = subNode;
        }
    }

    return resultRegister;
};

Compiler.prototype.evaluatePrintNode = function (node) {
    var register = this.evaluateExpressionNode(node.expressionNode);

    this.writeln("print", register);
};

Compiler.prototype.evaluateVariableNode = function (node) {
    var init = null;
    if (node.initExpressionNode) {
        init = this.evaluateExpressionNode(node.initExpressionNode);
    }

    var reg = this.getNextRegister();
    this.varMap[node.varName] = reg;

    this.writeln("move", reg, init);
};