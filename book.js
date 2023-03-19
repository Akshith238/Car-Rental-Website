const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '4fb2cb4b05msh06e028da46f0709p1cd5cbjsn043f2f5c9440',
    'X-RapidAPI-Host': 'car-data.p.rapidapi.com'
   }
  };
  
  list1=[];

  fetch('https://car-data.p.rapidapi.com/cars?limit=40&page=0', options)
  .then(response => response.json())
  .then(response => {
        response.forEach(data =>{
              list1.push(data)
        })
        var carlist=document.getElementById('luxury-car-models');
        for(i=0;i<40;i++){
            var car=document.createElement('option')
            car.value=list1[i].make + " " + list1[i].model
            carlist.appendChild(car)
        }
    })
  .catch(err => console.error(err));
  