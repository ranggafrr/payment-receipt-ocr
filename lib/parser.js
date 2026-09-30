const MONTHS = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

function linesOf(text) { return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean); }

function extractTransferAt(lines) {
  const line = lines.find(value => /(?:\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{1,2}-\d{1,2}).*\d{1,2}:\d{2}(?::\d{2})?/.test(value));
  const date = line?.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
  const time = line?.match(/\d{1,2}:\d{2}(?::\d{2})?/);
  const numericDate = line?.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const isoDate = line?.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  const normalizedTime = time && (time[0].split(':').length === 2 ? `${time[0]}:00` : time[0]);
  if (numericDate && normalizedTime) return `${numericDate[3]}-${numericDate[2].padStart(2, '0')}-${numericDate[1].padStart(2, '0')} ${normalizedTime}`;
  if (isoDate && normalizedTime) return `${isoDate[1]}-${isoDate[2].padStart(2, '0')}-${isoDate[3].padStart(2, '0')} ${normalizedTime}`;
  return date && normalizedTime ? `${date[3]}-${MONTHS[date[2].slice(0, 3).toLowerCase()]}-${date[1].padStart(2, '0')} ${normalizedTime}` : null;
}

function extractAmount(lines, key) {
  const index = lines.findIndex(line => new RegExp(key, 'i').test(line));
  const amountFrom = line => line?.match(/(?:Rp|IDR)\.?\s*([\d.,]+)/i)?.[1] || line?.match(/([\d.,]+)/)?.[1];
  const labeledValue = index >= 0 && (amountFrom(lines[index]) || amountFrom(lines[index + 1]));
  const rupiahValues = lines.flatMap(line => line.match(/(?:Rp|IDR)\.?\s*([\d.,]+)/gi) || []).map(value => value.match(/([\d.,]+)/)?.[1]).filter(Boolean);
  const value = labeledValue || rupiahValues.at(-1);
  if (!value) return null;
  const normalized = value.includes(',') && value.includes('.')
    ? (value.lastIndexOf(',') > value.lastIndexOf('.') ? value.replace(/\./g, '').replace(',', '.') : value.replace(/,/g, ''))
    : /,\d{3}$/.test(value) ? value.replace(',', '') : value.replace(/\./g, '').replace(',', '.');
  return Number(normalized);
}

function extractSender(lines, key, after, last, inlineLabel) {
  const index = lines.findIndex(line => new RegExp(key, 'i').test(line));
  if (index < 0 && last) return lines.at(-1) || null;
  if (index >= 0 && inlineLabel) {
    const inlineValue = lines[index].replace(new RegExp(`^${key}\\s*[:\\-]?\\s*`, 'i'), '').replace(/^[@:,-]+\s*/, '').trim();
    if (inlineValue) return inlineValue;
  }
  const inline = index >= 0 ? lines[index].match(/^\s*[^:]+:\s*(.+)$/) : null;
  if (inline) return inline[1].trim();
  const value = index >= 0 && after ? lines[index + 1] : index > 0 ? lines[index - 1] : lines.find(line => new RegExp(`(?:${key})\\s*[:\\-]`, 'i').test(line));
  return value?.replace(/^(?:dari|pengirim|sender)\s*[:\-]?\s*/i, '').replace(/^[@:,-]+\s*/, '').trim() || null;
}

module.exports = { linesOf, extractTransferAt, extractAmount, extractSender };
