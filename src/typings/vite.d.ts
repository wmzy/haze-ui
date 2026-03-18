/// <reference types="vite/client" />

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ImportMetaEnv = {
  // readonly DEV: boolean;
  // more env variables...
}

type ImportMeta = {
  readonly env: ImportMetaEnv;
}
