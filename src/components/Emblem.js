// v1 name for the Iron & Gold coin, kept until the cleanup pass.
import { Seal } from '../theme/brand';

export default function Emblem({ size = 64 }) {
  return <Seal kind="coin" size={size} />;
}
