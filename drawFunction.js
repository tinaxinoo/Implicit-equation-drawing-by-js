// 全局变量
var canvas, ctx, expressionInput, drawButton, scale, centerX, centerY, dragging, lastX, lastY;

// 窗口加载完成后执行的函数
window.onload = function () {
    // 获取画布和上下文
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    // 获取表达式输入框和绘制按钮
    expressionInput = document.getElementById("expression");
    drawButton = document.getElementById("drawButton");

    // 初始化放缩倍数、中心坐标和拖动状态
    scale = 0.04;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    dragging = false;

    // 监听绘制按钮点击事件
    drawButton.addEventListener('click', function () {
        drawFunction();
    });

    // 绑定鼠标事件
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onMouseWheel);

    // 初始绘制
    drawFunction();
};

// 绘制函数
function drawFunction() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制坐标轴和网格线
    drawAxisAndGrid();

    // 解析表达式
    var evaluateFunction = parseExpressionToFunction(expressionInput.value);

    // 绘制函数图像
    drawFunctionGraph(evaluateFunction);
}

// 绘制函数图像
function drawFunctionGraph(evaluateFunction) {
    // 扫描每个像素并绘制
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            var scaledX = (x - centerX) * scale;
            var scaledY = (centerY - y) * scale;

            var fValues = [
                evaluateFunction(scaledX, scaledY),
                evaluateFunction(scaledX + scale, scaledY),
                evaluateFunction(scaledX + scale, scaledY + scale),
                evaluateFunction(scaledX, scaledY + scale)
            ];

            var allNaN = fValues.every(function (value) {
                return isNaN(value);
            });

            if (allNaN) {
                continue;
            }

            // 检查函数值符号
            var allPositive = fValues.every(function (value) {
                return value > 0;
            });

            var allNegative = fValues.every(function (value) {
                return value < 0;
            });

            // 如果符号不全相等，则填充红色
            if (!allPositive && !allNegative) {
                ctx.fillStyle = "red";
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}
// 绘制坐标轴和网格线
function drawAxisAndGrid() {


    // 绘制网格线和刻度值
    ctx.beginPath();
    for (var x = centerX; x < canvas.width; x += 50) {
        var roundedX = Math.round(x) + 0.5;
        ctx.moveTo(roundedX, 0);
        ctx.lineTo(roundedX, canvas.height);
        drawTick(roundedX, centerY, true, (x - centerX) * scale);
    }
    for (var x = centerX; x > 0; x -= 50) {
        var roundedX = Math.round(x) + 0.5;
        ctx.moveTo(roundedX, 0);
        ctx.lineTo(roundedX, canvas.height);
        drawTick(roundedX, centerY, true, (x - centerX) * scale);
    }
    for (var y = centerY; y < canvas.height; y += 50) {
        var roundedY = Math.round(y) + 0.5;
        ctx.moveTo(0, roundedY);
        ctx.lineTo(canvas.width, roundedY);
        drawTick(centerX, roundedY, false, (centerY - y) * scale);
    }
    for (var y = centerY; y > 0; y -= 50) {
        var roundedY = Math.round(y) + 0.5;
        ctx.moveTo(0, roundedY);
        ctx.lineTo(canvas.width, roundedY);
        drawTick(centerX, roundedY, false, (centerY - y) * scale);
    }
    ctx.strokeStyle = "#ddd"; // 网格线颜色
    ctx.stroke();


    // 绘制坐标轴
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0.5, centerY);
    ctx.lineTo(canvas.width + 0.5, centerY);
    ctx.moveTo(centerX, 0.5);
    ctx.lineTo(centerX, canvas.height + 0.5);
    ctx.strokeStyle = "#000000"; // 使用十六进制颜色值
    ctx.stroke();
}

// 绘制刻度值
function drawTick(x, y, isXAxis, value) {
    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    value = value.toFixed(2);
    if (isXAxis) {
        ctx.fillText(value, x, y + 10);
    } else {
        ctx.fillText(value, x - 10, y);
    }
}

// 解析表达式为函数
function parseExpressionToFunction(expression) {
    // 将输入的函数替换为完整的 Math 函数形式
    expression = expression.replace(/\btan\b/g, 'Math.tan');
    expression = expression.replace(/sin/g, 'Math.sin');
    expression = expression.replace(/cos/g, 'Math.cos');
    expression = expression.replace(/abs/g, 'Math.abs');
    expression = expression.replace(/ln/g, 'Math.log');
    expression = expression.replace(/sqrt/g, 'Math.sqrt');
    expression = expression.replace(/ceil/g, 'Math.ceil');
    expression = expression.replace(/random/g, 'Math.random');
    expression = expression.replace(/\batan\b/g, 'Math.atan');
    expression = expression.replace(/\^/g, '**'); // 将^(异或)替换为**(乘方)
    expression = expression.replace(/\be\b/g, 'Math.E');
    return new Function('x', 'y', 'return ' + expression + ';');
}

// 鼠标按下事件处理函数
function onMouseDown(event) {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
}

// 鼠标移动事件处理函数
function onMouseMove(event) {
    if (dragging) {
        var deltaX = event.clientX - lastX;
        var deltaY = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;

        // 移动中心点
        centerX += deltaX;
        centerY += deltaY;

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 重新绘制
        drawFunction();
    }
}

// 鼠标松开事件处理函数
function onMouseUp(event) {
    dragging = false;
}

// 鼠标滚轮事件处理函数
function onMouseWheel(event) {
    // 放缩倍数的调整量
    var delta = event.deltaY > 0 ? 10 / 9 : 9 / 10;
    scale *= delta;
    // 重新绘制
    drawFunction();
}

