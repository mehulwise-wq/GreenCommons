// Builds the deed_rules INSERT from js/data.js so the server uses the same limits as the app.
const fs = require('fs'), vm = require('vm');
global.window = global; global.GC = {}; vm.runInThisContext(fs.readFileSync(__dirname + '/../js/data.js', 'utf8'));
const rows = GC.DEEDS.map((d) => {
  const pts = GC.DEED_LEVELS[d.level].points;
  return `('${d.id}','${d.cat}',${pts},${d.min},${d.max == null ? 'null' : d.max},${d.scale ? 'true' : 'false'},${d.int ? 'true' : 'false'},${d.once ? 'true' : 'false'},${d.unit === 'acres' ? 'true' : 'false'},${d.penalty ? 'true' : 'false'})`;
});
process.stdout.write('insert into public.deed_rules(deed_id,cat,points,min_amount,max_amount,per_person,whole_only,once_only,by_land,is_penalty) values\n' + rows.join(',\n') + '\non conflict (deed_id) do update set cat=excluded.cat, points=excluded.points, min_amount=excluded.min_amount, max_amount=excluded.max_amount, per_person=excluded.per_person, whole_only=excluded.whole_only, once_only=excluded.once_only, by_land=excluded.by_land, is_penalty=excluded.is_penalty;\n');
