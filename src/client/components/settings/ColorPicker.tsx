import {
  Popover,
  TextField,
  ColorPicker as PolarisColorPicker,
} from '@shopify/polaris';
import { useState } from 'react';
import colorConvert from 'color-convert';

export interface ColorPickerProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  error,
  onChange,
}) => {
  const [state, setState] = useState({
    popoverActive: false,
  });
  return (
    <Popover
      active={state.popoverActive}
      preferredAlignment="left"
      autofocusTarget="none"
      activator={
        <TextField
          autoComplete="off"
          label={label}
          value={value}
          error={error}
          prefix={
            <div
              style={{
                width: '20px',
                height: '20px',
                background: value,
              }}
            />
          }
          onChange={(v) => {
            onChange(v);
          }}
          onFocus={() => {
            setState((prevState) => {
              return {
                ...prevState,
                popoverActive: true,
              };
            });
          }}
        />
      }
      onClose={() => {
        setState((prevState) => {
          return {
            ...prevState,
            popoverActive: false,
          };
        });
      }}
    >
      <Popover.Pane>
        <PolarisColorPicker
          color={colorConvert.hex.hsv(value).reduce(
            (acc, v, index) => {
              if (index === 0) {
                acc.hue = v;
              } else if (index === 1) {
                acc.saturation = v / 100;
              } else if (index === 2) {
                acc.brightness = v / 100;
              }
              return acc;
            },
            { hue: 0, saturation: 0, brightness: 0 },
          )}
          onChange={(color) => {
            const hex = colorConvert.hsv.hex([
              color.hue,
              color.saturation * 100,
              color.brightness * 100,
            ]);
            onChange(`#${hex}`);
          }}
        />
      </Popover.Pane>
    </Popover>
  );
};
