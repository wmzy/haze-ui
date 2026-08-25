# Haze UI

> The React UI Component Library with controllable states.

English | [简体中文](./README-zh_CN.md)

[![npm](https://img.shields.io/npm/v/haze-ui)](https://www.npmjs.com/package/haze-ui)
[![CI](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml)

## Features

- Integrated [react use control](https://github.com/wmzy/react-use-control) provides component internal states
- Keep strict, provide lightweight, composable, and easily extendable components
- Support themes customization
- Support Tree-shaking

## Getting Started

### Installation

```sh
npm i haze-ui
// or
pnpm add haze-ui
```

### Usage

```jsx
import { Button } from 'haze-ui';

export default function MyComponent() {
  return <Button>Start</Button>;
}
```

## react-f0rm Integration

The `haze-ui/form` entry (peer dependency: `react-f0rm`) glues react-f0rm
form state to haze-ui's control-prop system, so any control-prop
component (`Input`, `Select`, `Switch`, `Textarea`, `TagInput`, ...)
binds to a form field with zero adapters.

### useFormControl(form, name): field → Control

```jsx
import { useForm, setValue } from 'react-f0rm';
import { Input } from 'haze-ui';
import { useFormControl } from 'haze-ui/form';

function NameField({ form }) {
  const name = useFormControl(form, 'name');
  return <Input value={name} />; // two-way bound, no onChange wiring
}
```

The handle is a real `Control`: reads subscribe to the field (sibling
fields stay isolated), writes go through `setValueByPath`, and functional
updates evaluate against the live form value. `reset(form, newValues)`
re-seeds every bridged control with no remounting.

### FormItem: label, errors and aria wiring

```jsx
import { Form, useForm } from 'react-f0rm';
import { Input } from 'haze-ui';
import { FormItem } from 'haze-ui/form';

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

`FormItem` generates the field/error ids, renders `<label htmlFor>`, and
surfaces the first error in a `role="alert"` element — no manual
`FieldError` wiring.

## Related Projects

- [react-use-control](https://github.com/wmzy/react-use-control)

## How to Contribute

Anyone and everyone is welcome to contribute. 

## License

[MIT](https://choosealicense.com/licenses/mit/)
