import * as React from "react";
import { cn } from "@/lib/utils";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  variant?: "text" | "textarea" | "heading";
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  editable?: boolean;
  showIcon?: boolean;
}

const EditableField = React.forwardRef<HTMLDivElement, EditableFieldProps>(
  (
    {
      value,
      onSave,
      variant = "text",
      placeholder = "Click to edit...",
      className,
      inputClassName,
      editable = true,
      showIcon = true,
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(value);
    const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    React.useEffect(() => {
      setEditValue(value);
    }, [value]);

    React.useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    const handleSave = () => {
      if (editValue.trim() !== value) {
        onSave(editValue.trim());
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(value);
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && variant !== "textarea") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Enter" && e.metaKey && variant === "textarea") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    };

    if (!editable) {
      return (
        <div ref={ref} className={className}>
          {value || placeholder}
        </div>
      );
    }

    if (isEditing) {
      return (
        <div ref={ref} className={cn("flex items-center gap-2", className)}>
          {variant === "textarea" ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={placeholder}
              className={cn(
                "min-h-[60px] bg-background/50 border-primary/50 focus:border-primary focus:ring-primary/20",
                inputClassName
              )}
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={placeholder}
              className={cn(
                "bg-background/50 border-primary/50 focus:border-primary focus:ring-primary/20",
                variant === "heading" && "text-lg font-semibold",
                inputClassName
              )}
            />
          )}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleSave}
              className="p-1 rounded hover:bg-primary/20 text-primary transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group relative cursor-pointer rounded px-1 -mx-1 transition-colors hover:bg-muted/50",
          className
        )}
        onClick={() => setIsEditing(true)}
      >
        <span className={cn(!value && "text-muted-foreground")}>
          {value || placeholder}
        </span>
        {showIcon && (
          <Pencil className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    );
  }
);
EditableField.displayName = "EditableField";

export { EditableField };
