# tiny-slug
> Yet another url shortener

tiny-slug is a bare-bones URL shortener.

It uses a Cassandra backend in order to generate longs which will be
base-converted into slugs.

It uses signed 64 fixed precision integers to generate slugs in base62,
in order to conform to [RFC 3986](http://tools.ietf.org/html/rfc3986#section-2).

So with `2^63-11` possible values, the number is astronomically large and cannot be
exhausted realistically in a reasonable time span before the whole notion of URLs
is obsolete ;).

### Running

Simply run the app using `npm`

```bash
$ npm start
```

### Tests

In order to run the tests you need a running instance of cassandra which is
already provisioned.

A sample `docker-compose` file is provided in order to run the tests.

```bash
$ docker-compose -f test-env.yml up -d
```

then

```bash
$ npm test
```

##### Notes

- UI is shamefully copied from [ts-url-shortener](https://github.com/aligoren/ts-url-shortener)
- There is a possible race-condition when generating sequences which I *hope* is compensated for
  when assigning slugs to urls. Needs a **heavy** write load test using vegeta or some other tool
  to confirm.
