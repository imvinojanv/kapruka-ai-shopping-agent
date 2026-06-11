"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Send, ClipboardList, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FormField {
  id: string;
  label: string;
  type: "text" | "phone" | "textarea" | "select" | "date";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  row?: string;
}

export interface DynamicFormSchema {
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
}

interface DynamicFormProps {
  schema: DynamicFormSchema;
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export function DynamicForm({ schema, onSubmit, disabled }: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const setValue = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted || disabled) return;

    const lines = schema.fields
      .map((field) => {
        const val = values[field.id]?.trim() || "";
        if (!val && !field.required) return null;
        return `${field.label}: ${val || "(not provided)"}`;
      })
      .filter(Boolean);

    const message = lines.join("\n");
    setSubmitted(true);
    onSubmit(message);
  };

  const allRequiredFilled = schema.fields
    .filter((f) => f.required)
    .every((f) => values[f.id]?.trim());

  if (submitted) {
    return (
      <div className="max-w-md rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <ClipboardList className="h-4 w-4" />
          <span className="font-medium">Details submitted successfully</span>
        </div>
      </div>
    );
  }

  // Group fields by row
  const rows = groupFieldsByRow(schema.fields);

  return (
    <form onSubmit={handleSubmit} className="max-w-md rounded-2xl border border-border/60 bg-linear-to-br from-card via-card to-muted/30 overflow-hidden">
      {/* Header */}
      <div className="h-1 w-full bg-linear-to-r from-primary/60 via-primary to-primary/60" />
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">{schema.title}</h4>
            {schema.description && (
              <p className="text-[11px] text-muted-foreground">{schema.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="px-4 py-3 space-y-3">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className={row.length > 1 ? "grid grid-cols-2 gap-3" : ""}>
            {row.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={values[field.id] || ""}
                onChange={(v) => setValue(field.id, v)}
                disabled={disabled}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="px-4 pb-4 pt-1">
        <Button
          type="submit"
          className="w-full h-9 gap-2 rounded-lg"
          disabled={!allRequiredFilled || disabled}
        >
          <Send className="h-3.5 w-3.5" />
          {schema.submitLabel || "Submit Details"}
        </Button>
      </div>
    </form>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </Label>

      {field.type === "textarea" ? (
        <Textarea
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm min-h-16 resize-none"
          disabled={disabled}
        />
      ) : field.type === "select" && field.options ? (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder={field.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "date" ? (
        <DateField value={value} onChange={onChange} placeholder={field.placeholder} disabled={disabled} />
      ) : (
        <Input
          type={field.type === "phone" ? "tel" : "text"}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 text-sm"
          disabled={disabled}
        />
      )}
    </div>
  );
}

function DateField({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const date = value ? new Date(value) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-empty={!date}
          className="w-full h-9 justify-between text-left text-sm font-normal data-[empty=true]:text-muted-foreground"
        >
          {date ? format(date, "PPP") : <span>{placeholder || "Pick a date"}</span>}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) onChange(format(d, "yyyy-MM-dd"));
          }}
          defaultMonth={date || today}
          disabled={(d) => d < today}
        />
      </PopoverContent>
    </Popover>
  );
}

function groupFieldsByRow(fields: FormField[]): FormField[][] {
  const rows: FormField[][] = [];
  let i = 0;

  while (i < fields.length) {
    const field = fields[i];
    if (field.row) {
      // Find all consecutive fields with the same row ID
      const rowGroup: FormField[] = [field];
      while (i + 1 < fields.length && fields[i + 1].row === field.row) {
        i++;
        rowGroup.push(fields[i]);
      }
      rows.push(rowGroup);
    } else {
      rows.push([field]);
    }
    i++;
  }

  return rows;
}
