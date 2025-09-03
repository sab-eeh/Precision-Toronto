// src/components/ui/Popover.jsx
import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef(
  ({ className, align = "center", sideOffset = 6, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-auto rounded-xl border border-blue-500/20 bg-[#111827] p-4 text-white shadow-xl outline-none " +
            "animate-in fade-in-0 zoom-in-95 " +
            "data-[side=bottom]:slide-in-from-top-2 " +
            "data-[side=top]:slide-in-from-bottom-2 " +
            "data-[side=left]:slide-in-from-right-2 " +
            "data-[side=right]:slide-in-from-left-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
);

PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
