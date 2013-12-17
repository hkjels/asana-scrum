
/**
 * Module dependencies.
 */

var Collection = require('collection')
  , asanabutton = require('asana-oauthbutton')('8061706646606')
  , cookie = require('cookie')
  , domify = require('domify')
  , events = require('event')
  , format = require('format').sprintf
  , magnify = require('input-search')
  // , StoryboardView = require('storyboard-view')
  , querystring = require('querystring')
  , request = require('superagent');

/**
 * Base url of API.
 */

var base = 'https://app.asana.com/api/1.0';

/**
 * DOM-element cache.
 */

var content = document.querySelector('#content');

/**
 * Populate storyboard.
 *
 * A search for a tag has been performed and we can
 * populate the Storyboard with results.
 */

function populateBoard(stories) {
  console.dir(stories);

  // var view = StoryboardView();
  // content.appendChild(view.el);

}

/**
 * Authorized.
 *
 * Authorized users sees a storyboard and can query for
 * tags within all of their workspaces at ones.
 */

function authorized() {
  content.classList.add('authorized');

  function checkResponse(res) {
    if (res.ok) return populateBoard(res.body);
    content.appendChild(domify('<h1>No stories was marked with your specified tag'));
  }

  // Search

  function keyup(e) {
    var enter = 13;
    if (enter == e.keyCode && e.target.value.length) {
      var tag = e.target.value;

      request
        .get(format('%s/tags/%s/tasks', base, tag))
        .set(format('Authorization: Bearer %s', cookie('auth')))
        .end(checkResponse);
    }
  }

  var input = domify('<input type="search" name="query" placeholder="Input a tag" />');
  content.appendChild(input);
  magnify(input);
  events.bind(input, 'keyup', keyup);
}

/**
 * Un-authorized.
 *
 * Will display an Oauth login-link which redirects to and from
 * the asana backend.
 */

function unauthorized() {
  content.appendChild(asanabutton);
  content.classList.add('unauthorized');
}

/**
 * Determine if the user is logged in.
 */

if (cookie('auth')) authorized();
else {
  var query = querystring.parse(location.href);
  if (query.token != void 0) {
    cookie('auth', query.token);
    authorized();
  } else {
    unauthorized();
  }
}

