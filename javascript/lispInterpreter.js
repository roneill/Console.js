/**
 * Created by .
 * User: Robert O'Neill
 * Date: 3/19/11
 * Lisp-Style Arithmetic Evaluator
 */

// parses an input string and creates an array of sexpr elements
function parse(input) {
    
	var array = input.replace(/\(/g, " ( ").replace(/\)/g, " ) ").split(" ");
	
	for(var i = 0; i < array.length; i++) {
		if(array[i] === "") {
			array.splice(i, 1);
            i--;
        }
	}
	
	return array;
}
// Converts from parenthesized prefix to infix notation
function prefixToInfix(parsedInput) {
	var retVal;

	if(parsedInput[0] == "(") {
        var ops = new Array();
        retVal = prefixToInfixHelper(ops, parsedInput, 0, new Array());
	}

	return retVal;
}

// Helper function for prefixToInfix
// Creates an array of infix operations like [1, +, 1]
// from an array in parenthesized prefix notation
function prefixToInfixHelper(ops, array, i, acc) {

	var ln = ops.length - 1;

    // if symbol is a left paren, add the operator to the operator stack,
    // push a left paren on to the accumulator, and move to the next symbol
    if(array[i] === "(") {
		ops.push(array[i+1]);
        acc.push("(");
		return prefixToInfixHelper(ops, array, i+2, acc);
    }
	if(i === array.length - 1) {
		if(ops[ln] === "+" || ops[ln] === "-") {
			acc.push(0);
            acc.push(array[i]);
            return acc;
        }
		if(ops[ln] === "*" || ops[ln] === "/") {
            acc.push(1);
            acc.push(array[i]);
            return acc;
        }
	}
    if(array[i+1] === ")" && i + 2 < array.length) {
        ops.pop();
        acc.push(parseInt(array[i]));
        return prefixToInfixHelper(ops, array, i+1, acc);
    }
	if(array[i] === ")" && i !== array.length) {
		if(ops[ln] === "+" || ops[ln] === "-") {
            acc.push(")");
            acc.push(ops[ln]);
			return prefixToInfixHelper(ops, array, i+1, acc);
		}
		if(ops[ln] === "*" || ops[ln] === "/") {
            acc.push(")");
            acc.push(ops[ln]);
			return prefixToInfixHelper(ops, array, i+1, acc);
		}
	}
	else {
            acc.push(parseInt(array[i]));
            acc.push(ops[ln]);
			return prefixToInfixHelper(ops, array, i+1, acc);
	}
}

// Evaluates an array of items in infix notation
function compute(array) {
    var expression = "";

    for(var i = 0; i < array.length; i++) {
        expression += array[i];
    }

    return eval(expression); // I know the saying "Don't be eval. I'm just being lazy. :("
}

// run : String -> Number
function run(input) {
    try {
        return compute(prefixToInfix(parse(input)));
    }
    catch (err) {
        return "The expression " + input + "returned an error."
    }
}
