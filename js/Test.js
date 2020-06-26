const FCFS = require('./js/FCFS.js');
const RR = require('./js/RR.js');
const HRRN = require('./js/HRRN.js');
const SPN = require('./js/SPN.js');
const SRTN = require('./js/SRTN.js');
const TLS = require('./js/TLS.js');
const FCFS_multi = require('./js/FCFS_multi.js');
const SPN_multi = require('./js/SPN_multi.js');
const SRTN_multi = require('./js/SRTN_multi.js');
const HRRN_multi = require('./js/HRRN_multi.js');
const RR_multi = require('./js/RR_multi.js');
const TLS_multi = require('./js/TLS_multi.js');
const createProcess = require('./js/createProcess.js');
const processInfoBean = require('./js/processInfoBean.js');
const {dialog} = require('electron').remote;

// alert message (일렉트론에서 alert 사용 시 input 태그 readOnly 처럼 변함)
const empty_inputs = {
    type: 'question',  //종류
    title: 'Inputs empty',  //제목
    message: 'Arrival 혹은 Burst Time을 입력해주세요',   // 메세지 내용
};
const bt_error = {
    type: 'question',
    title: 'Invalid value',
    message: 'burstTime은 0 보다 큰 값을 입력하세요',
};
const empty_tm = {
    type: 'question',
    title: 'Time Limit empty',
    message: 'Time Limit을 입력해주세요',
};
const input_error = {
    type: 'question',
    title: 'Invalid value',
    message: '모든 입력값은 1000000 이하로 입력하세요',
};
const empty_qt = {
    type: 'question',
    title: 'Quantums empty',
    message: '퀀텀을 입력하세요',
};
const switching_TLS = {
    type: 'question',
    title: 'TLS Error',
    message: 'TLS를 사용하려면 처음부터 선택 후 TIMELIMT를 입력해주세요',
};
const empty_error = {
    type: 'question',
    title: 'empty Error',
    message: '프로세스를 입력해주세요',
};
const over_process_num = {
    type: 'question',
    title: 'process Error',
    message: '프로세스 개수가 15개를 초과합니다',
};

// 애니메이션 색 넣기
const BLACK = 'black';  // 큐가 빈 경우
const COLORS = ['#8F8681', '#E4B660', '#7BC5AE', '#85B8CB', '#A46843', '#9BCFB8', '#FE7773', '#FCD3D1', '#A13E97', '#40686A', '#19B3B1', '#BDBDBF', '#1E646E', '#B98D72', '#EAD6BD'];

// 필요한 태그 찾기
const createTag = str => document.createElement(str);
const findTag = str => document.querySelector(str);
const inputs = document.querySelectorAll('.inputs');            // at, bt 인풋
const processT = findTag('#process table');                         // 프로세스 테이블
const btn_add = findTag('.btn_add');                                // 추가 버튼
const reset = findTag('.reset');                                    // 리셋 버튼
const quantum_name = findTag('.input_time');                        // 퀀텀 이름
const quantum_input = document.getElementById('quantum');     // 퀀텀 인풋
const timeLimit_name = findTag('.time_limit');                      // 제한시간 이름
const timeLimit_td = findTag('.time_limit_td');                     // 제한시간 td

const timeLimit_input = document.getElementById('time_limit');// 제한시간 인풋
const select = document.getElementById('algorithm');          // 알고리즘 선택

let processNumber = 0;          // 입력받은 프로세스 개수를 기억
let at = [];                    // arrival time을 넣는다 (1000000 이하)
let bt = [];                    // burst time을 넣는다 (1000000 이하)
let lt = [];                    // limit time을 넣는다

let text = selectAlgorithm();                 // 선택된 알고리즘을 넣는다.


// RR이나 TLS일때는 입력창 하나가 더 필요하므로 이들이 입력될 때 나타나도록 해준다.
window.addEventListener('click', (e) => {
    const timeLimit_tds = document.querySelectorAll('.time_limit_td');

    e.preventDefault();
    text = selectAlgorithm();
    if(text === 'RR' || text === 'RR multi') {
        quantum_name.style.display ='inline';
        quantum_input.style.display ='inline';
    }
    else {
        quantum_name.style.display ='none';
        quantum_input.style.display ='none';
    }
    if(text === 'TLS' || text === 'TLS multi') {
        // at와 lt의 개수가 다르면 어느 하나에서 lt가 없는 경우이므로 TLS로 못가게 해준다
        if(at.length !== lt.length) {
            dialog.showMessageBox(null, switching_TLS);
            return select[0].selected = true;
        }
        timeLimit_name.style.display = 'inline';
        timeLimit_tds.forEach(timeLimit => {
            timeLimit.style.visibility ='visible';
        });
        timeLimit_input.style.display = 'inline';
    }
    else {
        timeLimit_name.style.display ='none';
        timeLimit_tds.forEach(timeLimit => {
            timeLimit.style.visibility ='hidden';
        });
        timeLimit_input.style.display ='none';
    }
});


// 리셋 버튼 클릭 시 전체 리셋
reset.addEventListener('click', (e) => {
    location.reload();
});



// 추가 버튼을 클릭되면 사용자의 입력을 받았던 input 태그에서 값을 가져와 저장한다.
btn_add.addEventListener('click', (e) => {
    e.preventDefault();
    text = selectAlgorithm();

    // 프로세스를 추가할 때 빈 입력이 있는 경우를 막는다
    // inputs[0] : AT, inputs[1] : BT, inputs[2] : Quantum, inputs[3] : LT
    if((text === 'TLS' || text === 'TLS multi') && inputs[3].value=='') return dialog.showMessageBox(null, empty_tm);
    if(inputs[0].value==='' || inputs[1].value==='') return dialog.showMessageBox(null, empty_inputs);
    if(inputs[1].value === '0') return dialog.showMessageBox(null, bt_error);
    if(Number(inputs[0].value) > 1000000 || Number(inputs[1].value) > 1000000 || inputs[2].value > 1000000 || inputs[3].value > 1000000) return dialog.showMessageBox(null, input_error);
    if(processNumber === 15) return dialog.showMessageBox(null, over_process_num);
    // 프로세스 이름 설정, at와 bt 저장
    const tr = createTag('tr');
    const td_name = createTag('td');
    td_name.textContent = 'P' + processNumber;                  // 프로세스 이름 넣기
    tr.appendChild(td_name);
    let index=0;
    inputs.forEach(input => {
        if(!input.classList.value.includes('input_time') && !input.classList.value.includes('time_limit')) {
            const tds = createTag('td');
            tds.textContent = input.value;
            tr.appendChild(tds);
            processT.appendChild(tr);
            if(index === 0) at.push(Number(input.value));       // at, bt에 입력값을 넣는다
            else bt.push(Number(input.value));
            index++;
            input.value = '';                                   // input 안의 값을 비워준다
        }
    });
    // TLS일 경우 lt도 추가해준다
    if(text === 'TLS' || text === 'TLS multi') {
        const tds = createTag('td');
        tds.textContent = inputs[3].value;
        tds.classList.add('time_limit_td');
        tr.appendChild(tds);
        processT.appendChild(tr);
        lt.push(Number(inputs[3].value));   // lt에 입력값을 넣는다
        inputs[3].value = '';
    }
    document.getElementById('arrival').focus();
    // 프로세스 수를 하나 증가시켜 준다.
    processNumber++;
});

// 실행 버튼이 눌러지면 테이블을 그린다
const btn_start = findTag('.btn_start');
btn_start.addEventListener('click', (e) => {
    e.preventDefault();
    if(at.length === 0) return dialog.showMessageBox(null, empty_error);
    test(processNumber, at, bt);
});

// 프로세스 개수, arrivalTime, burstTime를 받아서 waitingTime, turnArountTime을 출력하고 애니메이션을 넣는다.
function test(size, at, bt) {

    text = selectAlgorithm();
    const coreNumber = Number(selectCores());       // 코어 갯수를 받아온다
    let create = new createProcess(size, coreNumber, at, bt, lt);

    let algorithm;
    if(text === 'FCFS')
        algorithm = new FCFS(create);
    else if(text === 'RR') {
        if(quantum.value === '') return dialog.showMessageBox(null, empty_qt);
        algorithm = new RR(create, quantum.value);
    }
    else if(text === 'HRRN')
        algorithm = new HRRN(create);
    else if(text === 'SPN')
        algorithm = new SPN(create);
    else if(text === 'SRTN')
        algorithm = new SRTN(create);
    else if(text === 'TLS')
        algorithm = new TLS(create);
    else if(text === 'FCFS multi')
        algorithm = new FCFS_multi(create, coreNumber);
    else if(text === 'SPN multi')
        algorithm = new SPN_multi(create, coreNumber);
    else if(text === 'HRRN multi')
        algorithm = new HRRN_multi(create, coreNumber);
    else if(text === 'SRTN multi')
        algorithm = new SRTN_multi(create, coreNumber);
    else if(text === 'RR multi') {
        if(quantum.value === '') return dialog.showMessageBox(null, empty_qt);
        algorithm = new RR_multi(create, quantum_input.value, coreNumber);
    }
    else if(text === 'TLS multi')
        algorithm = new TLS_multi(create, coreNumber);


    draw(algorithm.getPrintQueue());        // 출력할 printQueue를 그린다
    informate(algorithm.processList);       // 프로세스의 정보를 표현해준다
}

// 애니메이션 그리기
function draw(queue) {
    const table = findTag('#animation table');
    const tr_time = createTag('tr');
    const tr_ani = createTag('tr');
    let time = 0;                       // 시간을 체크
    let index = 0;                      // queue의 index를 체크
    text = selectAlgorithm();

    // 실행한 알고리즘 이름을 기록
    const name = createTag('tr');
    name.textContent = text;
    name.style.borderTop = 'hidden';
    table.append(name);

    // 시간 기록
    while(index<queue.length) {
        const td = createTag('td');
        let str = "" + queue[index];                         // queue[index] : 프로세스 이름
        if(str === 'X') td.textContent = time++;             // X 일때 = 프로세스 실행이 없을 때 => 따로 처리한다.

        // 멀티코어에서 각각의 코어에서 같은 시간에 일했다면 출력값이 P1a, P2b, P3c ... 이런식으로 출력됨
        // 만약 P1a, P2a, P3a ... 이런식으로 a밖에 없다면 코어 하나에서 실행된 것을 의미
        if(str.indexOf('a')>-1) td.textContent = time++;
        if(str.indexOf('b')>-1) td.textContent = time-1;
        if(str.indexOf('c')>-1) td.textContent = time-1;
        if(str.indexOf('d')>-1) td.textContent = time-1;
        tr_time.appendChild(td);
        index++;
    }
    table.appendChild(tr_time);
    let i = 1;                                                                  // queue의 진행 상태를 위한 인덱스
    const td = createTag('td');
    while(true) {
        const td = createTag('td');
        if (queue[i - 1] !== 'X') queue[i - 1] = queue[i - 1].slice(0, -1);              // X 일때는 따로 slice하지 않는다
        td.textContent = queue[i - 1];
        tr_ani.appendChild(td);
        if (queue[i - 1] === 'X') td.style.backgroundColor = BLACK;                     // 작업하지 않을 경우 black
        else td.style.backgroundColor = COLORS[Number(queue[i - 1].slice(1))];          // 프로세스 번호마다 색을 부여한다.
        i++;
        if(i===queue.length+1) break;
    }
    table.appendChild(tr_ani);
}

// at, bt, wt, tt, ntt 그리기
function informate(queue) {
    const table = findTag('#result table');
    const tr2 = createTag('tr');
    for(let i=0; i<queue.length; i++) {
        const tr = createTag('tr');
        let td = createTag('td');
        td.textContent = queue[i].getProcessId();
        tr.appendChild(td);
        td = createTag('td');
        td.textContent = queue[i].getArrivalTime();
        tr.appendChild(td);
        td = createTag('td');
        td.textContent = queue[i].getBurstTime();
        tr.appendChild(td);
        td = createTag('td');
        td.textContent = queue[i].getWaitingTime();
        tr.appendChild(td);
        td = createTag('td');
        td.textContent = queue[i].getTurnAroundTime();
        tr.appendChild(td);
        td = createTag('td');
        td.textContent = queue[i].getNormalizedTT();
        tr.appendChild(td);
        if (i === queue.length - 1)
            tr.style.borderBottom = '10px solid grey';

        table.appendChild(tr);
    }
}

// select 태그의 현재 값을 읽어온다.
function selectAlgorithm() {
    const numSelect = document.getElementById('algorithm');
    const text = numSelect.options[findTag('#algorithm').selectedIndex].text;
    return text;
}
// 사용자가 선택한 core 수를 가져온다.
function selectCores() {
    const numSelect = document.getElementById('cores');
    const text = numSelect.options[findTag('#cores').selectedIndex].text;
    return text;
}

// 엔터와 숫자를 제외하고는 입력 제한
function numKeyCheck(e) {
    let keyValue = event.keyCode;
    if(((keyValue >= 48) && (keyValue <= 57)) || keyValue === 13) return true;
    else return false;
}