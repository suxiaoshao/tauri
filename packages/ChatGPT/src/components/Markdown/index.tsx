import React, { startTransition, useEffect } from 'react';
import MarkdownSource, { MarkdownToJSX } from 'markdown-to-jsx';
import Prism from 'prismjs';
import './init';
import {
  Divider,
  TypographyProps,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Link,
  Box,
  BoxProps,
  SxProps,
  Theme,
} from '@mui/material';

export interface MarkdownProps extends BoxProps {
  value: string;
}

function CustomImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <Box component={'img'} {...props} />;
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
          margin: `${props.variant !== 'h2' ? '30px' : '10px'} 0 0 10px`,
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
  if (props.className !== undefined) {
    return <code className={props.className}>{props.children}</code>;
  } else {
    return (
      <Box
        component={'span'}
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

function MyPre(props: { children: string }) {
  return (
    <div>
      <pre className="line-numbers">{props.children}</pre>
    </div>
  );
}

function MyListItem(props: { children: JSX.Element[] }) {
  return (
    <li>
      {props.children.map((value) => {
        return typeof value === 'string' ? (
          <Typography
            variant="body1"
            component="span"
            sx={{
              margin: '6px 0 6px 0',
              display: 'inline-block',
            }}
            key={value}
          >
            {value}
          </Typography>
        ) : (
          value
        );
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
          lineHeight: '1.5em',
          fontSize: 17,
        } as SxProps<Theme>,
      },
    },
    img: CustomImage,
    a: CustomLink,
    code: MyCode,
    pre: MyPre,
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
  useEffect(() => {
    startTransition(() => {
      Prism.highlightAll();
    });
  }, [value]);
  return (
    <Box {...props}>
      <MarkdownSource options={option}>{value}</MarkdownSource>
    </Box>
  );
}
