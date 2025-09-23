/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 05:08:53
 */
import { editor } from 'monaco-editor';
import monankai from 'monaco-themes/themes/Dracula.json';
editor.defineTheme('dracula', monankai as editor.IStandaloneThemeData);

// @ts-expect-error @ts-expect-error
self.MonacoEnvironment = {
  getWorker: function getWorker() {
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
  },
};
