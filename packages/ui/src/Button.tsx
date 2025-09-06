import * as React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string };
export function Button({ label = "Click", ...rest }: Props) {
  return (
    <button {...rest}
      style={{ padding:"10px 16px", borderRadius:8, border:"1px solid #e5e7eb",
               background:"#111", color:"#fff", cursor:"pointer" }}>
      {label}
    </button>
  );
}
