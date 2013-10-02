// ==UserScript==
// @name          LastFm SoundClouder
// @namespace     http://nickjacob.com
// @description	  Get some soundcloud info on last.fm
// @include       http://last.fm/*
// @include       http://*.last.fm/*
// ==/UserScript==
;(function (window, undefined) {

  function __deep(obj, prop) {
    var parts = prop.split('.'), i = -1, l = parts.length;
    while(++i < l) {
      if (!(obj[parts[i]] !== undefined && (obj = obj[parts[i]]))) {
        return undefined;
      }
    }
    return (typeof obj === 'function') ? obj() : obj;
  }
 
  function compile (tpl) {
    var qq = /"/.test(tpl) ? "\'" : "\"", _qq = function(str){ return qq + str + qq; };
    return Function(["obj"], "with (obj) { return " + _qq(tpl.replace(/[\r\n\s\t]/g, " ").replace(/['"]/g,"\$&").replace(/{{\s*([\w\.]+)\s*}}/ig, function (str, m) {
      return (/\./g.test(m)) ? _qq("+ __deep(obj, " + _qq(m) + ") +") : _qq(" + ((typeof(" + m + ") !== " + _qq("function") +") ? " + m + " : " + m + "()) +");
    })) + "; }");
  }

  // we need jquery; load it
  var MIN_JQUERY = 9, ROOT_URL = 'http://static.nickjacob.com/lastfm/',
      scTpl = compile(" \
      <div class='sc-user' id='{{id}}-sub' style='background: url({{avatar_url}}); background-size: 100%;'> \
        <div class='online-indicator online-{{online}}'></div> \
        <span class='sc-un'><a href='{{permalink_url}}' target='_blank'>{{username}}</a></span> \
        <span class='sc-followers'>{{followers_count}}</span> \
        <div class='sc-logo'><img src='http:\/\/developers.soundcloud.com\/assets\/logo_white.png'/></div> \
      </div>"),
      loadTpl = compile("\
        <div class='sc-modal' id='sc-modal'> \
          <div class='sc-modal-inner'> \
            Loading soundcloud links...\
          </div>\
        </div>\
      ");

  function loadScript (url, onload) {
    console.log('loading', url);

    var head = document.getElementsByTagName('head')[0],
        script = document.createElement('SCRIPT');

    script.async = true;
    script.src = url;

    script.onload = onload;
    script.onerror = function (){ console.log(arguments); throw "NO!"; };
    head.appendChild(script);
  }

  if (!window.jQuery || !jQuery().jquery.split('.')[1] >= MIN_JQUERY) {
    loadScript(ROOT_URL + 'jquery-1.10.2.min.js', main);
  } else {
    main();
  }

  function main () {
    loadScript(ROOT_URL + 'easyXDM.min.js', main_inner);
  }

  function main_inner () {
    // load in the stylesheet
    window.jQuery('head').append("<link rel='stylesheet' href='" + ROOT_URL + "jammy.css'/>");

    jQuery('body').append(loadTpl);
    var $modal = jQuery('#sc-modal');
    $modal.fadeIn(); // fade it in

    // set an emergency fadeout
    setTimeout(function () {
      $modal.fadeOut();
    }, 3000);

    var handlers = {

      name: function (data) {
        if (!data || !data.id || !data.data) return;

        var $el = jQuery('#' + data.id);

        if ($el) {

          // add the data to it
          $el.addClass('sc-data');

          data.data.id = data.id;
          $el.append(scTpl(data.data));

        }

      }

    };

    var socket = new easyXDM.Socket({
      remote: "http://static.nickjacob.com/lastfm/test.html",

      onMessage: function (message, origin) {
        var msg;

        try {
          msg = JSON.parse(message);
        } catch (e) {
        }

        if (msg && msg.type) {
          if (handlers[msg.type]){
            handlers[msg.type](msg.data);
          }
        }
      },

      onReady: function () {
        console.log('socket ready');

        // get the names
        var names = jQuery.makeArray(jQuery('.similar-artists .text-over-image-text, .artist-overview h1, strong.name, .artistList a[href*="/music/"], .artistRecs a[href*="/music/"], .artist-grid-item a[href*="/music/"], .recent-artists a[href*="/music/"], .album-item-detail-wrapper .artist, .artist-grid-item h3')).map(function (el, i) {
          var name = jQuery.trim(el.innerHTML);

          el.id = 'sc-' + i;
          return { name: name, id: 'sc-' + i };

        });

        // send the names to remote
        socket.postMessage(JSON.stringify(names));
        setTimeout(function (){
          $modal.fadeOut();
        }, 700);

      }

    });
  }

}(window));
