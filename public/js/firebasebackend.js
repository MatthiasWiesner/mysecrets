
function FirebaseBackend(){
    this.datastore = 123;

    this.generateUUID = function() {
        var s = [], itoh = '0123456789ABCDEF';
        // Make array of random hex digits. The UUID only has 32 digits in it, but we
        // allocate an extra items to make room for the '-'s we'll be inserting.
        for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random()*0x10);
        // Conform to RFC-4122, section 4.4
        s[14] = 4;  // Set 4 high bits of time_high field to version
        s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
        // Convert to hex chars
        for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];
        // Insert '-'s
        s[8] = s[13] = s[18] = s[23] = '-';
        return s.join('');
    };

    this.getUrl = function(callback){
        var url = $.localStorage.get('firebaseUrl');
        if (url == undefined) {
            bootbox.prompt("Set the url to your firebase app?", function(url) {
              if (url === null) {
                alert('You f***ing need the firebase url, dude!');
              } else {
                $.localStorage.set('firebaseUrl', url);
                this.setDatastore(url, callback);
              }
            });
        } else {
            this.setDatastore(url, callback);
        }
    }

    this.setDatastore = function(url, callback){
        var secrets_url = url + '/' + 'mysecrets';
        this.datastore = new Firebase(secrets_url);
        this.datastore.authWithOAuthPopup("google", function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            callback();
          }
        });
    }

    this.init = function(callback){
        this.getUrl(callback);
    };

    this.getSecrets = function(callback){
        var mysecrets = new Array();
        this.datastore.on("value", function(snapshot) {
            snapshot.forEach(function(item){
                var elem = item.val();
                elem.id = item.key();
                elem.get = function(_key){
                    return this[_key];
                };
                elem.getId = function(){
                    return this.id;
                };
                mysecrets.push(elem);
            });
            callback(mysecrets);
        }, function (errorObject) {
          alert("The read failed: " + errorObject.code);
        });
    };

    this.saveSecret = function(secretData, callback){
        secretData.date = String(new Date());
        if(secretData.id){
            this.datastore.child(secretData.id).set(secretData);
        } else {
            this.datastore.push(secretData);
        }
        callback();
    };

    this.deleteSecret = function(recordId, callback){
        this.datastore.child(recordId).remove();
        callback();
    };
}