import { Pressable, View, type ViewProps } from 'react-native';
import { type ReactNode } from 'react';

interface CardProps extends ViewProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className, ...rest }: CardProps) {
  const classes = [
    'bg-surface rounded-2xl p-4 border border-border',
    className ?? '',
  ].join(' ');

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${classes} active:bg-surface-2`}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={classes} {...rest}>
      {children}
    </View>
  );
}
