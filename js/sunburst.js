Date.prototype.format = function () {
    'use strict';
    var y = this.getFullYear() + "-", m = this.getMonth() + 1, d = "-" + this.getDate();
    return y + m + d;
};
var Calendar = {
    today: new Date(),
    monthStart: "",
    monthEnd: "",
    day: 24 * 60 * 60 * 1000,
    month: [],
    monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
        "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    parseNames: ["январ", "феврал", "мар", "апрел", "ма", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"],
    dayNames: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    events: {},
    init: function () {
        'use strict';
        var self = this;
        document.querySelector("#add").onclick = self.showQuickAdd;
        document.querySelector("#qAdd").onclick = self.eventQuickAdd;
        document.querySelector("#refresh").onclick = self.draw;
        document.querySelector("#remove").onclick = self.eventDelete;
        document.querySelector("#addEvent").onclick = self.eventAdd;
        [].forEach.call(
            document.querySelectorAll(".close"),
            function (el) {
                el.onclick = self.hideCalendarPopup;
            }
        );
        if (navigator.userAgent.indexOf("MSIE 9.0") > 0) {
            [].forEach.call(
                document.querySelectorAll("input[type=text],input[type=search],textarea"),
                function (el) {
                    el.value = el.getAttribute("placeholder");
                    el.onclick =  function () {
                        if (el.value === el.getAttribute("placeholder")) {
                            el.value = '';
                        }
                    };
                    el.onblur = function () {
                        if (el.value === '') {
                            el.value = el.getAttribute("placeholder");
                        }
                    };
                }
            );
        }

        self.calculate();
    },
    eventAdd: function (e) {
        'use strict';
        var self = Calendar, date = e.currentTarget.parentNode.parentNode.getAttribute("data-date"),
            form = e.currentTarget.parentNode.parentNode, eventName, eventDate, eventMembers, eventDescription, failed = false;
        [].forEach.call(
            document.querySelectorAll(".error"),
            function (el) {
                el.className = el.className.substring(0, el.className.indexOf("error"));
            }
        );
        eventName = form.querySelector("#event-name");
        if (eventName.style.display !== "none" && eventName.value === "") {
            eventName.className += " error";
            failed = true;
        }
        eventDate = form.querySelector("#event-date");
        if (eventDate.style.display !== "none" && eventDate.value === "") {
            eventDate.className += " error";
            failed = true;
        }
        if (failed) {
            return;
        }
        eventMembers = form.querySelector("#event-members");
        eventDescription = form.querySelector("#event-description");
        if (eventDate.value !== "") {
            date = self.dateParse(eventDate.value);
        }
        self.eventAppend(date, eventName.value, eventDescription.value, eventMembers.value);
        self.hideCalendarPopup(e);
        self.draw();
    },
    eventAppend: function (date, header, descr, peoples) {
        'use strict';
        var self = this, event;
        self.loadFromStorage();
        if (date !== "") {
            if (date instanceof Date) {
                date = date.format();
            }
        }
        event = self.events[date] || {};
        if (header === "") {
            event.header = event.header || "";
        } else {
            event.header = header;
        }
        if (descr) {
            event.description = descr;
        } else {
            event.description = event.description || "";
        }

        if (peoples) {
            event.people = peoples.split(",");
        } else {
            event.people = event.people || [];
        }
        event.content = function () {
            return this.header + this.description + this.people.join("");
        };
        if (event.header !== "" && date !== "") {
            self.events[date] = event;
        }
        self.saveToStorage();
    },
    eventDelete: function (e) {
        'use strict';
        var self = Calendar, date = e.currentTarget.parentNode.parentNode.getAttribute("data-date");
        self.loadFromStorage();
        if (self.events[date]) {
            delete self.events[date];
        }
        self.saveToStorage();
        self.hideCalendarPopup(e);
        self.draw();
    },
    eventQuickAdd: function (e) {
        'use strict';
        var input = document.querySelector("#quickAddText");
        Calendar.fastAppend(input.value);
        input.value = "";
        Calendar.hideCalendarPopup(e);
    },
    fastAppend: function (value) {
        'use strict';
        var self = this, rows = value.split(","), date = rows[0], header = rows.splice(1).join(",");
        self.eventAppend(self.dateParse(date), header);
        self.draw();
    },
    dateParse: function (string) {
        'use strict';
        if (!string || string === "") {
            return "";
        }
        var self = this,
            item = string.split(" "),
            dt = {date: 0, month: -1, year: -1},
            stringMonth = false;
        item.forEach(function (itm) {
            var num = parseInt(itm, 10);
            if (isNaN(num)) {
                self.parseNames.forEach(function (nm, j) {
                    if (itm.toLowerCase().indexOf(nm) >= 0) {
                        if (itm.length === 3) {
                            num = 4;
                        } else {
                            num = j;
                        }
                        stringMonth = true;
                    }
                }, itm);
            }
            if (dt.date === 0) {
                dt.date = num;
            } else if (dt.month === -1) {
                dt.month = stringMonth ? num : num - 1;
            } else if (dt.year === -1) {
                dt.year = num;
            }
        });
        return new Date((dt.year === -1) ? new Date().getFullYear() : dt.year, dt.month, dt.date);
    },
    dateFormat: function (date) {
        'use strict';
        var parts = date.split("-"), dt = new Date(parts[0], parts[1] - 1, parts[2]), today = new Date(), year;
        if (dt.getFullYear() === today.getFullYear()) {
            year = "";
        } else {
            year = dt.getFullYear();
        }
        return dt.getDate() + " " + Calendar.monthNames[dt.getMonth() + 12] + year;
    },
    calculate: function () {
        'use strict';
        var self = this, daysBefore, weekStart, counter, i, j;
        self.monthStart = new Date(self.today.getFullYear(), self.today.getMonth(), 1);
        self.monthEnd = new Date(self.today.getFullYear(), self.today.getMonth() + 1, 0);
        daysBefore = (self.monthStart.getDay() === 0) ? 6 : self.monthStart.getDay() - 1;
        weekStart = new Date(self.monthStart.getTime() + self.day * (-daysBefore));
        counter = 0;
        for (i = 0; i < 5; i++) { //weeks
            self.month[i] = [];
            for (j = 0; j < 7; j++) {
                self.month[i][j] = new Date(weekStart.getTime() + self.day * counter);
                counter++;
            }
        }
        self.draw();
    },
    changeMonth: function (direction) {
        'use strict';
        var self = this;
        self.today = new Date(self.today.getFullYear(), self.today.getMonth() + direction, 1);
        self.calculate();
    },
    setToday: function () {
        'use strict';
        var self = this;
        self.today = new Date();
        self.calculate();
    },
    select: function (e, isActive) {
        'use strict';
        var classes = (e.currentTarget.className.length > 0) ? e.currentTarget.className.split(" ") : [];
        isActive = isActive || false;
        if (e.currentTarget.className.indexOf("active") >= 0 && !isActive) {
            classes.pop();
        } else {
            classes.push("active");
        }
        [].forEach.call(
            document.querySelectorAll(".active"),
            function (el) {
                el.className = el.className.substring(0, el.className.indexOf("active"));
            }
        );
        e.currentTarget.className = classes.join(" ");

    },
    viewEvent: function (e) {
        'use strict';
        var form = document.querySelector("#fulladd"), event, nameField, eventName, dateField, eventDate, membersField, eventMembers, eventDescription;
        form.style.display = "block";
        form.onclick = function (e) {
            e.stopPropagation();
        };
        Calendar.select(e, true);
        form.parentNode.removeChild(form);
        event = Calendar.events[e.currentTarget.getAttribute("data-date")];
        nameField = form.querySelector("#name-field");
        eventName = form.querySelector("#event-name");
        dateField = form.querySelector("#date-field");
        eventDate = form.querySelector("#event-date");
        membersField = form.querySelector("#members-field");
        eventMembers = form.querySelector("#event-members");
        eventDescription = form.querySelector("#event-description");
        if (event) {
            nameField.innerHTML = event.header;
            nameField.style.display = "block";
            eventName.style.display = "none";
            dateField.innerHTML = Calendar.dateFormat(e.target.getAttribute("data-date"));
            dateField.style.display = "block";
            eventDate.style.display = "none";
            if (event.people && event.people.length > 0) {
                membersField.innerHTML = event.people.join(", ");
                membersField.style.display = "block";
                eventMembers.style.display = "none";
            } else {
                membersField.style.display = "block";
                eventMembers.style.display = "auto";
            }
            if (event.description && event.description !== "") {
                eventDescription.value = event.description;
                eventDescription.readOnly = true;
            } else {
                eventDescription.value = "";
                eventDescription.readOnly = false;
            }
        } else {
            nameField.style.display = "none";
            eventName.style.display = "inline";
            dateField.style.display = "none";
            eventDate.style.display = "inline";
            eventDate.value = Calendar.dateFormat(e.target.getAttribute("data-date"));
            membersField.style.display = "none";
            eventMembers.style.display = "inline";
            eventDescription.value = "";
            eventDescription.readOnly = false;
        }
        e.currentTarget.appendChild(form);
    },
    draw: function () {
        'use strict';
        var self = Calendar, today = new Date(), div, p, dayName, dayNumber, event, calendar = document.querySelector("#calendar"), i, j;
        self.loadFromStorage();
        calendar.innerHTML = "";
        for (i = 0; i < 5; i++) {//weeks
            for (j = 0; j < 7; j++) {//days
                div = document.createElement("div");
                if (self.month[i][j].getFullYear() === today.getFullYear() &&
                        self.month[i][j].getMonth() === today.getMonth() &&
                        self.month[i][j].getDate() === today.getDate()) {
                    div.className = "today";
                }
                p = document.createElement("p");
                if (i === 0) {
                    dayName = document.createElement("span");
                    dayName.className = "daytext";
                    dayName.innerHTML = self.dayNames[self.month[i][j].getDay()] + ",&nbsp;";
                    p.innerHTML += dayName.innerHTML;
                }
                dayNumber = document.createElement("span");
                dayNumber.className = "daynumber";
                dayNumber.innerHTML = self.month[i][j].getDate().toString();

                p.innerHTML += dayNumber.innerHTML;
                if (self.events[self.month[i][j].format()]) {
                    event = self.events[self.month[i][j].format()];
                    p.innerHTML += "<h3>" + event.header + "</h3><p>" + event.people.join(",") + "</p>";
                    div.className = "event";
                }
                div.setAttribute("data-date", self.month[i][j].format());
                div.appendChild(p);
                div.onclick = Calendar.select;
                div.ondblclick = Calendar.viewEvent;
                calendar.appendChild(div);
            }
        }
        document.querySelector(".monthdate").innerHTML = self.monthNames[self.today.getMonth()] + " " + self.today.getFullYear();

    },
    saveToStorage: function () {
        'use strict';
        var self = this;
        localStorage.setItem("events", JSON.stringify(self.events));
    },
    loadFromStorage: function () {
        'use strict';
        var self = this, loaded = JSON.parse(localStorage.getItem("events"));
        if (loaded !== null) {
            self.events = loaded;
        } else {
            self.events = {};
        }
    },
    showQuickAdd: function (e) {
        'use strict';
        e.stopPropagation();
        var popup = document.querySelector("#quickadd");
        if (popup.style.display !== "block") {
            popup.style.display = "block";
        } else {
            popup.style.display = "none";
        }
    },
    hideCalendarPopup: function (e) {
        'use strict';
        e.stopPropagation();
        var parentElem = e.currentTarget.parentNode, inputs = document.querySelectorAll("#" + parentElem.id + " input[type='text']");
        document.querySelector("#" + parentElem.id).style.display = "none";
        [].forEach.call(
            inputs,
            function (el) {
                el.value = "";
            }
        );
        if (parentElem.id === "fulladd") {
            parentElem.parentNode.removeChild(parentElem);
            document.body.appendChild(parentElem);
        }
    },
    search: function (needle) {
        'use strict';
        var self = Calendar, result = [], item, content;
        self.loadFromStorage();
        for (item in self.events) {
            if (self.events.hasOwnProperty(item)) {
                content = self.events[item].header + self.events[item].description + self.events[item].people.join("");
                if (content.indexOf(needle) >= 0) {
                    result.push(item);
                }
            }
        }
        return result;
    }
};