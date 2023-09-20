canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const imgBackground = document.getElementById("img_bg0");

function resize_canvas(){
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

function gameLoop() {
    console.log('Loop')
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(imgBackground, 0, 0, 
        canvas.width, 
        canvas.height);

    window.requestAnimationFrame(gameLoop);
}

resize_canvas()
window.requestAnimationFrame(gameLoop);
