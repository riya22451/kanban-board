let draggedCard=null;
let rightcard=null;
document.addEventListener('DOMContentLoaded',loadTasksFromLocalStorage);
function addTask(columnId){
    const tasktext=document.getElementById(`${columnId}-input`);
    const taskvalue=tasktext.value;
    if(taskvalue===""){
        return;
    }
    const taskDate=new Date().toLocaleString();
    const taskdiv=createTask(taskvalue,taskDate);
    document.getElementById(`${columnId}-tasks`).appendChild(taskdiv);
    updateTaskCount(columnId);
    saveTasksToLocalStorage(columnId,taskvalue,taskDate);
   
    tasktext.value="";
}
function createTask(text,date){
    const div=document.createElement('div');
    
    div.innerHTML=`<span>${text}</span> <br> <small class="date">${date}</small>`;
   
    div.classList.add('card');
    div.draggable=true;
    div.addEventListener('dragstart',dragStart);
    div.addEventListener('dragend',dragEnd);
    div.addEventListener('contextmenu',function(event){
        event.preventDefault();
        rightcard=this;
       showContextMenu(event.pageX,event.pageY);
    })
    return div;
}
function dragStart(){
    this.classList.add("dragging");
    draggedCard=this;
}
function dragEnd(){
    this.classList.remove("dragging");
    ["todo","Doing","Done"].forEach((columnId)=>{
        updateTaskCount(columnId);
    })
    updateLocalStorage();
}
let columns=document.querySelectorAll('.tasks');
columns.forEach((col)=>{
    col.addEventListener('dragover',dragOver);
});
function dragOver(event){
    event.preventDefault();
    this.appendChild(draggedCard);
    const afterElement=getDragAfterElement();
    if(afterElement==null){
        this.appendChild(draggedCard);
    }
    else{
        this.insertBefore(draggedCard,afterElement);
    }
}
const contextmenu=document.querySelector(".context-menu");
function showContextMenu(x,y){
    
    contextmenu.style.left=`${x}px`;
    contextmenu.style.top=`${y}px`;
    contextmenu.style.display="block";
    
}
document.addEventListener('click',()=>{
    contextmenu.style.display="none";
})
function Edit(){
    if(rightcard!==null){
        const text=prompt("enter the text you want to edit");
        if(text!==""){
            rightcard.textContent=text;
        }
       
    }
    updateLocalStorage();
   
    
}
function Delete(){
   const column=rightcard.parentElement.id.replace("-tasks","");
    rightcard.remove();
    updateTaskCount(column);
   updateLocalStorage();

}
function updateTaskCount(ColumnId){
    const count=document.querySelectorAll(`#${ColumnId}-tasks .card`).length;
    document.getElementById(`${ColumnId}-count`).textContent=count;
}
function saveTasksToLocalStorage(columnId,tasktext,taskdate){
    const tasks=JSON.parse(localStorage.getItem(columnId))||[];
    tasks.push({text: tasktext, date:taskdate});
    localStorage.setItem(columnId,JSON.stringify(tasks));
}
function loadTasksFromLocalStorage(){
    ["todo","Doing","Done"].forEach((columnId)=>{
        const tasks=JSON.parse(localStorage.getItem(columnId)) || [];
        tasks.forEach(({text,date})=> {
            const taskElement=createTask(text,date);
            document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
        });
        updateTaskCount(columnId);
        
    });
}
function updateLocalStorage(){
    ["todo","Doing","Done"].forEach((columnId)=>{
        const tasks=[];
        document.querySelectorAll(`#${columnId}-tasks .card`).forEach((card)=>{
            const taskText=card.querySelector("span").textContent;
            const taskDate=card.querySelector("small").textContent;
            tasks.push({text:taskText,date:taskDate});
        });
        localStorage.setItem(columnId,JSON.stringify(tasks));
    })
}
function getDragAfterElement(container,y){
    const draggableElements=[...container.querySelectorAll(".card:not(.dragging)"),];
    const result=draggableElements.reduce((closestElementUnderMouse,currentTask)=>{
        const box=currentTask.getBoundingClientRect();
        const offset=y-box.top-box.height/2;
        if(offset<0 && offset>closestElementUnderMouse.offset){
            return {offset:offset ,element: currentTask };
        }else{
            return closestElementUnderMouse;
        }
    },
    {offset:Number.NEGATIVE_INFINITY}
);
return result.element;

}