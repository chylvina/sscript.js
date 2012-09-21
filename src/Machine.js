//Machine class

function trim(str, chars) {
    return ltrim(rtrim(str, chars), chars);
}

function ltrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}

function rtrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}

function Machine(codeArr) {
    //simple parser
    this.vlabelMap = {};

    for(var i = 0, l = codeArr.length; i < l; i++) {
        var code = codeArr[i];

        if(code.opcode == "vlabel") {
            this.vlabelMap[codeArr[i].operands[0]] = i;
        }
    }

    this.instructions = codeArr;
    this.registers = [];
    this.pc = 0;
    this.labelMap = {};
}

Machine.prototype.run = function () {
    for (var l = this.instructions.length; this.pc < l; this.pc++) {
        var instruction = this.instructions[this.pc];
        this[instruction.opcode].apply(this, instruction.operands);
    }
};

Machine.prototype.resolveRegister = function (operand) {
    if (typeof operand == "string" && operand.length > 0) {
        if (operand[0] == "$") {
            return parseInt(operand.substr(1));
        }
    }

    Errors.push({
        type:Errors.RUNTIME_ERROR,
        msg:"Failed to resolve register",
        line:0
    });

    return -1;
};

Machine.prototype.getRegisterContent = function (operand) {
    operand = this.resolveRegister(operand);
    if (operand != -1) {
        if (this.registers.length > operand) {
            return this.registers[operand];
        }
    }
    return 0;
};

Machine.prototype.setRegisterContent = function (operand, value) {
    operand = this.resolveRegister(operand);
    if (operand != -1) {
        this.registers[operand] = value;
    }
};

//Arithmetic
Machine.prototype.add = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 + val2);
};

Machine.prototype.sub = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 - val2);
};

Machine.prototype.mult = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 * val2);
};

Machine.prototype.div = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    if (val2 == 0) {
        Errors.push({
            type:Errors.RUNTIME_ERROR,
            msg:"Division by zero",
            line:0
        });

        this.setRegisterContent(operand1, 0);
    }
    else {
        this.setRegisterContent(operand1, val1 / val2);
    }
};

Machine.prototype.mod = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    if (val2 == 0) {
        Errors.push({
            type:Errors.RUNTIME_ERROR,
            msg:"Division by zero",
            line:0
        });

        this.setRegisterContent(operand1, 0);
    }
    else {
        this.setRegisterContent(operand1, val1 % val2);
    }
};

Machine.prototype.addi = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = operand3;
    this.setRegisterContent(operand1, val1 + val2);
};

Machine.prototype.subi = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = parseInt(operand3);
    this.setRegisterContent(operand1, val1 - val2);
};

Machine.prototype.multi = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = parseInt(operand3);
    this.setRegisterContent(operand1, val1 * val2);
};

Machine.prototype.divi = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = parseInt(operand3);
    if (val2 == 0) {
        Errors.push({
            type:Errors.RUNTIME_ERROR,
            msg:"Division by zero",
            line:0
        });

        this.setRegisterContent(operand1, 0);
    } else {
        this.setRegisterContent(operand1, val1 / val2);
    }
};

Machine.prototype.modi = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = parseInt(operand3);
    if (val2 == 0) {
        Errors.push({
            type:Errors.RUNTIME_ERROR,
            msg:"Division by zero",
            line:0
        });

        this.setRegisterContent(operand1, 0);
    }
    else {
        this.setRegisterContent(operand1, val1 % val2);
    }
};

//Data transfer
Machine.prototype.move = function (operand1, operand2) {
    this.setRegisterContent(operand1, this.getRegisterContent(operand2));
};

Machine.prototype.lwi = function (operand1, content) {
    this.setRegisterContent(operand1, content);
};

Machine.prototype.lui = function (operand1, operand2) {
    this.setRegisterContent(operand1, parseInt(operand2) << 16);
};

//relation
Machine.prototype.eq = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 == val2);
};

Machine.prototype.ne = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 != val2);
};

Machine.prototype.lt = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 < val2);
};

Machine.prototype.gt = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 > val2);
};

Machine.prototype.le = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 <= val2);
};

Machine.prototype.ge = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 >= val2);
};

//Logical
Machine.prototype.and = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 && val2);
};

Machine.prototype.or = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand2);
    var val2 = this.getRegisterContent(operand3);
    this.setRegisterContent(operand1, val1 || val2);
};

//Conditional branch and Unconditional jump
Machine.prototype.vlabel = function (operand1) {
    //nothing to do here
};

Machine.prototype.label = function (operand1) {
    this.labelMap[operand1] = this.pc;
};

Machine.prototype.easyJump = function (lbl) {
    var nextPC;// = this.labelMap[lbl];
    if (lbl.substr(0, 1) == "_") {
        //it is vlabel
        var realLbl = lbl.substr(1);
        nextPC = this.vlabelMap[realLbl];
    }
    else {
        nextPC = this.labelMap[lbl];
    }

    if (nextPC == null) {
        Errors.push({
            type:Errors.RUNTIME_ERROR,
            msg:"Label not found",
            line:0
        });
    }
    else {
        this.pc = nextPC;
    }
};

Machine.prototype.beq = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand1);
    var val2 = this.getRegisterContent(operand2);
    if (val1 == val2) {
        this.easyJump(operand3);
    }
};

Machine.prototype.bne = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand1);
    var val2 = this.getRegisterContent(operand2);
    if (val1 != val2) {
        this.easyJump(operand3);
    }
};

Machine.prototype.bl = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand1);
    var val2 = this.getRegisterContent(operand2);
    if (val1 < val2) {
        this.easyJump(operand3);
    }
};

Machine.prototype.bg = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand1);
    var val2 = this.getRegisterContent(operand2);
    if (val1 > val2) {
        this.easyJump(operand3);
    }
};

Machine.prototype.ble = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand1);
    var val2 = this.getRegisterContent(operand2);
    if (val1 <= val2) {
        this.easyJump(operand3);
    }
};

Machine.prototype.bge = function (operand1, operand2, operand3) {
    var val1 = this.getRegisterContent(operand1);
    var val2 = this.getRegisterContent(operand2);
    if (val1 >= val2) {
        this.easyJump(operand3);
    }
};

Machine.prototype.j = function (operand1) {
    this.easyJump(operand1);
};

Machine.prototype.print = function (operand1) {
    var val = this.getRegisterContent(operand1);
    output(val);
};

Machine.prototype.idget = function (operand1, operand2) {
    var id = this.getRegisterContent(operand2);

    this.setRegisterContent(operand1, $("#" + id));
};

Machine.prototype.tagget = function (operand1, operand2, operand3) {
    var type = this.getRegisterContent(operand2);
    var index = this.getRegisterContent(operand3);

    this.setRegisterContent(operand1, $(type + ":eq(" + index + ")"));
};

Machine.prototype.tagfind = function (operand1, operand2, operand3, operand4) {
    var type = this.getRegisterContent(operand2);
    var index = this.getRegisterContent(operand3);
    var basenode = this.getRegisterContent(operand4);

    this.setRegisterContent(operand1, basenode.find(type + ":eq(" + index + ")"));
};

Machine.prototype.getvalue = function (operand1, operand2) {
    var basenode = this.getRegisterContent(operand2);

    this.setRegisterContent(operand1, basenode.val());
};

Machine.prototype.setvalue = function (operand1, operand2, operand3) {
    var basenode = this.getRegisterContent(operand2);

    var value = this.getRegisterContent(operand3);

    this.setRegisterContent(operand1, basenode.val(value));
};

Machine.prototype.gettext = function (operand1, operand2) {
    var basenode = this.getRegisterContent(operand2);

    this.setRegisterContent(operand1, basenode.text());
};

Machine.prototype.settext = function (operand1, operand2, operand3) {
    var basenode = this.getRegisterContent(operand2);

    var value = this.getRegisterContent(operand3);

    this.setRegisterContent(operand1, basenode.text(value));
};

Machine.prototype.eval = function (operand1, operand2) {
    var val = this.getRegisterContent(operand2);

    try {
        var r = eval(val);
    }
    catch (error) {
        alert(error);
    }

    this.setRegisterContent(operand1, r);
};