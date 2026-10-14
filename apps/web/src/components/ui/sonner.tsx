import { useTheme } from "@/components/theme-provider"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Toasts are plain text on a paper sheet: no status icons, the action is a text button.
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{ success: null, info: null, warning: null, error: null }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "8px",
          "--font-size": "13px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast shadow-(--shadow-overlay)! text-sm!",
          description: "text-muted-foreground!",
          actionButton:
            "bg-transparent! text-foreground! font-medium! underline! underline-offset-4!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
