var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var OpCode;
(function (OpCode) {
    OpCode[OpCode["HALT"] = 0] = "HALT";
    OpCode[OpCode["SET"] = 1] = "SET";
    OpCode[OpCode["PUSH"] = 2] = "PUSH";
    OpCode[OpCode["POP"] = 3] = "POP";
    OpCode[OpCode["EQ"] = 4] = "EQ";
    OpCode[OpCode["GT"] = 5] = "GT";
    OpCode[OpCode["JMP"] = 6] = "JMP";
    OpCode[OpCode["JT"] = 7] = "JT";
    OpCode[OpCode["JF"] = 8] = "JF";
    OpCode[OpCode["ADD"] = 9] = "ADD";
    OpCode[OpCode["MULT"] = 10] = "MULT";
    OpCode[OpCode["MOD"] = 11] = "MOD";
    OpCode[OpCode["AND"] = 12] = "AND";
    OpCode[OpCode["OR"] = 13] = "OR";
    OpCode[OpCode["NOT"] = 14] = "NOT";
    OpCode[OpCode["RMEM"] = 15] = "RMEM";
    OpCode[OpCode["WMEM"] = 16] = "WMEM";
    OpCode[OpCode["CALL"] = 17] = "CALL";
    OpCode[OpCode["RET"] = 18] = "RET";
    OpCode[OpCode["OUT"] = 19] = "OUT";
    OpCode[OpCode["IN"] = 20] = "IN";
    OpCode[OpCode["NOP"] = 21] = "NOP";
})(OpCode || (OpCode = {}));
let _program;
let _address = 0;
let _register = new Uint16Array(8);
let _stack = [];
let _progDivRef;
let _input = '';
let _inputEnabled = false;
let _prevChar = '';
let _delaySkip = false;
const INPUT_SPAN = '<span id="input"></span>';
const CURSOR_BLINK = '<span id="blink" class="blinking-cursor">&#9608;</span>';
function readBin() {
    const file = this.files[0];
    console.log(file.name);
    console.log(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
        console.log('File Loaded');
        let result = e.target.result;
        if (result instanceof ArrayBuffer) {
            _program = new Uint16Array(result);
            console.log(_program.length);
            document.getElementById('bin-load').classList.add('d-none');
            _progDivRef = document.getElementById('program');
            document.getElementById('program-container').classList.remove('d-none');
            runProgram();
        }
    };
    reader.readAsArrayBuffer(file);
}
function runProgram() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            let code = _program[_address];
            let aReg = _program[_address + 1] % 32768;
            let a = getValue(_address + 1);
            let b = getValue(_address + 2);
            let c = getValue(_address + 3);
            switch (code) {
                case OpCode.HALT:
                    Print('\nProgram Halt');
                    return;
                case OpCode.SET: // set a b
                    _register[aReg] = b;
                    _address += 3;
                    break;
                case OpCode.PUSH: // push a
                    _stack.push(a);
                    _address += 2;
                    break;
                case OpCode.POP: // pop a
                    _register[aReg] = _stack.pop();
                    _address += 2;
                    break;
                case OpCode.GT: // gt a b c
                    _register[aReg] = b > c ? 1 : 0;
                    _address += 4;
                    break;
                case OpCode.EQ: // eq a b c
                    _register[aReg] = b == c ? 1 : 0;
                    _address += 4;
                    break;
                case OpCode.JMP:
                    _address = a;
                    break;
                case OpCode.JT: // jt a b
                    if (a != 0)
                        _address = b;
                    else
                        _address += 3;
                    break;
                case OpCode.JF: // jf a b
                    if (a == 0)
                        _address = b;
                    else
                        _address += 3;
                    break;
                case OpCode.ADD: // add a b c
                    _register[aReg] = (b + c) % 32768;
                    _address += 4;
                    break;
                case OpCode.MULT: // mult a b c
                    _register[aReg] = (b * c) % 32768;
                    _address += 4;
                    break;
                case OpCode.MOD: // mod a b c
                    _register[aReg] = b % c;
                    _address += 4;
                    break;
                case OpCode.AND: // and a b c
                    _register[aReg] = b & c;
                    _address += 4;
                    break;
                case OpCode.OR: // or a b c
                    _register[aReg] = b | c;
                    _address += 4;
                    break;
                case OpCode.NOT: // not a b
                    _register[aReg] = ~b + 32768;
                    _address += 3;
                    break;
                case OpCode.RMEM: // rmem a b
                    _register[aReg] = _program[b];
                    _address += 3;
                    break;
                case OpCode.WMEM: // wmem a b
                    _program[a] = b;
                    _address += 3;
                    break;
                case OpCode.CALL: // call a
                    _stack.push(_address + 2);
                    _address = a;
                    break;
                case OpCode.RET: // ret
                    if (_stack.length == 0)
                        return;
                    _address = _stack.pop();
                    break;
                case OpCode.OUT:
                    if (!_delaySkip)
                        yield sleep(15);
                    Print(String.fromCharCode(a));
                    _address += 2;
                    break;
                case OpCode.IN:
                    if (_input) {
                        _register[aReg] = _input.charCodeAt(0);
                        _input = _input.substring(1);
                        _address += 2;
                    }
                    else {
                        _delaySkip = false;
                        _inputEnabled = true;
                        _progDivRef.innerHTML += INPUT_SPAN + CURSOR_BLINK;
                        Scroll();
                        return;
                    }
                    break;
                case OpCode.NOP:
                    _address++;
                    break;
                default:
                    Print(OpCode[code]);
                    return;
            }
        }
    });
}
function getValue(address) {
    let val = _program[address];
    if (val < 32768)
        return val;
    if (val < 32776) {
        val %= 32768;
        return _register[val];
    }
    throw new Error("Invalid Value");
}
function Print(s) {
    s = s.replace('\n', '<br>');
    if (s[0] == ' ') {
        if (_prevChar == '<' || _prevChar == ' ')
            s = s.replace(' ', '&nbsp;');
    }
    _prevChar = s[0];
    _progDivRef.innerHTML += s;
    Scroll();
}
function Scroll() {
    _progDivRef.scrollTop = _progDivRef.scrollHeight;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
document.getElementById('file-input').addEventListener('change', readBin, false);
document.onkeydown = e => {
    if (_inputEnabled) {
        let key = e.key;
        let keyCode = key.charCodeAt(0);
        let el = document.getElementById('input');
        if (key == 'Enter') {
            _input += '\n';
            el.id = '';
            document.getElementById('blink').remove();
            _inputEnabled = false;
            runProgram();
        }
        else if (key == 'Backspace') {
            if (_input.length > 0) {
                if (_input.length > 1)
                    _input = _input.slice(0, -1);
                else
                    _input = "";
                el.innerHTML = el.innerHTML.slice(0, -1);
                console.log(_input);
            }
        }
        else if (keyCode >= 97 && keyCode <= 122 || keyCode == 32) {
            _input += key;
            el.innerHTML += key;
        }
    }
    else {
        _delaySkip = true;
    }
};
