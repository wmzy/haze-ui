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

## react-f0rm 集成

react-f0rm 持有表单字段状态，它的无头 `useField` hook 是唯一的绑定层——
内置 `Field`/`Checkbox`/`Select` 组件走的就是同一通道。haze-ui 贡献视图：
受控核心（`InputCore`、`SelectCore`、`SwitchCore`、`TextareaCore`、
`TagInputCore`……）直接接收纯 `{value, onChange}` 对，无需适配器；`FormItem`
在此基础上补 label、错误与 aria 接线。糖衣组件（`Input`、`Select`……）在
表单之外的独立使用仍保留原有 `Control<T> | T` API。

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

## 相关项目 

- [react-use-control](https://github.com/wmzy/react-use-control)

## 参与贡献

欢迎任何形式的贡献。

## 版权声明

[MIT](https://choosealicense.com/licenses/mit/)

