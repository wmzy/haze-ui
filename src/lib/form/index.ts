export {default as FormItem} from './FormItem';
export type {
  FieldValidator,
  FormItemAsProps,
  FormItemBinding,
  FormItemClassNames,
  FormItemOwnProps,
  FormItemProps,
  FormItemRawElement,
  FormItemRawElementBinding
} from './FormItem';
export {default as FormList} from './FormList';
export type {FormListBinding, FormListField, FormListProps} from './FormList';
export type {FormInstance, PathValueOf} from 'react-f0rm';

/**
 * react-f0rm 的上下文与命令式 API —— haze-ui form 层的官方透传出口。
 * react-f0rm 是 haze-ui 的普通依赖，从这里 import 即可，无需再直接
 * 依赖 react-f0rm。`<FormProvider value={form}>` 挂 context 后，子树里的
 * `FormItem`/`FormList` 可以省略 `form` prop。
 *
 * - `Form`：react-f0rm 的 `<form>` 组件封装 —— 挂 context、串提交链
 *   （onSubmit/onValidSubmit/onInvalidSubmit）与 native validation 开关。
 * - `useForm`：antd 风格命名的表单实例 hook。react-f0rm 自带组件生命周期
 *   绑定版的 `useForm`，直接透传即可 —— 不做 `useForm = createForm`
 *   别名，那会用生命周期语义不同的工厂版遮蔽同名 hook。
 * - `createForm`：手动生命周期的实例工厂（模块级单例、测试、桥接层等
 *   非 hook 场景）。
 * - `useValue`/`useValues`：字段级订阅 hook（响应式读取单个/整个表单值）
 *   ——同样透传，消费者无需直接依赖 react-f0rm。
 */
export {
  Form,
  useForm,
  createForm,
  FormProvider,
  useFormContext,
  useFieldArray,
  useFieldArrayItem,
  useWatch,
  useValue,
  useValues,
  trigger,
  setFocus,
  setServerErrors,
  setValue,
  getValue,
  getValues,
  reset
} from 'react-f0rm';

/**
 * Standard Schema v1 适配器（react-f0rm/resolvers/standard-schema）：
 * 任何实现 `~standard` 的 schema 库通用 —— zod v3.24+/v4、valibot v1、
 * arktype 等。`standardSchemaResolver` 是字段级（FormItem 的
 * `validate`），`standardSchemaFormValidator` 是表单级
 * （`createForm({validate})`，成功时把 schema 解析结果存为
 * parsedValues；经 `./standard-schema` 兜底 react-f0rm 1.3.0 的
 * 品牌符号打包缺陷）。`hasStandardProps` 运行时探测 schema 是否实现了
 * Standard Schema。
 */
export {
  hasStandardProps,
  standardSchemaFormValidator,
  standardSchemaResolver
} from './standard-schema';
export type {StandardSchemaV1} from './standard-schema';

/**
 * zod 专用字段级适配器（react-f0rm/resolvers/zod）：schema 实现了
 * Standard Schema 时直接走通用通道，否则走 zod 的 safeParseAsync。
 */
export {zodResolver} from 'react-f0rm/resolvers/zod';
