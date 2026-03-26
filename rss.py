import csv
import re
from datetime import datetime, timezone


ROMAN_NUMERAL_PATTERN = re.compile(
    r"\b(?=[MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b",
    re.IGNORECASE,
)
TRAILING_DATE_PATTERN = re.compile(
    r"-\d{1,2}-(january|february|march|april|may|june|july|august|september|october|november|december)$",
    re.IGNORECASE,
)


def normalize_name_slug(raw_name):
    return TRAILING_DATE_PATTERN.sub("", raw_name)


def format_name(raw_name):
    name = ' '.join(normalize_name_slug(raw_name).title().split('-'))
    return ROMAN_NUMERAL_PATTERN.sub(lambda m: m.group(0).upper(), name)

desc = []
today = datetime.now(timezone.utc).strftime("%d %B")
end_date = ""
feast = ""

with open("novena.csv", newline='') as cf:
    rd = csv.reader(cf, delimiter=',')
    for row in rd:
        if row[2] == today:
            desc.append(format_name(row[0]))
            if end_date and feast:
                continue
            else:
                end_date = row[3]
                feast = row[1]

desc = '<br/>'.join(desc)
guid = f"https://raynardgerraldo.github.io/novena#{today.replace(' ', '-').lower()}"
pub_date = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S %z")

header = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Novena Feed - {today}</title>
    <link>https://raynardgerraldo.github.io/novena</link>
    <description>Novena Feed - {today}</description>
    """
content = f"""<item>
      <title>Novenas you can start today - {today}</title>
      <link>https://raynardgerraldo.github.io/novena</link>
      <guid>{guid}</guid>
      <pubDate>{pub_date}</pubDate>
      <description><![CDATA[
        {desc}<br/><br/>
        Feast Day: {feast}<br/>
        Start Date: {today}<br/>
        End Date: {end_date}<br/>
      ]]></description>
    </item>
  </channel>
</rss>"""

with open("feed.xml", "w") as f:
    f.write(header)
    f.write(content)
