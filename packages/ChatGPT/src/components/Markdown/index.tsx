import {
  Box,
  type BoxProps,
  Divider,
  Link,
  Paper,
  type SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  type Theme,
  Typography,
  type TypographyProps,
} from '@mui/material';
import MarkdownSource, { type MarkdownToJSX } from 'markdown-to-jsx';
import Prism from 'prismjs';
import React, { startTransition, useEffect } from 'react';
import { match, P } from 'ts-pattern';
import './init';

export interface MarkdownProps extends BoxProps {
  value: string;
}

function CustomImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <Box component="img" {...props} />;
}

function CustomLink(props: { title: string; href: string; children: string }) {
  return (
    <Link title={props.title} href={props.href} target="_blank" sx={{ display: 'inline-block', ml: 0.5, mr: 0.5 }}>
      {props.children}
    </Link>
  );
}

function CustomHead(props: TypographyProps) {
  return (
    <>
      <Typography
        sx={{
          margin: match(props.variant)
            .with('h2', () => '10px 0 0 10px')
            .otherwise(() => '30px 0 0 10px'),
        }}
        id={String(props.children)}
        variant={props.variant}
      >
        {props.children}
      </Typography>
      <Divider
        sx={{
          margin: '15px 0 15px 0',
        }}
      />
    </>
  );
}

function MyCode(props: { children: string; className?: string }) {
  if (props.className) {
    return <code className={props.className}>{props.children}</code>;
  } else {
    return (
      <Box
        component="span"
        sx={({
          palette: {
            secondary: { main, contrastText },
          },
        }) => ({
          borderRadius: 2,
          p: 0.3,
          pl: 0.5,
          pr: 0.5,
          m: 0.3,
          mr: 0.5,
          ml: 0.5,
          minWidth: 20,
          fontSize: 17,
          background: main,
          color: contrastText,
          display: 'inline-flex',
          justifyContent: 'center',
        })}
        className="code-inline"
      >
        {props.children}
      </Box>
    );
  }
}

function CustomPre(props: { children: string }) {
  return (
    <Box sx={{ width: '100%' }}>
      <Box component="pre" className="line-numbers" sx={{ width: '100%' }}>
        {props.children}
      </Box>
    </Box>
  );
}

function MyListItem(props: { children: JSX.Element[] }) {
  return (
    <li>
      {props.children.map((value) => {
        return match(value)
          .with(P.string, (str) => (
            <Typography
              variant="body1"
              component="span"
              sx={{
                margin: '6px 0 6px 0',
                display: 'inline-block',
              }}
              key={str.toString()}
            >
              {str}
            </Typography>
          ))
          .otherwise(() => value);
      })}
    </li>
  );
}

function MyTable(props: { children: JSX.Element }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        margin: '10px 5px 10px 5px',
        width: 'auto',
      }}
    >
      <Table>{props.children}</Table>
    </TableContainer>
  );
}

function MyBlockquote(props: { children: JSX.Element }) {
  return (
    <Box
      sx={{
        mt: 2,
        mb: 2,
        p: 1,
        borderRadius: 2,
        background: 'var(--you-on-tertiary)',
        color: 'var(--you-tertiary)',
      }}
    >
      {props.children}
    </Box>
  );
}

const option: MarkdownToJSX.Options = {
  overrides: {
    h1: {
      component: CustomHead,
      props: {
        variant: 'h2',
      },
    },
    h2: {
      component: CustomHead,
      props: {
        variant: 'h3',
      },
    },
    h3: {
      component: CustomHead,
      props: {
        variant: 'h4',
      },
    },
    h4: {
      component: CustomHead,
      props: {
        variant: 'h5',
      },
    },
    p: {
      component: Typography,
      props: {
        variant: 'body1',
        sx: {
          fontSize: 16,
          lineHeight: '1.5em',
        } as SxProps<Theme>,
      },
    },
    img: CustomImage,
    a: CustomLink,
    code: MyCode,
    pre: CustomPre,
    li: MyListItem,
    table: MyTable,
    thead: TableHead,
    tr: TableRow,
    tbody: TableBody,
    td: TableCell,
    th: TableCell,
    hr: Divider,
    blockquote: MyBlockquote,
  },
};
export default function CustomMarkdown({ value, ...props }: MarkdownProps): JSX.Element {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref === null) return;
    startTransition(() => {
      Prism.highlightAllUnder(ref);
    });
  }, [value, ref]);
  return (
    <Box {...props} ref={setRef}>
      <MarkdownSource options={option}>{value}</MarkdownSource>
    </Box>
  );
}
