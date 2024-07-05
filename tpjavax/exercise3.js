

function DisplayUrl(time,url) {
    setTimeout(function() {

        var iframe= document.createElement('iframe');
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.src = url;
        iframe.id = "previous"
        const obj=document.getElementById("MAIN");
        const objprevious=document.getElementById("previous");
        if(objprevious!==null){
            obj.removeChild(objprevious)
        }
        obj.appendChild(iframe);
        
    }, time*1000);
    
}

function LoadJson(){
    fetch('slides.json')
    .then(response => response.json())
    .then(data => {
        data.slides.forEach(function(slide) {
              DisplayUrl(slide.time, slide.url);
            
          });
        
    })
    
    .catch(error => {
        console.error('Error loading slides.json', error);
    });

}