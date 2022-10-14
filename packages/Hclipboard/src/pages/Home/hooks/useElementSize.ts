import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export default function useElementSize(): [DOMRect | undefined, RefObject<HTMLElement>] {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState<DOMRect>();
  // 重设大小
  const updateSize = useCallback(() => {
    const domRect = ref.current?.getBoundingClientRect();
    setSize(domRect);
  }, [ref]);
  useEffect(() => {
    updateSize();
    const dom = ref.current;
    dom?.addEventListener('resize', updateSize);
    return () => {
      dom?.removeEventListener('resize', updateSize);
    };
  }, [ref, updateSize]);
  return [size, ref];
}
