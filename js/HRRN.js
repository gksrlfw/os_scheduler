const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

// 배열안의 원소위치를 바꾸는 함수
function swap(a, i, j) {
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

function HRRN(createProcess) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.processList = createProcess.getProcessInfo();
    this.setWTAT(this.processList);
}

// HRRN의 우선순위 : response ratio를 기준으로 우선순위를 정한다
HRRN.prototype.setPriority = function(processList) {
    // 현재 queue 안에 있는 프로세스를 response ratio 기준으로 정렬한다
    processList.sort(function(p1, p2) {
        if((p1.getBefore_burstTime()+p1.getTurnAroundTime())/p1.getBefore_burstTime() <
            (p2.getBefore_burstTime()+p2.getTurnAroundTime())/p2.getBefore_burstTime())
            return 1;
        if((p1.getBefore_burstTime()+p1.getTurnAroundTime())/p1.getBefore_burstTime() >
            (p2.getBefore_burstTime()+p2.getTurnAroundTime())/p2.getBefore_burstTime())
            return -1;
        return 0;
    });
    // 두 프로세스의 우선순위가 같다면 먼저온 프로세스를 앞으로 보낸다.
    for(let i=0; i<processList.length; i++) {
        for(let j=0; j<i; j++) {
            if(processList[i].getBefore_burstTime() === processList[j].getBefore_burstTime()
            && processList[i].getArrivalTime() < processList[j].getArrivalTime())
                swap(processList, i, j);
        }
    }
};

HRRN.prototype.setWTAT = function(processList) {
    for(let i=0; i<processList.length; i++) {
        processList[i].setWaitingTime(0);
        processList[i].setTurnAroundTime(0);
    }

    while(true) {
        for(let i=0; i<processList.length; i++) {
            if(this.time === processList[i].getArrivalTime())
                this.queue.push(processList[i]);
        }
        // 우선순위를 결정하는 이 부분을 제외하면 FCFS와 동일함
        // 실행중이였던 프로세스가 끝나는 경우에만 우선순위를 다시 설정해준다
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

HRRN.prototype.addInfo = function (index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));

};
HRRN.prototype.setTime = function (time) {
    this.time = time;
};
HRRN.prototype.getTime = function () {
    return this.time;
};
HRRN.prototype.getProcessList = function () {
    return this.processList;
};
HRRN.prototype.setProcessList = function (processList) {
    this.processList = processList;
};
HRRN.prototype.getPrintQueue = function () {
    return this.printQueue;
};
HRRN.prototype.setPrintQueue = function (printQueue) {
    this.printQueue = printQueue;
};

module.exports = HRRN;