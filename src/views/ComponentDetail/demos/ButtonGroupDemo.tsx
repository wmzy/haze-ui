import { Button } from '@/lib';
import { ButtonGroup, ButtonGroupSeparator } from '@/lib/components/ButtonGroup';

import PropsTable from '../PropsTable';

import { intro, section, fieldRow } from '../styles';

// ─── ButtonGroup ───────────────────────────────────────────────
export default function ButtonGroupDemo() {
  return (
    <>
      <h1>ButtonGroup</h1>
      <p className={intro}>
        连体按钮组：相邻按钮的圆角与中缝在 CSS 层合并成一条 bar，子件仍是
        独立可聚焦的真实 <code>Button</code>。组上的 <code>size</code>/
        <code>variant</code>/<code>disabled</code> 下发给每个未显式声明的子按钮；
        <code>ButtonGroupSeparator</code> 在按钮之间画分隔线或承接图标/文案。
        记得给组 <code>aria-label</code>，读屏会播报整组。
      </p>

      <div className={section}>
        <h2>Basic</h2>
        <ButtonGroup aria-label='视图切换'>
          <Button>日</Button>
          <Button>周</Button>
          <Button>月</Button>
        </ButtonGroup>
      </div>

      <div className={section}>
        <h2>Sizes &amp; variants</h2>
        <div className={fieldRow}>
          <ButtonGroup aria-label='小尺寸描边' size='sm' variant='outline'>
            <Button>Left</Button>
            <Button>Middle</Button>
            <Button>Right</Button>
          </ButtonGroup>
          <ButtonGroup aria-label='默认幽灵' variant='ghost'>
            <Button>Left</Button>
            <Button>Middle</Button>
            <Button>Right</Button>
          </ButtonGroup>
          <ButtonGroup aria-label='大尺寸实体' size='lg'>
            <Button>Left</Button>
            <Button>Middle</Button>
            <Button>Right</Button>
          </ButtonGroup>
        </div>
      </div>

      <div className={section}>
        <h2>Split button</h2>
        <ButtonGroup aria-label='保存操作'>
          <Button>保存</Button>
          <Button square aria-label='更多保存选项'>
            ▾
          </Button>
        </ButtonGroup>
      </div>

      <div className={section}>
        <h2>Separator</h2>
        <div className={fieldRow}>
          <ButtonGroup aria-label='对齐方式' variant='outline'>
            <Button>左对齐</Button>
            <ButtonGroupSeparator />
            <Button>居中</Button>
            <ButtonGroupSeparator />
            <Button>右对齐</Button>
          </ButtonGroup>
          <ButtonGroup aria-label='登录方式'>
            <Button>Google 登录</Button>
            <ButtonGroupSeparator>or</ButtonGroupSeparator>
            <Button>GitHub 登录</Button>
          </ButtonGroup>
        </div>
      </div>

      <div className={section}>
        <h2>Vertical &amp; disabled</h2>
        <div className={fieldRow}>
          <ButtonGroup aria-label='排序字段' orientation='vertical' variant='outline'>
            <Button>名称</Button>
            <Button>大小</Button>
            <Button>更新时间</Button>
          </ButtonGroup>
          <ButtonGroup aria-label='禁用的操作组' disabled>
            <Button>编辑</Button>
            <Button>复制</Button>
            <Button>删除</Button>
          </ButtonGroup>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='ButtonGroupProps' />
        <PropsTable of='ButtonGroupSeparatorProps' />
      </div>
    </>
  );
}
