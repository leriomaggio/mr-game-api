function loadGUI(){
    
    var numOfSliders=[1,2,3,4,5,6,7,8,9,10];
    var focus={"id":"id", "shortName":"shortName", "activation":"activation"};
    
    /*##################
    MASTER FUNCTIONS
    (call slave functions)
    ##################*/
    
    function init(){
        /* Retrieve init paramaters and data */
        var ourRequest = new XMLHttpRequest();
            ourRequest.open('GET', "http://127.0.0.1:5000/init_buttons");
            ourRequest.onload = function() {
                var ourData = JSON.parse(ourRequest.responseText);
                
                //Initialise GUI elements
                    //Home center GUI
                groupData = ourData["btnInfo"];
                groupData["groups"].forEach(renderGrp);
                    //Main sliders and text
                statsData = ourData["statsInfo"];
                setMainSliders(statsData[0],statsData[1],statsData[2],statsData[3]);
                numOfSliders.forEach(renderBtnLinks);
                    //Main FDG
                FDG("creation", "http://127.0.0.1:5000/simulation", "#svgMain", "collapsed");
            };
            ourRequest.send();
        }
    init();
    
    function render(element, id){
        //Update either modal 1 or 2
        if (element == "modal1"){
            group = id;
            resetModal1();
            populateModal1(group);
            //$("#modalTmpl").modal();
        } else if (element == "modal2") {
            btnId = id;
            resetModal2();
            populateModal2(btnId);
            //$("#modalTmpl2").modal();       
        }
    }
    
    function update(elements){
        /* Retrieve updated data */
        
        var ourRequest = new XMLHttpRequest();
            ourRequest.open('GET', "http://127.0.0.1:5000/update");
            ourRequest.onload = function() {
                var ourData = JSON.parse(ourRequest.responseText);

                nodeData = ourData["nodes"];
                statsData = ourData["stats"];
                groupData = ourData["groups"];
                
                //Update GUI
                if (elements.includes("centerGUI")){
                    //Home center GUI
                        //Sliders
                        setMainSliders(statsData[0],statsData[1],statsData[2],statsData[3]);
                        //Circle group activation colours & label
                        bundles = [];        
                        for(var i in ourData["groups"]){
                            btnName = "btn-"+ourData["groups"][i]["group"];
                            activColor = ourData["groups"][i]["activColor"];
                            activation = ourData["groups"][i]["activation"];
                            bundles.push({"btnName": btnName, "activColor": activColor, "activation": activation});
                        };
                        bundles.forEach(colorGrp);
                        //FDG
                        FDG("destruction", "http://127.0.0.1:5000/simulation", "#svgMain", "collapsed");
                        FDG("creation", "http://127.0.0.1:5000/simulation", "#svgMain", "collapsed");
                };
                if (elements.includes("modal1")){
                    //Modal 1
                        //Title
                        groupId = document.getElementById("modalTitle").innerHTML;
                        //Sliders (if modal exists)
                        group="";
                        for(var i in ourData["groups"]){
                            if(ourData["groups"][i]["group"] == groupId){
                                group = ourData["groups"][i];
                                populateModal1(group);
                                break; 
                            }
                        }
                };
                if (elements.includes("modal2")){
                    //Modal 2
                        //Pop vis
                        setPopVis(focus);
                };
            };
            ourRequest.send();
    }

    /*##################
    SLAVE FUNCTIONS 
    (called by master functions)
    ##################*/
    
    //PERSISTANT HOME: CENTER UI
    function renderGrp(group){
        /*create div holding group of buttons*/
        btnName = "btn-"+group["group"];
        btnHTML =  group["group"]+"<br>"+group["activation"].toFixed(0);
        modalId = "#modal-"+group["group"];
        var btn = document.createElement("BUTTON");
        btn.id = btnName;
        btn.className = "btn grpRect";
        btn.innerHTML = btnHTML;
        btn.setAttribute("data-toggle", "dropdown");
        
        document.getElementById("div-dropdown").appendChild(btn); 
        $("#"+btnName).data("myAttribute");
        document.getElementById(btnName).style.border = "1px solid "+group["grpColor"];
        document.getElementById(btnName).addEventListener("click", function(e) {   
            render("modal1",group);
            update(["centerGUI","modal1"]);
            $('.dropdown-toggle').dropdown();
        });
        bundle = {"btnName":btnName,"activColor":group["activColor"],"activation":group["activation"]};
        colorGrp(bundle);
    }
    
    function setMainSliders(total, goal, goalPct, totalPct){
        totalRnd = Number(total);
        totalPctRnd = Number(totalPct);
        goalPctRnd = Number(goalPct);
        $('#progress_total').css('width', totalPctRnd.toFixed(2)+"%").attr('aria-valuenow', totalPctRnd.toFixed(2));
        $('#progress_totalTxt').text(totalRnd.toFixed(0));
        $('#progress_goal').css('width', goalPctRnd.toFixed(2)+"%").attr('aria-valuenow', goalPctRnd.toFixed(2));
        $('#progress_goalTxt').text(goal);
        $('#progress_goalVal').text(goalPctRnd.toFixed(0));
        
    }
    
    function colorGrp(bundle){
        //Color
        btnId = '#'+bundle["btnName"];
        color = bundle["activColor"];
        activation = bundle["activation"];
        $(btnId).css('background-color', color);
        
        //Text
        activationRnd = Number(activation);
        groupname = bundle["btnName"].replace('btn-','');
        html = groupname+"<br>"+activationRnd.toFixed(0);
        $(btnId).html(html);
    }
    
    //MODAL 1: RENDER & RESET
    var sliderCount = 1;
    function populateModal1(group){
        document.getElementById("modalTitle").innerHTML = group["group"];
        sliderCount = 1;
        group["nodes"].forEach(setSlider);
    };
    
    function setSlider(node){
        
        btnId = "#slider"+sliderCount+"Txt";
        progressId = "#slider"+sliderCount;
        progressTextId = "#slider"+sliderCount+"Curr";
        sliderDiv =  document.getElementById("div-slider"+sliderCount);
        progressVal = Number(node["activation"]);
        
        //Assign progress color
        if (progressVal > 100 || progressVal < 0){
            color = "black";
        }
        else if (progressVal > 75 || progressVal < 25){
            color = "red";
        } else if (progressVal > 60 || progressVal < 40) {
            color = "orange";
        } else {
            color = "green";       
        }
        
        $(progressId).css('width', progressVal.toFixed(2)+"%").attr('aria-valuenow', progressVal.toFixed(2));
        $(progressId).css('background-color', color); 
        $(progressTextId).text(progressVal.toFixed(0));
        $(btnId).text(node["shortName"]);
        $(btnId).attr('data-id', node["id"]);
        document.getElementById("dropdown-menu").appendChild(sliderDiv);
        
        sliderCount ++;
    }

    function resetModal1(){
        numOfSliders.forEach(resetSliders);
    }
    
    function resetSliders(sliderCount){
        sliderDiv =  document.getElementById("div-slider"+sliderCount);
        document.getElementById("hiddenItems").appendChild(sliderDiv);
    }
    
    //MODAL2: RENDER & RESET    
    function populateModal2(btnId){
        
        nodeId = 
        document.getElementById(btnId).getAttribute('data-id');
        nodeName = document.getElementById(btnId).innerText;
        
        //Set title and subtitle
        document.getElementById("modal2Title").innerHTML = nodeName;
        document.getElementById("modal2Title").setAttribute('data-btnId', btnId);
        document.getElementById("modal2Subtitle").innerHTML = nodeId;
        
        //Set sliderBtn data-id
        document.getElementById("intvSlider").setAttribute('data-id', nodeId);
        
        //Set slider
        setIntvSlider();
        
        //Set pop vis
        setPopVis(btnId);
        
        //Set FDG      
        URL = "http://127.0.0.1:5000/simulation/" + nodeId;
        FDG("destruction", URL, "#svgM2", "compact");
        FDG("creation", URL,"#svgM2", "compact");
        renderFdgTxt(nodeId);
        
        document.getElementById("rightHeader").style.visibility = "visible";
        document.getElementById("rightBody").style.visibility = "visible";
        document.getElementById("rightFooter").style.visibility = "visible";
    }
    
    function setIntvSlider(){
        
    };
    
    function setPopVis(btnId){
        sliderId = btnId.replace('Txt','');
        activ_min = document.getElementById(sliderId).min;
        activ_max = document.getElementById(sliderId).max;
        activ_curr = document.getElementById(sliderId).value;
        activ_pct = (activ_curr / (activ_max - activ_min)) *100;
        popN = (activ_pct/10).toFixed(0);
        resetPops();
        colorPops(popN);
            function resetPops(){
                count = 1;
                while (count <= 10) {
                    document.getElementById("prevPop"+count).style.color = "black";
                    count++;
                } 
            }
            function colorPops(affected){
                healthy = affected+1;
                while (healthy <= 10) {
                    document.getElementById("prevPop"+healthy).style.color = "black";
                    healthy++;
                } 
                while (affected >= 1) {
                    document.getElementById("prevPop"+affected).style.color = "red";
                    affected--;
                }
            }
        document.getElementById("prevalenceTxt").innerText = activ_pct.toFixed(2)+"%";
    }
    
    function renderFdgTxt(nodeId){
        var ourRequest = new XMLHttpRequest();
            URL = "http://127.0.0.1:5000/simulation/"+nodeId
            ourRequest.open('GET', URL);
            ourRequest.onload = function() {
                var ourData = JSON.parse(ourRequest.responseText);
                
                effectors_done=[nodeId,];
                effecteds_done=[nodeId,];
                ourData["links"].forEach(scribe);
                
                function scribe (link){
                    //Identify whether link affects, or is affected by, the node
                    if (link["source"] == nodeId){
                        txtDiv = document.getElementById("effectors");
                        node = link["target"];
                        if (effectors_done.includes(node)){
                            link["color"]="";
                        }   
                        effectors_done.push(link["target"]);
                    }
                    else if (link["target"] == nodeId){
                        txtDiv = document.getElementById("effecteds");
                        node = link["source"];
                        if (effecteds_done.includes(node)){
                            link["color"]="";
                        }
                        effecteds_done.push(link["source"]);
                    }
                   
                    
                    //Render HTML
                    if (link["color"] == "blue"){
                        html = "<span style=\"color:blue\"><i class=\"fas fa-chevron-circle-down\"></i>"+node+"</span><br>";
                    } else if (link["color"] == "red"){
                        html = "<span style=\"color:red\"><i class=\"fas fa-chevron-circle-up\"></i>"+node+"</span><br>";
                    } else {
                        return;   
                    }
                    txtDiv.innerHTML += html;
                }
                
            }
            ourRequest.send();
    }
    
    function renderBtnLinks(id){
        btnId = "slider"+id+"Txt";
        document.getElementById(btnId).addEventListener("click", function() {
            focus = {}
            render("modal2",this.id);
        });
    }
    
    function resetModal2(){
        document.getElementById("effectors").innerHTML = "";
        document.getElementById("effecteds").innerHTML = "";
    }
  
    
    //depreciated button code 
    /*
    //BUTTON: INTERVENE    
       function setIntvBtns(btnId){
        btn = document.getElementById(btnId);
        btn.onclick = function(){
        me = document.getElementById(this.id);
            target = me.getAttribute('data-id');
            valence = me.getAttribute("data-vale");
            value = me.getAttribute("data-value");
            
            //Send intervention request to API
            var xhr = new XMLHttpRequest();        

            xhr.open("POST", "http://127.0.0.1:5000/intervene", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    //Redraw views
                    update(["centerGUI","modal1","modal2"]);
                }
            }
            xhr.send(JSON.stringify({
                                        "id": target,
                                        "valence": valence,
                                        "value": value
            }));            
        };
    }
    var intvBtnIds=["btn-intv+","btn-intv-"];
    intvBtnIds.forEach(setIntvBtns);
    */
    
    //GLOBAL BUTTON: RESET 
    var btn_reset = document.getElementById("btn_reset");
    btn_reset.addEventListener("click", function() {
        resetRequest = new XMLHttpRequest();
        resetRequest.open('GET', "http://127.0.0.1:5000/reset");
        resetRequest.onload = function(){update(["centerGUI","modal1"])};
        resetRequest.send();
    })
    

};

window.onload=loadGUI()