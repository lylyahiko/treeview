$(document).ready(function() {
    var parser;

    //This is to establish le connection
    primusprotocol = (location.protocol === 'https:') ? "wss://" : "ws://",
        primus = window.Primus.connect(primusprotocol + location.host);

    $.get('../views/layouts/main.handlebars', function (template) {
        parser = Handlebars.compile(template);
        var output = parser();

        primus.on("data", function (data) {
            $("#nodeTable").html(parser(data));
        });
    });

    var body = $("body");

    body.on('click', '#groot-add', function () {
        var newNode = {
            name: $("#name").val(),
            count: Number($("#count").val()),
            request: 'add',
            min: Number($("#min").val()),
            max: Number($("#max").val())
        };

        // Some sanity checking for inputs
        if (validate(newNode) !== false) {
            primus.write(newNode);
            $('#nodeModal').modal('hide');
        }
    });

    body.on('click', '.node', function () {
        $("#edit-name").val($(this).data("name"));
        $("#edit-min").val($(this).data("min"));
        $("#edit-max").val($(this).data("max"));
        $("#edit-count").val($(this).data("count"));
        $("#edit-node-id").val(this.id);
    });

    body.on('click', '#node-edit', function () {
        var editNode = {
            request: 'edit',
            name:   $("#edit-name").val(),
            min:    $("#edit-min").val(),
            max:    $("#edit-max").val(),
            count: $("#edit-count").val(),
            id:     $("#edit-node-id").val()
        };
        if (validate(editNode) !== false) {
            primus.write(editNode);
            $('#editModal').modal('hide');
        }
    });

    body.on('click', '#node-delete', function () {
        var deleteNode = {
            request: 'drop',
            id: $("#edit-node-id").val()
        };
        primus.write(deleteNode);
        $('#editModal').modal('hide');
    });

    function validate(node) {
        var errorPanel = $('.error-panel');
        var inputError = $(".input-error");
        inputError.html('');
        errorPanel.hide();

        if (node.name === '') {
            inputError.append('Name is empty');
            errorPanel.show();
            return false;
        }

        if (node.count < 0) {
            inputError.append('Number needs to be a positive number.');
            errorPanel.show();
            return false;
        }

        if (node.count > 15) {
            inputError.append('Number needs to be less than or equal to 15.');
            errorPanel.show();
            return false;
        }

        if (node.max < node.min) {
            inputError.append('The maximum number needs to be greater than the minimum number.');
            errorPanel.show();
            return false;
        }
        return true;
    }

    $('.error-panel').hide();
});