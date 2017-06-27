$(document).ready(function() {
    var parser;

    //This is to establish le connection
    var primus = Primus.connect('http://127.0.0.1:3306/', {});

    primus.on("data", function(data) {
        console.log("data:", data);
        primus.write(data)
    });

    $.get('../views/layouts/main.handlebars', function (template) {
        parser = Handlebars.compile(template);
        var output = parser();

        $("#nodeTable").html(output);
    });
});