declare module 'vivus' {
  type TimingFunction = (input: number) => number;

  interface VivusOptions {
    type?: 'delayed' | 'sync' | 'oneByOne' | 'script' | 'scenario' | 'scenario-sync';
    duration?: number;
    delay?: number;
    start?: 'inViewport' | 'manual' | 'autostart';
    dashGap?: number;
    forceRender?: boolean;
    reverseStack?: boolean;
    selfDestroy?: boolean;
    pathTimingFunction?: TimingFunction;
    animTimingFunction?: TimingFunction;
    onReady?: (vivusObj: Vivus) => void;
  }

  interface VivusPathMapItem {
    el: SVGPathElement;
    length: number;
    startAt: number;
    duration: number;
    progress: number;
  }

  class Vivus {
    static LINEAR: TimingFunction;
    static EASE: TimingFunction;
    static EASE_IN: TimingFunction;
    static EASE_OUT: TimingFunction;
    static EASE_OUT_BOUNCE: TimingFunction;

    map: VivusPathMapItem[];

    constructor(
      element: string | HTMLElement | SVGElement,
      options?: VivusOptions,
      callback?: (vivusObj: Vivus) => void
    );

    play(speed?: number, callback?: () => void): this;
    stop(): this;
    reset(): this;
    finish(): this;
    setFrameProgress(progress: number): this;
    getStatus(): 'start' | 'progress' | 'end';
    destroy(): void;
  }

  export default Vivus;
}
