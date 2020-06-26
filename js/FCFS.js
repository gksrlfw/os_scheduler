// 나머지 알고리즘에 대해서 동일한 기능을 하는 변수, 함수의 경우 주석처리를 하지 않았습니다.

const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function FCFS(createdProcess) {
    this.queue = [];                                        // 실행해야 할 프로세스들을 저장
    this.printQueue = [];                                   // time이 지날 때 마다 queue에서 실행되는 프로세스를 넣는다
    this.time = 0;                                          // 시간 변수
    this.count = 0;                                         // process가 종료될때마다 증가시키는 변수
    this.processList = createdProcess.getProcessInfo();     // createProcess 클래스에서 생성된 process들을 담고있는 배열
    this.setWTAT(this.processList);                         // waiting time과 turnAround time을 결정하는 함수
}


// setWTAT의 기본적인 기능
// 1. time과 ArrivalTime이 맞으면 프로세스를 queue에 넣는다.
// 2. queue에 원소가 존재하는 경우 time이 지날때마다 turnAround를 증가시킨다.
// 3. time이 지날때 마다 첫 원소의 burstTime을 0이 될때 까지 감소시키며 printQueue에 넣어준다.
// 4. 0이 되면 해당 프로세스의 정보를 새롭게 기록해준 뒤 queue에서 뺀다.
// 5. 이를 프로세스 전체를 완료했을 때 while문을 종료한다.
FCFS.prototype.setWTAT = function(processList) {
    // waitingTime, turnAroundTime을 0으로 초기화
    for(let i=0; i<processList.length; i++) {
        processList[i].setWaitingTime(0);
        processList[i].setTurnAroundTime(0);
    }
    while(true) {
        for(let i=0; i<processList.length; i++) {                   //time과 ArriveTime이 일치하면 프로세스를 queue에 넣는다.
            if(this.time === processList[i].getArrivalTime())
                this.queue.push(processList[i]);
        }
         if(this.queue.length !== 0) {
            for(let i=0; i<this.queue.length; i++)                  // queue에 들어있는 시간동안 시간이 지날때마다 모든 프로세스의 turnAround를 증가한다.
                this.queue[i].upTurnAroundTime();

            let temp = this.queue[0].getBefore_burstTime();             // burstTime이 줄기 전 값을 저장한다
            this.queue[0].downBurstTime();                              // queue의 맨 앞에있는 프로세스의 burstTime이 하나 줄음
            this.printQueue.push(this.queue[0].getProcessId()+'a');     // busrtTime이 줄은 프로세스를 결과창에 출력할 queue에 담는다 (1번 프로세서에서 진행하였으므로 a를 더해준다 - 각각의 프로세스에 대해 1번은 a, 2번은 b, 3번은 c, 4번은 d 이런식으로 저장)

            // 맨 앞에 있는 프로세스의 busrtTime이 0이 되면 프로세스의 정보를 기록한 뒤 queue에서 제거
            if(this.queue[0].getBurstTime() === 0) {
                this.addInfo(this.queue[0].getProcessNumber(), temp, this.queue[0].getTurnAroundTime() - temp, this.queue[0].getTurnAroundTime());
                this.queue.shift();         // queue의 맨 앞 원소 제거
                this.count++;
            }
        }
        else this.printQueue.push("X");                     // 해당 시간에 프로세스가 없으면 X를 넣어준다.
        if(this.count === processList.length) break;        // 모든 프로세스가 종료되면 while 종료
        this.time++;
    }
};

// 특정 인덱스에 WT와 TA를 넣어준다.
// burst Time, waitingTime, turnaround time, ntt 를 설정한다 (ntt의 경우 소수점 둘째자리에서 반올림한다)
FCFS.prototype.addInfo = function(index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));
};

FCFS.prototype.setTime = function(time) {
    this.time = time;
};

FCFS.prototype.getTime = function() {
    return this.time;
};

FCFS.prototype.getProcessList = function() {
    return this.processList;
};

FCFS.prototype.setProcessList = function(processList) {
    this.processList = processList;
};

FCFS.prototype.getPrintQueue = function() {
    return this.printQueue;
};

FCFS.prototype.setPrintQueue = function(printQueue) {
    this.printQueue = printQueue;
};


module.exports = FCFS;
