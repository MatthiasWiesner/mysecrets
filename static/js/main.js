function EnDeCrypt(passphrase){
    this.passphrase = passphrase;

    this.encrypt = function(message){
        return CryptoJS.TripleDES.encrypt(message, passphrase).toString();
    };

    this.decrypt = function(encrypted){
        return CryptoJS.TripleDES.decrypt(encrypted, passphrase).toString(CryptoJS.enc.Utf8);
    };
}

function MySecrets(){
    this.tripledes;
    this.newModal;
    this.detailModal;

    this.showDetails = function(data, document){
        $('input[data-data-field="id"]', $('#updateSecretForm')).val(document.id);
        $('input[data-data-field="username"]', $('#updateSecretForm')).val(data.username);
        $('input[data-data-field="password"]', $('#updateSecretForm')).val(data.password);
        $('input[data-data-field="url"]', $('#updateSecretForm')).val(data.url);
        $('textarea[data-data-field="freeText"]', $('#updateSecretForm')).val(data.freeText);
        $('textarea[data-data-field="tags"]', $('#updateSecretForm')).val(document.tags.join());
        $('#detailsModal').modal('show');
    };

    this.getSecrets = function(){
        $.getJSON("/secret/").success($.proxy(function(data){
            var $mySecretEntries = $('#mySecretEntries');
            $mySecretEntries.empty();

            $.get('static/js/templates.html', $.proxy(function(templates){
                var $tplAccordion = $(templates).filter('#tplAccordion');
                var $tplCategory = $(templates).filter('#tplCategory');
                var $tplCategoryBody = $(templates).filter('#tplCategoryBody');
                var $tplSecretEntry = $(templates).filter('#tplSecretEntry');
                var $tplTagcontainer = $(templates).filter('#tplTagcontainer');

                categories = {};
                $.each(data, $.proxy(function(i, doc){
                    try {
                        this.tripledes.decrypt(doc.data);
                    } catch (err) {
                        alert('The data could not be decrypted. Please enter a valid passphrase.');
                        return false;
                    }
                    if(!(doc.category in categories)){
                        categories[doc.category] = [];
                    }
                    categories[doc.category].push(doc);
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
                        var data = JSON.parse(this.tripledes.decrypt(document.data));

                        data.id = document.id
                        var $row = $(Mustache.render($tplSecretEntry.html(), data));

                        $.each(document.tags, function(i, tag){
                            var $tag = $(Mustache.render($tplTagcontainer.html(), {tag: tag}));
                            $('td.tags', $row).append($tag);
                        });

                        $('button.docUpdate', $row).on('click', $.proxy(function(){
                            this.showDetails(data, document);
                        }, this));

                        $('button.docRemove', $row).on('click', $.proxy(function(){
                            bootbox.confirm("Are you sure?", $.proxy(function(result) {
                                console.log(result);
                                if(result){
                                    $.ajax({
                                        url: '/secret/',
                                        type: 'DELETE',
                                        data: {id: document.id},
                                        success: $.proxy(function(result) {
                                            this.getSecrets();
                                        }, this)
                                    });
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

        $.post("/secret/", pdata).success($.proxy(function(data){
            this.getSecrets();
        }, this));
    }

    this.createSecret = function(category, username, password, url, freeText, tags){
        if (!category) {
            alert('At least category is required.');
            return false;
        }
        this.saveSecret({
            category: category,
            username: username,
            password: password,
            url: url,
            freeText: freeText,
            tags: tags
        });
    };

    this.updateSecret = function(id, username, password, url, freeText, tags){
        if (!id) {
            alert('At least id is required.');
            return false;
        }
        this.saveSecret({
            id: id,
            username: username,
            password: password,
            url: url,
            freeText: freeText,
            tags: tags
        });
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

    this.init = function(passphrase){
        var self = this;
        this.tripledes = new EnDeCrypt(passphrase);

        $.get('static/js/templates.html', $.proxy(function(templates){
            this.newModal = $($(templates).filter('#tplNewModal').html());
            this.detailModal = $($(templates).filter('#tplDetailModal').html());

            $('#mySecrets').prepend(this.newModal);
            $('#mySecrets').append(this.detailModal);

            // toggle dialog password visibility
            $('.passwordVisible', $('.modal')).on('click', function(){
                $(this).siblings('input[data-data-field="password"]').toggleAttr("type", "text", "password");
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
                    $('input[data-data-field="username"]', $('#updateSecretForm')).val(),
                    $('input[data-data-field="password"]', $('#updateSecretForm')).val(),
                    $('input[data-data-field="url"]', $('#updateSecretForm')).val(),
                    $('textarea[data-data-field="freeText"]', $('#updateSecretForm')).val(),
                    $('textarea[data-data-field="tags"]', $('#updateSecretForm')).val()
                );
            }, this));

            $('#btnGeneratePassword').on('click', $.proxy(function(){
                var b = bootbox.dialog({
                    title: 'Generate password',
                    message: $(templates).filter('#tplGeneratePassword').html()
                });
                $('#contPasswordResults', b).hide();
                $('#btnGeneratePassword', b).on('click', $.proxy(function(){
                    var pw = this.generatePassword($('#inputPasswordLength').val(), $('#inputPasswordWithSymbols', b).prop('checked'));
                    $('#passwordResult').val(pw);
                    $('#contPasswordResults', b).show();
                }, this));
            }, this));
            this.getSecrets();
        }, this));
    };
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

function startSecrets(callback){
    var passphraseName = 'passphrase_' + prefix;
    var passphrase = $.localStorage.get(passphraseName);

    if (passphrase == '' || passphrase == null) {
        $('#setPassphrase').show();
        $('#setPassphrase button').click(function(){
            passphrase = $("#setPassphrase input").val();
            $.localStorage.set(passphraseName, passphrase);
            $('#setPassphrase').hide();
            callback(passphrase);
        });
    } else {
        callback(passphrase);
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

$(document).ready(function(){
    if (typeof prefix !== 'undefined') {
        startSecrets(function(passphrase){
            $('#mySecrets').show();
            new MySecrets().init(passphrase);
        });
    }
});