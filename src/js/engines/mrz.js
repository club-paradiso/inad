// Passport MRZ (ICAO 9303 TD3) rebuilt from the document as printed. Pure: no DOM, no state.
import { documentFields, documentNameOnRecord } from './document-evidence-model.js';

// ICAO 9303 check digit: weights 7·3·1, digits as values, A–Z as 10–35, filler '<' as 0.
export function mrzCheckDigit(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) { const ch = str[i]; const v = ch >= '0' && ch <= '9' ? ch.charCodeAt(0) - 48 : ch >= 'A' && ch <= 'Z' ? ch.charCodeAt(0) - 55 : 0; sum += v * [7, 3, 1][i % 3]; }
  return String(sum % 10);
}
const mrzDate = (iso) => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[1].slice(2) + m[2] + m[3] : '<<<<<<'; };
const mrzText = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim();
// TD3 passport MRZ rebuilt from what the document itself shows (name and number as printed, so a
// tampered field stays visible in the MRZ too). Check digits are computed from the printed values.
export function simMrz(t, c, d = null) {
  const fields = documentFields(d);
  const code = (t.nationality.code || c.code || 'XXX').slice(0, 3).padEnd(3, 'X');
  const parts = mrzText(documentNameOnRecord(d) || 'UNRECORDED').split(/ +/);
  const nm = parts[0] + '<<' + parts.slice(1).join('<');
  const l1 = ('P<' + code + nm).padEnd(44, '<').slice(0, 44);
  const sex = (t.passport.sex || c.sex || '<').slice(0, 1);
  const docNo = mrzText(fields['여권번호'] || 'UNRECORDED').replace(/ /g, '').padEnd(9, '<').slice(0, 9);
  const dob = mrzDate(t.passport.birthDate || c.dob);
  const exp = mrzDate(fields['만료일'] || t.passport.expiry);
  const opt = '<'.repeat(14);
  const a = docNo + mrzCheckDigit(docNo), b = dob + mrzCheckDigit(dob), e = exp + mrzCheckDigit(exp), o = opt + mrzCheckDigit(opt);
  const l2 = a + code + b + sex + e + o + mrzCheckDigit(a + b + e + o);
  return [l1, l2];
}
