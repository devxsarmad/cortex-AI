const operators = new Set(["+", "-", "*", "/"]);

const precedence: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2
};

const tokenize = (expression: string) => {
  const tokens: string[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let value = char;
      index += 1;
      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        value += expression[index];
        index += 1;
      }
      if (!/^\d+(\.\d+)?$/.test(value)) {
        throw new Error("Calculator only supports valid decimal numbers.");
      }
      tokens.push(value);
      continue;
    }

    if (operators.has(char) || char === "(" || char === ")") {
      tokens.push(char);
      index += 1;
      continue;
    }

    throw new Error("Calculator only supports numbers, +, -, *, /, and parentheses.");
  }

  return tokens;
};

const toReversePolishNotation = (tokens: string[]) => {
  const output: string[] = [];
  const stack: string[] = [];

  for (const token of tokens) {
    if (/^\d+(\.\d+)?$/.test(token)) {
      output.push(token);
      continue;
    }

    if (operators.has(token)) {
      while (
        stack.length > 0 &&
        operators.has(stack[stack.length - 1]) &&
        precedence[stack[stack.length - 1]] >= precedence[token]
      ) {
        output.push(stack.pop() as string);
      }
      stack.push(token);
      continue;
    }

    if (token === "(") {
      stack.push(token);
      continue;
    }

    if (token === ")") {
      while (stack.length > 0 && stack[stack.length - 1] !== "(") {
        output.push(stack.pop() as string);
      }
      if (stack.pop() !== "(") {
        throw new Error("Calculator expression has mismatched parentheses.");
      }
    }
  }

  while (stack.length > 0) {
    const token = stack.pop() as string;
    if (token === "(" || token === ")") {
      throw new Error("Calculator expression has mismatched parentheses.");
    }
    output.push(token);
  }

  return output;
};

const evaluateReversePolishNotation = (tokens: string[]) => {
  const stack: number[] = [];

  for (const token of tokens) {
    if (/^\d+(\.\d+)?$/.test(token)) {
      stack.push(Number(token));
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();
    if (left === undefined || right === undefined) {
      throw new Error("Calculator expression is incomplete.");
    }

    if (token === "+") stack.push(left + right);
    if (token === "-") stack.push(left - right);
    if (token === "*") stack.push(left * right);
    if (token === "/") {
      if (right === 0) throw new Error("Calculator cannot divide by zero.");
      stack.push(left / right);
    }
  }

  if (stack.length !== 1 || !Number.isFinite(stack[0])) {
    throw new Error("Calculator expression could not be evaluated.");
  }

  return stack[0];
};

export const calculateExpression = (expression: string) => {
  const tokens = tokenize(expression);
  if (tokens.length === 0) {
    throw new Error("Calculator expression is empty.");
  }

  return evaluateReversePolishNotation(toReversePolishNotation(tokens));
};
