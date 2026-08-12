"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    iFrameResize?: (
      options: Record<string, unknown>,
      target: string,
    ) => void;
  }
}

interface PaytrIframeProps {
  token: string;
}

const IFRAME_SCRIPT = "https://www.paytr.com/js/iframeResizer.min.js";

export function PaytrIframe({ token }: PaytrIframeProps) {
  const readyRef = useRef(false);

  useEffect(() => {
    readyRef.current = false;

    const applyResize = () => {
      if (readyRef.current) return;
      if (typeof window.iFrameResize !== "function") return;
      readyRef.current = true;
      window.iFrameResize(
        {
          log: false,
          checkOrigin: false,
        },
        "#paytriframe",
      );
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${IFRAME_SCRIPT}"]`,
    );

    if (existing) {
      applyResize();
      existing.addEventListener("load", applyResize);
      return () => existing.removeEventListener("load", applyResize);
    }

    const script = document.createElement("script");
    script.src = IFRAME_SCRIPT;
    script.async = true;
    script.addEventListener("load", applyResize);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", applyResize);
    };
  }, [token]);

  return (
    <div className="purchase-paytr">
      <p className="purchase-paytr__eyebrow">Güvenli ödeme · PayTR</p>
      <div className="purchase-paytr__frame-wrap">
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${token}`}
          id="paytriframe"
          title="PayTR güvenli ödeme"
          frameBorder={0}
          scrolling="no"
          className="purchase-paytr__iframe"
        />
      </div>
    </div>
  );
}
