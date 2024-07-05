

function loadDoc() {
    fetch('text.txt')
      .then(response => response.text())
      .then(data => {
        document.getElementById('tarea').value = data;
      });
  }
  
function loadDoc2() {
    fetch('text.txt')
    .then(response => response.text())
    .then(data => {
        const lignes=data.split('\n');
        const tarea2 = document.getElementById('tarea2');
        lignes.forEach((ligne) => {
            const new_p=document.createElement('p');
            new_p.textContent=ligne;
            new_p.style.color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
            tarea2.appendChild(new_p);
        })
    });

}