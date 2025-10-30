import { match } from 'ts-pattern';
import { type ClipHistory } from '../hooks/useClipData';
import { Separator } from '@hclipboard/components/ui/separator';
import formatTime from '@hclipboard/utils/formatTime';
import { Fragment } from 'react/jsx-runtime';
import prettyBytes from 'pretty-bytes';
import { RTFJS } from 'rtf.js';
import { useCallback, useEffect, useState } from 'react';
import { encodeNonAsciiHTML } from 'entities';
import { ClipboardType } from '@hclipboard/rpc/query';

RTFJS.loggingEnabled(false);

interface InformationItemProps {
  label: string;
  value: string | number;
}

function InformationItem({ label, value }: InformationItemProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

interface InformationsProps {
  items: InformationItemProps[];
}

function Informations({ items }: InformationsProps) {
  return (
    <div className="p-3 gap-2 flex flex-col">
      <span className="text-muted-foreground text-sm">Information</span>
      <ul className="flex flex-col gap-1">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            <InformationItem {...item} />
            {index !== items.length - 1 && <Separator />}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}

interface RtfDetailProps {
  text: string;
  wordCount: number;
  charCount: number;
  updateTime: number;
}

function RtfDetail({ text, wordCount, charCount, updateTime }: RtfDetailProps) {
  const [renderedData, setRenderedData] = useState<HTMLElement[] | null>(null);
  const promiseFn = useCallback(async () => {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(text);
    const doc = new RTFJS.Document(buffer.buffer, {});
    setRenderedData(await doc.render());
  }, [text]);

  useEffect(() => {
    promiseFn();
  }, [promiseFn]);

  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (ref && renderedData?.length) {
      ref.innerHTML = '';
      for (const element of renderedData) {
        ref.append(element);
      }
      return () => {
        ref.innerHTML = '';
      };
    }
  }, [ref, renderedData]);

  return (
    <>
      <div className="flex-1 overflow-y-auto" ref={setRef} />
      <Separator />
      <Informations
        items={[
          { label: 'Content Type', value: 'RTF' },
          { label: 'Characters', value: charCount },
          { label: 'Words', value: wordCount },
          { label: 'Copied', value: formatTime(updateTime) },
        ]}
      />
    </>
  );
}

interface HistoryDetailsProps {
  item: ClipHistory;
}

export default function HistoryDetails({ item }: HistoryDetailsProps) {
  return (
    <div className="flex flex-col h-full w-full">
      {match(item)
        .with(
          { data: { tag: ClipboardType.Text } },
          ({
            data: {
              value: { charCount, text, wordCount },
            },
            updateTime,
          }) => {
            const dataList = text.split('\n').map((value) => encodeNonAsciiHTML(value).replaceAll(' ', '&nbsp;'));
            return (
              <>
                <div className="flex-1 overflow-y-auto p-3">
                  {dataList.map((value, index) => (
                    // oxlint-disable-next-line no-array-index-key no-danger
                    <p key={index} className="leading-7 break-all" dangerouslySetInnerHTML={{ __html: value }} />
                  ))}
                </div>
                <Separator />
                <Informations
                  items={[
                    { label: 'Content Type', value: 'Text' },
                    { label: 'Char Count', value: charCount },
                    { label: 'Word Count', value: wordCount },
                    { label: 'Copied', value: formatTime(updateTime) },
                  ]}
                />
              </>
            );
          },
        )
        .with(
          { data: { tag: ClipboardType.Image } },
          ({
            data: {
              value: { data, height, size, width },
            },
            updateTime,
          }) => {
            const url = URL.createObjectURL(new Blob([data], { type: 'image/png' }));
            return (
              <>
                <div className="flex-1 overflow-hidden">
                  <img className="max-w-full max-h-full object-contain" src={url} alt="Clipboard" />
                </div>
                <Separator />
                <Informations
                  items={[
                    { label: 'Content Type', value: 'Image' },
                    { label: 'Size', value: prettyBytes(size) },
                    { label: 'Dimensions', value: `${width} x ${height}` },
                    { label: 'Copied', value: formatTime(updateTime) },
                  ]}
                />
              </>
            );
          },
        )
        .with({ data: { tag: ClipboardType.Files } }, ({ data: { value }, updateTime }) => (
          <>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {value.map((file) => (
                <span key={file} className="break-all">
                  {file}
                </span>
              ))}
            </div>
            <Separator />
            <Informations
              items={[
                { label: 'Content Type', value: 'Files' },
                { label: 'Files Count', value: value.length },
                { label: 'copied', value: formatTime(updateTime) },
              ]}
            />
          </>
        ))
        .with(
          { data: { tag: ClipboardType.Html } },
          ({
            data: {
              value: { text, charCount, wordCount },
            },
            updateTime,
          }) => (
            <>
              {/* oxlint-disable-next-line no-danger */}
              <div className="flex-1 overflow-y-auto" dangerouslySetInnerHTML={{ __html: text }} />
              <Separator />
              <Informations
                items={[
                  { label: 'Content Type', value: 'HTML' },
                  { label: 'Characters', value: charCount },
                  { label: 'Words', value: wordCount },
                  { label: 'Copied', value: formatTime(updateTime) },
                ]}
              />
            </>
          ),
        )
        .with(
          { data: { tag: ClipboardType.Rtf } },
          ({
            data: {
              value: { text, charCount, wordCount },
            },
            updateTime,
          }) => <RtfDetail text={text} charCount={charCount} wordCount={wordCount} updateTime={updateTime} />,
        )
        .exhaustive()}
    </div>
  );
}
