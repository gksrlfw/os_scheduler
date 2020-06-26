//HRRN과 구조는 완전 동일하고 setPriority부분에서 Response-Ratio기준이 아닌 현 before_BurstTime기준으로 우선순위가 설정된다
const processInfoBean = require('./processInfoBean.js');
const createProcess = require('./createProcess.js');

function swap(a, i, j) {
    if(i===j) return;
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

function TLS (createProcess, cores) {
    this.queue = [];
    this.printQueue = [];
    this.time = 0;
    this.count = 0;
    this.processList = createProcess.getProcessInfo();
    this.coreNum = Number(cores);
    this.setWTAT(this.processList);
}

TLS.prototype.checkTimeLimit = function(processList) {

    // 프로세스가 코어 갯수 이하일 때는 확인할 필요 없다
    if(processList.length <= this.coreNum) return;

    processList.sort(function (p1, p2) {
        return (p1.getTimeLimit() - p1.gettlWaiting()) - (p2.getTimeLimit() - p2.gettlWaiting());
    });

    // 제한시간에 임박한 프로세스가 여러개있는지 확인하여 여러개라면 도착 시간이 빠른 프로세스를 찾아서 실행시키며
    // 코어갯수 이하일 경우 그냥 실행시켜준다
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
    if(!check) index = processList.length;
    if(index<=this.coreNum) return;          // core 갯수 이하면 확인할 필요없음

    let temp = [];      // 코어 갯수만큼의 프로세스를 넣는다 (도착시간이 빠른 순으로)
    let cnt = 0;        // 몇개를 넣었는지 확인
    while(true) {
        if (cnt === this.coreNum) break;
        let min = 1000001;
        for (let i = 0; i < index; i++)
            if (!temp.includes(i))
                if (min > processList[i].getArrivalTime()) min = i;
        temp.push(min);
        cnt++;
    }
    for(let i=0; i<this.coreNum; i++)
        swap(processList, i, temp[i]);
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

            let temp = [];
            let i = 0;
            let cnt = 0;
            let check = false;
            while(this.queue[i] && cnt<this.coreNum){
                temp.push(this.queue[i].getBefore_burstTime());
                this.queue[i].downBurstTime();
                this.queue[i].settlWaiting(0);

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