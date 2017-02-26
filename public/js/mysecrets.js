function EnDeCrypt(passphrase){
    this.passphrase = passphrase;

    this.encrypt = function(message){
        var salt = CryptoJS.lib.WordArray.random(16);
        var salt_hex = CryptoJS.enc.Hex.stringify(salt);

        var iv = CryptoJS.lib.WordArray.random(16);
        var key = CryptoJS.PBKDF2(this.passphrase, salt, {keySize: 256/32, iterations: 1000 });
        var encrypted = CryptoJS.AES.encrypt(message, key, {mode: CryptoJS.mode.CBC, iv: iv });


        var key_encrypted = CryptoJS.AES.encrypt(key.toString(), this.passphrase, {mode: CryptoJS.mode.CBC, iv: iv });

        return encrypted.toString() + ':' + key_encrypted.toString() + ':' + iv.toString();
    };

    this.decrypt = function(encrypted_string){
        var parts = encrypted_string.split(':');
        var message = parts[0];
        var key_encrypted = parts[1];
        var iv = CryptoJS.enc.Hex.parse(parts[2])

        var key_string = CryptoJS.AES.decrypt(key_encrypted, this.passphrase).toString(CryptoJS.enc.Utf8);
        var decrypted = CryptoJS.AES.decrypt(message, CryptoJS.enc.Hex.parse(key_string), {iv: iv});

        return decrypted.toString(CryptoJS.enc.Utf8);
    };
}

function MySecrets(){
    this.backend;
    this.endecrypt;
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

    this.newCategoryDoc = function(category) {
        $('input[data-data-field="category"]', $('#createSecretForm')).val(category);
        $('#newModal').modal('show');
    }

    this.getSecrets = function(){
        this.backend.getSecrets($.proxy(function(data){
            var $mySecretEntries = $('#mySecretEntries');
            $mySecretEntries.empty();

            var $tplAccordion = $('#tplAccordion');
            var $tplCategory = $('#tplCategory');
            var $tplCategoryBody = $('#tplCategoryBody');
            var $tplSecretEntry = $('#tplSecretEntry');
            var $tplTagcontainer = $('#tplTagcontainer');

            var categories = {};
            $.each(data, $.proxy(function(i, doc){
                var decrypted_data;
                try {
                    decrypted_data = this.endecrypt.decrypt(doc.get('data'));
                } catch (err) {
                    alert('Some could not be decrypted. Try another passphrase.');
                    return true;
                }
                // altough with a wrong passphrase the decypt function returns an empty string
                // instead of raise an error
                if (!decrypted_data) {
                    alert('Some could not be decrypted. Try another passphrase.');
                    return true;
                }

                if (!(doc.get('category') in categories)){
                    categories[doc.get('category')] = [];
                }
                categories[doc.get('category')].push(new Array(doc, decrypted_data));
            }, this));

            $('input[data-data-field="category"]', $('#createSecretForm')).autocomplete({
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

                $.each(docList, $.proxy(function(i, document_data){
                    var doc = document_data[0];
                    var data = {};

                    try {
                        data = JSON.parse(document_data[1]);
                    } catch (err){
                        console.log(err);
                    }

                    data.id = doc.getId();
                    data.category = doc.get('category');
                    data.tags = doc.get('tags');

                    var $row = $(Mustache.render($tplSecretEntry.html(), data));

                    $(".passwordVisible", $row).on('click', function(){
                        $('input[data-data-field="password"]', $row).toggleAttr("type", "text", "password");
                    });

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
                                this.backend.deleteSecret(doc.getId(), $.proxy(this.getSecrets, this));
                            }
                        }, this));
                    }, this));
                    $('tbody', $categoryBody).append($row);

                }, this));

                $category.append($categoryBody);
                $($accordion).append($category);
                index += 1;

                new Clipboard('.btn-passwd', {
                    text: function(trigger){
                        return $(trigger.getAttribute('data-clipboard-target')).val();
                    }
                });

                $('button.newCategoryDoc', $category).on('click', $.proxy(this.newCategoryDoc, this, category));

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
        encrypted = this.endecrypt.encrypt(data);
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
            var documents = [];
            $.each(data, $.proxy(function(i, record){
                try {
                    var doc = {};
                    var d = JSON.parse(this.endecrypt.decrypt(record.get('data')));
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
        this.endecrypt = new EnDeCrypt(passphrase);
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
            $('#newModal').modal('hide');
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

            $('#btnSaveImports', b).on('click', $.proxy(function(){
                try {
                    var data = JSON.parse($('#content', b).val());
                } catch (err) {
                    alert('The data could not be parsed. Please insert valid json');
                    return false;
                }
                this.importSecrets(data);
            }, this));
        }, this));

        $('#btnExportSecrets').on('click', $.proxy(this.exportSecrets, this));

        this.getSecrets();
    };
}

function startMySecrets(passphrase, backend){
    $('#mySecrets').show();
    new MySecrets().start(passphrase, backend);
}

function initBackend(backend, passphrase){
    backend.init(function(){
        startMySecrets(passphrase, backend);
    });
}

function initMySecrets(){
    var passphraseName = 'passphrase';
    var passphrase = $.localStorage.get(passphraseName);

    var backends = {
        local: {clazz: LocalBackend},
        default: {clazz: FirebaseBackend}
    };

    if ($.getUrlVar('be') != undefined && backends[$.getUrlVar('be')] != undefined) {
        var backendDef = backends[$.getUrlVar('be')]
    } else {
        var backendDef = backends.default;
    }

    var clazz = backendDef['clazz'];
    var backend = new clazz();

    if (passphrase == '' || passphrase == null) {
        $('#setPassphrase').show();
        // toggle passphrase visibility
        $('.passwordVisible', $('#setPassphrase')).on('click', function(){
            $('#passphrase').toggleAttr("type", "text", "password");
        });
        $('#setPassphrase button.submit').click(function(){
            passphrase = $("#passphrase").val();
            if ($("#store_passphrase").is(":checked")) {
                $.localStorage.set(passphraseName, passphrase);
            }
            $('#setPassphrase').hide();
            initBackend(backend, passphrase);
        });
    } else {
        initBackend(backend, passphrase);
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

$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    var urlvar = $.getUrlVars()[name];
    if (urlvar) {
        return $.getUrlVars()[name].replace('#', '');
    }
    return '';
  }
});

$(document).ready(function(){
    initMySecrets();
});
