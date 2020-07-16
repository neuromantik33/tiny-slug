const base62 = require('base62');
const cassandra = require('cassandra-driver');
const consistency = cassandra.types.consistencies;

let contactPoints = process.env.CASSANDRA_CONTACT_POINTS;
contactPoints = contactPoints ? contactPoints.split(',') : ['localhost'];

const dc = process.env.CASSANDRA_DATACENTER || 'datacenter1';
const ks = process.env.CASSANDRA_KEYSPACE || 'tiny_slug';

const client = new cassandra.Client({
  contactPoints: contactPoints,
  localDataCenter: dc,
  keyspace: ks,
});
process.on('exit', async () => await client.shutdown());

module.exports = {

  // Visible for testing
  client: client,

  urlForSlug: async slug => {
    const rs = await executePs('SELECT url FROM slug_links WHERE slug = ?', [slug]);
    return rs.first() ? rs.first().url : null;
  },

  newSlugId: async name => {
    function incCounter() {
      return executePs('UPDATE slug_gen SET cnt = cnt + 1 WHERE name = ?', [name]);
    }

    function getCounter() {
      return executePs('SELECT cnt FROM slug_gen WHERE name = ?', [name]);
    }

    // There is a definite race condition here as there is no atomic
    // incrementAndGet semantics for counters but well adding a etcd
    // or zookeeper is just overkill for this exercise
    await incCounter();
    const rs = await getCounter();
    return rs.first().cnt;
  },

  slugForUrl: async url => {
    const rs = await executePs('SELECT slug FROM slug_links WHERE url = ?', [url]);
    return rs.first() ? rs.first().slug : null;
  },

  saveSlugFor: saveSlugFor,

};

async function saveSlugFor(url, id) {
  // There is a chance that the id is already reserved due to the race condition mentioned above
  // But since it is monotonically increasing let's assume that eventually retrying by decrementing
  // progressively will eventually fill any "holes"
  try {
    const slug = base62.encode(id);
    await executePs('INSERT INTO slug_links (slug, url) VALUES (?, ?)', [slug, url]);
    return slug;
  } catch (err) {
    console.error('Race condition detected! Decrementing until successful', err);
    if (id > 0) {
      return await saveSlugFor(url, id - 1);
    }

    throw err;
  }
}

function executePs(q, params) {
  return client.execute(q, params, { prepare: true, consistency: consistency.localQuorum });
}
