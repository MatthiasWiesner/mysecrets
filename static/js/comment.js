function MyComments(){

    this.getComments = function(){

        $.getJSON('/comment/', $.proxy(function(data){
            var converter = new Markdown.Converter();
            $('tbody', $('#myComments')).empty();
            $.each(data, $.proxy(function(i, comment){
                comment.content = converter.makeHtml(comment.content);
                var $commentEntry = $(Mustache.render($(this.templates)
                    .filter('#tplCommentEntry').html(), comment));
                $('tbody', $('#myComments')).append($commentEntry);

                $('.docRemove', $commentEntry).on('click', $.proxy(function(){
                    bootbox.confirm("Are you sure?", $.proxy(function(result) {
                        if(result){
                            $.ajax({
                                url: '/comment/',
                                type: 'DELETE',
                                data: {id: comment.id},
                                success: $.proxy(function(result) {
                                    this.getComments();
                                }, this)
                            });
                        }
                    }, this));
                }, this));

            }, this));
        }, this));
    }

    this.saveComment = function(content, id){
        data = {content: content}
        if (id) {
            data.id = id
        }
        $.post("/comment/", data).success($.proxy(function(data){
            this.getComments();
        }, this));
    }

    this.init = function(){
        $.get('/static/js/templates.html', $.proxy(function(templates){
            this.templates = templates;
            this.newComment = $($(templates).filter('#tplComment').html());
            $('#myComments').prepend(this.newComment);

            $("#btnSaveComment").on('click', $.proxy(function(){
                this.saveComment(
                    $('textarea[data-data-field="content"]', $('#frmSaveComment')).val(),
                    $('input[data-data-field="id"]', $('#frmSaveComment')).val()
                );
                $("#frmSaveComment")[0].reset();
            }, this));

        }, this));
    }
}

$(document).ready(function(){
    var myComments = new MyComments();
    myComments.init();
    myComments.getComments();
});