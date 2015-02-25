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
    this.newModal;
    this.detailModal;

    showDetails = function(data, document){
        $('input[data-data-field="id"]', $('#updateSecretForm')).val(document.id);
        $('input[data-data-field="username"]', $('#updateSecretForm')).val(data.username);
        $('input[data-data-field="password"]', $('#updateSecretForm')).val(data.password);
        $('input[data-data-field="url"]', $('#updateSecretForm')).val(data.url);
        $('textarea[data-data-field="freeText"]', $('#updateSecretForm')).val(data.freeText);
        $('textarea[data-data-field="tags"]', $('#updateSecretForm')).val(document.tags.join());
        $('#detailsModal').modal('show');
    };

    saveSecret = function(d){
        data = JSON.stringify({
            username: d.username,
            password: d.password,
            url: d.url,
            freeText: d.freeText
        });
        encrypted = self.tripledes.encrypt(data);

        pdata = {data: encrypted, tags: d.tags}
        if (d.id) pdata.id = d.id;
        if (d.category) pdata.category = d.category;

        $.post("/secret/", pdata).success(function(data){
            getSecrets();
        });
    }

    getSecrets = function(){
        $.getJSON("/secret/").success(function(data){

            var $mySecretEntries = $('#mySecretEntries');
            $mySecretEntries.empty();

            $.get('static/js/templates.html', function(templates){
                var $tplAccordion = $(templates).filter('#tplAccordion');
                var $tplCategory = $(templates).filter('#tplCategory');
                var $tplCategoryBody = $(templates).filter('#tplCategoryBody');
                var $tplSecretEntry = $(templates).filter('#tplSecretEntry');
                var $tplTagcontainer = $(templates).filter('#tplTagcontainer');

                categories = {};
                $.each(data, function(i, doc){
                    try {
                        self.tripledes.decrypt(doc.data);
                    } catch (err) {
                        alert('The data could not be decrypted. Please enter a valid passphrase.');
                        return false;
                    }
                    if(!(doc.category in categories)){
                        categories[doc.category] = [];
                    }
                    categories[doc.category].push(doc);
                });

                $('input[data-data-field="category"]', self.newModal).autocomplete({
                    source: $.map(categories, function(element,index) {return index})
                });

                var $accordion = $($tplAccordion.html());

                var index = 1;
                $.each(categories, function(category, docList){
                    var $category = $(Mustache.render($tplCategory.html(), {category: category, index: index}));
                    var $categoryBody = $(Mustache.render($tplCategoryBody.html(), {index: index}));

                    $.each(docList, function(i, document){
                        var data = JSON.parse(self.tripledes.decrypt(document.data));

                        data.id = document.id
                        var $row = $(Mustache.render($tplSecretEntry.html(), data));

                        $.each(document.tags, function(i, tag){
                            var $tag = $(Mustache.render($tplTagcontainer.html(), {tag: tag}));
                            $('td.tags', $row).append($tag);
                        });

                        $('button.docUpdate', $row).on('click', function(){
                            showDetails(data, document);
                        });

                        $('button.docRemove', $row).on('click', function(){
                            $.ajax({
                                url: '/secret/',
                                type: 'DELETE',
                                data: {id: document.id},
                                success: function(result) {
                                    getSecrets();
                                }
                            });
                        });
                        $('tbody', $categoryBody).append($row);
                    });
                    $category.append($categoryBody);
                    $($accordion).append($category);
                    index += 1;
                });
                $mySecretEntries.append($accordion);
                $('.collapse').collapse();
            });
        });
    };

    createSecret = function(category, username, password, url, freeText, tags){
        if(!category){
            alert('At least category is required.');
            return false;
        }
        saveSecret({
            category: category,
            username: username,
            password: password,
            url: url,
            freeText: freeText,
            tags: tags
        });
    };

    updateSecret = function(id, username, password, url, freeText, tags){
        if(!id){
            alert('At least id is required.');
            return false;
        }
        saveSecret({
            id: id,
            username: username,
            password: password,
            url: url,
            freeText: freeText,
            tags: tags
        });
    };

    this.init = function(passphrase){
        self = this;
        this.tripledes = new EnDeCrypt(passphrase);

        $.get('static/js/templates.html', function(templates){
            self.newModal = $($(templates).filter('#tplNewModal').html());
            self.detailModal = $($(templates).filter('#tplDetailModal').html());

            $('#mySecrets').prepend(self.newModal);
            $('#mySecrets').append(self.detailModal);

            // toggle new secret password visibility
            $(".passwordVisible").on('click', function(){
                $(this).siblings('input[data-data-field="password"]').toggleAttr("type", "text", "password");
            });

            $("#createSecret").on('click', function(){
                createSecret(
                    $('input[data-data-field="category"]', $('#createSecretForm')).val(),
                    $('input[data-data-field="username"]', $('#createSecretForm')).val(),
                    $('input[data-data-field="password"]', $('#createSecretForm')).val(),
                    $('input[data-data-field="url"]', $('#createSecretForm')).val(),
                    $('textarea[data-data-field="freeText"]', $('#createSecretForm')).val(),
                    $('textarea[data-data-field="tags"]', $('#createSecretForm')).val()
                );
                $("#createSecretForm")[0].reset();
            });

            $("#updateSecret").on('click', function(){
                updateSecret(
                    $('input[data-data-field="id"]', $('#updateSecretForm')).val(),
                    $('input[data-data-field="username"]', $('#updateSecretForm')).val(),
                    $('input[data-data-field="password"]', $('#updateSecretForm')).val(),
                    $('input[data-data-field="url"]', $('#updateSecretForm')).val(),
                    $('textarea[data-data-field="freeText"]', $('#updateSecretForm')).val(),
                    $('textarea[data-data-field="tags"]', $('#updateSecretForm')).val()
                );
            });
            getSecrets();
        });
    };
}

$.fn.toggleAttr = function(attr, attr1, attr2) {
    return this.each(function() {
        var self = $(this);
        if (self.attr(attr) == attr1)
            self.attr(attr, attr2);
        else
            self.attr(attr, attr1);
    });
};

function startSecrets(callback){
    var passphraseName = 'passphrase_' + prefix;
    var passphrase = $.localStorage.get(passphraseName);

    if (passphrase == '' || passphrase == null){
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
}

$(document).ready(function(){
    if(typeof prefix !== 'undefined'){
        startSecrets(function(passphrase){
            $('#mySecrets').show();
            new MySecrets().init(passphrase);
        });
    }
});