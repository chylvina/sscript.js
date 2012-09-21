//Nodes

function Node() {
    this.line = 0;
}
Node.prototype.setLine = function (line) {
    this.line = line;
    return this;
};


function ExpressionBlockNode() {
    this.expressions = [];
}

OopHelp.extend(ExpressionBlockNode, Node);

ExpressionBlockNode.prototype.push = function (expression) {
    this.expressions.push(expression);
};

//ExpressionBlockNode.prototype.toString = function () {
//    var result = '';
//    for (var i = 0, l = this.expressions.length; i < l; i++) {
//        result += this.expressions[i].toString() + "\r\n";
//    }
//    return result;
//};

ExpressionBlockNode.prototype.iterate = function (func) {
    for (var i = 0, l = this.expressions.length; i < l; i++) {
        var expression = this.expressions[i];
        func(expression, i);
    }
};


function PrintNode(expressionNode) {
    this.expressionNode = expressionNode;
}

OopHelp.extend(PrintNode, Node);

function EvalNode(expressionNode) {
    this.expressionNode = expressionNode;
}

OopHelp.extend(EvalNode, Node);


function IntNode(data) {
    this.data = parseInt(data);
}

OopHelp.extend(IntNode, Node);

function StringNode(data) {
    this.data = data;
}

OopHelp.extend(StringNode, Node);


function BoolNode(data) {
    this.data = data;
}

OopHelp.extend(BoolNode, Node);

function VariableNode(varName, initExpressionNode) {
    this.varName = varName;
    this.initExpressionNode = initExpressionNode;
}

OopHelp.extend(VariableNode, Node);

function DataNode(data) {
    this.data = data;
}

OopHelp.extend(DataNode, Node);

function IfNode(conditionExpression, expressions, elseExpressions) {
    this.conditionExpression = conditionExpression;
    this.expressions = expressions;
    this.elseExpressions = elseExpressions;
}

OopHelp.extend(IfNode, Node);


function WhileNode(conditionExpression, expressions) {
    this.conditionExpression = conditionExpression;
    this.expressions = expressions;
}

OopHelp.extend(WhileNode, Node);


function IdentifierNode(identifier) {
    this.identifier = identifier;
}

OopHelp.extend(IdentifierNode, Node);

// (...)
function ParenNode(node) {
    this.node = node;
}

OopHelp.extend(ParenNode, Node);

// [...]
function BracketNode(node) {
    this.node = node;
}

OopHelp.extend(BracketNode, Node);

// -
function NegateNode(node) {
    this.node = node;
}

OopHelp.extend(NegateNode, Node);

// !a
function NotNode(node) {
    this.node = node;
}

OopHelp.extend(NotNode, Node);

// a + b
function CompoundNode() {
    this.nodes = [];
}

OopHelp.extend(CompoundNode, Node);

CompoundNode.prototype.push = function (node) {
    this.nodes.push(node);
};

// html id
function HtmlIdNode(id) {
    this.id = id;
}

OopHelp.extend(HtmlIdNode, Node);

// html tag
function HtmlTagNode(basenode, tag, index) {
    this.basenode = basenode;
    this.tag = tag;
    this.index = index || 0;
}

OopHelp.extend(HtmlTagNode, Node);

// value get
function ValueGetNode(basenode) {
    this.basenode = basenode;
}

OopHelp.extend(ValueGetNode, Node);

// value set
function ValueSetNode(basenode, value) {
    this.basenode = basenode;
    this.value = value;
}

OopHelp.extend(ValueSetNode, Node);

// text get
function TextGetNode(basenode) {
    this.basenode = basenode;
}

OopHelp.extend(TextGetNode, Node);

// text set
function TextSetNode(basenode, value) {
    this.basenode = basenode;
    this.value = value;
}

OopHelp.extend(TextSetNode, Node);

// +, -, *, /, ...
function OperatorNode() {
}

OopHelp.extend(OperatorNode, Node);

// +
function OperatorPlusNode() {
}

OopHelp.extend(OperatorPlusNode, OperatorNode);

// -
function OperatorMinusNode() {
}

OopHelp.extend(OperatorMinusNode, OperatorNode);

// *
function OperatorMultNode() {
}

OopHelp.extend(OperatorMultNode, OperatorNode);

// /
function OperatorDivNode() {
}

OopHelp.extend(OperatorDivNode, OperatorNode);

// %
function OperatorModNode() {
}

OopHelp.extend(OperatorModNode, OperatorNode);

// &&
function OperatorAndNode() {
}

OopHelp.extend(OperatorAndNode, OperatorNode);

// ||
function OperatorOrNode() {
}

OopHelp.extend(OperatorOrNode, OperatorNode);

// ==
function OperatorEqualNode() {
}

OopHelp.extend(OperatorEqualNode, OperatorNode);

// !=
function OperatorNotEqualNode() {
}

OopHelp.extend(OperatorNotEqualNode, OperatorNode);

// =
function OperatorAssignNode() {
}

OopHelp.extend(OperatorAssignNode, OperatorNode);

// +=
function OperatorPlusAssignNode() {
}

OopHelp.extend(OperatorPlusAssignNode, OperatorNode);

// -=
function OperatorMinusAssignNode() {
}

OopHelp.extend(OperatorMinusAssignNode, OperatorNode);

// >
function OperatorGreaterNode() {
}

OopHelp.extend(OperatorGreaterNode, OperatorNode);

// >=
function OperatorGreaterEqualNode() {
}

OopHelp.extend(OperatorGreaterEqualNode, OperatorNode);

// <
function OperatorLessNode() {
}

OopHelp.extend(OperatorLessNode, OperatorNode);

// <=
function OperatorLessEqualNode() {
}

OopHelp.extend(OperatorLessEqualNode, OperatorNode);


function PostIncrementNode(node) {
    this.node = node;
}

OopHelp.extend(PostIncrementNode, Node);


function PreIncrementNode(node) {
    this.node = node;
}

OopHelp.extend(PreIncrementNode, Node);


function PostDecrementNode(node) {
    this.node = node;
}

OopHelp.extend(PostDecrementNode, Node);


function PreDecrementNode(node) {
    this.node = node;
}

OopHelp.extend(PreDecrementNode, Node);