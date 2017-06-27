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

        if (newNode.name !== ''
            && newNode.count > 0
            && newNode.min >= 0
            && newNode.count <=15
            && newNode.max > newNode.min
        ) {
            primus.write(newNode);
            $('#nodeModal').modal('hide');
        } else {
            alert('Please check your inputs and try again');
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
        primus.write(editNode);
        $('#editModal').modal('hide');
    });

    body.on('click', '#node-delete', function () {
        var deleteNode = {
            request: 'drop',
            id: $("#edit-node-id").val()
        };
        primus.write(deleteNode);
        $('#editModal').modal('hide');
    });
});