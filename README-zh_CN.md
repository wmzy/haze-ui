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

表单层（`FormItem`、`useFormControl`；peer 依赖 `react-f0rm`）从主 barrel
导出，把 react-f0rm 的表单状态桥接到 haze-ui 的 control 属性体系：任何支持
control 属性的组件（`Input`、`Select`、`Switch`、`Textarea`、`TagInput`……）
都能直连表单字段，无需适配器。

### useFormControl(form, name)：字段 → Control

```jsx
import { useForm, setValue } from 'react-f0rm';
import { Input, useFormControl } from 'haze-ui';

function NameField({ form }) {
  const name = useFormControl(form, 'name');
  return <Input value={name} />; // 双向绑定，无需手写 onChange
}
```

返回的句柄是真正的 `Control`：读取按字段订阅（兄弟字段互不牵连），写入走
`setValueByPath`，函数式更新基于实时表单值求值。`reset(form, newValues)`
会重新播种所有桥接的 control，无需重挂组件。

### FormItem：label、错误与 aria 接线

```jsx
import { Form, useForm } from 'react-f0rm';
import { FormItem, Input } from 'haze-ui';

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
        {({ id, errorId, invalid, control }) => (
          <Input id={id} value={control} aria-invalid={invalid} aria-describedby={errorId} />
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

