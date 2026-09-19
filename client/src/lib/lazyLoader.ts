import React, { lazy, ComponentType } from "react";

interface LazyComponent<T = any> {
  (): Promise<{ default: ComponentType<T> }>;
  preload?: () => Promise<{ default: ComponentType<T> }>;
}

export function lazyWithPreload<T = any>(
  factory: () => Promise<{ default: ComponentType<T> }>
) {
  const LazyComponent = lazy(factory) as React.LazyExoticComponent<ComponentType<T>> & { preload: () => Promise<{ default: ComponentType<T> }> };
  (LazyComponent as any).preload = factory;
  return LazyComponent;
}

export function preloadPage(path: string) {
  return import(/* @vite-ignore */ `../pages${path}`);
}

export function clearLoadedComponents() {
  // No-op for compatibility
}
