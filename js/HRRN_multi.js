const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function swap(a, i, j) {
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

function HRRN_multi(createProcess, cores) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.coreNum = cores;
    this.processList = createProcess.getProcessInfo();
    this.setWTAT(this.processList);
}

HRRN_multi.prototype.setPriority = function(processList2, index_) {
    if(processList2.length === 1) return;

    // 프로세스가 실행중인 곳과 실행중이지 않은 곳으로 나눈다
    let processList = processList2.slice(index_);       // 실행 중이지 않은 곳
    let processList3 = processList2.slice(0, index_);   // 실행 중인 곳
    // 먼저 실행중이지 않은 곳에 대해서 우선순위를 선정하며 우선순위 선정이 완료될 경우 실행중인 프로세스와 합쳐서 queue에 넣어준다.
    processList.sort(function(p1, p2) {
        if((p1.getBefore_burstTime()+p1.getTurnAroundTime())/p1.getBefore_burstTime() <
            (p2.getBefore_burstTime()+p2.getTurnAroundTime())/p2.getBefore_burstTime())
            return 1;
        if((p1.getBefore_burstTime()+p1.getTurnAroundTime())/p1.getBefore_burstTime() >
            (p2.getBefore_burstTime()+p2.getTurnAroundTime())/p2.getBefore_burstTime())
            return -1;
        return 0;
    });

    let check = false;
    let index = processList.length;
    for(let i=1; i<processList.length; i++) {
        if(processList[i-1].getBefore_burstTime() !== processList[i].getBefore_burstTime() || processList[i-1].getArrivalTime() !== processList[i].getArrivalTime()){
            check=true;
            index = i;
            break;
        }
    }

    // 코어갯수 이하면 우선순위의 중복을 확인할 필요없음
    if(index+processList3.length <= this.coreNum) {
        this.queue = [];
        for(let i=0; i<processList3.length; i++)
            this.queue.push(processList3[i]);

        for(let i=0; i<processList.length; i++)
            this.queue.push(processList[i]);
        return;
    }
    let temp = [];      // 코어 갯수만큼의 프로세스를 넣는다 (도착시간 빠른 순으로)
    let cnt = 0;        // 몇개를 넣었는지 확인
    while(true) {
        if (cnt === this.coreNum) break;
        let min = 0;
        for (let i = 1; i < index; i++)
            if (!temp.includes(i))
                if (processList[min].getArrivalTime() > processList[i].getArrivalTime()) min = i;
        temp.push(min);
        cnt++;
    }

    // 우선순위 선정이 완료되면 processList3에 합쳐준 후 queue에 넣어준다.
    for(let i=0; i<this.coreNum; i++)
        swap(processList, i, temp[i]);
    for(let i=0; i<processList.length; i++)
        processList3.push(processList[i]);

    this.queue = [];
    for(let i=0; i<processList3.length; i++)
        this.queue.push(processList3[i]);
};

HRRN_multi.prototype.setWTAT = function(processList) {
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

HRRN_multi.prototype.addInfo = function (index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));

};
HRRN_multi.prototype.setTime = function (time) {
    this.time = time;
};
HRRN_multi.prototype.getTime = function () {
    return this.time;
};
HRRN_multi.prototype.getProcessList = function () {
    return this.processList;
};
HRRN_multi.prototype.setProcessList = function (processList) {
    this.processList = processList;
};
HRRN_multi.prototype.getPrintQueue = function () {
    return this.printQueue;
};
HRRN_multi.prototype.setPrintQueue = function (printQueue) {
    this.printQueue = printQueue;
};

module.exports = HRRN_multi;