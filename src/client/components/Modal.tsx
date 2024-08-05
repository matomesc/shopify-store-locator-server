import ReactModal from 'react-modal';
import { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { Divider, Icon, Text } from '@shopify/polaris';
import { XIcon } from '@shopify/polaris-icons';

const ModalSafeForReact18 = ReactModal as ComponentType<ReactModal['props']>;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  shouldCloseOnEsc?: boolean;
  footer?: ReactNode;
  title: string;
  /**
   * Leave this unset for the modal to be full width.
   */
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  maxWidth?: React.CSSProperties['maxWidth'];
}

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  open,
  onClose,
  shouldCloseOnEsc,
  children,
  footer,
  title,
  width,
  height,
  maxWidth,
}) => {
  return (
    <ModalSafeForReact18
      isOpen={open}
      onRequestClose={onClose}
      style={{
        content: {
          padding: '0',
          background: 'rgb(255, 255, 255)',
          // border: '1px solid rgb(48, 48, 48)',
          boxShadow: 'rgba(26, 26, 26, 0.07) 0px 1px 0px 0px',
          borderRadius: '12px',
          width,
          maxWidth,
          height,
          // left: 0,
          // right: 0,
          margin: 'auto',

          // Make sure the modal is scrollable
          maxHeight: '100vh',
          overflowY: 'auto',
        },
      }}
      shouldCloseOnEsc={shouldCloseOnEsc}
      ariaHideApp={false}
    >
      <div>
        <style jsx>{`
          .headerCloseIcon > :global(.Polaris-Icon) {
            width: 2rem;
            height: 2rem;
          }
        `}</style>
        <div
          className="header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
          }}
        >
          <span>
            <Text variant="headingLg" as="h2">
              {title}
            </Text>
          </span>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <span
            className="headerCloseIcon"
            onClick={onClose}
            style={{ cursor: 'pointer', paddingTop: '5px' }}
          >
            <Icon source={XIcon} tone="base" />
          </span>
        </div>
        <Divider />
        <div className="children" style={{ padding: '16px' }}>
          {children}
        </div>
        {footer && <Divider />}
        {footer && (
          <div
            className="footer"
            style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </ModalSafeForReact18>
  );
};
