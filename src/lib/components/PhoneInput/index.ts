export {default as PhoneInput} from './PhoneInput';
export type {PhoneInputProps} from './PhoneInput';
// Pure libphonenumber-js validity helper — the derived `isValid` state
// stays inside the component; consumers validate in render with this.
export {isValidPhone} from './phone-number';
