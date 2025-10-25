/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-03-07 00:42:35
 * @FilePath: /self-tools/Users/sushao/Documents/code/tauri/packages/Hclipboard/src/pages/Home/index.tsx
 */
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import React, { useEffect, useState } from 'react';
import HistoryItem from './components/HistoryItem';
import useClipData from './hooks/useClipData';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@hclipboard/components/ui/resizable';
import { Separator } from '@hclipboard/components/ui/separator';
import { match } from 'ts-pattern';
import { copyToClipboard } from '@hclipboard/rpc/query';
const appWindow = getCurrentWebviewWindow();

export default function Home() {
  // 表单
  const [searchName, setSearchName] = useState<string>('');
  // 历史记录
  const data = useClipData(searchName);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  useEffect(() => {
    setSelectedIndex(0);
  }, [data]);
  useEffect(() => {
    const fn = appWindow.onFocusChanged(() => {
      setSearchName('');
    });
    return () => {
      (async () => {
        const f = await fn;
        f();
      })();
    };
  }, []);
  // focus
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
    }
  }, [inputRef]);
  const detail = data.at(selectedIndex);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Check if IME composition is finished before triggering key binds
    // This prevents unwanted triggering while user is still inputting text with IME
    // e.keyCode === 229 is for the CJK IME with Legacy Browser [https://w3c.github.io/uievents/#determine-keydown-keyup-keyCode]
    // isComposing is for the CJK IME with Modern Browser [https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent/isComposing]
    const isComposing = e.nativeEvent.isComposing;

    if (e.defaultPrevented || isComposing) {
      return;
    }
    match(e.key)
      .with('ArrowUp', () => {
        if (selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1);
        }
      })
      .with('ArrowDown', () => {
        if (selectedIndex < data.length - 1) {
          setSelectedIndex(selectedIndex + 1);
        }
      })
      .with('Enter', async () => {
        const item = data[selectedIndex];
        // todo
        // await copyToClipboard(item.data);
      })
      // oxlint-disable-next-line no-empty-function
      .otherwise(() => {});
  };
  const [selectedRef, setSelectedRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (selectedRef) {
      selectedRef?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedRef]);

  return (
    <div className="w-full h-full flex flex-col" onKeyDown={handleKeyDown}>
      <input
        className="p-3 pl-4 pr-4 appearance-none border-none focus:outline-none"
        ref={setInputRef}
        placeholder="搜索"
        spellCheck={false}
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />
      <Separator />
      <ResizablePanelGroup className="flex-1" direction="horizontal">
        <ResizablePanel defaultSize={35}>
          <ul className="overflow-y-auto h-full">
            {data.map((item, index) => (
              <HistoryItem
                key={item.id}
                item={item}
                selected={index === selectedIndex}
                {...match(selectedIndex)
                  .with(index, () => ({ ref: setSelectedRef }))
                  .otherwise(() => ({}))}
                onPointerMove={() => setSelectedIndex(index)}
              />
            ))}
          </ul>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>2222</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
