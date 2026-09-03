# Haze UI

> 一个带有可控状态的 React 组件库。

[English](./README.md) | 简体中文

[![npm](https://img.shields.io/npm/v/haze-ui)](https://www.npmjs.com/package/haze-ui)
[![CI](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml)

## 特性

- 集成 [react use control](https://github.com/wmzy/react-use-control) ，提供组件内部状态的控制
- 保持克制，提供轻量、可组合、易于扩展的组件
- 支持主题定制
- 支持 Tree-shaking

## 快速开始

### 安装

```sh
npm i haze-ui
// or
pnpm add haze-ui
```

### 使用

导入组件及其 CSS，两种加载方式：

```jsx
// 全量样式（最简单，gzip 后约 12kB）
import 'haze-ui/styles.css';
import { lightTheme, spacing, typography, Button } from 'haze-ui';

// ……或按组件加载（只为用到的组件付费）。
// tokens.css 只需导入一次，再导入用到的组件 CSS：
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/button.css';
import { Button } from 'haze-ui';

export default function MyComponent() {
  return (
    <Button>Start</Button>
  )
}
```

组件 CSS 文件名为组件名的 kebab-case（`OTPInput` →
`haze-ui/css/otp-input.css`）。按组件的文件只包含该组件自己的规则，
主题/间距/排印等令牌始终来自 `haze-ui/css/tokens.css`。

## ButtonLink：带按钮外观的真链接

长得像按钮的导航仍然应该「是」链接——`as={Button}` 会把 `href` 落到
`<button>` 上（非法属性：⌘/中键开新标签失效，爬虫与无 JS 环境无从跟随）。
`ButtonLink` 渲染原生 `<a>`，穿 Button 的全套外观——同样的
`variant`/`size`/`square` props，同样的 hover/active/焦点与禁用视觉：

```jsx
import { ButtonLink } from 'haze-ui';

<ButtonLink href='/page/2' variant='outline'>下一页</ButtonLink>

// 锚点没有 `disabled` 属性——用 aria-disabled 上报状态（配
// tabIndex={-1} 移出焦点序）；ButtonLink 按 Button 的 :disabled 同款渲染
<ButtonLink href='/prev' aria-disabled tabIndex={-1}>← 上一页</ButtonLink>
```

其余 props 全部扩展自原生 `<a>` 属性并透传到锚点（`target`、`rel`、
`download`、`aria-*`……），ref 一并转发——与 `NavLink` 相同的组合形态，
路由库可用 `as` 把自己的 Link 元素换下来：

```jsx
// 配类型化路由 Link（href 与 SPA onClick 由路由注入）：
<TypedLink to='/articles' search={{offset: 20}} as={ButtonLink}>
  下一页
</TypedLink>
```

两个组件共享同一份皮肤（styles 模块），对 Button 的主题微调会同步
重皮肤 ButtonLink。CSS：`haze-ui/css/button.css` 同时覆盖两者。

## AsyncSection：加载 / 错误 / 内容三态归一

`AsyncSection` 把每个异步视图都要手写一遍的三个分支收敛为一个组件：
`loading` 渲染 Spinner 占位；`error` 非空渲染 Alert 样式错误框与可选的
`Retry` 按钮（`Error` 实例自动取 `message`，`errorText` 可覆盖）；否则
渲染 children。两者同时为真时 `loading` 优先——重试路径（旧错误未清除
时再次进入加载）显示占位而非过期错误。文案全部可配；只有传入 `onRetry`
才渲染重试按钮。

```jsx
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/async-section.css';
import { AsyncSection } from 'haze-ui';

<AsyncSection loading={loading} error={error} onRetry={refetch}>
  {data}
</AsyncSection>
```

## react-f0rm 集成

react-f0rm 持有表单字段状态，它的无头 `useField` hook 是唯一的绑定层——
内置 `Field`/`Checkbox`/`Select` 组件走的就是同一通道。haze-ui 贡献视图：
受控核心（`InputCore`、`SelectCore`、`SwitchCore`、`TextareaCore`、
`TagInputCore`、`TransferCore`、`UploadCore`……）直接接收纯 `{value, onChange}`
对，无需适配器；`FormItem`
在此基础上补 label、错误与 aria 接线。糖衣组件（`Input`、`Select`……）在
表单之外的独立使用仍保留原有 `ControlOrValue<T>`（即 `Control<T> | T`）API。

### useField：字段 → {value, onChange}

```jsx
import { useForm, useField } from 'react-f0rm';
import { InputCore } from 'haze-ui';

function NameField({ form }) {
  const { value, onChange } = useField({ form, name: 'name' });
  return <InputCore value={value} onChange={onChange} />; // 双向绑定
}
```

hook 按字段订阅（兄弟字段互不牵连）；`onChange` 写入走 react-f0rm 的用户
变更通道，触发与真实输入一致的校验：字段生效的 `mode`（含 `FormItem`/
`useField` 的单字段覆盖）与表单的 `reValidateMode`。默认 `mode: 'onSubmit'`
+ `reValidateMode: 'onChange'` 下，提交失败后通过绑定的核心组件输入，会逐键
重新校验并在值合法时立即清除错误——无需失焦、无需重复提交。`onChange` 只接受
纯值（受控核心只发下一个值，不发函数式更新；需要上一个值时在下次渲染读
`value`）。`reset(form, newValues)` 会通过订阅机制重新播种所有绑定，无需
重挂组件。

### FormItem：label、错误与 aria 接线

```jsx
import { Form, useForm } from 'react-f0rm';
import { FormItem, InputCore } from 'haze-ui';

function ProfileForm() {
  const form = useForm({ initialValues: { email: '' } });
  return (
    <Form form={form} onSubmit={...}>
      <FormItem
        form={form}
        name="email"
        label="Email"
        validate={(v) => (v.includes('@') ? undefined : 'must be an email')}
      >
        {({ id, errorId, invalid, value, onChange }) => (
          <InputCore id={id} value={value} onChange={onChange} aria-invalid={invalid} aria-describedby={errorId} />
        )}
      </FormItem>
    </Form>
  );
}
```

`FormItem` 生成字段/错误的 id、渲染 `<label htmlFor>`，并把首个错误渲染进
`role="alert"` 元素——无需手挂 `FieldError`。

### `as`：声明式绑定（react-f0rm Field 风格）

不想写渲染函数时，把组件直接传给 `as`，`FormItem` 自动接好 id、aria、
`onBlur` 和 `onChange`——props 形态对齐 react-f0rm 的 `Field`，而非 Radix
的 `asChild`。`as` 与 children 渲染函数二选一。

```jsx
// 文本字段：无需再接任何东西
<FormItem form={form} name="email" label="Email" as={InputCore} />

// 复选类控件：值在 `checked` 里
<FormItem
  form={form}
  name="subscribed"
  label="订阅"
  as={CheckboxCore}
  valueToProps={(checked) => ({ checked: !!checked })}
/>

// DOM 元素形态的控件：事件与值各用一行适配
<FormItem
  form={form}
  name="email"
  as={NativeInput}
  eventToValue={(e) => e.target.value}
  renderError={(error, id) => <em id={id}>{error}</em>}
/>
```

- `eventToValue` 默认恒等——haze 核心组件的 `onChange` 发出下一个纯值；
  `as` 是原生 DOM 元素组件时传 `(e) => e.target.value`。
- `asProps` 在值之前展开到控件上，因此 `value`/`valueToProps` 冲突时优先
  （与 Field.tsx 一致）。
- `renderError(error, id)` 替换内置错误 span 的内容；span 本身（id、
  `role="alert"`、样式）仍由 FormItem 渲染。
- 携带类型化的表单时，`validate` 的 value 参数是字段的真实类型
  （`PathValueOf<TValues, P>`），不再是 `any`。

### `input`：面向 haze 核心组件与原生 DOM 控件的声明式绑定（类型化透传）

受控核心组件的顺手形态——直接传组件引用，其余 JSX 属性原样透传，并按
组件自己的 props 做编译期校验：

```jsx
<FormItem
  form={form}
  name="email"
  label="Email"
  input={InputCore}
  placeholder="you@x.dev"
  mode="onBlur"
  validate={(v) => (v.includes('@') ? undefined : 'must be an email')}
/>

// JSX children 也透传——SelectCore 的选项：
<FormItem form={form} name="role" label="角色" input={SelectCore}>
  <option value="admin">Admin</option>
  <option value="viewer">Viewer</option>
</FormItem>

// 复选类控件仍配 valueToProps 适配：
<FormItem
  form={form}
  name="subscribed"
  label="订阅"
  input={CheckboxCore}
  valueToProps={(checked) => ({ checked })}
/>
```

`input` 与 `as` 接的是同一套 id/aria/`onBlur`/`onChange`/值契约——所有
haze 核心组件（`InputCore`、`TextareaCore`、`SelectCore`、
`TagInputCore`、`TransferCore`、`UploadCore`、`CheckboxCore`、
`SwitchCore`……）都说纯 `{value, onChange}`
对，默认适配器零配置（`TagInputCore` 的 `onChange` 本来就发出下一个
`string[]`；`TransferCore` 发出下一个 `string[]` 附带移动元信息，
`UploadCore` 发出下一个 `File[]`；复选类核心配 `valueToProps`）。与 `as` 的差异：

- 透传属性**按核心组件自己的 props 做类型校验**——
  `input={InputCore} size="xl"` 是编译错误，而 `asProps` 是无类型的包。
- JSX **children** 透传给核心组件（`SelectCore` 的 `<option>`）；渲染函数
  children 与 `input` 互斥（`input` 旁边挂渲染函数会 throw——那是迁移
  残留）。
- 接线属性（`id`、`aria-invalid`、`aria-describedby`、`onBlur`、
  `onChange`、`value`/`checked`）与 FormItem 自己的属性名**保留**：类型上
  从透传面剔除、运行时恒定优先。与控件属性撞名的（如 CheckboxCore 自己
  的 `label`）经 `input` 不可达——请改用渲染函数或 `as`/`asProps`。

`input` 同样接受原生 DOM 绑定——无需核心组件。两种 raw 形态都显式携带
`eventToValue` 适配器，值通道从不靠猜：

```jsx
// 原生表单元素：绑定对象把标签名和适配器配成一对，其余 JSX 属性
// 按该元素自己的 HTML 属性做类型校验（textarea 的 rows、select 的
// option children）
<FormItem
  form={form}
  name="bio"
  label="简介"
  input={{element: 'textarea', eventToValue: (e) => e.target.value}}
  rows={4}
/>

// DOM 元素形态的组件：顶层 eventToValue 就是从纯值（核心）切到事件
// 语义（raw）的显式开关
<FormItem
  form={form}
  name="email"
  label="Email"
  input={NativeInput}
  eventToValue={(e) => e.target.value}
/>
```

- 元素绑定接受 `'input' | 'textarea' | 'select'`，且**必须**携带
  `eventToValue`——缺适配器的 `input={{element: 'input'}}` 是编译错误
  （运行时未类型调用方漏传时也按 DOM 契约取 `e.target.value`，绝不把
  Event 对象写进 store）。
- 组件旁的顶层 `eventToValue` 把该绑定切到 raw 语义，与 `as` 通道一致；
  透传属性仍按组件自己的 props 校验。
- 保留属性规则同样生效：`id`、`onBlur`、`onChange`、`value`/`checked`、
  aria-* 与 FormItem 自己的属性名在 raw 通道上同样不可透传。

## 相关项目 

- [react-use-control](https://github.com/wmzy/react-use-control)

## 参与贡献

欢迎任何形式的贡献。

## 版权声明

[MIT](https://choosealicense.com/licenses/mit/)


## 常见问题

### 组件渲染出来没有样式

haze-ui 的样式通过独立 CSS 子路径发布，JS 入口不内联任何样式文件。
全量引入一次即可：

```js
import 'haze-ui/styles.css';
```

或按组件引入 tokens 与该组件自己的规则：

```js
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/button.css';
```

### 是否提供 CommonJS 构建？

不提供——haze-ui 仅发布 ESM（`"type": "module"`）。请使用支持 ESM 的
打包器或运行时（Vite、webpack 5、Next.js、Node ≥ 18 等）。
