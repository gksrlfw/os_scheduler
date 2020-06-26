
const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function RR (createdProcess, quantum) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.processList = createdProcess.getProcessInfo();
    this.quantum = Number(quantum);             // 사용자로부터 입력받은 타임퀀텀
    this.setWTAT(this.processList);
}

RR.prototype.setWTAT = function (processList) {
    let Qcount = 0;             // 현재 실행중인 프로세스가 몇번 실행되었는지 저장
    for(let i=0; i<processList.length; i++) {
        processList[i].setWaitingTime(0);
        processList[i].setTurnAroundTime(0);
    }
    while(true) {
        for (let i = 0; i < processList.length; i++) {
            if (this.time === processList[i].getArrivalTime())
                this.queue.push(processList[i]);
        }
        // 사용자의 입력 quantum과 실행 횟수가 동일하다면 queue의 맨 뒤로 넣어준다.
        if (Qcount === this.quantum) {
            this.queue.push(this.queue[0]);
            this.queue.shift();
            Qcount = 0;
        }
        let temp;
        if (this.queue.length !== 0) {
            for (let i = 0; i < this.queue.length; i++)
                this.queue[i].upTurnAroundTime();

            temp = this.queue[0].getBefore_burstTime();
            this.queue[0].downBurstTime();
            this.printQueue.push(this.queue[0].getProcessId() + 'a');
            Qcount++;           // 프로세스가 실행될때마다 Qcount를 증가시킨다

            if (this.queue[0].getBurstTime() === 0) {
                this.addInfo(this.queue[0].getProcessNumber(), temp, this.queue[0].getTurnAroundTime() - temp, this.queue[0].getTurnAroundTime());
                this.queue.shift();
                this.count++;
                Qcount = 0;
            }
        }
        // queue에 프로세스가 없는 경우 따로 해줘야한다.
        else {
            for (let i = 0; i < processList.length; i++) {
                if (this.time === processList[i].getArrivalTime())
                    this.queue.push(processList[i]);
            }
            if (this.queue.length !== 0) {
                for (let i = 0; i < this.queue.length; i++)
                    this.queue[i].upTurnAroundTime();
                temp = this.queue[0].getBefore_burstTime();
                this.queue[0].downBurstTime();
                this.printQueue.push(this.queue[0].getProcessId() + 'a');
                Qcount++;
            }
            if (this.queue.length === 0) this.printQueue.push('X');
        }
        if (this.count === processList.length) break;
        this.time++;
    }
};
RR.prototype.addInfo = function (index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));

};
RR.prototype.setTime = function (time) {
    this.time = time;
};
RR.prototype.getTime = function () {
    return this.time;
};
RR.prototype.getProcessList = function () {
    return this.processList;
};
RR.prototype.setProcessList = function (processList) {
    this.processList = processList;
};
RR.prototype.getPrintQueue = function () {
    return this.printQueue;
};
RR.prototype.setPrintQueue = function (printQueue) {
    this.printQueue = printQueue;
};

module.exports = RR;