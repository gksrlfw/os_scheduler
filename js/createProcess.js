const processInfoBean = require('./processInfoBean.js');

// 사용자의 arrival time, burst time 등의 입력을 기초로하여 최초 프로세스 리스트 설정
function createProcess(input, coreNumber, at, bt ,lt) {
    this.processInfo = [];                      // 이 배열 안에 모든 프로세스의 정보를 저장
    this.coreNumber = coreNumber;
    this.setProcessList(input, at, bt, lt);
}

createProcess.prototype.setProcessList = function(num, at, bt, lt) {

    for(let i=0; i<num; i++)
        this.processInfo.push(new processInfoBean());       // 프로세스의 개수만큼 processInfoBean을 넣어준다

    // 사용자에게 입력받은 arrivalTime, burstTime과 함께 최초 프로세스의 정보를 설정한다
    for (let i = 0; i < num; i++) {
        this.processInfo[i].setProcessNumber(i);
        this.processInfo[i].setProcessId("P" + i);
        this.processInfo[i].setPriority(i);
        this.processInfo[i].setArrivalTime(at[i]);
        this.processInfo[i].setBurstTime(bt[i]);
        this.processInfo[i].setBefore_burstTime(bt[i]);
        if(lt.length !== 0) {                               // lt값이 존재하는 경우에만 넣어준다
            this.processInfo[i].setTimeLimit(lt[i]);
            this.processInfo[i].settlWaiting(0);
        }
    }
};

createProcess.prototype.getProcessInfo = function() {
    return this.processInfo;
};

createProcess.prototype.getCoreNumber = function() {
    return this.coreNumber;
};

createProcess.prototype.setProcessInfo = function(processInfo) {
    this.processInfo = processInfo;
};

module.exports = createProcess;

