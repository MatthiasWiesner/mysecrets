function EnDeCrypt(passphrase){
    this.passphrase = passphrase;

    this.encrypt = function(message){
        return CryptoJS.TripleDES.encrypt(message, passphrase).toString();
    };

    this.decrypt = function(encrypted){
        return CryptoJS.TripleDES.decrypt(encrypted, passphrase).toString(CryptoJS.enc.Utf8);
    };
}

function DropboxBackend(){
    this.client;
    this.datastore;

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
    }

    this.init = function(APP_KEY, APP_TOKEN, callback){
        var client = new Dropbox.Client({key: APP_KEY, token: APP_TOKEN});
        client.authenticate({interactive: false}, $.proxy(function (error) {
            if (error) {
                alert('Authentication error: ' + error);
            }
            if (client.isAuthenticated()) {
                this.client = client;

                var datastoreManager = this.client.getDatastoreManager();
                datastoreManager.openDefaultDatastore($.proxy(function (error, datastore) {
                    if (error) {
                        alert('Error opening default datastore: ' + error);
                    }
                    this.datastore = datastore;
                    callback();
                }, this));
            }
        }, this));
    };

    this.getSecrets = function(callback){
        var secretsTable = this.datastore.getTable('secrets');
        var result = secretsTable.query();
        callback(result);
    };

    this.saveSecret = function(secretData, callback){
        var secretsTable = this.datastore.getTable('secrets');
        var defaultValues = {
          "category": "New",
          "data": "",
          "tags": "",
          "date": String(new Date())
        }

        var recordId = secretData.id || this.generateUUID();
        var secret = secretsTable.getOrInsert(recordId, defaultValues);

        secret.update({
          "category": secretData.category,
          "data": secretData.data,
          "tags": secretData.tags,
          "date": String(new Date())
        });
        callback();
    };

    this.deleteSecret = function(recordId, callback){
        var secretsTable = this.datastore.getTable('secrets');
        var s = secretsTable.get(recordId)
        if (s) {
            s.deleteRecord();
        }
        callback(); 
    };
}


function MySecrets(){
    this.backend;
    this.tripledes;
    this.newModal;
    this.detailModal;

    this.showDetails = function(data){
        $('input[data-data-field="id"]', $('#updateSecretForm')).val(data.id);
        $('input[data-data-field="category"]', $('#updateSecretForm')).val(data.category);
        $('input[data-data-field="username"]', $('#updateSecretForm')).val(data.username);
        $('input[data-data-field="password"]', $('#updateSecretForm')).val(data.password);
        $('input[data-data-field="url"]', $('#updateSecretForm')).val(data.url);
        $('textarea[data-data-field="freeText"]', $('#updateSecretForm')).val(data.freeText);
        $('textarea[data-data-field="tags"]', $('#updateSecretForm')).val(data.tags);
        $('#detailsModal').modal('show');
    };

    this.getSecrets = function(){
        this.backend.getSecrets($.proxy(function(data){
            var $mySecretEntries = $('#mySecretEntries');
            $mySecretEntries.empty();

            var $tplAccordion = $('#tplAccordion');
            var $tplCategory = $('#tplCategory');
            var $tplCategoryBody = $('#tplCategoryBody');
            var $tplSecretEntry = $('#tplSecretEntry');
            var $tplTagcontainer = $('#tplTagcontainer');

            categories = {};
            $.each(data, $.proxy(function(i, doc){
                try {
                    this.tripledes.decrypt(doc.get('data'));
                } catch (err) {
                    alert('The data could not be decrypted. Please enter a valid passphrase.');
                    return false;
                }
                if (!(doc.get('category') in categories)){
                    categories[doc.get('category')] = [];
                }
                categories[doc.get('category')].push(doc);
            }, this));

            $('input[data-data-field="category"]', this.newModal).autocomplete({
                source: $.map(categories, function(element,index) {return index})
            });

            var $accordion = $($tplAccordion.html());

            var index = 1;
            $.each(categories, $.proxy(function(category, docList){
                var $category = $(Mustache.render($tplCategory.html(), {
                    category: category,
                    index: index
                }));
                var $categoryBody = $(Mustache.render($tplCategoryBody.html(), {index: index}));

                $.each(docList, $.proxy(function(i, document){
                    var data = JSON.parse(this.tripledes.decrypt(document.get('data')));

                    data.id = document.getId();
                    data.category = document.get('category');
                    data.tags = document.get('tags');

                    var $row = $(Mustache.render($tplSecretEntry.html(), data));

                    var tags = data.tags.split(/[\s,;]+/g).filter(Boolean);
                    if (tags.length){
                        $.each(tags, function(i, tag){
                            var $tag = $(Mustache.render($tplTagcontainer.html(), {tag: tag}));
                            $('td.tags', $row).append($tag);
                        });
                    }

                    $('button.docUpdate', $row).on('click', $.proxy(this.showDetails, this, data));

                    $('button.docRemove', $row).on('click', $.proxy(function(){
                        bootbox.confirm("Are you sure?", $.proxy(function(result) {
                            if(result){
                                this.backend.deleteSecret(document.getId(), $.proxy(this.getSecrets, this));
                            }
                        }, this));
                    }, this));
                    $('tbody', $categoryBody).append($row);
                }, this));

                $(".passwordVisible", $categoryBody).on('click', function(){
                    $('input[data-data-field="password"]', $categoryBody).toggleAttr("type", "text", "password");
                });

                $category.append($categoryBody);
                $($accordion).append($category);
                index += 1;
            }, this));
            $mySecretEntries.append($accordion);
            $('.collapse').collapse();
        }, this));
    };

    this.saveSecret = function(d){
        data = JSON.stringify({
            username: d.username,
            password: d.password,
            url: d.url,
            freeText: d.freeText
        });
        encrypted = this.tripledes.encrypt(data);
        pdata = {
            data: encrypted,
            tags: d.tags
        }
        if (d.id) {
            pdata.id = d.id;
        }
        if (d.category) {
            pdata.category = d.category;
        }
        this.backend.saveSecret(pdata, $.proxy(this.getSecrets, this, data));
    }

    this.createSecret = function(category, username, password, url, freeText, tags){
        if (!category) {
            alert('At least category is required.');
            return false;
        }
        this.saveSecret({
            id: null,
            category: category,
            username: username,
            password: password,
            url: url,
            freeText: freeText,
            tags: tags
        });
    };

    this.updateSecret = function(id, category, username, password, url, freeText, tags){
        if (!id) {
            alert('At least id is required.');
            return false;
        }
        this.saveSecret({
            id: id,
            category: category,
            username: username,
            password: password,
            url: url,
            freeText: freeText,
            tags: tags
        });
    };

    this.exportSecrets = function(){
        this.backend.getSecrets($.proxy(function(data){
            documents = [];
            $.each(data, $.proxy(function(i, record){
                try {
                    var doc = {};
                    var d = JSON.parse(this.tripledes.decrypt(record.get('data')));
                    doc.username = d.username;
                    doc.password = d.password;
                    doc.url = d.url;
                    doc.freeText = d.freeText;
                    doc.category = record.get('category');
                    doc.tags = record.get('tags');
                } catch (err) {
                    alert('The data could not be decrypted. Please enter a valid passphrase.');
                    return false;
                }
                documents.push(doc);
            }, this));

            var json = JSON.stringify(documents, null, 2);
            var blob = new Blob([json], {type: 'application/json'});
            var url = window.URL.createObjectURL(blob);
            var a = $("<a />", {
                href : url,
                download: 'export_secrets.json'
            });
            a.appendTo('body');
            a.simulate("click");
            window.URL.revokeObjectURL(url);
        }, this));
    };

    this.importSecrets = function(data){
        $.each(data, $.proxy(function(idx, doc){
            if (!doc.category) {
                alert('At least category is required.');
                return true;
            }
            this.saveSecret({
                category: doc.category,
                username: doc.username,
                password: doc.password,
                url: doc.url,
                freeText: doc.freeText,
                tags: String(doc.tags)
            });
        }, this));
    };

    this.generatePassword = function(length, withSymbols){
        var mask = '';
        mask += 'abcdefghijklmnopqrstuvwxyz';
        mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        mask += '0123456789';
        if (withSymbols) {
            mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        }
        var result = '';
        for (var i = length; i > 0; --i) {
            result += mask[Math.round(Math.random() * (mask.length - 1))];
        }
        return result;
    };

    this.start = function(passphrase, backend){
        this.tripledes = new EnDeCrypt(passphrase);
        this.backend = backend;

        this.newModal = $('#tplNewModal').html();
        this.detailModal = $('#tplDetailModal').html();

        $('#mySecrets').prepend(this.newModal);
        $('#mySecrets').append(this.detailModal);

        // toggle dialog password visibility
        $('.passwordVisible', $('.modal')).on('click', function(){
            $('input[data-data-field="password"]', $(this).closest('form')).toggleAttr("type", "text", "password");
        });

        $('.btnGenPasswd', $('.modal')).on('click', {genFunc: this.generatePassword}, function(event){
            var len = $('input.genPasswdLen', $(this).parent()).val();
            var sc = $('input.genPasswdSC', $(this).parent()).prop('checked');
            var passwd = event.data.genFunc(len, sc);
            $('input[data-data-field="password"]', $(this).closest('form')).val(passwd);
        });

        $("#createSecret").on('click', $.proxy(function(){
            this.createSecret(
                $('input[data-data-field="category"]', $('#createSecretForm')).val(),
                $('input[data-data-field="username"]', $('#createSecretForm')).val(),
                $('input[data-data-field="password"]', $('#createSecretForm')).val(),
                $('input[data-data-field="url"]', $('#createSecretForm')).val(),
                $('textarea[data-data-field="freeText"]', $('#createSecretForm')).val(),
                $('textarea[data-data-field="tags"]', $('#createSecretForm')).val()
            );
            $("#createSecretForm")[0].reset();
        }, this));

        $("#updateSecret").on('click', $.proxy(function(){
            this.updateSecret(
                $('input[data-data-field="id"]', $('#updateSecretForm')).val(),
                $('input[data-data-field="category"]', $('#updateSecretForm')).val(),
                $('input[data-data-field="username"]', $('#updateSecretForm')).val(),
                $('input[data-data-field="password"]', $('#updateSecretForm')).val(),
                $('input[data-data-field="url"]', $('#updateSecretForm')).val(),
                $('textarea[data-data-field="freeText"]', $('#updateSecretForm')).val(),
                $('textarea[data-data-field="tags"]', $('#updateSecretForm')).val()
            );
        }, this));

        $('#btnImportSecrets').on('click', $.proxy(function(){
            var b = bootbox.dialog({
                title: 'Import Secrets',
                message: $('#tplImportSecrets').html()
            });
            try {
                var data = JSON.parse($('#content', b).val());
            } catch (err) {
                alert('The data could not be parsed. Please insert valid json');
                return false;
            }
            $('#btnSaveImports', b).on('click', $.proxy(this.importSecrets, this, data));
        }, this));            

        $('#btnExportSecrets').on('click', $.proxy(this.exportSecrets, this));

        this.getSecrets();
    };
}

function startMySecrets(passphrase, backend){
    $('#mySecrets').show();
    new MySecrets().start(passphrase, backend);
}

function initMySecrets(credentials){
    var passphraseName = 'passphrase';
    var passphrase = $.localStorage.get(passphraseName);
    var backend = new DropboxBackend();

        if (passphrase == '' || passphrase == null) {
        $('#setPassphrase').show();
        $('#setPassphrase button').click(function(){
            passphrase = $("#setPassphrase input").val();
            $.localStorage.set(passphraseName, passphrase);
            $('#setPassphrase').hide();
            backend.init(credentials.key, credentials.token, function(){
                startMySecrets(passphrase, backend);
            });
        });
    } else {
        backend.init(credentials.key, credentials.token, function(){
            startMySecrets(passphrase, backend);
        });
    }

    $('#btnClearPassphrase').on('click', function(){
        bootbox.confirm("Are you sure?", function(result) {
            if (result) {
                $.localStorage.remove(passphraseName);
                location.reload();
            }
        });
    });
}

$.fn.toggleAttr = function(attr, attr1, attr2) {
    return this.each(function(){
        if ($(this).attr(attr) == attr1) {
            $(this).attr(attr, attr2);
        } else {
            $(this).attr(attr, attr1);
        }
    });
};

$(document).ready(function(){
    if (typeof credentials !== 'undefined') {
        initMySecrets(credentials);
    }
});
