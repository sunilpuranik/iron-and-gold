// v1 name for CompanySheet mode="charter", kept until the cleanup pass.
import CompanySheet from './CompanySheet';

export default function CharterSheet(props) {
  return <CompanySheet {...props} mode="charter" />;
}
