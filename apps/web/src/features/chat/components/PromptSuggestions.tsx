import { Button } from "@/components/ui/button";

const suggestedPrompts = [
  "Summarize the selected sources",
  "Compare the uploaded documents",
  "List key facts with citations"
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
