const socket = io();

let params = new URLSearchParams(window.location.search);
let room = params.get("room");

function createRoom(){
    const newRoom = Math.random().toString(36).substring(2,8).toUpperCase();
    window.location.href = "?room="+newRoom;
}

if(room){
    socket.emit("joinRoom", room);
    document.getElementById("lobby").style.display="none";
}

let role;
let harePos = 0;
let tortoisePos = 0;
let stamina = 100;

socket.on("role", r=>{
    role=r;
    document.getElementById("role").innerText="You are: "+role;
});

document.getElementById("moveBtn").onclick=()=>{
    let move = role==="hare"?10:6;
    update(move);
    socket.emit("move",{move,role});
};

document.getElementById("boostBtn").onclick=()=>{
    if(role==="hare" && stamina>20){
        stamina-=20;
        update(25);
        socket.emit("move",{move:25,role});
    }
};

function update(move){
    if(role==="hare"){
        harePos+=move;
        document.getElementById("hare").style.left=harePos+"px";
    }else{
        tortoisePos+=move;
        document.getElementById("tortoise").style.left=tortoisePos+"px";
    }
    checkWin();
}

socket.on("opponentMove",data=>{
    if(data.role==="hare"){
        harePos+=data.move;
        document.getElementById("hare").style.left=harePos+"px";
    }else{
        tortoisePos+=data.move;
        document.getElementById("tortoise").style.left=tortoisePos+"px";
    }
    checkWin();
});

function checkWin(){
    if(harePos>900) alert("🐰 Hare Wins!");
    if(tortoisePos>900) alert("🐢 Tortoise Wins!");
}
