let saintData = {};
let saintIndex = [];
let foundKey = [];
const today = document.getElementById('today');
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const d = new Date();
const todaysDate = d.getUTCDate().toString().padStart(2, '0') + ' ' + months[d.getUTCMonth()];

function capitalize(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

function suggestMatches(input) {
  const normalized = input.toLowerCase();
  return saintIndex
    .filter(entry => entry.name.includes(normalized) || normalized.includes(entry.name))
    .map(entry => entry.display);
}

async function parse() {
  const res = await fetch('novena.csv');
  const csv = await res.text();
  csv.trim().split('\n').forEach(line => {
    const [name, feast, start_date, end_date, leap_start, leap_end] = line.split(',');
    const key = name.toLowerCase();
    const displayname = capitalize(name).replace(/-/g, ' ');
    console.log(start_date)
    console.log(todaysDate)
    if (start_date === todaysDate) {
      foundKey.push(key)
    }
    saintData[key] = { displayname, feast, start_date, end_date, leap_start, leap_end };
    saintIndex.push({
      key,
      display: name.replace(/-/g, ' '),
      name: name.replace(/-/g, ' ')
    });
  });
}

async function load() {
    await parse();
    console.log(saintData);
    console.log(foundKey);
    renderSaintInfo(today, foundKey);
}

document.getElementById('search').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const query = e.target.value.trim().toLowerCase().replace(/\s+/g, '-');
    const exact = saintData[query];
    const output = document.getElementById('result');

    if (exact) {
      renderSaintInfo(output, exact);
    } else {
      const matches = suggestMatches(e.target.value.trim());
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
  if (Array.isArray(result)) {
    output.innerHTML = `<strong>Novenas you can start today:</strong><br>`
    for (let i = 0; i < result.length; i++) {
        today.innerHTML += `${saintData[result[i]].displayname}<br>`
    }
    today.innerHTML += `
        <strong>Feast Day:</strong> ${saintData[result[0]].feast}<br>
        <strong>Novena Starts:</strong> ${saintData[result[0]].start_date}<br>
        <strong>Novena Ends:</strong> ${saintData[result[0]].end_date}` +
        (saintData[result[0]].leap_start ? `<br><strong>Leap Year start:</strong> ${saintData[result[0]].leap_start}<br>
         <strong>Leap Year end:</strong> ${saintData[result[0]].leap_end}` : '');

  } else {
    output.innerHTML = `
        ${result.displayname}<br>
        <strong>Feast Day:</strong> ${result.feast}<br>
        <strong>Novena Starts:</strong> ${result.start_date}<br>
        <strong>Novena Ends:</strong> ${result.end_date}` +
        (result.leap_start ? `<br><strong>Leap Year start:</strong> ${result.leap_start}<br>
        <strong>Leap Year end:</strong> ${result.leap_end}` : '');
  }
}

function handleSuggestionClick(name) {
  const key = name.toLowerCase().replace(/\s+/g, '-');
  const saint = saintData[key];
  const output = document.getElementById('result');
  if (saint) renderSaintInfo(output, saint);
}

load();
