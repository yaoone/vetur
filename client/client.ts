import * as vscode from 'vscode';
import {
  LanguageClient,
  RevealOutputChannelOn,
  ServerOptions,
  TransportKind,
  LanguageClientOptions
} from 'vscode-languageclient';
import { resolve } from 'path';
import { existsSync } from 'fs';

export function initializeLanguageClient(vlsModulePath: string): LanguageClient {
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6005'] };

  const documentSelector = ['vue'];
  const config = vscode.workspace.getConfiguration();

  let serverPath;

  const devVlsPackagePath = config.get('vetur.dev.vlsPath', '');
  if (devVlsPackagePath && devVlsPackagePath !== '' && existsSync(devVlsPackagePath)) {
    serverPath = resolve(devVlsPackagePath, 'dist/vueServerMain.js');
  } else {
    serverPath = vlsModulePath;
  }

  const runExecArgv: string[] = [];
  if (config.get('vetur.dev.vlsPort') !== -1) {
    runExecArgv.push(`--inspect=${config.get('vetur.dev.vlsPort')}`);
  }

  const serverOptions: ServerOptions = {
    run: { module: serverPath, transport: TransportKind.ipc, options: { execArgv: runExecArgv } },
    debug: { module: serverPath, transport: TransportKind.ipc, options: debugOptions }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector,
    synchronize: {
      configurationSection: ['vetur', 'emmet', 'html', 'javascript', 'typescript', 'prettier', 'stylusSupremacy'],
      fileEvents: vscode.workspace.createFileSystemWatcher('{**/*.js,**/*.ts}', false, false, true)
    },
    initializationOptions: {
      config
    },
    revealOutputChannelOn: RevealOutputChannelOn.Never
  };

  return new LanguageClient('vetur', 'Vue Language Server', serverOptions, clientOptions);
}
