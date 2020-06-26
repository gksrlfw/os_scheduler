// FCFS의 멀티코어 버전

const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function FCFS_multi(createdProcess, cores) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.processList = createdProcess.getProcessInfo();
    this.coreNum = cores;                               // 코어 갯수를 저장
    this.setWTAT(this.processList);
}


// 멀티코어 구현 방법
// 기존 FCFS의 경우 queue의 첫번째 원소에 대해서, 즉 프로세스 하나에 대해서만 burstTime을 줄여가며 진행하였지만 멀티코어의 경우 코어의 개수만큼 queue에서 burstTime을 줄여가면서 진행한다.
// 만약 core가 두개라면 queue의 첫번째, 두번째 원소에 대해서 앞의 단일코어와 똑같은 과정을 반복한다.
FCFS_multi.prototype.setWTAT = function(processList) {
    for(let i=0; i<processList.length; i++) {
        processList[i].setWaitingTime(0);
        processList[i].setTurnAroundTime(0);
    }

    while(true) {
        for(let i=0; i<processList.length; i++) {
            if(this.time === processList[i].getArrivalTime())
                this.queue.push(processList[i]);
        }
         if(this.queue.length !== 0) {
            for(let i=0; i<this.queue.length; i++)
                this.queue[i].upTurnAroundTime();

            let temp = [];          // 코어개수만큼 줄어들기 전 버스트타임을 저장한다.
            let i=0;                // queue, temp의 인덱스
            let cnt = 0;            // 코어를 몇개 사용했는지 체크
            let check = false;      // 이전 루프에서 원소가 빠진게 있는지 체크한다 (하지 않을 경우 마지막 프로세스에 대해 멀티코어처럼 작동하지 않음)

            // queue에 프로세스가 없거나 코어 개수보다 더 사용하기 전에 while문을 빠져나온다
            while(this.queue[i] && cnt<this.coreNum){
                temp.push(this.queue[i].getBefore_burstTime());
                this.queue[i].downBurstTime();

                // busrtTime을 줄인 프로세스를 printQueue에 넣는다. 어떤 프로세서에서 실행되었는지 확인하기 위해 각각의 프로세스 이름 뒤에 구분할 수 있는 알파벳을 붙여준다.
                // 이전 루프에서 실행중이였던 프로세스를 종료하여 큐에서 삭제했는지 확인한다.
                if(!check) {
                    if (i === 0) this.printQueue.push(this.queue[i].getProcessId() + 'a');      // 첫번째 프로세서
                    if (i === 1) this.printQueue.push(this.queue[i].getProcessId() + 'b');      // 두번째 프로세서
                    if (i === 2) this.printQueue.push(this.queue[i].getProcessId() + 'c');      // 세번째 프로세서
                    if (i === 3) this.printQueue.push(this.queue[i].getProcessId() + 'd');      // 네번째 프로세서
                }
                else {
                    if (i === 0) this.printQueue.push(this.queue[i].getProcessId() + 'b');
                    if (i === 1) this.printQueue.push(this.queue[i].getProcessId() + 'c');
                    if (i === 2) this.printQueue.push(this.queue[i].getProcessId() + 'd');
                    check = false;      // 다시 false로 만들어준다
                }
                if(this.queue[i].getBurstTime() === 0) {
                    this.addInfo(this.queue[i].getProcessNumber(), temp[i], this.queue[i].getTurnAroundTime() - temp[i], this.queue[i].getTurnAroundTime());
                    // i번째 프로세스를 큐와 temp에서 제거한다
                    this.queue.splice(i, 1);
                    temp.splice(i, 1);
                    this.count++;
                    i--;
                    check = true;       // 루프에서 프로세스가 제거되었으므로 true로 만들어 준다
                }
                i++;
                cnt++;
            }
        }
        else this.printQueue.push("X");
        if(this.count === processList.length) break;
        this.time++;
    }
};

FCFS_multi.prototype.addInfo = function(index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));
};

FCFS_multi.prototype.setTime = function(time) {
    this.time = time;
};

FCFS_multi.prototype.getTime = function() {
    return this.time;
};

FCFS_multi.prototype.getProcessList = function() {
    return this.processList;
};

FCFS_multi.prototype.setProcessList = function(processList) {
    this.processList = processList;
};

FCFS_multi.prototype.getPrintQueue = function() {
    return this.printQueue;
};

FCFS_multi.prototype.setPrintQueue = function(printQueue) {
    this.printQueue = printQueue;
};

module.exports = FCFS_multi;
