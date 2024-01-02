const width = 20;       // 横マス数
const height = 20;      // 縦マス数
const mineCount = 10;   // 地雷数
const size = 30;        // 1マスのドット数
const NumColor = ["#000","#f00","#080","#00f","#ff0","#f0f","#ff","#fff","#4f4"]  // 地雷数の色

let gameover = false;   // ゲームオーバーフラグ
let leftCount = 0;      // 開けたマスの数

// 盤面作成（処理用配列変数作成）
const board = [];
for(let y = 0; y < height; y++){
  board[y] = [];
  for(let x = 0; x < width; x++){
    leftCount ++;
    board[y][x] = {
      text: ''
    }
  }
}

// 地雷をセット
for( let i = 0; i < mineCount; i++){
  let x, y;
  do {
    x = Math.trunc(Math.random() * width);
    y = Math.trunc(Math.random() * height);
  } while(board[y][x].mine);
  board[y][x].mine = true;
  leftCount --;
}

const openTarget = [];

// 盤面描画・DOM設定
const init = ()=> {
  const container = document.getElementById('container');
  container.style.width = `${width * size}px`
  container.style.height = `${height * size}px`
  
  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      const div = document.createElement("div");
      container.appendChild(div);
      div.style.position =        "absolute";
      div.style.width =           `${size}px`
      div.style.height =          `${size}px`
      div.style.left =            `${x * size}px`
      div.style.top =             `${y * size}px`
      div.style.backgroundColor = '#ccc';
      div.style.border =          '3px outset #ddd';
      div.style.boxSizing =       'border-box';
      div.style.fontSize =        `${size * 0.7}px`;
      div.style.display =         `flex`;
      div.style.alignItems =      `center`;
      div.style.justifyContent =  `center`;
      // マスをクリックした時の処理
      div.onpointerdown = () => {
        if (gameover) { // ゲームオーバー時は何もしない
          return;
        }
        if(document.getElementById('flag').checked){  // 旗モードならば旗をマスに設定
          flag(x, y);
        } else {
          openTarget.push([x, y]);  // マスを開ける
          open ();
        }
      }
      board[y][x].element = div;
    }
  }
}

// 旗設定
const flag = (x, y) => {
  const cell = board[y][x];
  if(cell.open){              // マスが開いていたら何もしない
    return;
  }
  if(cell.text === '🚩'){     // 既に旗が立っていたら除去する
    cell.text = '';
  } else {
    cell.text = '🚩';         // 旗を立てる
  }
  update();
}

// 盤面再描写
const update = () => {
  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      const cell = board[y][x];
      cell.element.textContent = cell.text;
      if (cell.open) {
        cell.element.style.backgroundColor = "#eee";
        cell.element.style.border = "1px solid #888";
      }
    }
  }
}

// 全ての爆弾を表示する
const showAllMines = () => {
  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      const cell = board[y][x];
      if(cell.mine){
        cell.text = '💣';
      }
    }
  }
}

// マス開け処理
const open = () => {
  while(openTarget.length) {
    const [x, y] = openTarget.pop();
    const cell = board[y][x];
    if(cell.open) {
      continue;
    }
    cell.open = true;
    leftCount --;
    if(cell.mine) {
      gameover = true;
      showAllMines();
      cell.text = '💥';
      update();
      continue;
    }
    let counter = 0;
    let target = [];
    for(let dy = -1; dy <=1; dy++) {
      for(let dx = -1; dx <=1; dx++) {
        const cx = x + dx;
        const cy = y + dy;
        if(cx < 0 || cy < 0 || cx >= width || cy >= height){
          continue;
        }
        target.push([cx, cy]);
        if(board[cy][cx].mine){
          counter++;
        }
      }
    }
    if(counter){
      cell.text = counter;
      cell.element.style.color = NumColor[counter - 1 ];
    } else {
      cell.text = "";
      openTarget.push(...target);
    }
    if (leftCount === 0) {
      showAllMines();
      gameover = true;
    }
    update();
  }
}
  
window.onload = () => {
  init();
  const startTime = Date.now();
  const tick = () => {
    if(gameover) {
      return;
    }
    const time = Date.now() - startTime;
    document.getElementById("timer").textContent = (time / 1000).toFixed(2);
    requestAnimationFrame(tick);
  }
  tick();
}