const express = require('express');
const debug = require('debug')('tiny-slug:slugs');
const router = express.Router();

const {
  urlForSlug,
  newSlugId,
  slugForUrl,
  saveSlugFor,
} = require('../components/cassandra');

async function getSlug(req, res, next) {
  const slug = req.params.slug;
  try {
    const url = await urlForSlug(slug);
    return url
      ? res.status(200).json({ slug: slug, url: url })
      : res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
}

async function createSlug(req, res, next) {
  const url = req.body.url;
  debug('Creating slug for', url);
  try {
    let status;
    let slug = await slugForUrl(url);
    if (slug) {
      status = 200;
    } else {
      slug = await saveNewSlug(url);
      status = 201;
    }

    return res
      .status(status)
      .json({ slug: slug, url: url });
  } catch (err) {
    return next(err);
  }
}

async function saveNewSlug(url) {
  const id = await newSlugId('auto');
  const slug = await saveSlugFor(url, id);
  debug('New slug for', url, `-> ${id} ('${slug}')`);
  return slug;
}

router
  .get('/:slug', getSlug)
  .post('/', createSlug);

module.exports = router;
