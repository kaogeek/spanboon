setTimeout(() => {
    let Url = document.URL;
    let indexEmergencyevent = Url.indexOf('emergencyevent')
    let indexObjectivetimeline = Url.indexOf('objective')
    if (indexEmergencyevent > 0 || indexObjectivetimeline > 0) {
        Controller.prototype.timeline();
        window.addEventListener('resize', function (event) {
            Controller.prototype.timeline();
        }, true);
    }
}, 5000);

var Controller;

Controller = (function () {
    function Controller(inputor) {
        this.controllers = {};
        this.$inputor = $(inputor);
    }

    Controller.prototype.timeline = function () {
        var w = window.innerWidth;
        if (canvas) {
            window.scrollTo(0, 0);
            var elms = document.querySelectorAll("[id='point']");
            var ctx = canvas.getContext("2d");
            canvas.height = document.getElementById('body').getBoundingClientRect().height
            canvas.width = document.getElementById('body').getBoundingClientRect().width

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
                ctx.moveTo(stratXpoint, (stratYpoint - 60));
                ctx.lineTo(stratXpoint, ((stratYpoint - y) / 1.2) + y);
                ctx.arcTo(stratXpoint, (((stratYpoint - y) / 2) + y), x, (((stratYpoint - y) / 2) + y), (x - stratXpoint) > 60 || (x - stratXpoint) < -60 ? 70 : 10); // Create an arc
                ctx.lineTo(((((stratXpoint - x) / 2) - (((stratXpoint - x) / 2) / 2)) + x), ((stratYpoint - y) / 2) + y);
                ctx.arcTo(x, ((stratYpoint - y) / 2) + y, x, y, (x - stratXpoint) > 60 || (x - stratXpoint) < -60 ? 70 : 10); // Create an arc
                ctx.lineTo(x, (y));
                ctx.stroke();

                stratXpoint = x;
                stratYpoint = y;

            }
        }

    };

    return Controller;

})();