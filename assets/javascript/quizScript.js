const date = document.querySelector(".date");
const today = (new Date()).getFullYear();
date.textContent = today;

const donateBtn = document.querySelector(".donate");
donateBtn.addEventListener('click', () => {
    window.open("https://www.buymeacoffee.com/HamzaElkotp")
    window.open("https://www.paypal.com/paypalme/dtcHamza")
    window.open("https://www.patreon.com/HamzaElkotb")
})


const quizName = document.getElementById("quizName");
const sticksBox = document.getElementById("sticksBox");
const showHideSideBar = document.getElementById("showHideSideBar");
const quizDataContentBox = document.getElementById("showHideSideBar");
const sticksContainer = document.getElementById("sticksContainer");
const questionContainer = document.getElementById("questionContainer");

showHideSideBar?.addEventListener('click', () => {
    sticksBox.classList.toggle('hide');
})


const point = document.getElementById("point");
const time = document.getElementById("time");
const nowQueNum = document.getElementById("nowQueNum");
const maxQueNum = document.getElementById("maxQueNum");

const gettedPoint = document.getElementById("gettedPoint");
const trueAnswed = document.getElementById("trueAnswed");
const allQues = document.getElementById("allQues");
const percent = document.getElementById("percent");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

const dangerAudio = document.getElementById("dangerAudio");
const verydangerAudio = document.getElementById("verydangerAudio");

let handler = null;

let minQueId = 0;
let currQueId = 0;
let maxQueId = null;

let targetedAnsNum = null;
let answeredQuesNum = 0;


const composer = function (...funcs) {
    return async function (value) {
        for (func of funcs) {
            value = await func(value)
        }
        return value
    }
}

async function fetchQuiz(api) {
    let response = await fetch(api);
    let data = await response.json();

    if (!response.ok) { return false }
    return data
}

const setQuizName = function (data) {
    quizName.textContent = data["quizName"];
    return data
}

const increaseAnswered = function () {
    answeredQuesNum++;
}
const showSubmitButton = function () {
    submitBtn.classList.remove('hide');
}

const setTimer = function (data) {
    time.textContent = data["timer"];
    return data;
}


const loopThroughQuestion = function (data) {
    data["questions"].forEach((que) => {
        pushQuestions(que)
    })
    return data
}

const loopThroughResultQuestion = function (data) {
    data["questions"].forEach((que) => {
        pushQuestionsResult(que)
    })
    return data
}



const pushSingleQue = function (queData) {
    let queParent = document.createElement("div");
    queParent.classList.add("questionHolder", "hide");
    queParent.setAttribute("degree", queData["queDegree"]);
    queParent.setAttribute("queId", queData["queId"]);
    queParent.setAttribute("answered", false);
    questionContainer.append(queParent);
    return [queData, queParent]
}
const pushSingleQueToRes = function (queData) { // same as pushSingleQue() but for just result
    let queParent = document.createElement("div");
    queParent.classList.add("questionHolder", "hide");
    queParent.setAttribute("degree", queData["queDegree"]);
    queParent.setAttribute("gettedDegree", queData["queDegree"]);

    if(queData["trueAnswer"] != queData["userAnswer"]){
        queParent.setAttribute("gettedDegree", 0);
    }
    queParent.setAttribute("queId", queData["queId"]);
    questionContainer.append(queParent);
    return [queData, queParent]
}
const increseTrueAnswdNum = function (dataArr) {
    let queData = dataArr[0];
    if(queData["trueAnswer"] == queData["userAnswer"]){
        trueAnswed.textContent = Number(trueAnswed.textContent)+1;
    }
    return dataArr
}
const pushSingleQueData = function (dataArr) {
    let queData = dataArr[0];
    let queParent = dataArr[1];

    let title = document.createElement("p");
    title.textContent = queData["queTitle"];
    title.classList.add("is-size-4", "has-text-weight-semibold");
    queParent.append(title);

    if (queData["queImage"] != "") {
        let img = document.createElement("img");
        img.src = queData["queImage"]
        queParent.append(img);
    }

    let subtitle = document.createElement("p");
    subtitle.textContent = queData["queDetails"];
    subtitle.classList.add("subtitle", "is-size-5", "paragraph");
    queParent.append(subtitle);

    return dataArr
}
const pushOptions = function (dataArr) {
    let queData = dataArr[0];
    let queParent = dataArr[1];

    let optionsBox = document.createElement("div");
    optionsBox.classList.add("field", "control", "is-flex", "is-flex-direction-column");
    queParent.append(optionsBox);

    let optionBoxNum = queData["queId"];

    queData["queChoices"].forEach((option, indx) => {
        let label = document.createElement('label');
        label.classList.add("ans");

        let radio = document.createElement('input');
        radio.type = "radio";
        radio.name = `que${optionBoxNum}`;
        radio.setAttribute('inx', indx);

        label.append(radio);

        radio.addEventListener('change', () => {
            if (queParent.getAttribute('answered') == "false") {
                queParent.setAttribute('answered', true);
                increaseAnswered();
                if (answeredQuesNum == targetedAnsNum) {
                    showSubmitButton();
                }
            }
        })

        label.append(document.createTextNode(option["optionValue"]));
        optionsBox.append(label);
    });

    return dataArr
}

const pushOptionsDisabledWithCheck = function (dataArr) { // same as pushOptions() but for just result
    let queData = dataArr[0];
    let queParent = dataArr[1];

    let optionsBox = document.createElement("div");
    optionsBox.classList.add("field", "control", "is-flex", "is-flex-direction-column");
    queParent.append(optionsBox);

    let optionBoxNum = queData["queId"];

    queData["queChoices"].forEach((option, indx) => {
        let label = document.createElement('label');
        label.classList.add("ans");

        let radio = document.createElement('input');
        radio.type = "radio";
        radio.name = `que${optionBoxNum}`;
        radio.setAttribute('inx', indx);
        radio.disabled = true;

        if(indx == queData["userAnswer"] && indx == queData["trueAnswer"]){ // if this is the user answer and it is true
            label.classList.add("true", "checked");
        }else if(indx == queData["userAnswer"]){ // if this is the user answer and not true
            label.classList.add("false", "checked");
        }else if(indx == queData["trueAnswer"]){ // if this is the ture answer and not the user
            label.classList.add("true");
        }
        // if this is not true answer and not choosed nothing will happen


        label.append(radio);
        label.append(document.createTextNode(option["optionValue"]));
        optionsBox.append(label);
    });

    return dataArr
}

const increaseQueNum = function (dataArr) {
    maxQueNum.textContent = Number(maxQueNum.textContent) + 1;
    targetedAnsNum++
    return dataArr
}
const increaseQueNumToRes = function (dataArr) { // same as increaseQueNum() but for just result
    maxQueNum.textContent = Number(maxQueNum.textContent) + 1;
    allQues.textContent = Number(allQues.textContent) + 1;

    return dataArr
}
const createQueStick = function (dataArr) {
    let queData = dataArr[0];

    let stick = document.createElement("div");
    stick.classList.add("quistion");
    stick.role = "button";
    stick.setAttribute("sticknumber", queData["queId"]);
    stick.textContent = `Q${queData["queId"] + 1}`

    sticksContainer.append(stick);

    return [...dataArr, stick]
}

const updatePoint = function(newQue){
    return newQue.getAttribute("degree");
}
const updateGettedPoint = function(newQue){
    return newQue.getAttribute("getteddegree");
}

const activateQueStick = function (dataArr) {
    let stick = dataArr[2];

    stick.addEventListener('click', () => {
        // active the current and unactive the active
        let activeStick = sticksContainer.querySelector(`[sticknumber='${currQueId}']`);
        activeStick.classList.remove("active");
        stick.classList.add("active");

        // hide the old activated question
        let oldQue = questionContainer.querySelector(`[queId="${currQueId}"]`);
        oldQue.classList.add("hide");

        // activate the new question and 
        let newQueID = stick.getAttribute("sticknumber");
        currQueId = Number(newQueID);

        let newQue = questionContainer.querySelector(`[queId="${currQueId}"]`);
        newQue.classList.remove("hide");

        // update question degree
        point.textContent = updatePoint(newQue);
        if(gettedPoint){ // works only in results
            gettedPoint.textContent = updateGettedPoint(newQue);
        }


        // Update current question counter
        nowQueNum.textContent = currQueId + 1;

        if (currQueId == minQueId) {
            previousBtn.disabled = true;
        } else {
            previousBtn.disabled = false;
        }

        if (currQueId == maxQueId) {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
        }
    });

    return [dataArr[0], dataArr[1]]
}


// set events
const active1stQue = function (data) { // works in both
    let firstStick = document.querySelector(".quistion");
    let firstQue = document.querySelector(".questionHolder");
    firstStick.classList.add("active");
    firstQue.classList.remove("hide");
    point.textContent = firstQue.getAttribute("degree");
    if(gettedPoint){
        gettedPoint.textContent = updateGettedPoint(firstQue);
    }
    return data
}
const calcPercent = function (data){
    percent.textContent = `${Math.round((Number(trueAnswed.textContent)*100)/Number(allQues.textContent))}%`;
    return data
}



const settCounterWanr = function (data) {
    time.classList.toggle("warn")
    return data
}

const setCounterDager = function (data) {
    time.classList.remove("warn");
    time.classList.toggle("danger");
    dangerAudio.play()
    return data
}

const setCounterMoreDager = function (data) {
    time.classList.add("danger");
    time.classList.toggle("moredanger");
    verydangerAudio.play()
    return data
}

const finishTimer = function () {
    let audioHandle = setInterval(audioRun, 350);
    let times = 8;
    function audioRun() {
        setTimeout(() => {
            verydangerAudio.play();
            time.classList.toggle("moredanger");
        }, 0);
        times--
        if (times == 0) {
            clearInterval(audioHandle)
        }
    }

}

const startTimer = function (data) {
    let timer = data["timer"].split(":");

    let minuts = timer[0];
    let seconds = timer[1];
    handler = setInterval(descrease, 900);
    function descrease() {
        if ((minuts == "00" && seconds <= "59" && seconds >= "31") || (minuts == "01" && seconds <= "00")) {
            settCounterWanr();
        }
        else if (minuts == "00" && seconds <= "31" && seconds > "11") {
            setCounterDager();
        } else if (minuts == "00" && seconds <= "11") {
            setCounterMoreDager();
        }
        if (minuts == "00" && seconds == "0") {
            clearInterval(handler);
            finishTimer();
            answerJsonComposer(data);
        } else {
            if (seconds == "00") {
                seconds = "59";
                minuts -= 1;
                time.textContent = `${minuts.toString().padStart(2, 0)}:${seconds}`;
            }
            else {
                seconds -= 1;
                time.textContent = `${minuts.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}`;
            }
        }
    }

    return data
}

const stopTimer = function (data){
    clearInterval(handler);
    return data
}

const activateMoveButtons = function (data) {
    maxQueId = data["questions"].length - 1;

    previousBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currQueId > minQueId) {
            // hide the old activated question
            let prevEleId = document.querySelector(`[queId="${currQueId}"]`);
            prevEleId.classList.add("hide");

            // unactivate the old activated question stick
            let activeStick = sticksContainer.querySelector(`[sticknumber='${currQueId}']`);
            activeStick.classList.remove("active");

            // show the previous question
            let currEleId = document.querySelector(`[queId="${--currQueId}"]`);
            currEleId.classList.remove("hide");

            // activate the previous question stick
            let currStick = document.querySelector(`[sticknumber="${currQueId}"]`);
            currStick.classList.add("active");

            point.textContent = updatePoint(currEleId);
            if(gettedPoint){ // works only in results
                gettedPoint.textContent = updateGettedPoint(currEleId);
            }

            if (currQueId == minQueId) {
                previousBtn.disabled = true;
            }
        }
        nextBtn.disabled = false;

        // Update current question counter
        nowQueNum.textContent = currQueId + 1;
    });
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currQueId < maxQueId) {
            // hide the old activated question
            let prevEleId = document.querySelector(`[queId="${currQueId}"]`);
            prevEleId.classList.add("hide");

            // unactivate the old activated question stick
            let activeStick = sticksContainer.querySelector(`[sticknumber='${currQueId}']`);
            activeStick.classList.remove("active");

            // show the next question
            let currEleId = document.querySelector(`[queId="${++currQueId}"]`);
            currEleId.classList.remove("hide");

            // activate the next question stick
            let currStick = document.querySelector(`[sticknumber="${currQueId}"]`);
            currStick.classList.add("active");

            point.textContent = updatePoint(currEleId);
            if(gettedPoint){ // works only in results
                gettedPoint.textContent = updateGettedPoint(currEleId);
            }

            if (currQueId == maxQueId) {
                nextBtn.disabled = true;
            }
        }
        previousBtn.disabled = false;

        // Update current question counter
        nowQueNum.textContent = currQueId + 1;
    });

    return data
}


const generateAnswerJson = function (data) {
    let oldJSon = data;
    let questions = data["questions"];
    questions.forEach((que) => {
        let id = que["queId"];
        let queParent = document.querySelector(`[queid='${id}']`);
        let ans = null;
        if (queParent.querySelector("input:checked")) {
            ans = queParent.querySelector("input:checked");
            ans = Number(ans.getAttribute("inx"));
        }
        que["userAnswer"] = ans;
    })
    return data
}
const disableQueBox = function (data) {
    questionContainer.classList.add("disable")
    return data
}
const startResultPageConnection = function (data) {
    let resultWindow = window.open('/results.html', '_blank');

    resultWindow.addEventListener('load', () => {
        resultWindow.postMessage(data, window.location.origin);
    })
}

const initSubmit = function (data) {
    submitBtn.addEventListener('click', () => {
        answerJsonComposer(data)
    })
    return data
}



const generateConnectionWithQuiz= function(){
    let receivedData = null
    window.addEventListener('message', function (event) {
        if (event.origin === window.location.origin) {
            receivedData = event.data;
            resultCcontrol(receivedData)
        }
    });
}



const pushQuestions = composer(pushSingleQue, pushSingleQueData, pushOptions, increaseQueNum, createQueStick, activateQueStick, active1stQue);
const initQuiz = composer(fetchQuiz, setQuizName, setTimer, loopThroughQuestion, startTimer, activateMoveButtons, initSubmit);
const answerJsonComposer = composer(stopTimer, disableQueBox, generateAnswerJson, startResultPageConnection);

const pushQuestionsResult = composer(pushSingleQueToRes, increseTrueAnswdNum, pushSingleQueData, pushOptionsDisabledWithCheck, increaseQueNumToRes, createQueStick, calcPercent, activateQueStick, active1stQue);
const resultCcontrol = composer(setQuizName, loopThroughResultQuestion, activateMoveButtons);