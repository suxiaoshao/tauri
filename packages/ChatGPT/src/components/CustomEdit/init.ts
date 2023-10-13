import 'monaco-editor/esm/vs/editor/editor.main';
import { editor } from 'monaco-editor';
import monankai from 'monaco-themes/themes/Dracula.json';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
self.MonacoEnvironment = {
  getWorker: function (moduleId, label) {
    if (label === 'json') {
      return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url));
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url));
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url));
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url));
    }
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
  },
};
editor.defineTheme('dracula', monankai as editor.IStandaloneThemeData);
