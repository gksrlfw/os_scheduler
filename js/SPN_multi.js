const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');
function swap(a, i, j) {
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

function SPN_multi (createProcess, cores) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.processList = createProcess.getProcessInfo();
    this.coreNum = Number(cores);
    this.setWTAT(this.processList);
}

// HRRN_multi와 구조가 동일하다
SPN_multi.prototype.setPriority = function(processList2, index_) {
    if(processList2.length === 1) return;
    let processList = processList2.slice(index_);
    let processList3 = processList2.slice(0, index_);

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

    if(index+processList3.length <= this.coreNum) {
        this.queue = [];
        for(let i=0; i<processList3.length; i++)
            this.queue.push(processList3[i]);

        for(let i=0; i<processList.length; i++)
            this.queue.push(processList[i]);
        return;
    }

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
    for(let i=0; i<processList.length; i++)
        processList3.push(processList[i]);

    this.queue = [];
    for(let i=0; i<processList3.length; i++)
        this.queue.push(processList3[i]);

};

SPN_multi.prototype.setWTAT = function(processList) {
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
            // 코어갯수 혹은 현재 프로세스 갯수만큼 큐를 탐색하며 새로 들어온 프로세스가 있는지 확인하며 있으면 우선순위를 선정한다
            for(let i=0; i<Math.min(this.queue.length, this.coreNum); i++) {
                if(this.queue[i].getBefore_burstTime() === this.queue[i].getBurstTime()) {
                    this.setPriority(this.queue, i);
                    break;
                }
            }
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

SPN_multi.prototype.addInfo = function (index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));

};
SPN_multi.prototype.setTime = function (time) {
    this.time = time;
};
SPN_multi.prototype.getTime = function () {
    return this.time;
};
SPN_multi.prototype.getProcessList = function () {
    return this.processList;
};
SPN_multi.prototype.setProcessList = function (processList) {
    this.processList = processList;
};
SPN_multi.prototype.getPrintQueue = function () {
    return this.printQueue;
};
SPN_multi.prototype.setPrintQueue = function (printQueue) {
    this.printQueue = printQueue;
};

module.exports = SPN_multi;