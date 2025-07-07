import csv
from datetime import datetime, timezone

desc = []
today = datetime.now(timezone.utc).strftime("%d %B")
end_date = ""
feast = ""

with open("novena.csv", newline='') as cf:
    rd = csv.reader(cf, delimiter=',')
    for row in rd:
        if row[2] == today:
            desc.append(' '.join(row[0].title().split('-')))
            if end_date and feast:
                continue
            else:
                end_date = row[3]
                feast = row[1]

desc = '<br/>'.join(desc)
header = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Novena Feed</title>
    <link>https://raynardgerraldo.github.io/novena</link>
    <description>Novena Feed</description>
    """
content = f"""<item>
      <title>Novenas you can start today</title>
      <link>https://raynardgerraldo.github.io/novena</link>
      <guid>https://raynardgerraldo.github.io/novena</guid>
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
