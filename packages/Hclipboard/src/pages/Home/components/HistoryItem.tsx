import { Text, File, Image, CodeXml, Code } from 'lucide-react';
import { type ClipHistory } from '../hooks/useClipData';
import { match } from 'ts-pattern';
import { cn } from '@hclipboard/lib/utils';
import { Badge } from '@hclipboard/components/ui/badge';
import { ClipboardType } from '@hclipboard/rpc/query';

export interface HistoryItemProps {
  item: ClipHistory;
  selected: boolean;
  onPointerMove?: () => void;
  ref?: React.Ref<HTMLLIElement>;
}

export default function HistoryItem({ item: { data }, selected, ref, onPointerMove }: HistoryItemProps) {
  const spanClass = 'truncate flex-1';
  return (
    <li
      className={cn(
        'flex gap-2 px-4 py-3 text-sm outline-hidden select-none relative',
        selected &&
          'after:bg-input after:left-1.5 after:top-0 after:absolute after:w-[calc(100%-(--spacing(3)))] after:h-full after:rounded-lg after:content-[""] after:-z-10',
      )}
      ref={ref}
      onPointerMove={onPointerMove}
    >
      {match(data)
        .with({ tag: ClipboardType.Text }, ({ value: { text } }) => (
          <>
            <Text />
            <span className={spanClass}>{text}</span>
          </>
        ))
        .with({ tag: ClipboardType.Image }, ({ value: { height, width } }) => (
          <>
            <Image />
            <span className={spanClass}>
              Image ({width}x{height})
            </span>
          </>
        ))
        .with({ tag: ClipboardType.Files }, ({ value }) => (
          <>
            <File />
            <span className={spanClass}>{value.map((file) => file.split('/').pop()).join(',')}</span>
            <Badge>{value.length} Files</Badge>
          </>
        ))
        .with({ tag: ClipboardType.Rtf }, ({ value: { plainText } }) => (
          <>
            <Code />
            <span className={spanClass}>{plainText}</span>
          </>
        ))
        .with({ tag: ClipboardType.Html }, ({ value: { plainText } }) => (
          <>
            <CodeXml />
            <span className={spanClass}>{plainText}</span>
          </>
        ))
        .exhaustive()}
    </li>
  );
}
