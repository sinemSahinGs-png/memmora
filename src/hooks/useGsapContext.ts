"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ContextFactory = () => void | (() => void);

export function useGsapContext(
  factory: ContextFactory,
  deps: React.DependencyList = [],
  scope?: React.RefObject<HTMLElement | null>,
) {
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  useLayoutEffect(() => {
    let cleanup: void | (() => void);

    const ctx = gsap.context(() => {
      cleanup = factoryRef.current();
    }, scope?.current ?? undefined);

    return () => {
      if (typeof cleanup === "function") cleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
