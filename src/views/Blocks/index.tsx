import type { ComponentType } from 'react';

import { useMemo } from 'react';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  useClipboard,
} from '@/lib';
import { highlightTsx } from '@/views/ComponentDetail/highlight';
import { buildStackblitzProject } from '@/views/ComponentDetail/stackblitz';
import { intro, page } from '@/views/ComponentDetail/styles';
import { useSiteLocale } from '@/views/i18n';

import AiWorkbenchBlock from './blocks/AiWorkbenchBlock';
import ChatBlock from './blocks/ChatBlock';
import CrudBlock from './blocks/CrudBlock';
import DashboardBlock from './blocks/DashboardBlock';
import DataTableBlock from './blocks/DataTableBlock';
import FilterListBlock from './blocks/FilterListBlock';
import FormWizardBlock from './blocks/FormWizardBlock';
import KanbanBlock from './blocks/KanbanBlock';
import LoginBlock from './blocks/LoginBlock';
import ProfileBlock from './blocks/ProfileBlock';
import SettingsBlock from './blocks/SettingsBlock';
import { resolveBlockSource } from './block-sources';

/*
 * Blocks 页：整页级组合（dashboard / 登录 / 设置 / AI 聊天 / 主从 CRUD）
 * 的画廊。每个 block 一张卡片 —— 页内静态预览（600px 滚动盒）+ 源码折叠
 * + Open in StackBlitz（多文件工程：block 源码原文件 + 薄入口 App.tsx）。
 * block 组件本身零文档站依赖（只 import '@/lib'），预览、源码与
 * StackBlitz 跑的是同一份文件。
 */

type BlockId =
  | 'dashboard'
  | 'login'
  | 'settings'
  | 'chat'
  | 'crud'
  | 'aiWorkbench'
  | 'dataTable'
  | 'kanban'
  | 'formWizard'
  | 'filterList'
  | 'profile';

type BlockDef = {
  id: BlockId;
  Component: ComponentType;
  /** 预览盒滚动行为：dashboard 的 AppShell 自管内容滚动。 */
  overflow: 'auto' | 'hidden';
  /** StackBlitz 工程需要引入的 css family 闭包（含传递依赖）。 */
  cssFamilies: string[];
};

const BLOCKS: BlockDef[] = [
  {
    id: 'dashboard',
    Component: DashboardBlock,
    overflow: 'hidden',
    cssFamilies: [
      'app-shell', 'sidebar', 'tooltip', 'stat', 'data-table', 'checkbox',
      'dropdown-menu', 'empty', 'input', 'pagination', 'skeleton', 'table',
      'virtual-list', 'breadcrumb', 'button', 'badge', 'segmented', 'select',
      'chip', 'spinner', 'visually-hidden',
    ],
  },
  {
    id: 'login',
    Component: LoginBlock,
    overflow: 'auto',
    cssFamilies: ['card', 'form', 'input', 'password-input', 'checkbox', 'button', 'alert'],
  },
  {
    id: 'settings',
    Component: SettingsBlock,
    overflow: 'auto',
    cssFamilies: [
      'tabs', 'switch', 'radio', 'select', 'combobox', 'chip', 'spinner',
      'virtual-list', 'button', 'card',
    ],
  },
  {
    id: 'chat',
    Component: ChatBlock,
    overflow: 'hidden',
    cssFamilies: [
      'chat-container', 'chat-message', 'streaming-text', 'thinking-indicator',
      'tool-call-card', 'chat-input', 'conversation-list', 'avatar', 'badge',
      'button', 'empty', 'spinner',
    ],
  },
  {
    id: 'crud',
    Component: CrudBlock,
    overflow: 'auto',
    cssFamilies: [
      'tree', 'data-table', 'dialog', 'confirm-dialog', 'toast', 'form',
      'input', 'select', 'button', 'badge', 'segmented', 'kbd', 'checkbox',
      'dropdown-menu', 'empty', 'pagination', 'skeleton', 'spinner', 'table',
      'virtual-list', 'visually-hidden',
    ],
  },
  {
    id: 'aiWorkbench',
    Component: AiWorkbenchBlock,
    overflow: 'hidden',
    cssFamilies: [
      'workbench', 'resizable', 'activity-rail', 'status-bar', 'tab-bar',
      'conversation-list', 'chat-container', 'chat-message', 'streaming-text',
      'thinking-indicator', 'tool-call-card', 'prompt-input', 'model-picker',
      'sources', 'avatar', 'badge', 'button', 'empty', 'spinner', 'tooltip',
    ],
  },
  {
    id: 'dataTable',
    Component: DataTableBlock,
    overflow: 'auto',
    cssFamilies: [
      'data-table', 'checkbox', 'dropdown-menu', 'empty', 'input',
      'pagination', 'progress', 'segmented', 'select', 'skeleton', 'spinner',
      'table', 'virtual-list', 'visually-hidden', 'avatar', 'badge', 'button',
      'chip',
    ],
  },
  {
    id: 'kanban',
    Component: KanbanBlock,
    overflow: 'hidden',
    cssFamilies: [
      'avatar', 'avatar-group', 'badge', 'button', 'chip', 'dropdown-menu',
      'empty', 'input', 'progress', 'select', 'spinner', 'tooltip',
      'virtual-list', 'visually-hidden',
    ],
  },
  {
    id: 'formWizard',
    Component: FormWizardBlock,
    overflow: 'auto',
    cssFamilies: [
      'stepper', 'card', 'form', 'input', 'select', 'checkbox', 'button',
      'alert', 'chip', 'spinner', 'virtual-list',
    ],
  },
  {
    id: 'filterList',
    Component: FilterListBlock,
    overflow: 'auto',
    cssFamilies: [
      'card', 'input', 'checkbox', 'select', 'chip', 'badge', 'avatar',
      'rating', 'empty', 'pagination', 'button', 'spinner', 'virtual-list',
    ],
  },
  {
    id: 'profile',
    Component: ProfileBlock,
    overflow: 'auto',
    cssFamilies: [
      'card', 'avatar', 'avatar-group', 'badge', 'button', 'descriptions',
      'timeline', 'tag-group', 'spinner',
    ],
  },
];

/** 打开 block 的多文件 StackBlitz 工程；sdk 加载失败时静默放弃。 */
async function openBlockInStackBlitz(block: BlockDef, source: string): Promise<void> {
  const entry = resolveBlockSource(block.id);
  if (!entry) return;
  const componentName = entry.fileName.replace(/\.tsx$/, '');
  try {
    const { default: sdk } = await import('@stackblitz/sdk');
    sdk.openProject(
      buildStackblitzProject(`blocks-${block.id}`, `import ${componentName} from './${componentName}';

export default function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <${componentName} />
    </div>
  );
}
`, {
        files: { [`src/${entry.fileName}`]: source },
        cssFamilies: block.cssFamilies,
        openFile: `src/${entry.fileName}`,
      }),
      { newWindow: true }
    );
  } catch {
    // 文档页不受影响，用户可改用 Copy 手动搭建
  }
}

const blockSection = css`
  margin-bottom: var(--haze-space-8);

  h2 {
    font-size: var(--haze-text-lg);
    font-weight: var(--haze-weight-semibold);
    margin: 0 0 var(--haze-space-1);
  }
`;

const blockDescription = css`
  margin: 0 0 var(--haze-space-3);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
`;

const shell = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
`;

const toolbar = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-3);
  border-bottom: 1px solid var(--haze-color-border);
`;

const toolbarSpacer = css`
  flex: 1;
`;

const previewArea = css`
  height: 600px;
  overflow: auto;
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  border-radius: 0 0 var(--haze-radius-lg) var(--haze-radius-lg);
`;

const sourceHeader = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-3);
  border-top: 1px solid var(--haze-color-border);
`;

const sourceTrigger = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--haze-color-text);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-sm);
  text-align: left;
`;

const chevron = css`
  display: inline-block;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
  transition: transform var(--haze-duration-fast) var(--haze-ease);
`;

const chevronOpen = css`
  transform: rotate(90deg);
`;

const codeStyle = css`
  margin: 0;
  border-top: 1px solid var(--haze-color-border);
  padding: var(--haze-space-3) var(--haze-space-4);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  line-height: var(--haze-leading-normal);
  color: var(--haze-color-text);
  white-space: pre;
  max-height: 60vh;
  overflow: auto;
`;

function BlockCard({ block }: { block: BlockDef }) {
  const { t } = useSiteLocale();
  const [open, , openControl] = useControl(false);
  const { copied, copy } = useClipboard();
  const entry = resolveBlockSource(block.id);
  // block entries are module constants — tokenizing once per mounted card.
  const highlighted = useMemo(
    () => (entry ? highlightTsx(entry.source) : null),
    [entry]
  );
  const { Component } = block;

  if (!entry || !highlighted) return null;

  return (
    <div className={shell} data-slot='block-card'>
      <div className={toolbar}>
        <span style={{ fontFamily: 'var(--haze-font-mono)', fontSize: 'var(--haze-text-sm)' }}>
          blocks/{entry.fileName}
        </span>
        <span className={toolbarSpacer} />
        <Button
          size='sm'
          variant='outline'
          onClick={() => void openBlockInStackBlitz(block, entry.source)}
        >
          Open in StackBlitz
        </Button>
        <Button size='sm' variant='outline' onClick={() => void copy(entry.source)}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <div
        className={previewArea}
        data-slot='block-preview'
        style={{ overflow: block.overflow }}
      >
        <Component />
      </div>
      <Collapsible open={openControl}>
        <div className={sourceHeader} data-state={open ? 'open' : 'closed'}>
          <CollapsibleTrigger className={sourceTrigger}>
            <span x-class={[chevron, open && chevronOpen]} aria-hidden='true'>
              ▸
            </span>
            <span>{t.blocks[block.id].title} — source</span>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <pre className={codeStyle}>
            <code>{highlighted}</code>
          </pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default function Blocks() {
  const { t } = useSiteLocale();

  return (
    <div className={page}>
      <h1>{t.blocks.title}</h1>
      <p className={intro}>{t.blocks.intro}</p>
      {BLOCKS.map((block) => (
        <section key={block.id} className={blockSection} data-slot='block-section'>
          <h2>{t.blocks[block.id].title}</h2>
          <p className={blockDescription}>{t.blocks[block.id].description}</p>
          <BlockCard block={block} />
        </section>
      ))}
    </div>
  );
}
