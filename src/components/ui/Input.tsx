import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { forwardRef } from 'react';
import { colors } from '@/theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'md' | 'lg';
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, size = 'md', className, ...rest },
  ref
) {
  const heightCls = size === 'lg' ? 'h-14 text-lg' : 'h-12 text-base';
  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-muted text-sm font-medium">{label}</Text>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        className={[
          'bg-surface-2 border border-border rounded-xl px-4 text-text',
          heightCls,
          error ? 'border-danger' : '',
          className ?? '',
        ].join(' ')}
        {...rest}
      />
      {error ? (
        <Text className="text-danger text-xs">{error}</Text>
      ) : hint ? (
        <Text className="text-muted text-xs">{hint}</Text>
      ) : null}
    </View>
  );
});
