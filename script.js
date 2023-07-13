// Selecting DOM elements

let allFilters = document.querySelectorAll(".filter");
let openModal = document.querySelector(".open-modal");
let closeModal = document.querySelector(".close-modal");
let allFilterClasses = ["red", "blue", "green", "yellow", "black"];
let ticketsContainer = document.querySelector(".tickets-container");
let myDB = window.localStorage;

// Variables to track modal state and text input
let ticketModalOpen = false;
let isTextTyped = false;

// Event listeners
openModal.addEventListener("click", openTicketModal);
closeModal.addEventListener("click", closeTicketModal);

// Adding event listeners to filter buttons
for (let i = 0; i < allFilters.length; i++) {
  allFilters[i].addEventListener("click", selectFilter);
}

// Function to handle filter selection
function selectFilter(e) {
  // console.log(e);
  if (e.target.classList.contains("active-filter")) {
    // If the selected filter is already active, remove the active class
    e.target.classList.remove("active-filter");
    ticketsContainer.innerHTML = "";
    loadTickets();
  } else {
    // If a different filter is selected, remove active class from previous filter (if any) and add it to the newly selected filter
    if (document.querySelector(".active-filter")) {
      document
        .querySelector(".active-filter")
        .classList.remove("active-filter");
    }
    e.target.classList.add("active-filter");
    ticketsContainer.innerHTML = "";
    let filterClicked = e.target.classList[1];
    loadSelectedTickets(filterClicked);
  }
}

// Function to load tickets based on the selected filter
function loadSelectedTickets(filter) {
  let allTickets = myDB.getItem("allTickets");
  if (allTickets) {
    allTickets = JSON.parse(allTickets);
    for (let i = 0; i < allTickets.length; i++) {
      let ticketobj = allTickets[i];
      if (ticketobj.ticketFilter == filter) {
        appendTicket(ticketobj);
      }
    }
  }
}

// Function to load all tickets
function loadTickets() {
  let allTickets = localStorage.getItem("allTickets");
  if (allTickets) {
    allTickets = JSON.parse(allTickets);
    for (let i = 0; i < allTickets.length; i++) {
      let ticketobj = allTickets[i];
      appendTicket(ticketobj);
    }
  }
}

// Initial load of all tickets
loadTickets();

// Function to open the ticket modal
function openTicketModal(e) {
  // console.log(e);
  if (ticketModalOpen) {
    return;
  }

  let ticketModal = document.createElement("div");
  ticketModal.classList.add("ticket-modal");
  ticketModal.innerHTML = `
    
        <div class="ticket-text" contenteditable="true" spellcheck="false" >Enter your text
        </div>
    

        <div class="ticket-filters">
            <div class="ticket-filter2 red selected-filter"></div>
            <div class="ticket-filter2 blue"></div>
            <div class="ticket-filter2 green"></div>
            <div class="ticket-filter2 yellow"></div>
            <div class="ticket-filter2 black"></div>
        </div>
    `;
  document.querySelector("body").append(ticketModal);
  ticketModalOpen = true;
  isTextTyped = false;
  let tickettextDiv = ticketModal.querySelector(".ticket-text");

  tickettextDiv.addEventListener("keypress", handleKeyPress);

  let ticketFilters = ticketModal.querySelectorAll(".ticket-filter2");

  for (let i = 0; i < ticketFilters.length; i++) {
    ticketFilters[i].addEventListener("click", function (e) {
      if (e.target.classList.contains("selected-filter")) {
        return;
      }
      document
        .querySelector(".selected-filter")
        .classList.remove("selected-filter");
      e.target.classList.add("selected-filter");
    });
  }
}

// Function to close the ticket modal
function closeTicketModal(e) {
  if (ticketModalOpen) {
    document.querySelector(".ticket-modal").remove();
    ticketModalOpen = false;
  }
}

// Function to handle key press events in the ticket modal
function handleKeyPress(e) {
  // console.log(e);
  if (e.key == "Enter" && isTextTyped && e.target.textContent) {
    console.log("inside if");
    let filterSelected = document.querySelector(".selected-filter")
      .classList[1];
    let ticketId = uuid();
    let ticketInfoObject = {
      ticketFilter: filterSelected,
      ticketValue: e.target.textContent,
      ticketId: ticketId
    };
    appendTicket(ticketInfoObject);
    closeModal.click();
    saveTicketToDb(ticketInfoObject);
  }
  if (!isTextTyped) {
    isTextTyped = true;
    e.target.textContent = "";
  }
}

// Function to open the edit modal for a ticket
function openEditModal(ticketInfoObject) {
  if (ticketModalOpen) {
    return;
  }

  let ticketModal = document.createElement("div");
  ticketModal.classList.add("ticket-modal");
  ticketModal.innerHTML = `
    <div class="ticket-text" contenteditable="true" spellcheck="false">${
      ticketInfoObject.ticketValue
    }</div>
    <div class="ticket-filters">
      <div class="ticket-filter2 red ${
        ticketInfoObject.ticketFilter === "red" ? "selected-filter" : ""
      }"></div>
      <div class="ticket-filter2 blue ${
        ticketInfoObject.ticketFilter === "blue" ? "selected-filter" : ""
      }"></div>
      <div class="ticket-filter2 green ${
        ticketInfoObject.ticketFilter === "green" ? "selected-filter" : ""
      }"></div>
      <div class="ticket-filter2 yellow ${
        ticketInfoObject.ticketFilter === "yellow" ? "selected-filter" : ""
      }"></div>
      <div class="ticket-filter2 black ${
        ticketInfoObject.ticketFilter === "black" ? "selected-filter" : ""
      }"></div>
    </div>
    <button class="update-ticket" style="background-color: black 
    ; color: white; border: none; padding: 10px 20px;">Update</button>

  `;

  document.querySelector("body").append(ticketModal);
  ticketModalOpen = true;
  isTextTyped = true;

  let tickettextDiv = ticketModal.querySelector(".ticket-text");

  tickettextDiv.addEventListener("keypress", handleKeyPress);

  let ticketFilters = ticketModal.querySelectorAll(".ticket-filter2");

  for (let i = 0; i < ticketFilters.length; i++) {
    ticketFilters[i].addEventListener("click", function (e) {
      if (e.target.classList.contains("selected-filter")) {
        return;
      }
      document
        .querySelector(".selected-filter")
        .classList.remove("selected-filter");
      e.target.classList.add("selected-filter");
    });
  }

  let updateTicketBtn = ticketModal.querySelector(".update-ticket");

  updateTicketBtn.addEventListener("click", function (e) {
    let updatedTicketValue = tickettextDiv.textContent;
    let updatedTicketFilter = ticketModal.querySelector(".selected-filter")
      .classList[1];

    if (updatedTicketValue && updatedTicketFilter) {
      ticketInfoObject.ticketValue = updatedTicketValue;
      ticketInfoObject.ticketFilter = updatedTicketFilter;
      updateTicketInDb(ticketInfoObject);
      closeModal.click();
    }
  });
}

// Function to save a new ticket to the database
function saveTicketToDb(ticketInfoObject) {
  let allTickets = myDB.getItem("allTickets");
  if (allTickets) {
    allTickets = JSON.parse(allTickets);
    allTickets.push(ticketInfoObject);
    myDB.setItem("allTickets", JSON.stringify(allTickets));
  } else {
    let allTickets = [ticketInfoObject];
    myDB.setItem("allTickets", JSON.stringify(allTickets));
  }
}

// Function to append a ticket to the tickets container
function appendTicket(ticketInfoObject) {
  let { ticketFilter, ticketValue, ticketId } = ticketInfoObject;
  console.log(ticketFilter);
  let ticketDiv = document.createElement("div");
  ticketDiv.classList.add("ticket");
  ticketDiv.innerHTML = `
         <div class="ticket-header ${ticketFilter}"></div>
         <div class="ticket-edit"><i class="fa-solid fa-pencil"></i></div>   
         <div class="ticket-content">
                <div class="ticket-info">
                    <div class="ticket-id">${ticketId}</div>
                    <div class="ticket-delete"><i class="fa-solid fa-trash"></i></div>
                </div>
                
                <div class="ticket-value">
                        ${ticketValue}
                </div>

            </div>
    `;

  console.log(ticketDiv);

  let ticketHeader = ticketDiv.querySelector(".ticket-header");

  let editTicketBtn = ticketDiv.querySelector(".ticket-edit");
  editTicketBtn.addEventListener("click", function (e) {
    openEditModal(ticketInfoObject);
  });

  ticketHeader.addEventListener("click", function (e) {
    let currentFilter = e.target.classList[1]; // yellow
    let indexOfCurrFilter = allFilterClasses.indexOf(currentFilter); // 3
    let newIndex = (indexOfCurrFilter + 1) % allFilterClasses.length;
    let newFilter = allFilterClasses[newIndex];
    console.log({ currentFilter, newFilter });
    console.log(ticketHeader);
    //ticketHeader.style.backgroundColor = newFilter;
    ticketHeader.classList.remove(currentFilter);
    ticketHeader.classList.add(newFilter);

    let allTickets = JSON.parse(myDB.getItem("allTickets"));

    for (let i = 0; i < allTickets.length; i++) {
      if (allTickets[i].ticketId == ticketId) {
        allTickets[i].ticketFilter = newFilter;
      }
    }

    myDB.setItem("allTickets", JSON.stringify(allTickets));
  });

  let deleteTicketBtn = ticketDiv.querySelector(".ticket-delete");

  deleteTicketBtn.addEventListener("click", function (e) {
    ticketDiv.remove();
    let allTickets = JSON.parse(myDB.getItem("allTickets"));

    let updatedTicket = allTickets.filter(function (ticketObject) {
      if (ticketObject.ticketId == ticketId) {
        return false;
      }
      return true;
    });

    myDB.setItem("allTickets", JSON.stringify(updatedTicket));
  });

  ticketsContainer.append(ticketDiv);
}

// Function to update a ticket in the database
function updateTicketInDb(ticketInfoObject) {
  let allTickets = JSON.parse(myDB.getItem("allTickets"));

  for (let i = 0; i < allTickets.length; i++) {
    if (allTickets[i].ticketId === ticketInfoObject.ticketId) {
      allTickets[i].ticketValue = ticketInfoObject.ticketValue;
      allTickets[i].ticketFilter = ticketInfoObject.ticketFilter;
      break;
    }
  }

  myDB.setItem("allTickets", JSON.stringify(allTickets));

  ticketsContainer.innerHTML = "";

  loadTickets();
}

// Event listener to close the ticket modal
function closeTicketModal(e) {
  if (ticketModalOpen) {
    let ticketModal = document.querySelector(".ticket-modal");

    if (ticketModal.contains(e.target)) {
      return;
    }

    ticketModal.remove();
    ticketModalOpen = false;
  }
}
