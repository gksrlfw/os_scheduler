const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function RR_multi (createdProcess, quantum, cores) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.processList = createdProcess.getProcessInfo();
    this.quantum = Number(quantum);
    this.coreNum = cores;
    this.setWTAT(this.processList);
}

RR_multi.prototype.setWTAT = function (processList) {
    let Qcount = [];                // 타임퀀텀을 확인하는 count도 코어 개수만큼 만들어 준다
    for(let i=0; i<processList.length; i++) {
        processList[i].setWaitingTime(0);
        processList[i].setTurnAroundTime(0);
        Qcount.push(0);             // 초기값은 0으로 설정
    }
    while(true) {
        for (let i = 0; i < processList.length; i++) {
            if (this.time === processList[i].getArrivalTime())
                this.queue.push(processList[i]);
        }

        for (let i = 0; i < processList.length; i++) {
            if (Qcount[i] === this.quantum) {
                this.queue.push(this.queue[i]);
                this.queue.splice(i, 1);
                Qcount[i] = 0;
            }
        }

        let temp = [];
        let i = 0;
        let cnt = 0;
        let check = false;
        if (this.queue.length !== 0) {
            for (let j = 0; j < this.queue.length; j++)
                this.queue[j].upTurnAroundTime();
            while(this.queue[i] && cnt < this.coreNum) {
                temp.push(this.queue[i].getBefore_burstTime());
                this.queue[i].downBurstTime();
                if (!check) {
                    if (i === 0) this.printQueue.push(this.queue[i].getProcessId() + 'a');
                    if (i === 1) this.printQueue.push(this.queue[i].getProcessId() + 'b');
                    if (i === 2) this.printQueue.push(this.queue[i].getProcessId() + 'c');
                    if (i === 3) this.printQueue.push(this.queue[i].getProcessId() + 'd');
                } else {
                    if (i === 0) this.printQueue.push(this.queue[i].getProcessId() + 'b');
                    if (i === 1) this.printQueue.push(this.queue[i].getProcessId() + 'c');
                    if (i === 2) this.printQueue.push(this.queue[i].getProcessId() + 'd');
                    check = false;
                }
                Qcount[i]++;

                if (this.queue[i].getBurstTime() === 0) {
                    this.addInfo(this.queue[i].getProcessNumber(), temp[i], this.queue[i].getTurnAroundTime() - temp[i], this.queue[i].getTurnAroundTime());
                    this.queue.splice(i, 1);
                    temp.splice(i, 1);
                    Qcount[i] = 0;          // 다시 0으로 만들어준다
                    this.count++;
                    i--;
                    check = true;
                }
                i++;
                cnt++;
            }
        }
        else {
            for (let i = 0; i < processList.length; i++) {
                if (this.time === processList[i].getArrivalTime())
                    this.queue.push(processList[i]);
            }
            if (this.queue.length !== 0) {
                for (let i = 0; i < this.queue.length; i++) {
                    this.queue[i].upTurnAroundTime();
                    this.queue[i].downBurstTime();
                    if (i === 0) this.printQueue.push(this.queue[i].getProcessId() + 'a');
                    if (i === 1) this.printQueue.push(this.queue[i].getProcessId() + 'b');
                    if (i === 2) this.printQueue.push(this.queue[i].getProcessId() + 'c');
                    if (i === 3) this.printQueue.push(this.queue[i].getProcessId() + 'd');
                    Qcount[i]++;
                }
            }
            if(this.queue.length === 0) this.printQueue.push('X');
        }
        if (this.count === processList.length) break;
        this.time++;
    }
};
RR_multi.prototype.addInfo = function (index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));

};
RR_multi.prototype.setTime = function (time) {
    this.time = time;
};
RR_multi.prototype.getTime = function () {
    return this.time;
};
RR_multi.prototype.getProcessList = function () {
    return this.processList;
};
RR_multi.prototype.setProcessList = function (processList) {
    this.processList = processList;
};
RR_multi.prototype.getPrintQueue = function () {
    return this.printQueue;
};
RR_multi.prototype.setPrintQueue = function (printQueue) {
    this.printQueue = printQueue;
};

module.exports = RR_multi;