const express = require('express');
const debug = require('debug')('tiny-slug:index');
const router = express.Router();

const { urlForSlug } = require('../components/cassandra');

function home(req, res) {
  res.render('index', { title: 'tiny-slug' });
}

async function redirect(req, res, next) {
  const slug = req.params.slug;
  try {
    const url = await urlForSlug(slug);
    if (url) {
      debug(`Redirecting to ${url}`);
      return res.redirect(url);
    }

    return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
}

router
  .get('/', home)
  .get('/:slug', redirect);

module.exports = router;
