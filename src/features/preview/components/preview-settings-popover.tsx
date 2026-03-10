import { SettingsIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import { api } from "convex/_generated/api";
import { Id, Doc } from "convex/_generated/dataModel";
import { useUpdateProjectSettings } from "~/features/projects/hooks/use-projects";
import { Input } from "~/components/ui/input";

const formSchema = z.object({
  installCommand: z.string(),
  devCommand: z.string(),
});

interface PreviewSettingsPopoverProps {
  projectId: Id<"projects">;
  initialSettings: Doc<"projects">["settings"];
  onSave?: () => void;
}

function PreviewSettingsPopover({
  projectId,
  initialSettings,
  onSave,
}: PreviewSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const updateProjectSettings = useUpdateProjectSettings();
  const form = useForm({
    defaultValues: {
      installCommand: initialSettings?.installCommand || "",
      devCommand: initialSettings?.devCommand || "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      await updateProjectSettings.mutateAsync({
        projectId,
        settings: value,
      });
      onSave?.();
      setOpen(false);
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({
        installCommand: initialSettings?.installCommand || "",
        devCommand: initialSettings?.devCommand || "",
      });
    }
    setOpen(isOpen);
  };
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-full rounded-none"
          title="Preview Settings"
        >
          <SettingsIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Preview Settings</h4>
              <p className="text-xs text-muted-foreground">
                Configure how your project runs in the preview
              </p>
            </div>
          </div>
          <form.Field
            name="installCommand"
            children={(field) => {
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>Install Command</FieldLabel>

                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={"npm install"}
                  />
                  <FieldDescription>
                    Command to instal dependencies
                  </FieldDescription>
                </Field>
              );
            }}
          >
            {/* <Button type="submit">Save</Button> */}
          </form.Field>

          <form.Field
            name="devCommand"
            children={(field) => {
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>Start Command</FieldLabel>

                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={"npm install"}
                  />
                  <FieldDescription>
                    Command to start the developmemt server
                  </FieldDescription>
                </Field>
              );
            }}
          ></form.Field>
          <form.Subscribe
            selector={(form) => [form.isSubmitting, form.canSubmit]}
          >
            {([isSubmitting, canSubmit]) => {
              return (
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? " Saving Changes" : "Save Changes"}
                </Button>
              );
            }}
          </form.Subscribe>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export default PreviewSettingsPopover;
