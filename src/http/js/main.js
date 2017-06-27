$(document).ready(function() {
    var parser;

    //This is to establish le connection
    primusprotocol = (location.protocol === 'https:') ? "wss://" : "ws://",
        primus = window.Primus.connect(primusprotocol + location.host);

    $.get('../views/layouts/main.handlebars', function (template) {
        parser = Handlebars.compile(template);
        var output = parser();

        primus.on("data", function (data) {
            console.log("data:", data);
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
        console.log(newNode);
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
        $(this).data("name"); // name of factory
        console.log(this.id); // id of factory
    });
});