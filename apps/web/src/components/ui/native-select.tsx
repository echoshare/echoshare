import * as React from "react";

import { cn } from "@/lib/utils";

/** A lightly-styled native `<select>` — enough for device/mode pickers. */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:text-foreground [&>option]:bg-background",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
