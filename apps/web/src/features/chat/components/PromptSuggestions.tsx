import { Button } from "@/components/ui/button";

const suggestedPrompts = [
  "Summarize hypertension risk factors",
  "Explain HbA1c in simple terms",
  "Draft patient-friendly discharge guidance"
];

type PromptSuggestionsProps = {
  disabled: boolean;
  onSelect: (prompt: string) => void;
};

export function PromptSuggestions({ disabled, onSelect }: PromptSuggestionsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {suggestedPrompts.map((prompt) => (
        <Button
          key={prompt}
          type="button"
          variant="secondary"
          onClick={() => onSelect(prompt)}
          disabled={disabled}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}
