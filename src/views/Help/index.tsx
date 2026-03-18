import {page, intro} from '@/views/ComponentDetail/styles';

export default function Help() {
  return (
    <div className={page}>
      <h1>Help</h1>
      <p className={intro}>
        Need help with Haze UI? Check the component documentation or open an issue on GitHub.
      </p>
    </div>
  );
}
