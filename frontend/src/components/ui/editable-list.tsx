import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus, X, Pencil, Check, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EditableListProps {
  items: string[];
  onUpdate?: (items: string[]) => void;
  onSave?: (items: string[]) => void;
  variant?: "list" | "badges" | "card";
  placeholder?: string;
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  editable?: boolean;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  icon?: React.ReactNode;
  emptyMessage?: string;
  addLabel?: string;
}

const EditableList = React.forwardRef<HTMLDivElement, EditableListProps>(
  (
    {
      items,
      onUpdate,
      onSave,
      variant = "list",
      placeholder = "Add item...",
      className,
      itemClassName,
      iconClassName,
      editable = true,
      badgeVariant = "secondary",
      icon,
      emptyMessage = "No items yet",
      addLabel = "Add item",
    },
    ref
  ) => {
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
    const [editValue, setEditValue] = React.useState("");
    const [isAdding, setIsAdding] = React.useState(false);
    const [newValue, setNewValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const addInputRef = React.useRef<HTMLInputElement>(null);

    const handleUpdate = (newItems: string[]) => {
      onUpdate?.(newItems);
      onSave?.(newItems);
    };

    React.useEffect(() => {
      if (editingIndex !== null && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [editingIndex]);

    React.useEffect(() => {
      if (isAdding && addInputRef.current) {
        addInputRef.current.focus();
      }
    }, [isAdding]);

    const handleEdit = (index: number) => {
      setEditValue(items[index]);
      setEditingIndex(index);
    };

    const handleSaveEdit = (index: number) => {
      if (editValue.trim()) {
        const newItems = [...items];
        newItems[index] = editValue.trim();
        handleUpdate(newItems);
      }
      setEditingIndex(null);
      setEditValue("");
    };

    const handleDelete = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      handleUpdate(newItems);
    };

    const handleAdd = () => {
      if (newValue.trim()) {
        handleUpdate([...items, newValue.trim()]);
        setNewValue("");
        setIsAdding(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === "Enter") {
        e.preventDefault();
        action();
      } else if (e.key === "Escape") {
        setEditingIndex(null);
        setIsAdding(false);
        setEditValue("");
        setNewValue("");
      }
    };

    // Card variant - for talking points / caution flags style
    if (variant === "card") {
      return (
        <div ref={ref} className={cn("space-y-2", className)}>
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "group flex items-start gap-3 p-3 rounded-lg border animate-fade-in",
                editable && "hover:bg-muted/20",
                itemClassName
              )}
            >
              <ChevronRight className={cn("h-4 w-4 mt-0.5 shrink-0", iconClassName)} />
              {editingIndex === index ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleSaveEdit(index))}
                    onBlur={() => handleSaveEdit(index)}
                    className="flex-1 bg-background/50 border-primary/50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(index)}
                    className="p-1 rounded hover:bg-primary/20 text-primary transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <p
                    className={cn(
                      "flex-1 text-sm text-foreground",
                      editable && "cursor-pointer"
                    )}
                    onClick={() => editable && handleEdit(index)}
                  >
                    {item}
                  </p>
                  {editable && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="p-1 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {editable && (
            isAdding ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-primary/30">
                <ChevronRight className={cn("h-4 w-4 shrink-0 opacity-50", iconClassName)} />
                <Input
                  ref={addInputRef}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleAdd)}
                  onBlur={() => {
                    if (newValue.trim()) handleAdd();
                    else setIsAdding(false);
                  }}
                  placeholder={placeholder}
                  className="flex-1 bg-background/50 border-primary/50 text-sm"
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(true)}
                className="w-full justify-start text-muted-foreground hover:text-foreground border border-dashed border-muted-foreground/20 hover:border-primary/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addLabel}
              </Button>
            )
          )}
          {items.length === 0 && !isAdding && (
            <p className="text-sm text-muted-foreground text-center py-2">{emptyMessage}</p>
          )}
        </div>
      );
    }

    if (variant === "badges") {
      return (
        <div ref={ref} className={cn("flex flex-wrap gap-2", className)}>
          {items.map((item, index) => (
            <div key={index} className="group relative">
              {editingIndex === index ? (
                <div className="flex items-center gap-1">
                  <Input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleSaveEdit(index))}
                    onBlur={() => handleSaveEdit(index)}
                    className="h-6 w-24 text-xs bg-background/50 border-primary/50"
                  />
                </div>
              ) : (
                <Badge
                  variant={badgeVariant}
                  className={cn(
                    "cursor-pointer transition-all",
                    editable && "pr-6 hover:pr-8",
                    itemClassName
                  )}
                  onClick={() => editable && handleEdit(index)}
                >
                  {item}
                  {editable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(index);
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              )}
            </div>
          ))}
          {editable && (
            isAdding ? (
              <div className="flex items-center gap-1">
                <Input
                  ref={addInputRef}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleAdd)}
                  onBlur={() => {
                    if (newValue.trim()) handleAdd();
                    else setIsAdding(false);
                  }}
                  placeholder={placeholder}
                  className="h-6 w-24 text-xs bg-background/50 border-primary/50"
                />
              </div>
            ) : (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {addLabel}
              </Badge>
            )
          )}
          {items.length === 0 && !isAdding && (
            <span className="text-xs text-muted-foreground">{emptyMessage}</span>
          )}
        </div>
      );
    }

    // List variant
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "group flex items-start gap-2 p-2 rounded-lg transition-colors",
              editable && "hover:bg-muted/50",
              itemClassName
            )}
          >
            {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
            {editingIndex === index ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, () => handleSaveEdit(index))}
                  onBlur={() => handleSaveEdit(index)}
                  className="flex-1 bg-background/50 border-primary/50"
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(index)}
                  className="p-1 rounded hover:bg-primary/20 text-primary transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <span
                  className={cn("flex-1", editable && "cursor-pointer")}
                  onClick={() => editable && handleEdit(index)}
                >
                  {item}
                </span>
                {editable && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="p-1 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {editable && (
          isAdding ? (
            <div className="flex items-center gap-2 p-2">
              {icon && <span className="shrink-0 opacity-50">{icon}</span>}
              <Input
                ref={addInputRef}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAdd)}
                onBlur={() => {
                  if (newValue.trim()) handleAdd();
                  else setIsAdding(false);
                }}
                placeholder={placeholder}
                className="flex-1 bg-background/50 border-primary/50"
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addLabel}
            </Button>
          )
        )}
        {items.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-2">{emptyMessage}</p>
        )}
      </div>
    );
  }
);
EditableList.displayName = "EditableList";

export { EditableList };
