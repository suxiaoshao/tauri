import React, { type ComponentProps, type JSX, startTransition, useEffect } from 'react';
import MarkdownSource, { type MarkdownToJSX } from 'markdown-to-jsx';
import Prism from 'prismjs';
import './init';
import { match, P } from 'ts-pattern';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export interface MarkdownProps extends ComponentProps<'div'> {
  value: string;
}

function CustomImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  // oxlint-disable-next-line alt-text no-img-element
  return <img {...props} />;
}

function CustomLink(props: { title: string; href: string; children: string }) {
  return (
    // oxlint-disable-next-line no-html-link-for-pages
    <a
      title={props.title}
      href={props.href}
      target="_blank"
      className="inline-block ml-1 mr-1 underline text-blue-700 dark:text-blue-300"
    >
      {props.children}
    </a>
  );
}

function CustomCode(props: { children: string; className?: string }) {
  if (props.className) {
    return <code className={props.className}>{props.children}</code>;
  }
  return (
    <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {props.children}
    </code>
  );
}

function CustomPre(props: { children: string }) {
  return (
    <div>
      <pre className="line-numbers">{props.children}</pre>
    </div>
  );
}

function CustomListItem(props: { children: JSX.Element[] }) {
  return (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
      {props.children.map((value) =>
        match(value)
          .with(P.string, (value) => <li key={JSON.stringify(value)}>{value}</li>)
          .otherwise((value) => value),
      )}
    </ul>
  );
}

function TypographyH1({ children }: { children: JSX.Element }) {
  return <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">{children}</h1>;
}

function TypographyH2({ children }: { children: JSX.Element }) {
  return <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{children}</h2>;
}

function TypographyH3({ children }: { children: JSX.Element }) {
  return <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{children}</h3>;
}

function TypographyH4({ children }: { children: JSX.Element }) {
  return <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{children}</h4>;
}

function TypographyP({ children }: { children: JSX.Element }) {
  return <p className="leading-7 not-first:mt-6">{children}</p>;
}

function TypographyBlockquote({ children }: { children: JSX.Element }) {
  return <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>;
}

const option: MarkdownToJSX.Options = {
  overrides: {
    h1: TypographyH1,
    h2: TypographyH2,
    h3: TypographyH3,
    h4: TypographyH4,
    p: TypographyP,
    img: CustomImage,
    a: CustomLink,
    code: CustomCode,
    pre: CustomPre,
    ul: CustomListItem,
    table: Table,
    thead: TableHeader,
    tr: TableRow,
    tbody: TableBody,
    td: TableCell,
    th: TableHead,
    hr: Separator,
    blockquote: TypographyBlockquote,
  },
};
export default function CustomMarkdown({ value, ...props }: MarkdownProps) {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref === null) return;
    startTransition(() => {
      Prism.highlightAllUnder(ref);
    });
  }, [value, ref]);
  return (
    <div {...props} ref={setRef}>
      <MarkdownSource options={option}>{value}</MarkdownSource>
    </div>
  );
}
