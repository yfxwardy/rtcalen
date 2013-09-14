var Calendar = {
    today: new Date(),
    monthStart: "",
    monthEnd:"",
    day: 24*60*60*1000,
    month: [],
    monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    parseNames: ["январ", "феврал", "мар", "апрел", "ма", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"],
    dayNames: ["Воскресенье","Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    events:{},
    init: function (){
        var self = this;
        document.querySelector("#add").onclick = self.showQuickAdd;
        document.querySelector("body").onclick = self.hideQuickAdd;
        self.calculate();
    },
    eventAppend: function(date, descr, peoples){
        var self = this;
        var event = {};
        event.description = descr;
        event.people = (peoples)?peoples.split(","):[];
        self.events[date.toLocaleDateString()] = event;
        self.saveToStorage();

    },
    fastAppend: function(value){
        var self = this;
        var rows = value.split(",");
        self.eventAppend(self.dateParse(rows[0]),rows[1],rows[2]);
    },
    dateParse: function(string){
        var self = this;
        var item = string.split(" ");
        var dt = {date:0, month:-1,year:-1};
        item.forEach(function(itm){
            var num = parseInt(itm);
            if (isNaN(num)){
                self.parseNames.forEach(function(nm,j){
                    if (itm.toLowerCase().indexOf(nm)>=0){
                        if(itm.length==3){
                            num = 4
                        } else {num = j}
                    }
                },itm);
            }
            if(dt.date===0){ dt.date = num;}
            else if(dt.month===-1){ dt.month = num;}
            else if(dt.year===-1){ dt.year = num;}
        });
        return new Date((dt.year==-1)?new Date().getFullYear():dt.year,dt.month, dt.date);
    },
    calculate: function (){
        var self = this;
        self.monthStart = new Date(self.today.getFullYear(), self.today.getMonth(), 1);
        self.monthEnd = new Date(self.today.getFullYear(), self.today.getMonth()+1, 0);
        var daysBefore = (self.monthStart.getDay()==0)?6:self.monthStart.getDay()-1;
        var weekStart = new Date(self.monthStart.getTime()+ self.day*(-daysBefore));
        var counter = 0;
        for (var i=0;i<5;i++){//weeks
            self.month[i] = [];
            for (var j=0;j<7; j++){
                self.month[i][j] = new Date(weekStart.getTime() + self.day*counter);
                counter++;
            }
        }
        self.draw();
    },
    changeMonth:function(direction){
        var self = this;
        self.today = new Date(self.today.getFullYear(), self.today.getMonth()+direction,1);
        self.calculate();
    },
    setToday: function (){
        var self = this;
        self.today = new Date();
        self.calculate();
    },
    select:function (e) {
        var classes = (e.currentTarget.className.length>0)?e.currentTarget.className.split(" "):[];
        if( e.currentTarget.className.indexOf("active")>=0){
            classes.pop();
        } else {
            classes.push("active");
        }
        e.currentTarget.className = classes.join(" ");

    },
    active: function(){
        alert("Hello")
    },
    draw: function (){
        var self = this;
        var today = new Date();
        var div, p,dayName, dayNumber, event;
        var calendar = document.querySelector("#calendar");
        calendar.innerHTML = "";
        for (var i=0;i<5;i++){//weeks
            for (var j=0;j<7; j++){//days
                div = document.createElement("div");
                if (self.month[i][j].getFullYear() == today.getFullYear() && self.month[i][j].getMonth() == today.getMonth() &&
                    self.month[i][j].getDate() == today.getDate()){
                    div.className = "today";
                }

                p = document.createElement("p");
                if (i==0) {
                    dayName = document.createElement("span");
                    dayName.className = "daytext";
                    dayName.innerHTML = self.dayNames[self.month[i][j].getDay()]+",&nbsp;"
                    p.innerHTML += dayName.innerHTML;
                }
                dayNumber = document.createElement("span");
                dayNumber.className = "daynumber";
                dayNumber.innerHTML =self.month[i][j].getDate()+"";

                p.innerHTML += dayNumber.innerHTML;
                if (self.events[self.month[i][j].toLocaleDateString()]){
                    event = self.events[self.month[i][j].toLocaleDateString()]
                    p.innerHTML +="<h3>"+event.description+"</h3><p>"+event.people.join(",")+"</p>";
                    div.className = "event";
                    div.setAttribute("data-date", self.month[i][j].toLocaleDateString())
                    div.addEventListener("click", function(e){console.log(self.events[e.target.getAttribute("data-date")])})
                }
                div.appendChild(p);
                div.onclick = Calendar.select;
                div.ondblclick = Calendar.active;
                calendar.appendChild(div);
            }
        }
        document.querySelector(".monthdate").innerHTML = self.monthNames[self.today.getMonth()]+ " "+ self.today.getFullYear();

    },
    saveToStorage: function(){
        var self = this;
        localStorage.setItem("events", JSON.stringify(self.events));
    },
    loadFromStorage: function(){
        var self = this;
        self.events =JSON.parse(localStorage.getItem("events"));
    },
    showQuickAdd: function(e){
        e.stopPropagation();
        document.querySelector("#quickadd").style.display = "block";
    },
    hideQuickAdd: function(e){
        e.stopPropagation();
        document.querySelector("#quickadd").style.display = "none";
    }
};


