// 사용자로부터 Time Limit 를 받아 프로세스에게 제한시간을 두어 최대한 요구에 맞게 실행할 수 있도록 스케쥴링해준다.


const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function swap(a, i, j) {
    if(i===j) return;
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

function TLS (createProcess) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.processList = createProcess.getProcessInfo();
    this.setWTAT(this.processList);
}

TLS.prototype.checkTimeLimit = function(processList) {
    if(processList.length <= 1) return;         // 프로세스가 1이하일 때는 확인할 필요 없다
    processList.sort(function (p1, p2) {        // 현재 제한시간에 가장 임박한 프로세스 순서대로 정렬한다 (Time Limit - 실행되지 않고 기다린 시간)
        return (p1.getTimeLimit() - p1.gettlWaiting()) - (p2.getTimeLimit() - p2.gettlWaiting());
    });

    // 임박한 프로세스가 여러개있는지 확인하여 여러개라면 도착 시간이 빠른 프로세스를 찾아서 실행시키며 하나라면 0번 인덱스와 바꾸어준다
    let check = false;
    let index = 0;
    for(let i=1; i<processList.length; i++) {
        let temp1 = processList[i].gettlWaiting() - processList[i].getTimeLimit();
        let temp2 = processList[i-1].gettlWaiting() - processList[i-1].getTimeLimit();
        if(temp1!==temp2) {
            check = true;
            index = i;
            break;
        }
    }
    if(!check) index = processList.length;      // 끝까지 for문을 돌았다면 전체 프로세스의 임박한 순서가 같음
    let min = 1000001;                          // arrival time 최댓값 + 1
    for (let i = 0; i < index; i++) {
        if (min > processList[i].getArrivalTime())
            min = i;
    }
    swap(processList, min, 0);
};

TLS.prototype.setWTAT = function(processList) {
    for(let i=0; i<processList.length; i++) {
        processList[i].setWaitingTime(0);
        processList[i].setTurnAroundTime(0);
    }

    while(true) {
        for(let i=0; i<processList.length; i++) {
            if(this.time === processList[i].getArrivalTime())
                this.queue.push(processList[i]);
        }

        this.checkTimeLimit(this.queue);

        if(this.queue.length !== 0) {
            for(let i=0; i<this.queue.length; i++) {
                this.queue[i].upTurnAroundTime();
                this.queue[i].uptlWaiting();
            }

            this.queue[0].settlWaiting(0);                  // 프로세스가 한번 실행이 되면 실행되지 않고 기다린 시간을 0으로 만들어 준다. (이 시간을 프로세스가 실행되지 않을 경우에만 증가한다)
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

TLS.prototype.addInfo = function (index, x, y, z) {
    this.processList[index].setBurstTime(x);
    this.processList[index].setWaitingTime(y);
    this.processList[index].setTurnAroundTime(z);
    this.processList[index].setNormalizedTT((z/x).toFixed(1));

};
TLS.prototype.setTime = function (time) {
    this.time = time;
};
TLS.prototype.getTime = function () {
    return this.time;
};
TLS.prototype.getProcessList = function () {
    return this.processList;
};
TLS.prototype.setProcessList = function (processList) {
    this.processList = processList;
};
TLS.prototype.getPrintQueue = function () {
    return this.printQueue;
};
TLS.prototype.setPrintQueue = function (printQueue) {
    this.printQueue = printQueue;
};

module.exports = TLS;