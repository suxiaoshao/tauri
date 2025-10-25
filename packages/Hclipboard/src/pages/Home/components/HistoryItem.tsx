import { Text, File, Image, CodeXml, Code } from 'lucide-react';
import { ClipType, type ClipHistory } from '../hooks/useClipData';
import { match } from 'ts-pattern';
import { cn } from '@hclipboard/lib/utils';

export interface HistoryItemProps {
  item: ClipHistory;
  selected: boolean;
  onPointerMove?: () => void;
  ref?: React.Ref<HTMLLIElement>;
}

export default function HistoryItem({ item: { data, type }, selected, ref, onPointerMove }: HistoryItemProps) {
  const decoder = new TextDecoder('utf8');
  return (
    <li
      className={cn(
        'flex gap-2 px-2 py-3 text-sm outline-hidden select-none',
        selected && 'bg-accent text-accent-foreground',
      )}
      ref={ref}
      onPointerMove={onPointerMove}
    >
      {match(type)
        .with(ClipType.Text, () => (
          <>
            <Text />
            <span className="truncate">{decoder.decode(data)}</span>
          </>
        ))
        .with(ClipType.Image, () => (
          <>
            <Image />
            <span></span>
          </>
        ))
        .with(ClipType.Files, () => (
          <>
            <File />
            <span></span>
          </>
        ))
        .with(ClipType.Rtf, () => (
          <>
            <Code />
            <span></span>
          </>
        ))
        .with(ClipType.Html, () => (
          <>
            <CodeXml />
            <span></span>
          </>
        ))
        .exhaustive()}
    </li>
  );
}
