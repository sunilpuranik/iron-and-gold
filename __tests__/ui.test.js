import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Landmark } from 'lucide-react-native';
import { Button, Money, Plate } from '../src/theme/ui';
import { GoldFill, IronFill } from '../src/theme/brand';
import { ThemeProvider } from '../src/theme/theme';

const wrap = (ui, scheme = 'dark') => <ThemeProvider scheme={scheme}>{ui}</ThemeProvider>;

// Every host View whose style carries a native gradient.
function gradientViews(root) {
  return root.queryAll((n) => !!StyleSheet.flatten(n.props.style)?.experimental_backgroundImage);
}

function expectFillsBox(style) {
  expect(style).toMatchObject({
    position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
  });
  // Fixed pixel sizes are what left an unfilled strip when the plate grew.
  expect(style.width).toBeUndefined();
  expect(style.height).toBeUndefined();
}

describe('plate fills', () => {
  test('gold leaf is a native gradient pinned to all four edges', async () => {
    await render(wrap(<GoldFill />));
    const [fill] = gradientViews(screen.container);
    const style = StyleSheet.flatten(fill.props.style);
    expectFillsBox(style);
    expect(style.experimental_backgroundImage).toBe(
      'linear-gradient(to bottom, #FBF0C2 0%, #E4C46A 18%, #CFA64A 50%, #9C7424 100%)',
    );
    expect(fill.props.pointerEvents).toBe('none');
  });

  test.each(['dark', 'light'])('iron carries grain over its gradient (%s theme)', async (scheme) => {
    await render(wrap(<IronFill />, scheme));
    const style = StyleSheet.flatten(gradientViews(screen.container)[0].props.style);
    expectFillsBox(style);
    expect(style.experimental_backgroundImage).toMatch(/^linear-gradient\(.*\), linear-gradient\(to bottom, #5B5F66 0%, #383A3F 45%, #1D1E21 100%\)$/);
    expect(style.experimental_backgroundSize).toBe('100% 3px, 100% 100%');
  });

  test('gold and iron plates draw their fill, lacquer does not', async () => {
    await render(wrap(
      <>
        <Plate material="gold" />
        <Plate material="iron" />
        <Plate />
      </>,
    ));
    expect(gradientViews(screen.container)).toHaveLength(2);
  });
});

describe('Button', () => {
  test.each(['gold', 'iron', 'primary', 'secondary'])('%s buttons fill their whole face', async (kind) => {
    await render(wrap(<Button title="Invest" kind={kind} onPress={() => {}} style={{ flex: 1 }} />));
    const fills = gradientViews(screen.container);
    expect(fills).toHaveLength(1);
    expectFillsBox(StyleSheet.flatten(fills[0].props.style));
  });

  test('buttons contain no percentage-sized svg', async () => {
    await render(wrap(<Button title="Deal" icon={Landmark} onPress={() => {}} />));
    const svgs = screen.container.queryAll((n) => n.props.bbWidth === '100%' || n.props.bbHeight === '100%');
    expect(svgs).toHaveLength(0);
  });

  test('pressing calls onPress', async () => {
    const onPress = jest.fn();
    await render(wrap(<Button title="Ring the bell" onPress={onPress} />));
    await fireEvent.press(screen.getByRole('button', { name: 'Ring the bell' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test.each(['gold', 'iron', 'ghost'])('disabled %s buttons ignore presses and say so', async (kind) => {
    const onPress = jest.fn();
    await render(wrap(<Button title="Start" kind={kind} disabled onPress={onPress} />));
    const btn = screen.getByRole('button', { name: 'Start' });
    await fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
    expect(btn.props.accessibilityState).toEqual({ disabled: true });
  });

  test('ghost buttons have no fill', async () => {
    await render(wrap(<Button title="Pass" kind="ghost" onPress={() => {}} />));
    expect(gradientViews(screen.container)).toHaveLength(0);
  });

  test('icon-only buttons use their label and meet the 44pt target', async () => {
    const onPress = jest.fn();
    await render(wrap(<Button iconOnly icon={Landmark} label="Close" onPress={onPress} />));
    const btn = screen.getByRole('button', { name: 'Close' });
    await fireEvent.press(btn);
    expect(onPress).toHaveBeenCalled();
    const style = StyleSheet.flatten(typeof btn.props.style === 'function' ? btn.props.style({ pressed: false }) : btn.props.style);
    expect(style.width).toBeGreaterThanOrEqual(44);
    expect(style.height).toBeGreaterThanOrEqual(44);
  });
});

describe('Money', () => {
  test('formats plain, signed and negative amounts', async () => {
    await render(wrap(
      <>
        <Money amount={6000} />
        <Money amount={500} delta />
        <Money amount={-1200} />
      </>,
    ));
    expect(screen.getByText('$6,000')).toBeTruthy();
    expect(screen.getByText('+$500')).toBeTruthy();
    expect(screen.getByText('−$1,200')).toBeTruthy();
  });

  test('the ingot waits for layout, then draws at the measured size', async () => {
    await render(wrap(<Money amount={6000} v="ingot" />));
    const [box] = screen.container.queryAll((n) => typeof n.props.onLayout === 'function');
    const svgs = () => screen.container.queryAll((n) => n.props.bbWidth != null);
    expect(svgs()).toHaveLength(0);
    await fireEvent(box, 'layout', { nativeEvent: { layout: { width: 120, height: 28 } } });
    const [svg] = svgs();
    expect(svg.props.bbWidth).toBe(120);
    expect(svg.props.bbHeight).toBe(28);
  });
});
