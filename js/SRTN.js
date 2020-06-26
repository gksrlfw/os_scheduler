// SPN과 구조는 동일하며 time이 지날 때 마다 우선순위를 체크하는 것이 다르다
const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function swap(a, i, j) {
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

function SRTN (createProcess) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.processList = createProcess.getProcessInfo();
    this.setWTAT(this.processList);
}

// SRTN : SPN과 우선순위 선정은 동일함
SRTN.prototype.setPriority = function(processList2) {
    processList2.sort(function(p1, p2) {
        return p1.getBurstTime() - p2.getBurstTime();
    });

    for(let i=0; i<processList2.length; i++) {
        for(let j=0; j<i; j++) {
            if(processList2[i].getBefore_burstTime() === processList2[j].getBefore_burstTime()
            && processList2[i].getArrivalTime() < processList2[j].getArrivalTime())
                swap(processList2, i, j);
        }
    }
};

SRTN.prototype.setWTAT = function(processList) {
    for(let i=0; i<processList.length; i++) {
        processList[i].setWaitingTime(0);
        processList[i].setTurnAroundTime(0);
    }

    while(true) {
        for(let i=0; i<processList.length; i++) {
            if(this.time === processList[i].getArrivalTime())
                this.queue.push(processList[i]);
        }

        this.setPriority(this.queue);       // time이 지날 때 마다 우선순위를 체크한다.
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

SRTN.prototype.addInfo = function (index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));

};
SRTN.prototype.setTime = function (time) {
    this.time = time;
};
SRTN.prototype.getTime = function () {
    return this.time;
};
SRTN.prototype.getProcessList = function () {
    return this.processList;
};
SRTN.prototype.setProcessList = function (processList) {
    this.processList = processList;
};
SRTN.prototype.getPrintQueue = function () {
    return this.printQueue;
};
SRTN.prototype.setPrintQueue = function (printQueue) {
    this.printQueue = printQueue;
};

module.exports = SRTN;