(function() {

  var conn;
  var connect = function() {
  
    if (window["WebSocket"]) {
      conn = new WebSocket("ws://127.0.0.1:8888/");    
      
      conn.onopen = function() {
        log("Connecting..");
      };                                               
                                                       
      conn.onmessage = function(evt) {                 
        var json = jQuery.parseJSON(evt.data);         
        for(var key in json) {                         
          handle(key, json[key]);                      
        }                                              
      };                                               
                                                       
      conn.onclose = function() {                      
        log("Disconnected");                           
      };                                               
                                                       
    }
  };

  var logdiv;
  function log(arg) {
    if(!logdiv) { 
      logdiv = $('.log')[0];
    }
    logdiv.innerHTML = logdiv.innerHTML + '<br />\n' + new Date() + ': ' + arg;
  }                            
  
  var users = {};
  function handle(key, data) {
  
    switch(key) {
    
      // Change
      case 'c': 
        var div = users[data.id];
        if(div) {
          div.style.top  = data.pos.y + 'px';
          div.style.left = data.pos.x + 'px';
        }
        break;
             
      // New user
      case 'u':
        log('User connected ' + data.id)
      
        users[data.id] = (function() {
          var div = document.createElement('div');
          // http://paulirish.com/2009/random-hex-color-code-snippets/
          div.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
          div.style.position = 'absolute';
          div.style.height = '4px';
          div.style.width = '4px';
          document.body.appendChild(div);
          return div;
        })();        
        break;
           
      // Delete
      case 'd':
        var div = users[data.id];
        document.body.removeChild(div)
        delete users[data.id]; 
        break;
       
      // Message
      case 'm':
        log(data);
        break;
              
      default:
        break;
    }
  }                                        

  $(document).mousemove(function(event) {
     conn.send('{ "pos": { "x": ' + event.clientX + ', "y": ' + event.clientY + ' } }');
  });

  $(document).unload(function() {
     conn.close();
  });
          
  $(document).ready(function() {
    connect();
  });  

})();