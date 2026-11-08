(function(){
var KEY='maditasks-v1',items=[],cur=null;
try{items=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
var $=function(i){return document.getElementById(i)};
var ST=['Жаңа','Орындалуда','Орындалды'];
function save(){try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}}
function uid(){return Math.random().toString(36).slice(2,9)}
function ext(n){var m=n.split('.');return m.length>1?m.pop().slice(0,4).toUpperCase():'FILE'}
function fmt(b){return b>1048576?(b/1048576).toFixed(1)+' МБ':Math.max(1,Math.round(b/1024))+' КБ'}
function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}
function find(id){return items.find(function(x){return x.id===id})}

function crumbs(){
 var path=[],c=cur;
 while(c){var f=find(c);if(!f)break;path.unshift(f);c=f.parent}
 var h='<button data-go="">Басты бет</button>';
 path.forEach(function(p){h+=' / <button data-go="'+p.id+'">'+esc(p.name)+'</button>'});
 $('crumbs').innerHTML=h;
}
function render(){
 crumbs();
 var list=items.filter(function(x){return x.parent===cur});
 if(!list.length){$('grid').innerHTML='<div class="empty">Бос. Жоғарыдан файл жүктеңіз немесе папка құрыңыз.</div>';return}
 $('grid').innerHTML=list.map(function(x){
  var f=x.type==='file';
  var h='<div class="card"><div class="ico '+(f?'':'folder')+'">'+(f?ext(x.name):'')+'</div>';
  h+='<div class="name" data-open="'+x.id+'">'+esc(x.name)+'</div>';
  h+='<div class="meta">'+(f?fmt(x.size):'Папка')+' · '+new Date(x.date).toLocaleDateString('kk-KZ')+'</div>';
  if(f){
   h+='<div class="row"><select data-st="'+x.id+'" aria-label="Күйі">'+ST.map(function(n,i){return '<option value="'+i+'"'+(i===x.status?' selected':'')+'>'+n+'</option>'}).join('')+'</select></div>';
   h+='<div class="stars" role="group" aria-label="Баға">';
   for(var i=1;i<=5;i++)h+='<button data-rate="'+x.id+':'+i+'" class="'+(i<=x.rating?'on':'')+'" aria-label="'+i+' жұлдыз">★</button>';
   h+='</div>';
  }
  h+='<div class="row"><button class="mini '+(x.pub?'on':'')+'" data-pub="'+x.id+'">'+(x.pub?'Ортақ':'Жеке')+'</button><button class="mini" data-del="'+x.id+'">Жою</button></div></div>';
  return h;
 }).join('');
}
function addFiles(fs){
 Array.prototype.forEach.call(fs,function(f){
  items.push({id:uid(),type:'file',name:f.name,size:f.size,parent:cur,status:0,pub:false,rating:0,date:Date.now()});
 });
 save();render();
}
$('btnFile').onclick=function(){$('fileInput').click()};
$('fileInput').onchange=function(e){addFiles(e.target.files);e.target.value=''};
var drop=$('drop');
drop.ondragover=function(e){e.preventDefault();drop.classList.add('drag')};
drop.ondragleave=function(){drop.classList.remove('drag')};
drop.ondrop=function(e){e.preventDefault();drop.classList.remove('drag');addFiles(e.dataTransfer.files)};
$('btnFolder').onclick=function(){
 var i=$('folderName');
 if(i.hidden){i.hidden=false;i.focus();return}
 var n=i.value.trim();
 if(n){items.push({id:uid(),type:'folder',name:n,parent:cur,date:Date.now()});save()}
 i.value='';i.hidden=true;render();
};
$('folderName').onkeydown=function(e){if(e.key==='Enter')$('btnFolder').onclick()};
$('crumbs').onclick=function(e){var g=e.target.getAttribute('data-go');if(g!==null){cur=g||null;render()}};
$('grid').onclick=function(e){
 var t=e.target,id,it;
 if((id=t.getAttribute('data-open'))){if(find(id).type==='folder'){cur=id;render()}return}
 if((id=t.getAttribute('data-rate'))){var p=id.split(':');it=find(p[0]);it.rating=it.rating==+p[1]?0:+p[1];save();render();return}
 if((id=t.getAttribute('data-pub'))){it=find(id);it.pub=!it.pub;save();render();return}
 if((id=t.getAttribute('data-del'))){
  var kill=[id];for(var k=0;k<kill.length;k++)items.forEach(function(x){if(x.parent===kill[k])kill.push(x.id)});
  items=items.filter(function(x){return kill.indexOf(x.id)<0});save();render()}
};
$('grid').onchange=function(e){var id=e.target.getAttribute('data-st');if(id){find(id).status=+e.target.value;save()}};
$('grid').onmousemove=function(e){
 var c=e.target.closest&&e.target.closest('.card');if(!c)return;
 var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
 c.style.transform='rotateY('+(x*18)+'deg) rotateX('+(-y*18)+'deg)';
};
$('grid').onmouseout=function(e){var c=e.target.closest&&e.target.closest('.card');if(c)c.style.transform=''};
render();
})();
