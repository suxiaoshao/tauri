/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-03-07 00:42:35
 * @FilePath: /self-tools/Users/sushao/Documents/code/tauri/packages/Hclipboard/src/pages/Home/index.tsx
 */
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import React, { useEffect, useReducer, useState } from 'react';
import HistoryItem from './components/HistoryItem';
import useClipData from './hooks/useClipData';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@hclipboard/components/ui/resizable';
import { Separator } from '@hclipboard/components/ui/separator';
import { match, P } from 'ts-pattern';
import { type ClipboardType, copyToClipboard, type QueryHistoryRequest } from '@hclipboard/rpc/query';
import HistoryDetails from './components/HistoryDetails';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@hclipboard/components/ui/empty';
import { Copy } from 'lucide-react';
import { TypeSelect } from './components/TypeSelect';
import type { Enum } from 'types';
const appWindow = getCurrentWebviewWindow();

type Action =
  | Enum<'setSearchName', string | undefined>
  | Enum<'setClipboardType', ClipboardType | undefined>
  | Enum<'reset'>;

function reducer(state: QueryHistoryRequest, action: Action): QueryHistoryRequest {
  return match(action)
    .with({ tag: 'setSearchName' }, ({ value }) => ({ ...state, searchName: value }))
    .with(
      {
        tag: 'setClipboardType',
      },
      ({ value }) => ({ ...state, clipboardType: value }),
    )
    .with(
      {
        tag: 'reset',
      },
      () => ({ clipboardType: undefined, searchName: undefined }),
    )
    .otherwise(() => state);
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, { clipboardType: undefined, searchName: undefined });
  // 历史记录
  const data = useClipData(state);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  useEffect(() => {
    setSelectedIndex(0);
  }, [data]);
  // focus
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef?.focus();
    const unlisten = appWindow.onFocusChanged((handle) => {
      if (handle) {
        dispatch({ tag: 'reset' });
        inputRef?.focus();
      }
    });
    return () => {
      (async () => {
        const f = await unlisten;
        f();
      })();
    };
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
          e.preventDefault();
        }
      })
      .with('ArrowDown', () => {
        if (selectedIndex < data.length - 1) {
          setSelectedIndex(selectedIndex + 1);
          e.preventDefault();
        }
      })
      .with('Enter', async () => {
        const item = data.at(selectedIndex);
        if (!item) return;
        await copyToClipboard(item.id);
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
      <div className="p-3 pl-4 pr-4 flex">
        <input
          className="appearance-none border-none focus:outline-none flex-1"
          placeholder="搜索"
          spellCheck={false}
          ref={setInputRef}
          value={state.searchName}
          onChange={(e) => dispatch({ tag: 'setSearchName', value: e.target.value || undefined })}
        />
        <TypeSelect value={state.clipboardType} onChange={(value) => dispatch({ tag: 'setClipboardType', value })} />
      </div>
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
        <ResizablePanel>
          {match(detail)
            .with(P.nonNullable, (data) => <HistoryDetails item={data} />)
            .otherwise(() => (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Copy />
                  </EmptyMedia>
                  <EmptyTitle>No data</EmptyTitle>
                  <EmptyDescription>No data found</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ))}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
