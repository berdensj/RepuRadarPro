import React from "react";
import { cn } from "@/lib/utils";

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode;
}

export function Code({ className, children, ...props }: CodeProps) {
  return (
    <pre 
      className={cn(
        "rounded-lg bg-muted p-4 overflow-auto text-sm font-mono", 
        className
      )} 
      {...props}
    >
      <code>{children}</code>
    </pre>
  );
}