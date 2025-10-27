import { Text, File, Image, CodeXml, Code } from 'lucide-react';
import { ClipType, type ClipHistory } from '../hooks/useClipData';
import { match } from 'ts-pattern';
import { cn } from '@hclipboard/lib/utils';
import { Badge } from '@hclipboard/components/ui/badge';

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
        'flex gap-2 px-2 py-3 text-sm outline-hidden select-none',
        selected && 'bg-accent text-accent-foreground',
      )}
      ref={ref}
      onPointerMove={onPointerMove}
    >
      {match(data)
        .with({ tag: ClipType.Text }, ({ value: { data } }) => (
          <>
            <Text />
            <span className={spanClass}>{data}</span>
          </>
        ))
        .with({ tag: ClipType.Image }, ({ value: { height, width } }) => (
          <>
            <Image />
            <span className={spanClass}>
              Image ({width}x{height})
            </span>
          </>
        ))
        .with({ tag: ClipType.Files }, ({ value }) => (
          <>
            <File />
            <span className={spanClass}>{value.map((file) => file.split('/').pop()).join(',')}</span>
            <Badge>{value.length} Files</Badge>
          </>
        ))
        .with({ tag: ClipType.Rtf }, ({ value: { data } }) => (
          <>
            <Code />
            <span className={spanClass}>{data}</span>
          </>
        ))
        .with({ tag: ClipType.Html }, ({ value: { data } }) => (
          <>
            <CodeXml />
            <span className={spanClass}>{data}</span>
          </>
        ))
        .exhaustive()}
    </li>
  );
}
