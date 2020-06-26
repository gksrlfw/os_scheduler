//HRRN과 구조는 완전 동일하고 setPriority부분에서 Response-Ratio기준이 아닌 현 before_BurstTime기준으로 우선순위가 설정된다

const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function swap(a, i, j) {
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

function SPN (createProcess) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.processList = createProcess.getProcessInfo();
    this.setWTAT(this.processList);
}

// SPN : 현재의 burst time 기준으로 정렬한다
SPN.prototype.setPriority = function(processList2) {
    // 현재의 burst time 기준으로 정렬한다
    processList2.sort(function(p1, p2) {
        return p1.getBefore_burstTime() - p2.getBefore_burstTime();
    });

    // 우선순위가 같다면 먼저 온 프로세스를 앞으로 보낸다.
    for(let i=0; i<processList2.length; i++) {
        for(let j=0; j<i; j++) {
            if(processList2[i].getBefore_burstTime() === processList2[j].getBefore_burstTime()
            && processList2[i].getArrivalTime() < processList2[j].getArrivalTime())
                swap(processList2, i, j);
        }
    }
};


SPN.prototype.setWTAT = function(processList) {
    for(let i=0; i<processList.length; i++) {
        processList[i].setWaitingTime(0);
        processList[i].setTurnAroundTime(0);
    }

    while(true) {
        for(let i=0; i<processList.length; i++) {
            if(this.time === Number(processList[i].getArrivalTime()))
                this.queue.push(processList[i]);
        }
        if(this.queue.length>0 && this.queue[0].getBefore_burstTime()==this.queue[0].getBurstTime())
            this.setPriority(this.queue);

        if(this.queue.length !== 0) {
            for(let i=0; i<this.queue.length; i++)
                this.queue[i].upTurnAroundTime();

            let temp = this.queue[0].getBefore_burstTime();
            this.queue[0].downBurstTime();
            this.printQueue.push(this.queue[0].getProcessId()+'a');

            if(this.queue[0].getBurstTime() === 0) {
                this.addInfo(this.queue[0].getProcessNumber(), temp, this.queue[0].getTurnAroundTime()-temp, this.queue[0].getTurnAroundTime());
                this.queue.shift();
                this.count++;
            }
        }
        else this.printQueue.push("X");
        if(this.count === processList.length) break;
        this.time++;
    }
};

SPN.prototype.addInfo = function (index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));
};
SPN.prototype.setTime = function (time) {
    this.time = time;
};
SPN.prototype.getTime = function () {
    return this.time;
};
SPN.prototype.getProcessList = function () {
    return this.processList;
};
SPN.prototype.setProcessList = function (processList) {
    this.processList = processList;
};
SPN.prototype.getPrintQueue = function () {
    return this.printQueue;
};
SPN.prototype.setPrintQueue = function (printQueue) {
    this.printQueue = printQueue;
};

module.exports = SPN;