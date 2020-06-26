const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function swap(a, i, j) {
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

function SRTN_multi (createProcess, cores) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.coreNum = cores;
    this.processList = createProcess.getProcessInfo();
    this.setWTAT(this.processList);
}

// 실행중인 프로세스와 실행중이지 않은 프로세스의 구분 없이 우선순위를 선정해준다 (그 외의 구조는 동일)
SRTN_multi.prototype.setPriority = function(processList) {
    if(processList.length === 1) return;

    processList.sort(function(p1, p2) {
        return p1.getBurstTime() - p2.getBurstTime();
    });

    let check = false;
    let index = processList.length;
    for(let i=1; i<processList.length; i++) {
        if(processList[i-1].getBurstTime() !== processList[i].getBurstTime()){
            check=true;
            index = i;
            break;
        }
    }
    if(index <= this.coreNum) return;
    let temp = [];
    let cnt = 0;
    while(true) {
        if (cnt === this.coreNum) break;
        let min = 0;
        for (let i = 1; i < index; i++)
            if (!temp.includes(i))
                if (processList[min].getArrivalTime() > processList[i].getArrivalTime()) min = i;
        temp.push(min);
        cnt++;
    }
     for(let i=0; i<this.coreNum; i++)
        swap(processList, i, temp[i]);

};

SRTN_multi.prototype.setWTAT = function(processList) {
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

            this.setPriority(this.queue);

            for(let i=0; i<this.queue.length; i++)
                this.queue[i].upTurnAroundTime();

            let temp = [];
            let i = 0;
            let cnt = 0;
            let check = false;
            while(this.queue[i] && cnt<this.coreNum){
                temp.push(this.queue[i].getBefore_burstTime());
                this.queue[i].downBurstTime();
                if(!check) {
                    if (i === 0) this.printQueue.push(this.queue[i].getProcessId() + 'a');
                    if (i === 1) this.printQueue.push(this.queue[i].getProcessId() + 'b');
                    if (i === 2) this.printQueue.push(this.queue[i].getProcessId() + 'c');
                    if (i === 3) this.printQueue.push(this.queue[i].getProcessId() + 'd');
                }
                else {
                    if (i === 0) this.printQueue.push(this.queue[i].getProcessId() + 'b');
                    if (i === 1) this.printQueue.push(this.queue[i].getProcessId() + 'c');
                    if (i === 2) this.printQueue.push(this.queue[i].getProcessId() + 'd');
                    check = false;
                }

                if(this.queue[i].getBurstTime() === 0) {
                    this.addInfo(this.queue[i].getProcessNumber(), temp[i], this.queue[i].getTurnAroundTime() - temp[i], this.queue[i].getTurnAroundTime());
                    this.queue.splice(i, 1);
                    temp.splice(i, 1);
                    this.count++;
                    i--;
                    check = true;
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

SRTN_multi.prototype.addInfo = function (index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));

};
SRTN_multi.prototype.setTime = function (time) {
    this.time = time;
};
SRTN_multi.prototype.getTime = function () {
    return this.time;
};
SRTN_multi.prototype.getProcessList = function () {
    return this.processList;
};
SRTN_multi.prototype.setProcessList = function (processList) {
    this.processList = processList;
};
SRTN_multi.prototype.getPrintQueue = function () {
    return this.printQueue;
};
SRTN_multi.prototype.setPrintQueue = function (printQueue) {
    this.printQueue = printQueue;
};

module.exports = SRTN_multi;