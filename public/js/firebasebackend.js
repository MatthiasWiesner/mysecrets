
function FirebaseBackend(){
    this.datastore;
    var self = this;

    this.init = function(callback){
        if (typeof(config) == 'undefined') {
            msg  = "You need the firebase config. Create a file 'public/js/firebase_config.js'.\n"
            msg += "Get the config from the firebase app overview (Add firebase to web-app).\n"
            msg += "Paste the config variable to the file."
            bootbox.alert(msg);
        } else {
            firebase.initializeApp(config);
            // PopUp Version - work's, but is unfriendly
            // SignInWithRedirect, just leads to a redirect loop

            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then(function(result) {
                self.datastore = firebase.database().ref('/mysecrets');
                callback();
            }).catch(function(error) {
                bootbox.alert(errorMessage);
            });
        }
    };

    this.getSecrets = function(callback){
        var mysecrets = new Array();
        self.datastore.once('value').then(function(snapshot) {
            snapshot.forEach(function(item){
                var elem = item.val();
                elem.id = item.getKey();
                elem.get = function(_key){
                    return this[_key];
                };
                elem.getId = function(){
                    return this.id;
                };
                mysecrets.push(elem);
            });
            callback(mysecrets);
        });
    };

    this.saveSecret = function(secretData, callback){
        secretData.date = String(new Date());
        if(secretData.id){
            self.datastore.child(secretData.id).set(secretData);
        } else {
            self.datastore.push(secretData);
        }
        callback();
    };

    this.deleteSecret = function(recordId, callback){
        self.datastore.child(recordId).remove();
        callback();
    };
}