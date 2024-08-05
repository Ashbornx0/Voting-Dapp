const connectWalletMsg = document.querySelector('#connectWalletMessage');
const connectWalletBtn = document.querySelector('#connectWallet');
const votingStation = document.querySelector('#votingStation');
const timerTime = document.querySelector('#time');
const timerMsg = document.querySelector('#timerMessage');
const mainBoard = document.querySelector('#mainBoard');
const voteForm = document.querySelector('#voteForm');
const vote = document.querySelector('#vote');
const voteBtn = document.querySelector('#sendVote');
const showResultContainer = document.querySelector('#showResultContainer');
const showResult = document.querySelector('#showResult');
const result = document.querySelector('#result');
const admin = document.querySelector('#admin');
const candidates = document.querySelector('#candidates');
const electionDuration = document.querySelector('#electionDuration');
const startAnElection = document.querySelector('#startAnElection');
const candidate = document.querySelector('#candidate');
const addTheCandidate = document.querySelector('#addTheCandidate');

//Configuring Ethers
const contractAddress = '"the address in which you deployed547346"';
const contractABI = copy the contract abi from voting.json

let contract;
let signer;

const provider = new ethers.providers.Web3Provider(window.ethereum, 80002);
/**the chain id of amoy - 80002 */
provider.send("eth_requestAccounts", []).then(() => {
    provider.listAccounts().then((accounts) => {
        signer = provider.getSigner(accounts[0])
        contract = new ethers.Contract(contractAddress, contractABI, signer)
    });
});


//functions
const getAllCandidates = async function() {
    if(document.getElementById("candidateBoard")) {
        document.getElementById("candidateBoard").remove();
    }

    let board = document.createElement("table");
    board.id = "candidateBoard";
    mainBoard.appendChild(board);

    let tableHeader = document.createElement("tr");
    tableHeader.innerHTML = <th>ID No.</th>
                         <th>Candidate</th>
    board.appendChild(tableHeader);

    let candidates = await contract.retrieveVotes();
    for(let i = 0; i < candidates.length; i++){
        let candidate = document.createElement("tr");
        candidate.innerHTML = <td>${parseInt(candidates[i][0])}</td>
                            <td>${candidates[i][1]}</td> ;
        board.appendChild(candidate);
    }
}


const getResult = async function() {
    result.style.display = "flex";

    if(document.getElementById('resultBoard')) {
        document.getElementById('resultBoard').remove();
    }

    let resultBoard = document.createElement("table");
    resultBoard.id = "resultBoard";
    result.appendChild(resultBoard);

    let tableHeader = document.createElement("tr");
    tableHeader.innerHTML = <th>ID No.</th>
                            <th>Candidate</th>
                            <th>Number of Votes</th>;
    resultBoard.appendChild(tableHeader);       
    
    let candidates = await contract.retrieveVotes();
    for(let i = 0; i < candidates.length; i++){
        let candidate = document.createElement("tr");
        candidate.innerHTML = <td>${parseInt(candidates[i][0])}</td>
                            <td>${candidates[i][1]}</td> ;
                            <td>${parseInt(candidates[i][2])}</td>
        resultBoard.appendChild(candidate);
    }

}

const refreshPage = function() {
    setInterval(async() => {
        let time = await contract.electionTimer();

        if(time > 0){
            timerMessage.innerHTML = `<span id="time">${time}</span> second/s left`;
            voteForm.style.display = 'flex';
            showResultContainer.style.display = 'none';
        } else {
            timerMessage.textContent = "Either there's no election yet or the election already ended.";
            voterForm.style.display = 'none';
            showResultContainer.style.display = 'block';
        }
    }, 1000);

    setInterval(async() => {
        getAllCandidates();
    }, 10000);
}

const sendVote = async function() {
    await contract.voteTo(vote.value);
    vote.value = "";
}

const startElection = async function() {
    if(candidates.value){
        alert("list of candidates is empty");
    }
    if(electionDuration.value){
        alert("please set the election duration");
    }

    const _candidates = candidates.value.split(",");
    const _votingDuration = electionDuration.value;

    await contract.startElection(_candidates, _votingDuration);
    refreshPage();

    candidates.value = "";
    electionDuration.value = "";

    voteForm.style.display = "flex";
    showResultContainer.style.display = "none";
}

const addCandidate = async function() {
    if(!candidate.value){
        alert("please provide the candidate name first");
    }

    await contract.addCandidate(candidate.value);
    refreshPage();
    candidate.value = "";
}

const getAccount = async function() {
    const ethAccounts = await provider.send("eth_requestAccounts", []).then(()=>{
        provider.listAccounts().then((accounts) => {
            signer = provider.getSigner(accounts[0]);
            contract = new ethers.Contract(contractAddress, contractABI, signer)
        });
    });

    connectWalletBtn.textContent = signer._address.slice(0,10) + "...";
    connectWalletMsg.textContent = "You are currently connected...";
    connectWalletBtn.disabled = true;

    let owner = await contract.owner();
    if(owner == signer._address) {
        admin.style.display = "flex";

        let time = await contract.electionTimer();
        if(time == 0){
            contract.checkElectionPeriod();
        }
    }

    votingStation.style.display = "block";

    refreshPage();
    getAllCandidates();
};

// Add event listeners
connectWalletBtn.addEventListener('click', getAccount);
showResult.addEventListener('click', getResult);
voteBtn.addEventListener('click', sendVote);
addTheCandidate.addEventListener('click', addCandidate);
startAnElection.addEventListener('click', startElection);