setTimeout(() => {
    window.scrollTo(0, 0);

    var elms = document.querySelectorAll("[id='draw']");
    var ctx = canvas.getContext("2d");
    var stratXpoint = 20
    var stratYpoint = 20

    for (var i = 0; i < elms.length; i++) {
        var position = elms[i].getBoundingClientRect();
        var x = (position.left + position.width / 2);
        var y = (position.top);
        if (i === 0) {
            stratXpoint = x
            stratYpoint = y
        }

        ctx.beginPath();
        ctx.lineJoin = "round";
        ctx.setLineDash([13, 10]);
        ctx.strokeStyle = "#e1e1e1";
        ctx.lineWidth = 9;
        ctx.moveTo(stratXpoint, stratYpoint);
        ctx.lineTo(stratXpoint, ((stratYpoint - y) / 1.2) + y);
        ctx.arcTo(stratXpoint, (((stratYpoint - y) / 2) + y), x, (((stratYpoint - y) / 2) + y), 50); // Create an arc
        ctx.lineTo(((((stratXpoint - x) / 2) - (((stratXpoint - x) / 2) / 2)) + x), ((stratYpoint - y) / 2) + y);
        ctx.arcTo(x, ((stratYpoint - y) / 2) + y, x, y, 50); // Create an arc
        ctx.lineTo(x, (y));
        ctx.stroke();

        stratXpoint = x;
        stratYpoint = y;

    }






}, 200);