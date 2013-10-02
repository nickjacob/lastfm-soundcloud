;(function (window, undefined) {
  var MIN_JQUERY = 9, ROOT_URL = 'http://static.nickjacob.com/lastfm/';

  function immediate (done) {
    setTimeout(done, 0);
  }

  function loadError (err) {
    // todo: show error to user
    alert('failure: ' + err);
  }

  function loadScript (url, onload) {
    var head = document.getElementsByTagName('head')[0],
        script = document.createElement('SCRIPT');

    script.async = true;
    script.src = url;
    script.onload = onload;
    script.onerror = loadError;

    head.appendChild(script);
  }

  function soundcloud (done) {
    return function () {
      loadScript('http://connect.soundcloud.com/sdk.js', function () {
        if (!SC) return loadError('soundcloud not available');

        SC.initialize({
          client_id: 'c0cfd39532cab4fee36066c06b651747',
          redirect_uri: 'http://static.nickjacob.com/lastfm/callback.html'
        });

        // SC.connect(function () {
        //   SC.get('/me', function (me) {
        //     done(me);
        //   });
        // });
        
        done();

      });
    }
  }

  if (!window.jQuery || !jQuery().jquery.split('.')[1] >= MIN_JQUERY) {
    loadScript(ROOT_URL + 'jquery-1.10.2.min.js', soundcloud(main));
  } else {
    immediate(soundcloud(main));
  }


  // mainline
  function main (user) {
    var socket = new easyXDM.Socket({
      onMessage: function (message, origin) {
        var names = JSON.parse(message);

        names.map(function (data){
          SC.get('/users', { q: data.name }, function (users) {

            if (!users || !users.length) return;
            socket.postMessage(JSON.stringify({ type: 'name', data: { id: data.id, data: users[0] } }));

          });
        });

      }
    });

  }

}(window));
