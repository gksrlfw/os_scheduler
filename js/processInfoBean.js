
// 프로세스의 정보를 담는 객체
function processInfoBean (processNumber=0, processId=null, arrivalTime=0, burstTime=0, before_burstTime=0, priority=0, waitingTime=0, turnAroundTime=0,
                          timeLimit=0, normalizedTT=0) {
    this.processNumber = processNumber;
    this.processId = processId;
    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime;
    this.before_burstTime = before_burstTime;   // burstTime을 계속해서 줄이므로 원래 값을 저장할 필요가 있다.
    this.priority = priority;
    this.waitingTime = waitingTime;
    this.turnAroundTime = turnAroundTime;
    if(timeLimit!==0) {
        this.timeLimit = timeLimit;     // 사용자가 입력한 제한시간
        this.tlWaiting = [];            // 프로세스가 실행되기 전 까지 기다린 시간 (한번이라도 실행되면 0으로 리셋된 후 다시 카운트한다)
    }
    this.normalizedTT = normalizedTT;
};

// up 함수 : 해당 변수값을 1 증가
// down 함수 : 해당 변수값을 1 감소
// get 함수 : 해당 변수값을 리턴
// set 함수 : 해당 변수값을 설정
processInfoBean.prototype.getProcessNumber = function() {
    return this.processNumber;
};

processInfoBean.prototype.setProcessNumber = function(processNumber) {
    this.processNumber = processNumber;
};

processInfoBean.prototype.getProcessId = function() {
    return this.processId;
};

processInfoBean.prototype.setProcessId = function(processId) {
    this.processId = processId;
};

processInfoBean.prototype.getArrivalTime = function() {
    return this.arrivalTime;
};

processInfoBean.prototype.setArrivalTime = function(arrivalTime) {
    this.arrivalTime = arrivalTime;
};

processInfoBean.prototype.getBurstTime = function() {
    return this.burstTime;
};

processInfoBean.prototype.setBurstTime = function(burstTime) {
    this.burstTime = burstTime;
};

processInfoBean.prototype.getBefore_burstTime = function() {
    return this.before_burstTime;
};

processInfoBean.prototype.setBefore_burstTime = function(burst_time) {
    this.before_burstTime = burst_time;
};

processInfoBean.prototype.getPriority = function() {
    return this.priority;
};

processInfoBean.prototype.setPriority = function(priority) {
    this.priority = priority;
};

processInfoBean.prototype.getWaitingTime = function() {
    return this.waitingTime;
};

processInfoBean.prototype.setWaitingTime = function(waitingTime) {
    this.waitingTime = waitingTime;
};

processInfoBean.prototype.getTurnAroundTime = function() {
    return this.turnAroundTime;
};

processInfoBean.prototype.setTurnAroundTime = function(turnAroundTime) {
    this.turnAroundTime = turnAroundTime;
};

processInfoBean.prototype.getTimeLimit = function() {
    return this.timeLimit;
};

processInfoBean.prototype.setTimeLimit = function(timeLimit) {
    this.timeLimit = timeLimit;
};

// For TL Waiting
processInfoBean.prototype.gettlWaiting = function() {
    return this.tlWaiting;
};

processInfoBean.prototype.settlWaiting = function(tlWaiting) {
    this.tlWaiting = tlWaiting;
};

processInfoBean.prototype.uptlWaiting = function() {
    let temp = this.tlWaiting;
    temp++;
    this.tlWaiting = temp;
};

processInfoBean.prototype.getNormalizedTT = function() {
    return this.normalizedTT;
};

processInfoBean.prototype.setNormalizedTT = function(NormalizedTT) {
    this.normalizedTT = NormalizedTT;
};

processInfoBean.prototype.setBefore_burstTime = function(before_burstTime2) {
    this.before_burstTime = before_burstTime2;
};

processInfoBean.prototype.downBurstTime = function() {
    let temp = this.burstTime;
    temp--;
    this.burstTime = temp;
};

processInfoBean.prototype.upBurstTime = function() {
    let temp = this.burstTime;
    temp++;
    this.burstTime = temp;
};

processInfoBean.prototype.downWaitingTime = function() {
    let temp = this.waitingTime;
    temp--;
    this.waitingTime = temp;
};

processInfoBean.prototype.upWaitingTime = function() {
    let temp = this.waitingTime;
    temp++;
    this.waitingTime = temp;
};

processInfoBean.prototype.downTurnAroundTime = function() {
    let temp = this.turnAroundTime;
    temp--;
    this.turnAroundTime = temp;
};

processInfoBean.prototype.upTurnAroundTime = function() {
    let temp = this.turnAroundTime;
    temp++;
    this.turnAroundTime = temp;
};

module.exports = processInfoBean;