import { toast as toastify, ToastContent, ToastOptions } from 'react-toastify';

export function toast<T>(
  level: 'success' | 'error',
  content: ToastContent<T>,
  options?: ToastOptions<T>,
) {
  let background;
  switch (level) {
    case 'success': {
      background = 'var(--p-color-bg-fill-success)';
      break;
    }
    case 'error': {
      background = 'var(--p-color-bg-fill-critical)';
      break;
    }
    default: {
      background = undefined;
    }
  }
  toastify(content, {
    ...options,
    style: {
      background,
      color: 'white',
      ...options?.style,
    },
  });
}
