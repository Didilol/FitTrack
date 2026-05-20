import { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';

export interface ChartPoint {
  x: number;
  y: number;
}

interface Props {
  points: ChartPoint[];
  width: number;
  height?: number;
  formatY?: (n: number) => string;
  formatX?: (n: number) => string;
  emptyLabel?: string;
}

const PAD_LEFT = 38;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

export function LineChart({
  points,
  width,
  height = 200,
  formatY = (n) => `${Math.round(n)}`,
  formatX,
  emptyLabel = 'Sem dados',
}: Props) {
  const innerW = width - PAD_LEFT - PAD_RIGHT;
  const innerH = height - PAD_TOP - PAD_BOTTOM;

  const { path, dots, yTicks, xLabels } = useMemo(() => {
    if (points.length === 0) {
      return { path: '', dots: [], yTicks: [], xLabels: [] };
    }

    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const padY = maxY === minY ? Math.max(1, maxY * 0.1) : (maxY - minY) * 0.15;
    const yMin = Math.max(0, minY - padY);
    const yMax = maxY + padY;

    const minX = points[0].x;
    const maxX = points[points.length - 1].x;
    const rangeX = maxX - minX || 1;
    const rangeY = yMax - yMin || 1;

    const sx = (x: number) => PAD_LEFT + ((x - minX) / rangeX) * innerW;
    const sy = (y: number) => PAD_TOP + innerH - ((y - yMin) / rangeY) * innerH;

    let path = '';
    const dots: Array<{ cx: number; cy: number; key: string }> = [];
    points.forEach((p, i) => {
      const x = points.length === 1 ? PAD_LEFT + innerW / 2 : sx(p.x);
      const y = sy(p.y);
      path += (i === 0 ? 'M' : 'L') + ` ${x.toFixed(2)} ${y.toFixed(2)} `;
      dots.push({ cx: x, cy: y, key: `${i}` });
    });

    const yTicks = [yMin, (yMin + yMax) / 2, yMax].map((v) => ({
      y: sy(v),
      label: formatY(v),
    }));

    const xLabels: Array<{ x: number; label: string }> = [];
    if (formatX && points.length > 1) {
      xLabels.push({ x: sx(points[0].x), label: formatX(points[0].x) });
      xLabels.push({
        x: sx(points[points.length - 1].x),
        label: formatX(points[points.length - 1].x),
      });
    }

    return { path, dots, yTicks, xLabels };
  }, [points, innerH, innerW, formatY, formatX]);

  if (points.length === 0) {
    return (
      <View
        style={{ width, height }}
        className="bg-surface-2 rounded-2xl items-center justify-center"
      >
        <Text className="text-muted text-sm">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View className="bg-surface-2 rounded-2xl overflow-hidden">
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={colors.surface2} />
        {yTicks.map((t, i) => (
          <Line
            key={`grid-${i}`}
            x1={PAD_LEFT}
            x2={width - PAD_RIGHT}
            y1={t.y}
            y2={t.y}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="3,4"
          />
        ))}
        <Path
          d={path}
          stroke={colors.accent}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {dots.map((d) => (
          <Circle
            key={d.key}
            cx={d.cx}
            cy={d.cy}
            r={4}
            fill={colors.accent}
            stroke={colors.surface}
            strokeWidth={1.5}
          />
        ))}
      </Svg>

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
        }}
      >
        {yTicks.map((t, i) => (
          <Text
            key={`yl-${i}`}
            style={{
              position: 'absolute',
              left: 4,
              top: t.y - 7,
              fontSize: 10,
              color: colors.muted,
            }}
          >
            {t.label}
          </Text>
        ))}
        {xLabels.map((x, i) => (
          <Text
            key={`xl-${i}`}
            style={{
              position: 'absolute',
              left: x.x - 25,
              top: height - 16,
              width: 50,
              textAlign: 'center',
              fontSize: 10,
              color: colors.muted,
            }}
          >
            {x.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
