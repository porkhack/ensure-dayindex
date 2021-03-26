const { tree } = require('@pork/trees');
const { connect } = require('@oada/client');
const argv = require('minimist')(process.argv.slice(2));

// node index.js -s ../secrets/porkhack2.secrets.js -d 2021-03-26
if (!argv.s || !argv.d) {
  console.log('USAGE: node index.js -s path/to/secrets -d 2021-03-15');
  return;
}
const secrets = require(argv.s);
const day = argv.d
if (!day || !day.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
  console.log('ERROR: must pass day as -d looking like a day (2021-03-15)');
  return;
}

(async () => {
  const domain = Object.keys(secrets).find(d => d.match(/^farmer/));
  const token = secrets[domain].farmer.token;

  const oada = await connect({domain, token});
  console.log(`Connected to ${domain} with token ${token}`);

  const path = `/bookmarks/trellisfw/asns/day-index/${day}`;
  const exists = await oada.get({ path }).then(() => true).catch(() => false);
  if (exists) {
    console.log(`Path ${path} already exists`);
    return;
  }
 
  await oada.put({ path, tree, data: {} });
  console.log(`Path ${path} CREATED on OADA`);
  await oada.disconnect();
})();

/*
PUT /resources/randomstring
Content-Type: application/vnd.trellisfw.asn.porkhack.1+json
{ asn }

POST /bookmarks/trellisfw/asns/day-index/2021-03-26
{
  "_id": "reources/"+randomstring,
  _rev: 0
}
*/
