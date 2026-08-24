import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Mengecek apakah layar sesuai dengan breakpoint (default: 768px / Tailwind 'md')
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    // Set nilai awal
    setIsMobile(mediaQuery.matches);

    // Event listener untuk memantau perubahan ukuran layar
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
}