import { Icon } from '@shopify/polaris';
import { AlertCircleIcon } from '@shopify/polaris-icons';
import { CSSProperties } from 'react';

export interface InputErrorProps {
  message: string;
  style?: CSSProperties;
}

export const InputError: React.FC<InputErrorProps> = ({ message, style }) => {
  return (
    <div style={style}>
      <style jsx>{`
        div {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          color: rgb(142, 31, 11);
        }

        div :global(.Polaris-Icon) {
          display: inline-block;
          margin: 0;
          margin-right: 8px;
        }

        div :global(.Polaris-Icon svg) {
          color: rgb(142, 31, 11);
        }
      `}</style>
      <Icon source={AlertCircleIcon} />
      <span>{message}</span>
    </div>
  );
};
