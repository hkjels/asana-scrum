
/**
 * TODO Create a wrapper for #superagent with auth and base-url
 * TODO Create a component for magnified, autocompleted input
 */

/**
 * Module dependencies.
 */

var Collection = require('collection')
  , StoryboardView = require('storyboard-view')
  , Story = require('story-model')
  , Task = require('task-model')
  , asanabutton = require('asana-oauthbutton')('8061706646606')
  , autocomplete = require('autocomplete')
  , cookie = require('cookie')
  , domify = require('domify')
  , each = require('each')
  , events = require('event')
  , format = require('format').sprintf
  , magnify = require('input-search')
  , querystring = require('querystring')
  , request = require('superagent');

/**
 * Tags cache.
 */

var tags = {};

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
 *
 * TODO Translation asana <-> default should be moved
 */

function populateBoard(asanas) {
  var stories = {};

  each(asanas, function(asan) {
    if (asan.parent) {
      if (!stories[asan.parent.id]) stories[asan.parent.id] = {
        "id": asan.parent.id,
        "title": asan.parent.name,
        "tasks": new Collection
      };

      if (asan.assignee) console.dir(asan.assignee.photo);
      stories[asan.parent.id].tasks.push(new Task({
          "id": asan.id,
          "title": asan.name,
          "assignee": asan.assignee ? asan.assignee.name : null,
          "email": asan.assignee ? asan.assignee.email: null,
          "state": "todo"
        })
      );
    }
  });

  setTimeout(function() {
    var view = new StoryboardView(stories);
    content.appendChild(view.el);
  }, 50);
}

/**
 * Authorized.
 *
 * Authorized users sees a storyboard and can query for
 * tags within all of their workspaces at ones.
 */

function authorized() {
  content.classList.add('authorized');

  function retrieveTasks(res) {
    if (res.ok) return populateBoard(res.body.data);
    content.appendChild(domify('<h1>No stories was marked with your specified tag'));
  }

  // Search

  function keyup(e) {
    var enter = 13;
    if (enter == e.keyCode && e.target.value.length) {
      var tag = tags[e.target.value];
      var query = { opt_fields: 'assignee,completed,name,parent,assignee_status,assignee.name,assignee.email,parent.name,parent.id' };

      request
        .get(format('%s/tags/%d/tasks', base, tag))
        .query(query)
        .set({ 'Authorization': format('Bearer %s', cookie('auth')) })
        .end(retrieveTasks);
    }
  }

  var input = domify('<input type="search" name="query" placeholder="Input a tag" />');
  content.appendChild(input);
  magnify(input);
  events.bind(input, 'keyup', keyup);

  // Add tags for autocompletion

  autocomplete(input, function(str, cb) {
    request
      .get(format('%s/tags', base))
      .set({ 'Authorization': format('Bearer %s', cookie('auth')) })
      .end(function(res) {
        var tagNames = [];
        each(res.body.data, function(tag) {
          tags[tag.name] = tag.id;
          tagNames.push(tag.name);
        });
        cb(tagNames);
      });
  });
}

/**
 * Un-authorized.
 *
 * Will display an Oauth login-link which redirects to and from
 * the asana backend.
 */

function unauthorized() {
  content.appendChild(domify('<i class="icon ion-ios7-timer"></i>'))
  content.appendChild(asanabutton);
  content.classList.add('unauthorized');
}

/**
 * Determine if the user is logged in.
 */

if (cookie('auth')) authorized();
else {
  var query = querystring.parse(location.hash.substr(1));
  if (query.access_token != void 0) {
    cookie('auth', query.access_token, { maxage: query.expires_in });
    authorized();
  } else {
    unauthorized();
  }
}

