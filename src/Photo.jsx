import React, { useEffect, useRef, useState } from "react";
import { media } from "./company-media";
export default function Photo({
  src,
  photo,
  type = "team",
  className = "",
  eager = false,
  contain = false,
}) {
  const item = photo || media[type] || media.team;
  const frame = useRef(null);
  const [visible, setVisible] = useState(eager);
  useEffect(() => {
    if (eager || src || visible) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, [eager, src, visible]);
  return (
    <figure ref={frame} className={`photo ${className}`}>
      {src ? (
        <img
          src={src}
          alt={item.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <svg
          viewBox={item.box.join(" ")}
          role="img"
          aria-label={item.alt}
          preserveAspectRatio={contain ? "xMidYMid meet" : "xMidYMid slice"}
        >
          {visible && (
            <image
              href={item.src}
              width={item.width}
              height={item.height}
              transform={
                item.rotate
                  ? `translate(0 ${item.width}) rotate(-90)`
                  : undefined
              }
            />
          )}
        </svg>
      )}
    </figure>
  );
}
