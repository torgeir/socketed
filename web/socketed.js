var logdiv;
function log(arg) {
  if(!logdiv) logdiv = $('.log')[0];
  logdiv.innerHTML = logdiv.innerHTML + '<br />\n' + new Date() + ': ' + arg;
}                            
    
var images = {};
function handle(key, data) {
  
  switch(key) {
           
    case 'c': 
      var image = images[data.id];
      if(image) {
        image.style.top = data.pos.y + 'px';
        image.style.left = data.pos.x + 'px';
      }
      break;
      
    case 'u':
      log('user connected ' + data.id)
      images[data.id] = (function() {
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

    case 'd':
      var div = images[data.id];
      document.body.removeChild(div)
      delete images[div];
    
    case 'm':
      log(data);
      break;
    
    default:
      log('uh, is the server playing us?');
      break;
  }
}

var conn;
var connect = function() {
  if (window["WebSocket"]) {
    conn = new WebSocket("ws://static.torgeir.at:8888/");

    conn.onmessage = function(evt) {
      var json = jQuery.parseJSON(evt.data);
      
      for(var key in json) {
        var data = json[key];
        handle(key, data);
      }         
    };
    
    conn.onclose = function() {
      log("disconnected");
    };

    conn.onopen = function() {
      log("connected");
    };                                               
  }
};

$(document).mousemove(function(event) {
   conn.send('{ "pos": { "x": ' + event.clientX + ', "y": ' + event.clientY + ' } }');
});
          
$(document).ready(function() {
  connect();
})
$(document).unload(function() {
   conn.close();
});
