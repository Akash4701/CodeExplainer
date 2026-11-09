export interface CodeRange {
  line_start: number;
  line_end: number;
}

export type FlowStepType = "start" | "process" | "decision" | "end";

export interface FlowStep {
  id: string;
  type: FlowStepType;
  title: string;
  description: string;
  code_ranges: CodeRange[];
  next: string[];
}

export interface ExplanationData {
  explanation: {
    flow_map: FlowStep[];
  };
}

export function getFlowStepForLine(flowSteps: FlowStep[], line: number): FlowStep | undefined {
  return flowSteps
    .map((step, index) => {
      const containingRanges = step.code_ranges.filter(
        (range) => line >= range.line_start && line <= range.line_end,
      )
      if (containingRanges.length === 0) return undefined

      return {
        step,
        index,
        rangeSize: Math.min(...containingRanges.map((range) => range.line_end - range.line_start)),
      }
    })
    .filter((match): match is { step: FlowStep; index: number; rangeSize: number } => match !== undefined)
    .sort((left, right) => left.rangeSize - right.rangeSize || left.index - right.index)[0]?.step
}
