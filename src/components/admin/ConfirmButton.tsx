import type { ReactNode } from "react";

/**
 * Tombol submit dengan pesan konfirmasi khusus (mis. hapus).
 * Pop-up-nya ditampilkan oleh <ConfirmGuard /> di layout CMS.
 */
export function ConfirmButton({ message, className, children, label }: { message: string; className?: string; children: ReactNode; label?: string }) {
  return (
    <button type="submit" className={className} aria-label={label} data-confirm={message} data-confirm-tone="danger">
      {children}
    </button>
  );
}
