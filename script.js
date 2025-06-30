let saintData = {};
let saintIndex = [];

function simplify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\b(saint|blessed|of|the|and|in|on)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function suggestMatches(input) {
  const normalized = input.toLowerCase();
  return saintIndex
    .filter(entry => entry.simplified.includes(normalized) || normalized.includes(entry.simplified))
    .map(entry => entry.display);
}

fetch('novena.csv')
  .then(res => res.text())
  .then(csv => {
    csv.trim().split('\n').forEach(line => {
      const [name, feast, start_date, end_date, leap_start, leap_end] = line.split(',');
      const key = name.toLowerCase();
      saintData[key] = { feast, start_date, end_date, leap_start, leap_end };
      saintIndex.push({
        key,
        display: name.replace(/-/g, ' '),
        simplified: simplify(name)
      });
    });
  });

document.getElementById('search').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const query = e.target.value.trim().toLowerCase().replace(/\s+/g, '-');
    const exact = saintData[query];
    const output = document.getElementById('result');

    if (exact) {
      renderSaintInfo(output, exact);
    } else {
      const simplifiedQuery = simplify(e.target.value.trim());
      const matches = suggestMatches(simplifiedQuery);

      if (matches.length === 1) {
        const matchedKey = matches[0].toLowerCase().replace(/\s+/g, '-');
        renderSaintInfo(output, saintData[matchedKey]);
      } else if (matches.length > 1) {
        output.innerHTML = `<strong>Did you mean:</strong><ul>` +
          matches.map(name => `<li onclick="handleSuggestionClick('${name}')">${name}</li>`).join('') +
          `</ul>`;
      } else {
        output.textContent = 'Saint not found.';
      }
    }
  }
});

function renderSaintInfo(output, result) {
  output.innerHTML = `
    <strong>Feast Day:</strong> ${result.feast}<br>
    <strong>Novena Starts:</strong> ${result.start_date}<br>
    <strong>Novena Ends:</strong> ${result.end_date}` +
    (result.leap_start ? `<br><strong>Leap Year start:</strong> ${result.leap_start}<br>
    <strong>Leap Year end:</strong> ${result.leap_end}` : '');
}

function handleSuggestionClick(name) {
  const key = name.toLowerCase().replace(/\s+/g, '-');
  const saint = saintData[key];
  const output = document.getElementById('result');
  if (saint) renderSaintInfo(output, saint);
}

