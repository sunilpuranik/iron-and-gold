// An old-school engraved stock certificate for one company.
// Always printed on cream paper (it's a document on the table), whatever the app theme.
import { useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle, Defs, Ellipse, G, Pattern, Polygon, Rect,
} from 'react-native-svg';
import { T } from '../theme/text';
import { FONTS, LIGHT } from '../theme/tokens';
import { TIER_NAMES, company } from '../game/data';
import { isTrust, price, sizes } from '../game/engine';
import { companyGlyph } from './CompanyIcon';

const PAPER = '#F6EEDB';
const INK = '#2A221A';
const GOLD = { hi: '#F4DE93', mid: '#CFA64A', lo: '#8A6421' };
const SPECIMEN = '#8E3B32';

const PRESIDENTS = {
  cw: 'Elias Thorne', pp: 'Jonah Whitlock', pw: 'Thaddeus Crane', rm: 'Silas Kettle',
  ae: 'Cora Brightwell', cr: 'Amos Carrick', ft: 'Wm. Ashford',
};

const WORDS = ['no', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
  'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty', 'Twenty-one',
  'Twenty-two', 'Twenty-three', 'Twenty-four', 'Twenty-five'];

// Guilloché border: a band of interlaced rings, framed by fine rules, with rosettes in the corners.
export function Border({
  w, h, color, pid, paper = PAPER,
}) {
  const band = 13;
  const rosette = (cx, cy) => (
    <G key={`${cx}-${cy}`}>
      <Circle cx={cx} cy={cy} r="15" fill={paper} stroke={color} strokeWidth="1.2" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <Ellipse
            key={i}
            cx={cx + Math.cos(a) * 7}
            cy={cy + Math.sin(a) * 7}
            rx="6"
            ry="2.4"
            fill="none"
            stroke={color}
            strokeWidth="0.6"
            transform={`rotate(${(a * 180) / Math.PI} ${cx + Math.cos(a) * 7} ${cy + Math.sin(a) * 7})`}
          />
        );
      })}
      <Circle cx={cx} cy={cy} r="3" fill={color} />
    </G>
  );
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Defs>
        <Pattern id={`cert-rings-${pid}`} width="9" height="9" patternUnits="userSpaceOnUse">
          <Circle cx="4.5" cy="4.5" r="4.4" fill="none" stroke={color} strokeWidth="0.55" />
          <Circle cx="0" cy="0" r="4.4" fill="none" stroke={color} strokeWidth="0.55" />
          <Circle cx="9" cy="9" r="4.4" fill="none" stroke={color} strokeWidth="0.55" />
        </Pattern>
      </Defs>
      <Rect x="2" y="2" width={w - 4} height={h - 4} fill={`url(#cert-rings-${pid})`} stroke={color} strokeWidth="2" />
      <Rect x={2 + band} y={2 + band} width={w - 4 - band * 2} height={h - 4 - band * 2} fill={paper} stroke={color} strokeWidth="1" />
      <Rect x={6 + band} y={6 + band} width={w - 12 - band * 2} height={h - 12 - band * 2} fill="none" stroke={color} strokeWidth="0.5" />
      {[rosette(17, 17), rosette(w - 17, 17), rosette(17, h - 17), rosette(w - 17, h - 17)]}
    </Svg>
  );
}

// Gold notarial seal with the company initials.
export function Seal({ size = 58, label }) {
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = i % 2 ? 42 : 48;
    pts.push(`${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`);
  }
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Polygon points={pts.join(' ')} fill={GOLD.mid} stroke={GOLD.lo} strokeWidth="1.5" />
        <Circle cx="50" cy="50" r="34" fill={GOLD.hi} stroke={GOLD.lo} strokeWidth="1.5" />
        <Circle cx="50" cy="50" r="28" fill="none" stroke={GOLD.lo} strokeWidth="0.8" strokeDasharray="2 2" />
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <T style={{ fontFamily: FONTS.money, fontSize: size * 0.2, color: '#5C4012', letterSpacing: 1 }}>{label}</T>
      </View>
    </View>
  );
}

function Vignette({ id, color }) {
  const Glyph = companyGlyph(id);
  return (
    <View style={{ width: 96, height: 64, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width="96" height="64" style={{ position: 'absolute' }}>
        <Defs>
          <Pattern id={`cert-hatch-${id}`} width="96" height="2.4" patternUnits="userSpaceOnUse">
            <Rect x="0" y="0" width="96" height="0.6" fill={color} opacity="0.45" />
          </Pattern>
        </Defs>
        <Ellipse cx="48" cy="32" rx="46" ry="30" fill={`url(#cert-hatch-${id})`} stroke={color} strokeWidth="1.2" />
        <Ellipse cx="48" cy="32" rx="42" ry="26.5" fill="none" stroke={color} strokeWidth="0.5" />
      </Svg>
      <Glyph size={36} color={color} strokeWidth={1.6} />
    </View>
  );
}

function Signature({ name, role }) {
  return (
    <View style={{ alignItems: 'center', minWidth: 86 }}>
      <T style={{ fontFamily: FONTS.accent, fontSize: 15, color: INK }}>{name}</T>
      <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: INK, marginTop: 1 }} />
      <T style={{ fontFamily: FONTS.engraved, fontSize: 8, letterSpacing: 1.2, color: INK, marginTop: 2 }}>{role}</T>
    </View>
  );
}

export default function Certificate({
  id, state, owner, shares, number,
}) {
  const [box, setBox] = useState(null);
  const c = company(id);
  const color = LIGHT.companies[id].ink;
  const size = sizes(state)[id];
  const active = size >= 2;
  const specimen = !shares;
  const initials = c.name.split(' ').filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 3);

  return (
    <View
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={{ backgroundColor: PAPER, paddingHorizontal: 30, paddingVertical: 28, alignItems: 'center' }}
    >
      {box && <Border w={box.w} h={box.h} color={color} pid={id} />}

      <View style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ borderWidth: 1, borderColor: color, paddingHorizontal: 6, paddingVertical: 2 }}>
          <T style={{ fontFamily: FONTS.money, fontSize: 10, color }}>No. {String(number).padStart(4, '0')}</T>
        </View>
        <View style={{ borderWidth: 1, borderColor: color, paddingHorizontal: 6, paddingVertical: 2 }}>
          <T style={{ fontFamily: FONTS.money, fontSize: 10, color }}>{shares} SHARES</T>
        </View>
      </View>

      <T style={{ fontFamily: FONTS.engraved, fontSize: 7.5, letterSpacing: 1.6, color: INK, marginTop: 8, textAlign: 'center' }}>
        INCORPORATED IN THE TERRITORY · 1881
      </T>
      <T style={{ fontFamily: FONTS.display, fontSize: 23, color, textAlign: 'center', marginTop: 4 }}>{c.name}</T>
      <T style={{ fontFamily: FONTS.engraved, fontSize: 8, letterSpacing: 1.4, color: INK, marginBottom: 6 }}>
        {c.industry.toUpperCase()} · {TIER_NAMES[c.tier].toUpperCase()} STOCK
      </T>

      <Vignette id={id} color={color} />

      <T style={{ fontFamily: FONTS.accent, fontSize: 13, color: INK, marginTop: 8 }}>This certifies that</T>
      <T style={{ fontFamily: FONTS.display, fontSize: 20, color: INK, marginTop: 2 }}>{specimen ? '— Specimen —' : owner}</T>
      <View style={{ height: 1, width: '70%', backgroundColor: INK, opacity: 0.5 }} />
      <T style={{ fontFamily: FONTS.accent, fontSize: 12.5, color: INK, textAlign: 'center', marginTop: 6, lineHeight: 17 }}>
        is the registered owner of {WORDS[shares] || shares} fully paid share{shares === 1 ? '' : 's'} of the capital stock
        of {c.name}, transferable only on the books of the Company.
      </T>

      <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <Signature name={PRESIDENTS[id]} role="PRESIDENT" />
        <Seal label={initials} />
        <Signature name="R. Quill" role="SECRETARY" />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center' }}>
        <T style={{ fontFamily: FONTS.engraved, fontSize: 9, letterSpacing: 1, color: INK }}>
          {active ? `${size} PLOTS · $${price(id, size)} A SHARE · BANK ${state.bank[id]} OF 25` : 'NOT YET CHARTERED'}
        </T>
        {active && isTrust(size) && (
          <View style={{ backgroundColor: GOLD.mid, paddingHorizontal: 5, paddingVertical: 1 }}>
            <T style={{ fontFamily: FONTS.money, fontSize: 9, color: '#3A2A0E', letterSpacing: 1 }}>TRUST</T>
          </View>
        )}
      </View>

      {specimen && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <T
            style={{
              fontFamily: FONTS.money, fontSize: 44, letterSpacing: 6, color: SPECIMEN, opacity: 0.22, transform: [{ rotate: '-24deg' }],
            }}
          >
            SPECIMEN
          </T>
        </View>
      )}
    </View>
  );
}
