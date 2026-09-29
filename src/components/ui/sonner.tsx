"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Check, CircleAlert, Info, LoaderCircle, TriangleAlert } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const [position, setPosition] = useState<ToasterProps["position"]>("bottom-right");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setPosition(query.matches ? "top-center" : "bottom-right");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <Sonner
      theme="dark"
      position={position}
      duration={4000}
      className="toaster group"
      icons={{
        success: <Check className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        error: <CircleAlert className="size-4" />,
        loading: <LoaderCircle className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
