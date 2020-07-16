const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

const before = mocha.before;
const describe = mocha.describe;
const expect = chai.expect;
const it = mocha.it;

chai.use(chaiHttp);

const client = require('../components/cassandra').client;

describe('app', () => {

  before(async () => {
    await client.execute('TRUNCATE tiny_slug.slug_links');
  });

  let slug;

  it('should create a new slug given a url', async () => {
    const res = await chai
      .request(app)
      .post('/api/v1/slugs')
      .send({ url: 'https://www.google.com' });
    expect(res).to.have.status(201);
    expect(res.body).to.have.property('slug');
    slug = res.body.slug;
  });

  it('creating the same slug should be idempotent', async () => {
    const res = await chai
      .request(app)
      .post('/api/v1/slugs')
      .send({ url: 'https://www.google.com' });
    expect(res).to.have.status(200);
    expect(res.body.slug).to.eq(slug);
  });

  it('the api exposes the slug given a url', async () => {
    const res = await chai
      .request(app)
      .get(`/api/v1/slugs/${slug}`);
    expect(res).to.have.status(200);
    expect(res.body.url).to.eq('https://www.google.com');
  });
});
