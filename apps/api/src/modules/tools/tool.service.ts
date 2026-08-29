import { randomUUID } from "node:crypto";
import { calculateExpression } from "./calculator.tool.js";
import { getCurrentTime } from "./current-time.tool.js";
import { getDocumentStats } from "./document-stats.tool.js";
import type { ToolDefinition, ToolExecution, ToolName } from "./tool.types.js";

type PlannedToolCall = {
  name: ToolName;
  input: Record<string, unknown>;
};

const toolDefinitions: ToolDefinition[] = [
  {
    name: "calculator",
    description: "Evaluate basic arithmetic expressions using numbers, parentheses, and +, -, *, /.",
    parameters: {
      expression: "string"
    }
  },
  {
    name: "current_time",
    description: "Return the current date and time.",
    parameters: {
      timeZone: "optional IANA timezone string"
    }
  },
  {
    name: "document_stats",
    description: "Return counts for uploaded documents, chunks, embedding providers, and vector stores.",
    parameters: {}
  }
];

const extractArithmeticExpression = (message: string) => {
  const expression = message.match(/[0-9][0-9\s.+\-*/()]*[0-9)]/)?.[0]?.trim();
  return expression && /[+\-*/]/.test(expression) ? expression : null;
};

const wantsTime = (message: string) => /\b(time|date|today|now)\b/i.test(message);

const wantsDocumentStats = (message: string) =>
  /\b(documents?|sources?|uploads?|chunks?|vectors?|knowledge base)\b/i.test(message) &&
  /\b(count|stats?|status|ready|uploaded|how many|processed)\b/i.test(message);

export class ToolService {
  listDefinitions() {
    return toolDefinitions;
  }

  planToolCalls(message: string): PlannedToolCall[] {
    const calls: PlannedToolCall[] = [];
    const expression = extractArithmeticExpression(message);

    if (expression) {
      calls.push({
        name: "calculator",
        input: { expression }
      });
    }

    if (wantsTime(message)) {
      calls.push({
        name: "current_time",
        input: {}
      });
    }

    if (wantsDocumentStats(message)) {
      calls.push({
        name: "document_stats",
        input: {}
      });
    }

    return calls;
  }

  async executePlannedTools(message: string) {
    const calls = this.planToolCalls(message);
    const executions: ToolExecution[] = [];

    for (const call of calls) {
      executions.push(await this.execute(call));
    }

    return executions;
  }

  private async execute(call: PlannedToolCall): Promise<ToolExecution> {
    const id = randomUUID();

    try {
      if (call.name === "calculator") {
        const expression = String(call.input.expression ?? "");
        return {
          id,
          name: call.name,
          label: "Calculator",
          input: call.input,
          output: {
            result: calculateExpression(expression)
          },
          status: "success"
        };
      }

      if (call.name === "current_time") {
        return {
          id,
          name: call.name,
          label: "Current time",
          input: call.input,
          output: getCurrentTime(typeof call.input.timeZone === "string" ? call.input.timeZone : undefined),
          status: "success"
        };
      }

      return {
        id,
        name: call.name,
        label: "Document stats",
        input: call.input,
        output: getDocumentStats(),
        status: "success"
      };
    } catch (error) {
      return {
        id,
        name: call.name,
        label: call.name,
        input: call.input,
        output: {},
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Tool execution failed."
      };
    }
  }
}

export const toolService = new ToolService();
