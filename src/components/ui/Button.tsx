import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const baseByVariant: Record<Variant, string> = {
  primary: 'bg-accent active:bg-accent-dim',
  secondary: 'bg-surface-2 active:bg-surface border border-border',
  ghost: 'bg-transparent active:bg-surface',
  danger: 'bg-danger active:opacity-80',
};

const textByVariant: Record<Variant, string> = {
  primary: 'text-bg',
  secondary: 'text-text',
  ghost: 'text-text',
  danger: 'text-white',
};

const sizeContainer: Record<Size, string> = {
  sm: 'h-10 px-3',
  md: 'h-12 px-4',
  lg: 'h-14 px-5',
};

const sizeText: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  haptic = true,
  fullWidth,
  iconLeft,
  iconRight,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={() => {
        if (isDisabled) return;
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress?.();
      }}
      disabled={isDisabled}
      className={[
        'rounded-xl items-center justify-center flex-row',
        baseByVariant[variant],
        sizeContainer[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#0A0F00' : '#F5F5F5'}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {iconLeft}
          <Text
            className={[
              'font-semibold',
              textByVariant[variant],
              sizeText[size],
            ].join(' ')}
          >
            {children}
          </Text>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}
